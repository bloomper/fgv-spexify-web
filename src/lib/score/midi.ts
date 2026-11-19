import type { ParsedPart, ParsedScore } from "@/lib/score/parse";
import type { Meas, RawNote } from "@/lib/score/timeline";

// Standard MIDI file (.mid, format 0/1/2) -> the score model of parse.ts (measures + raw notes per channel). No DOM. Bars come from the
// time signatures (4/4 without), tempo marks go into the bar they fall in, notes that cross a bar line are split with ties.
const MAX_BARS = 20000;
interface Ev {
  t: number;
  ch: number;
  key: number;
}

function readTrack(d: Uint8Array, p: number, end: number) {
  const out = {
    on: [] as Ev[],
    off: [] as Ev[],
    prog: new Map<number, number>(),
    tempo: [] as Array<{ t: number; us: number }>,
    sig: [] as Array<{ t: number; n: number; d: number }>,
    name: "",
    chans: new Set<number>(),
  };
  let t = 0;
  let run = 0;
  const vlq = () => {
    let v = 0;
    for (let i = 0; i < 4; i++) {
      const b = d[p++];
      v = (v << 7) | (b & 0x7f);
      if (!(b & 0x80)) break;
    }
    return v;
  };
  while (p < end) {
    t += vlq();
    let st = d[p];
    if (st === undefined) break;
    if (st & 0x80) p++;
    else st = run;
    if (st === 0xff) {
      const type = d[p++];
      const len = vlq();
      if (type === 0x51 && len === 3) out.tempo.push({ t, us: (d[p] << 16) | (d[p + 1] << 8) | d[p + 2] });
      else if (type === 0x58 && len >= 2) out.sig.push({ t, n: d[p], d: 2 ** d[p + 1] });
      else if (type === 0x03 && !out.name) out.name = new TextDecoder("latin1").decode(d.subarray(p, p + len)).trim();
      p += len;
      if (type === 0x2f) break;
    } else if (st === 0xf0 || st === 0xf7) {
      p += vlq();
    } else {
      run = st;
      const hi = st & 0xf0;
      const ch = st & 0x0f;
      const a = d[p++];
      if (hi === 0xc0) {
        if (!out.prog.has(ch)) out.prog.set(ch, a);
      }
      else if (hi === 0xd0) continue;
      else {
        const b = d[p++];
        if (hi === 0x90 && b > 0) out.on.push({ t, ch, key: a });
        else if (hi === 0x80 || hi === 0x90) out.off.push({ t, ch, key: a });
      }
    }
  }
  return { ...out, last: t };
}

export function parseMidiFile(bytes: Uint8Array): ParsedScore {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (o: number) => String.fromCharCode(...bytes.subarray(o, o + 4));
  if (bytes.length < 14 || tag(0) !== "MThd") throw new Error("Ogiltig MIDI-fil");
  const ntrk = dv.getUint16(10);
  const div = dv.getUint16(12);
  if (div & 0x8000 || !div) throw new Error("MIDI-fil med tidskod stods inte");
  const ppq = div;
  let p = 8 + dv.getUint32(4);
  const tempo: Array<{ t: number; us: number }> = [];
  const sigs: Array<{ t: number; n: number; d: number }> = [];
  const prog = new Map<number, number>();
  const names = new Map<number, string>(); // channel -> name of the first track that plays on it
  const spans: Array<{ on: number; off: number; ch: number; key: number }> = [];
  let title = "";
  for (let i = 0; i < ntrk && p + 8 <= bytes.length; i++) {
    const len = dv.getUint32(p + 4);
    const end = Math.min(bytes.length, p + 8 + len);
    const tr = readTrack(bytes, p + 8, end);
    p = end;
    if (i === 0) title = tr.name;
    tempo.push(...tr.tempo);
    sigs.push(...tr.sig);
    tr.prog.forEach((v, ch) => prog.has(ch) || prog.set(ch, v));
    const open = new Map<number, number[]>();
    const all = [...tr.on.map((e) => ({ ...e, on: true })), ...tr.off.map((e) => ({ ...e, on: false }))].sort(
      (a, b) => a.t - b.t || Number(a.on) - Number(b.on)
    );
    for (const e of all) {
      const k = e.ch * 128 + e.key;
      if (e.on) {
        open.set(k, [...(open.get(k) ?? []), e.t]);
        if (!names.has(e.ch)) names.set(e.ch, tr.name);
      } else {
        const q = open.get(k);
        if (q?.length) spans.push({ on: q.shift() as number, off: Math.max(e.t, 1), ch: e.ch, key: e.key });
      }
    }
    open.forEach((q, k) =>
      q.forEach((on) => spans.push({ on, off: Math.max(tr.last, on + 1), ch: k >> 7, key: k & 127 }))
    );
  }
  if (!spans.length) throw new Error("Tom MIDI-fil");
  tempo.sort((a, b) => a.t - b.t);
  sigs.sort((a, b) => a.t - b.t);
  const endTick = spans.reduce((m, s) => Math.max(m, s.off), 0);
  // bars
  const starts: number[] = [];
  const measures: Meas[] = [];
  let t = 0;
  let sig = { n: 4, d: 4 };
  let si = 0;
  while (t < endTick) {
    while (si < sigs.length && sigs[si].t <= t) sig = sigs[si++];
    if (measures.length >= MAX_BARS) throw new Error("MIDI-filen ar for lang");
    starts.push(t);
    measures.push({ len: sig.n / sig.d, repeatStart: false, repeatEnd: 0, volta: null, tempo: [] });
    t += Math.round((ppq * 4 * sig.n) / sig.d);
  }
  const barAt = (tick: number) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= tick) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };
  const whole = ppq * 4;
  for (const e of tempo) {
    if (e.t >= endTick && e.t > 0) continue;
    const m = barAt(e.t);
    const me = measures[m];
    const off = (e.t - starts[m]) / whole;
    const qpm = 60_000_000 / e.us;
    const last = me.tempo[me.tempo.length - 1];
    if (last && Math.abs(last.off - off) < 1e-9) last.qpm = qpm;
    else me.tempo.push({ off, qpm });
  }
  // notes per channel, split at bar lines
  const parts = new Map<number, ParsedPart>();
  for (const s of spans.sort((a, b) => a.on - b.on)) {
    let part = parts.get(s.ch);
    if (!part) {
      part = {
        id: `C${s.ch + 1}`,
        name: names.get(s.ch) || `Kanal ${s.ch + 1}`,
        xmlProgram: prog.get(s.ch) ?? null,
        xmlDrum: s.ch === 9,
        notes: [],
      };
      parts.set(s.ch, part);
    }
    let a = s.on;
    while (a < s.off) {
      const m = barAt(a);
      const barEnd = m + 1 < starts.length ? starts[m + 1] : Infinity;
      const b = Math.min(s.off, barEnd);
      const n: RawNote = {
        m,
        off: (a - starts[m]) / whole,
        dur: (b - a) / whole,
        midi: s.key,
        tieStart: b < s.off,
        tieStop: a > s.on,
      };
      part.notes.push(n);
      a = b;
    }
  }
  return { parts: [...parts.entries()].sort((x, y) => x[0] - y[0]).map((x) => x[1]), measures, title };
}
