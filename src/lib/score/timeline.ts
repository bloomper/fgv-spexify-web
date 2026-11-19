// Pure score timeline: repeat expansion, tempo map and note events. No DOM, no imports (unit-tested with node).
// Positions inside a measure are in whole notes (quarter = 0.25). Time is in seconds at 100 % tempo.

export interface Meas {
  len: number; // length in whole notes
  repeatStart: boolean; // forward repeat at the left barline
  repeatEnd: number; // backward repeat: number of plays (>= 2), 0 = none
  volta: number[] | null; // ending numbers this measure belongs to (1st / 2nd ending), null = none
  tempo: Array<{ off: number; qpm: number }>; // tempo marks (quarter notes per minute) inside the measure
}

export interface RawNote {
  m: number; // written measure index
  off: number; // start inside the measure, whole notes
  dur: number; // whole notes
  midi: number; // sounding pitch (or percussion key)
  tieStart: boolean;
  tieStop: boolean;
}

export interface Occ {
  m: number; // written measure
  start: number; // seconds
  end: number;
  qpm0: number; // tempo at the start of this play of the measure
}

export interface NoteEvent {
  part: number;
  t: number; // seconds
  d: number; // seconds
  midi: number;
  occ: number; // index into Timeline.occs
}

/** Order in which written measures are played, with repeats and numbered endings. Other jumps (D.C., D.S., coda) are not followed. */
export function expandOrder(ms: readonly Meas[]): number[] {
  const order: number[] = [];
  const done = new Map<number, number>(); // repeat-end measure -> repeats already taken
  let start = 0;
  let pass = 1;
  let i = 0;
  let guard = 0;
  let vprev: number[] | null = null; // volta of the last ending bar passed: the pass stays until the ending group is over
  while (i < ms.length && guard++ < 10000) {
    const m = ms[i];
    const vo = m.volta;
    if (vo && vo.length) {
      if (
        vprev &&
        !(vo.length === vprev.length && vo.every((x, k) => x === vprev![k])) &&
        Math.min(...vo) <= Math.min(...vprev)
      )
        pass = 1; // a new ending group follows directly
      vprev = vo;
      if (!vo.includes(pass)) {
        i++;
        continue;
      }
    } else if (vprev) {
      pass = 1; // left the endings
      vprev = null;
    }
    if (m.repeatStart) start = i;
    order.push(i);
    if (m.repeatEnd >= 2) {
      const n = done.get(i) ?? 0;
      if (n < m.repeatEnd - 1) {
        done.set(i, n + 1);
        pass = vo && vo.length ? pass + 1 : n + 2;
        vprev = null;
        i = start;
        continue;
      }
      pass = 1;
      start = i + 1;
    }
    i++;
  }
  return order;
}

/** A jump of the recording through the written score: after measure `after` is played it continues at `to` (repeats, cuts).
 * nth = which play of `after` it belongs to (0 = the first); without it the first unused jump of that measure is taken. */
export interface Jump {
  after: number;
  to: number;
  nth?: number | null;
}

/** Play order of a recording described by jumps: measures 0, 1, 2 ... with every jump taken when its `after` measure has been played (score repeat signs are not followed: they are jumps too). */
export function orderFromJumps(n: number, jumps: readonly Jump[]): number[] {
  const out: number[] = [];
  const used = new Set<number>();
  const plays = new Map<number, number>();
  let m = 0;
  while (m >= 0 && m < n && out.length < 20000) {
    out.push(m);
    const k = plays.get(m) ?? 0;
    plays.set(m, k + 1);
    const j = jumps.findIndex((x, i) => !used.has(i) && x.after === m && (x.nth == null || x.nth === k));
    if (j >= 0) {
      used.add(j);
      m = jumps[j].to;
    } else m++;
  }
  return out;
}

/** Inverse of orderFromJumps: the jumps that turn the linear walk into `order` (e.g. expandOrder of a score with repeat signs). */
export function jumpsOfOrder(order: readonly number[]): Jump[] {
  const out: Jump[] = [];
  const plays = new Map<number, number>();
  order.forEach((m, i) => {
    const k = plays.get(m) ?? 0;
    plays.set(m, k + 1);
    if (i + 1 < order.length && order[i + 1] !== m + 1) out.push({ after: m, to: order[i + 1], nth: k });
  });
  return out;
}

/** Seconds from the start of a measure play to offset off (whole notes), with tempo changes. Past the measure end the last tempo goes on. */
export function secIn(qpm0: number, tempo: ReadonlyArray<{ off: number; qpm: number }>, off: number): number {
  let t = 0;
  let last = 0;
  let cur = qpm0;
  for (const c of tempo) {
    if (c.off >= off) break;
    t += ((c.off - last) * 240) / cur;
    last = Math.max(last, c.off);
    cur = c.qpm;
  }
  return t + ((off - last) * 240) / cur;
}

/** Inverse of secIn: offset (whole notes) at s seconds into a measure play. */
export function offIn(qpm0: number, tempo: ReadonlyArray<{ off: number; qpm: number }>, s: number): number {
  let t = 0;
  let last = 0;
  let cur = qpm0;
  for (const c of tempo) {
    const seg = ((c.off - last) * 240) / cur;
    if (t + seg > s) break;
    t += seg;
    last = Math.max(last, c.off);
    cur = c.qpm;
  }
  return last + ((s - t) * cur) / 240;
}

export interface Timeline {
  occs: Occ[];
  total: number; // seconds
  measures: readonly Meas[];
}

export const DEFAULT_QPM = 120;

export function buildTimeline(ms: readonly Meas[], defaultQpm = DEFAULT_QPM, playOrder?: readonly number[]): Timeline {
  const order = playOrder ?? expandOrder(ms);
  const occs: Occ[] = [];
  let t = 0;
  let qpm = defaultQpm;
  for (const m of order) {
    const me = ms[m];
    const len = secIn(qpm, me.tempo, me.len);
    occs.push({ m, start: t, end: t + len, qpm0: qpm });
    t += len;
    if (me.tempo.length) qpm = me.tempo[me.tempo.length - 1].qpm;
  }
  return { occs, total: t, measures: ms };
}

/** Tempo (quarter notes per minute) at the start of the piece: the first tempo mark when it sits at the very start, else the default. */
export function baseQpm(tl: Timeline): number {
  const m0 = tl.occs.length ? tl.measures[tl.occs[0].m] : null;
  return m0 && m0.tempo.length && m0.tempo[0].off <= 1e-6 ? m0.tempo[0].qpm : DEFAULT_QPM;
}

/** Score tempo (quarter notes per minute, 100 % speed) at time t: the last tempo mark at or before the position, else the tempo the measure began with. */
export function qpmAt(tl: Timeline, t: number): number {
  const i = occAt(tl, t);
  if (i < 0) return DEFAULT_QPM;
  const oc = tl.occs[i];
  const me = tl.measures[oc.m];
  const off = offIn(oc.qpm0, me.tempo, Math.max(0, t - oc.start));
  let q = oc.qpm0;
  for (const c of me.tempo) if (c.off <= off + 1e-9) q = c.qpm;
  return q;
}

/** Index of the occurrence playing at time t (clamped). */
export function occAt(tl: Timeline, t: number): number {
  const o = tl.occs;
  if (o.length === 0) return -1;
  let lo = 0;
  let hi = o.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (o[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Written measure + offset (whole notes) at time t, for the cursor. */
export function positionAt(tl: Timeline, t: number): { occ: number; m: number; off: number } | null {
  const i = occAt(tl, t);
  if (i < 0) return null;
  const oc = tl.occs[i];
  const me = tl.measures[oc.m];
  const off = Math.min(Math.max(0, offIn(oc.qpm0, me.tempo, Math.max(0, t - oc.start))), me.len);
  return { occ: i, m: oc.m, off };
}

/** First time a written measure is played (for tap-to-seek). */
export function timeOfMeasure(tl: Timeline, m: number): number {
  const o = tl.occs.find((x) => x.m === m);
  return o ? o.start : 0;
}

/** Note events of all plays of every measure; tied notes (same part and pitch, back to back) are merged into one. */
export function buildEvents(tl: Timeline, parts: ReadonlyArray<{ notes: readonly RawNote[] }>): NoteEvent[] {
  const byMeasure = new Map<number, Array<{ part: number; n: RawNote }>>();
  parts.forEach((p, part) => {
    for (const n of p.notes) {
      const l = byMeasure.get(n.m);
      if (l) l.push({ part, n });
      else byMeasure.set(n.m, [{ part, n }]);
    }
  });
  const out: NoteEvent[] = [];
  const open = new Map<string, NoteEvent>(); // part:midi of a note whose tie goes on
  tl.occs.forEach((oc, occ) => {
    const me = tl.measures[oc.m];
    const items = (byMeasure.get(oc.m) ?? []).slice().sort((a, b) => a.n.off - b.n.off);
    for (const { part, n } of items) {
      const t = oc.start + secIn(oc.qpm0, me.tempo, n.off);
      const d = secIn(oc.qpm0, me.tempo, n.off + n.dur) - secIn(oc.qpm0, me.tempo, n.off);
      const key = `${part}:${n.midi}`;
      const prev = n.tieStop ? open.get(key) : undefined;
      if (prev && Math.abs(prev.t + prev.d - t) < 0.02) {
        prev.d += d;
        if (!n.tieStart) open.delete(key);
        continue;
      }
      open.delete(key);
      const ev: NoteEvent = { part, t, d, midi: n.midi, occ };
      out.push(ev);
      if (n.tieStart) open.set(key, ev);
    }
  });
  return out.sort((a, b) => a.t - b.t || a.midi - b.midi);
}

// ---- Recording alignment: the server's score sync maps (Track.scoreSyncs).
// points = [[rec_s, m, beat], ...] in performance order, m = 0-based written measure, beat = quarter notes from the measure start.
export interface AlignData {
  points: ReadonlyArray<readonly [number, number, number]>;
  quality?: number;
  method?: string;
  jumps?: readonly Jump[]; // how the recording walks through the written score (always for manual maps; AI maps only when it differs from the repeat signs)
  gaps?: ReadonlyArray<readonly [number, number]>; // recording spans (s) inside the map that the score does not cover: no cursor there
}
export interface AlignMap {
  rec: number[]; // recording seconds, strictly increasing
  sc: number[]; // score-timeline seconds (100 % tempo), strictly increasing
  gaps?: AlignData["gaps"]; // recording spans with no sync, never interpolated across
}

/** Place every point on the timeline occurrence of its measure nearest after the previous point (repeats), skip points that do not fit.
 * used[i] tells whether points[i] was placed (the editor flags the others). */
export function fitPoints(
  tl: Timeline,
  points: AlignData["points"],
  gaps?: AlignData["gaps"]
): { map: AlignMap | null; used: boolean[] } {
  const rec: number[] = [];
  const sc: number[] = [];
  const used: boolean[] = points.map(() => false);
  let from = 0;
  points.forEach(([r, m, beat], pi) => {
    if (!(r > (rec.length ? rec[rec.length - 1] : -1)) || !Number.isFinite(r)) return;
    const me = tl.measures[m];
    if (!me) return;
    for (let i = from; i < tl.occs.length; i++) {
      const oc = tl.occs[i];
      if (oc.m !== m) continue;
      const t = oc.start + secIn(oc.qpm0, me.tempo, Math.min(Math.max(0, beat / 4), me.len));
      if (sc.length && t <= sc[sc.length - 1]) continue; // same bar again later: next play
      rec.push(r);
      sc.push(t);
      used[pi] = true;
      from = i;
      break;
    }
  });
  return { map: rec.length >= 2 ? (gaps?.length ? { rec, sc, gaps } : { rec, sc }) : null, used };
}

export const buildAlignMap = (tl: Timeline, points: AlignData["points"], gaps?: AlignData["gaps"]): AlignMap | null =>
  fitPoints(tl, points, gaps).map;

function interp(xs: number[], ys: number[], x: number): number | null {
  const n = xs.length;
  if (n < 2 || x < xs[0] || x > xs[n - 1]) return null;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const f = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + f * (ys[hi] - ys[lo]);
}
const inGap = (a: AlignMap, r: number) => !!a.gaps?.some(([x, y]) => r > x && r < y);
/** Score-timeline seconds at recording second r; null before the first / after the last point and inside a gap (no cursor). */
export const scoreTimeAt = (a: AlignMap, r: number) => (inGap(a, r) ? null : interp(a.rec, a.sc, r));
/** Recording second at score-timeline second t; null when the map does not cover it. */
export function recTimeAt(a: AlignMap, t: number): number | null {
  const r = interp(a.sc, a.rec, t);
  return r === null || inGap(a, r) ? null : r;
}

/** Recording second to seek to for a tapped written measure: the play of it nearest to score time `near`; null when no map covers it. */
export function recTimeOfMeasure(tl: Timeline, a: AlignMap, m: number, near: number): number | null {
  let best: number | null = null;
  let bd = Infinity;
  for (const oc of tl.occs) {
    if (oc.m !== m) continue;
    const r = recTimeAt(a, oc.start);
    if (r === null) continue;
    const d = Math.abs(oc.start - near);
    if (d < bd) {
      bd = d;
      best = r;
    }
  }
  return best;
}
