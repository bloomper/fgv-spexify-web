import { repeatSigns, resolveMeasureRepeats, type RepeatSign } from "@/lib/score/repeat";
import type { Meas, RawNote } from "@/lib/score/timeline";

// MusicXML (score-partwise) -> measures + raw notes per part. Browser only (DOMParser). Pitches are SOUNDING pitches
// (the <transpose> element of transposing instruments is applied). Not handled: grace notes, ornaments, dynamics, D.C./D.S./coda jumps.
export interface ParsedPart {
  id: string;
  name: string;
  xmlProgram: number | null; // <midi-program> - 1
  xmlDrum: boolean; // <midi-channel> 10 or only unpitched notes
  notes: RawNote[];
}
export interface ParsedScore {
  parts: ParsedPart[];
  measures: Meas[];
  title: string;
}

const STEP: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const UNIT: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  "16th": 0.25,
  "32nd": 0.125,
  breve: 8,
};

const kids = (e: Element, tag: string) => Array.from(e.children).filter((c) => c.tagName === tag);
const kid = (e: Element | null | undefined, tag: string) =>
  e ? (Array.from(e.children).find((c) => c.tagName === tag) ?? null) : null;
const txt = (e: Element | null | undefined) => (e?.textContent ?? "").trim();
const num = (e: Element | null | undefined, d = 0) => {
  const v = parseFloat(txt(e));
  return Number.isFinite(v) ? v : d;
};

function metronomeQpm(mt: Element): number | null {
  const unit = txt(kid(mt, "beat-unit"));
  const pm = parseFloat(txt(kid(mt, "per-minute")));
  if (!(pm > 0) || !(unit in UNIT)) return null;
  const dots = kids(mt, "beat-unit-dot").length;
  return pm * UNIT[unit] * (dots ? 2 - 1 / 2 ** dots : 1);
}

export function parseMusicXml(xml: string): ParsedScore {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const root = doc.documentElement;
  if (!root || root.tagName !== "score-partwise" || doc.querySelector("parsererror"))
    throw new Error("Ogiltig MusicXML");
  const names = new Map<string, { name: string; program: number | null; chan10: boolean; unp: Map<string, number> }>();
  for (const sp of Array.from(root.querySelectorAll("part-list > score-part"))) {
    const mi = kid(sp, "midi-instrument");
    const unp = new Map<string, number>();
    for (const m of kids(sp, "midi-instrument")) {
      const u = kid(m, "midi-unpitched");
      if (u) unp.set(m.getAttribute("id") ?? "", num(u) - 1);
    }
    const prog = kid(mi, "midi-program");
    names.set(sp.getAttribute("id") ?? "", {
      name: txt(kid(sp, "part-name")) || txt(kid(sp, "part-abbreviation")) || sp.getAttribute("id") || "Stämma",
      program: prog ? num(prog) - 1 : null,
      chan10: num(kid(mi, "midi-channel")) === 10,
      unp,
    });
  }
  const title = txt(root.querySelector("work > work-title")) || txt(root.querySelector("movement-title"));
  const measures: Meas[] = [];
  const parts: ParsedPart[] = [];
  let partNo = 0;
  for (const pe of kids(root, "part")) {
    const info = names.get(pe.getAttribute("id") ?? "");
    const part: ParsedPart = {
      id: pe.getAttribute("id") ?? `P${partNo + 1}`,
      name: info?.name ?? `Stämma ${partNo + 1}`,
      xmlProgram: info?.program ?? null,
      xmlDrum: !!info?.chan10,
      notes: [],
    };
    let divisions = 1;
    let transpose = 0;
    let timeLen = 1;
    let volta: number[] | null = null;
    let pitched = 0;
    let unpitched = 0;
    const raw: Array<RawNote & { staff: number }> = []; // notes with their staff; bars under a measure-repeat sign are filled in after the loop (repeat.ts)
    const signs = new Map<number, RepeatSign[]>();
    kids(pe, "measure").forEach((me, mi) => {
      const first = partNo === 0;
      let meas = measures[mi];
      if (!meas) {
        meas = { len: 0, repeatStart: false, repeatEnd: 0, volta: null, tempo: [] };
        measures[mi] = meas;
      }
      let pos = 0; // in divisions
      let lastStart = 0;
      let end = 0;
      let endVolta = false;
      const wholes = () => 4 * divisions;
      for (const c of Array.from(me.children)) {
        const tag = c.tagName;
        if (tag === "attributes") {
          const d = kid(c, "divisions");
          if (d) divisions = num(d, divisions) || divisions;
          const t = kid(c, "time");
          if (t) {
            const beats = txt(kid(t, "beats"))
              .split("+")
              .reduce((a, b) => a + (parseInt(b, 10) || 0), 0);
            const bt = num(kid(t, "beat-type"), 4);
            if (beats > 0 && bt > 0) timeLen = beats / bt;
          }
          const tr = kid(c, "transpose");
          if (tr) transpose = num(kid(tr, "chromatic")) + 12 * num(kid(tr, "octave-change"));
          const rs = repeatSigns(c);
          if (rs.length) signs.set(mi, [...(signs.get(mi) ?? []), ...rs]);
        } else if (tag === "backup") pos -= num(kid(c, "duration"));
        else if (tag === "forward") {
          pos += num(kid(c, "duration"));
          end = Math.max(end, pos);
        } else if (tag === "direction" || tag === "sound") {
          if (!first) continue;
          let qpm: number | null = null;
          const snd = tag === "sound" ? c : kid(c, "sound");
          if (snd?.getAttribute("tempo")) qpm = parseFloat(snd.getAttribute("tempo") as string);
          else if (tag === "direction") {
            const mt = c.querySelector("metronome");
            if (mt) qpm = metronomeQpm(mt);
          }
          if (qpm && qpm > 0) meas.tempo.push({ off: Math.max(0, pos) / wholes(), qpm });
        } else if (tag === "barline" && first) {
          const rep = kid(c, "repeat");
          if (rep?.getAttribute("direction") === "forward") meas.repeatStart = true;
          if (rep?.getAttribute("direction") === "backward")
            meas.repeatEnd = Math.max(2, parseInt(rep.getAttribute("times") ?? "2", 10) || 2);
          const en = kid(c, "ending");
          if (en) {
            const ty = en.getAttribute("type");
            if (ty === "start")
              volta = (en.getAttribute("number") ?? "1")
                .split(/[,\s]+/)
                .map((x) => parseInt(x, 10))
                .filter((x) => x > 0);
            else if (ty === "stop" || ty === "discontinue") endVolta = true;
          }
        } else if (tag === "note") {
          if (kid(c, "grace") || kid(c, "cue")) continue;
          const dur = num(kid(c, "duration"));
          const chord = !!kid(c, "chord");
          const start = chord ? lastStart : pos;
          if (!chord) {
            lastStart = pos;
            pos += dur;
          }
          end = Math.max(end, start + dur, pos);
          if (kid(c, "rest")) continue;
          let midi: number;
          const p = kid(c, "pitch");
          if (p) {
            midi =
              12 * (num(kid(p, "octave")) + 1) + (STEP[txt(kid(p, "step"))] ?? 0) + num(kid(p, "alter")) + transpose;
            pitched++;
          } else {
            const up = kid(c, "unpitched");
            if (!up) continue;
            const inst = kid(c, "instrument")?.getAttribute("id") ?? "";
            midi = info?.unp.get(inst) ?? 38;
            unpitched++;
          }
          const ties = kids(c, "tie").map((t) => t.getAttribute("type"));
          raw.push({
            m: mi,
            staff: parseInt(txt(kid(c, "staff")), 10) || 1,
            off: start / wholes(),
            dur: dur / wholes(),
            midi,
            tieStart: ties.includes("start"),
            tieStop: ties.includes("stop"),
          });
        }
      }
      if (first) {
        // measures inside a numbered ending belong to it (ending start..stop), also the ones between
        if (volta && !meas.volta) meas.volta = volta;
        if (endVolta) volta = null;
      }
      const content = end / wholes();
      const implicit = me.getAttribute("implicit") === "yes";
      meas.len = Math.max(meas.len, implicit ? content : Math.max(content, timeLen));
    });
    part.notes = resolveMeasureRepeats(raw, signs).map(({ m, off, dur, midi, tieStart, tieStop }) => ({
      m,
      off,
      dur,
      midi,
      tieStart,
      tieStop,
    }));
    part.xmlDrum = part.xmlDrum || (unpitched > 0 && pitched === 0);
    parts.push(part);
    partNo++;
  }
  if (!parts.length || !measures.length) throw new Error("Tom MusicXML");
  for (const m of measures) {
    if (!m) throw new Error("Saknade takter");
    m.tempo.sort((a, b) => a.off - b.off);
  }
  return { parts, measures, title };
}
