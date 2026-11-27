import { describe, expect, it } from "vitest";
import { parseMusicXml } from "@/lib/score/parse";
import { parseMidiFile } from "@/lib/score/midi";
import { resolveMeasureRepeats } from "@/lib/score/repeat";
import { channelsFor, instrumentFor } from "@/lib/score/instruments";
import {
  buildAlignMap,
  buildEvents,
  buildTimeline,
  expandOrder,
  jumpsOfOrder,
  orderFromJumps,
  positionAt,
  recTimeOfMeasure,
  scoreTimeAt,
} from "@/lib/score/timeline";
import { scoreText, zipEntries } from "@/lib/score/mxl";

const note = (step: string, octave: number, duration: number) =>
  `<note><pitch><step>${step}</step><octave>${octave}</octave></pitch><duration>${duration}</duration></note>`;

function score(measures: string[]): string {
  return `<?xml version="1.0"?><score-partwise><part-list><score-part id="P1"><part-name>Trumpet</part-name></score-part></part-list>
    <part id="P1">${measures.map((content, i) => `<measure number="${i + 1}">${i === 0 ? "<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>" : ""}${content}</measure>`).join("")}</part></score-partwise>`;
}

describe("reading MusicXML", () => {
  it("reads measures, notes at sounding pitch and tempo marks", () => {
    const parsed = parseMusicXml(
      score([
        `<attributes><transpose><chromatic>-2</chromatic></transpose></attributes><sound tempo="90"/>${note("D", 5, 4)}`,
        note("E", 5, 2) + note("F", 5, 2),
      ])
    );

    expect(parsed.parts).toHaveLength(1);
    expect(parsed.measures).toHaveLength(2);
    expect(parsed.measures[0].tempo).toEqual([{ off: 0, qpm: 90 }]);
    expect(parsed.parts[0].notes.map((n) => n.midi)).toEqual([72, 74, 75]);
    expect(instrumentFor(parsed.parts[0].name).label).toBe("Trumpet");
  });

  it("plays repeats and endings out", () => {
    const parsed = parseMusicXml(
      score([
        note("C", 4, 4),
        `<barline location="left"><repeat direction="forward"/></barline>${note("D", 4, 4)}`,
        `<barline location="left"><ending number="1" type="start"/></barline>${note("E", 4, 4)}<barline location="right"><ending number="1" type="stop"/><repeat direction="backward"/></barline>`,
        `<barline location="left"><ending number="2" type="start"/></barline>${note("F", 4, 4)}<barline location="right"><ending number="2" type="discontinue"/></barline>`,
      ])
    );
    const order = expandOrder(parsed.measures);

    expect(order).toEqual([0, 1, 2, 1, 3]);
    expect(orderFromJumps(4, jumpsOfOrder(order))).toEqual(order);
  });

  it("refuses what is not a score", () => {
    expect(() => parseMusicXml("<html/>")).toThrow();
  });
});

describe("the timeline", () => {
  const parsed = parseMusicXml(score([`<sound tempo="120"/>${note("C", 4, 4)}`, note("D", 4, 4), note("E", 4, 4)]));
  const timeline = buildTimeline(parsed.measures);

  it("times every measure at the score's tempo", () => {
    expect(timeline.total).toBeCloseTo(6);
    expect(positionAt(timeline, 3)).toEqual({ occ: 1, m: 1, off: 0.5 });
    expect(buildEvents(timeline, parsed.parts).map((event) => event.t)).toEqual([0, 2, 4]);
  });

  it("maps the recording onto the score through sync points", () => {
    // The recording takes four seconds a measure after a second of silence
    const map = buildAlignMap(timeline, [
      [1, 0, 0],
      [5, 1, 0],
      [9, 2, 0],
      [13, 2, 4],
    ]);

    expect(map).not.toBeNull();
    expect(scoreTimeAt(map!, 0.5)).toBeNull();
    expect(scoreTimeAt(map!, 7)).toBeCloseTo(3);
    expect(recTimeOfMeasure(timeline, map!, 2, 0)).toBeCloseTo(9);
  });
});

describe("measure-repeat signs", () => {
  it("fill the repeated bars with the bar before", () => {
    const items = [
      { m: 0, staff: 1, off: 0, dur: 0.25, midi: 60, tieStart: false, tieStop: false },
      { m: 3, staff: 1, off: 0, dur: 0.25, midi: 64, tieStart: false, tieStop: false },
    ];
    const signs = new Map([
      [1, [{ staff: null, kind: "start" as const, n: 1 }]],
      [3, [{ staff: null, kind: "stop" as const, n: 0 }]],
    ]);

    expect(
      resolveMeasureRepeats(items, signs)
        .map((item) => [item.m, item.midi])
        .sort()
    ).toEqual([
      [0, 60],
      [1, 60],
      [2, 60],
      [3, 64],
    ]);
  });
});

describe("MIDI", () => {
  it("reads notes into bars", () => {
    // Format 0, 96 ticks a quarter: tempo 120, C4 for a whole bar, then E4 for a quarter
    const track = [
      0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0x90, 60, 100, 0x83, 0x00, 0x80, 60, 0, 0x00, 0x90, 64, 100, 0x60,
      0x80, 64, 0, 0x00, 0xff, 0x2f, 0x00,
    ];
    const bytes = new Uint8Array([
      0x4d,
      0x54,
      0x68,
      0x64,
      0,
      0,
      0,
      6,
      0,
      0,
      0,
      1,
      0,
      96,
      0x4d,
      0x54,
      0x72,
      0x6b,
      0,
      0,
      0,
      track.length,
      ...track,
    ]);
    const parsed = parseMidiFile(bytes);

    expect(parsed.measures).toHaveLength(2);
    expect(parsed.measures[0].tempo[0].qpm).toBeCloseTo(120);
    expect(parsed.parts[0].notes.map((n) => [n.m, n.midi])).toEqual([
      [0, 60],
      [1, 64],
    ]);
    expect(channelsFor([false, true, false])).toEqual([0, 9, 1]);
  });
});

describe("compressed MusicXML", () => {
  it("reads the root file a container names, stored or deflated", async () => {
    const encoder = new TextEncoder();
    const files: [string, Uint8Array][] = [
      [
        "META-INF/container.xml",
        encoder.encode('<container><rootfiles><rootfile full-path="score.xml"/></rootfiles></container>'),
      ],
      ["score.xml", encoder.encode("<score-partwise/>")],
    ];
    const zip = storedZip(files);

    expect([...zipEntries(zip).keys()]).toEqual(["META-INF/container.xml", "score.xml"]);
    expect(await scoreText(zip.buffer as ArrayBuffer)).toBe("<score-partwise/>");
    expect(await scoreText(encoder.encode("<score-partwise/>").buffer as ArrayBuffer)).toBe("<score-partwise/>");
  });
});

/** A zip whose entries are stored, not compressed. */
function storedZip(files: [string, Uint8Array][]): Uint8Array {
  const chunks: number[] = [];
  const central: number[] = [];
  const u16 = (n: number) => [n & 0xff, (n >> 8) & 0xff];
  const u32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff];

  for (const [name, content] of files) {
    const encoded = new TextEncoder().encode(name);
    const offset = chunks.length;

    chunks.push(
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(content.length),
      ...u32(content.length),
      ...u16(encoded.length),
      ...u16(0),
      ...encoded,
      ...content
    );
    central.push(
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(content.length),
      ...u32(content.length),
      ...u16(encoded.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...encoded
    );
  }

  const start = chunks.length;

  return new Uint8Array([
    ...chunks,
    ...central,
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(central.length),
    ...u32(start),
    ...u16(0),
  ]);
}
