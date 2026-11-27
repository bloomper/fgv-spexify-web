import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseMusicXml } from "@/lib/score/parse";
import { ScoreSynth } from "@/lib/score/synth.client";
import { FakeAudioContext } from "@/lib/score/__tests__/fake-audio";

const xml = `<score-partwise><part-list>
  <score-part id="P1"><part-name>Piano</part-name></score-part>
  <score-part id="P2"><part-name>Trummor</part-name></score-part>
  <score-part id="P3"><part-name>Fiol</part-name></score-part></part-list>
  <part id="P1"><measure><attributes><divisions>1</divisions></attributes><sound tempo="120"/>
    <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration></note>
    <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration></note></measure>
    <measure><note><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration></note></measure></part>
  <part id="P2"><measure><attributes><divisions>1</divisions></attributes>
    <note><unpitched><display-step>C</display-step><display-octave>4</display-octave></unpitched><duration>1</duration><instrument id="x"/></note>
    <note><unpitched><display-step>F</display-step><display-octave>5</display-octave></unpitched><duration>3</duration></note></measure>
    <measure><note><rest/><duration>4</duration></note></measure></part>
  <part id="P3"><measure><attributes><divisions>1</divisions></attributes><note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration></note></measure>
    <measure><note><rest/><duration>4</duration></note></measure></part>
</score-partwise>`;

describe("the score synth", () => {
  let synth: ScoreSynth;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioContext", FakeAudioContext);
    synth = new ScoreSynth();
    synth.load(parseMusicXml(xml));
  });

  afterEach(() => {
    synth.dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("plays the notes ahead of the clock and says where it is", () => {
    const changes = vi.fn();

    synth.subscribe(changes);
    expect(synth.total).toBeCloseTo(4);
    expect(synth.baseBpm).toBe(120);
    expect(synth.parts.map((part) => part.voice.drum)).toEqual([false, true, false]);
    synth.play();
    expect(synth.isPlaying).toBe(true);

    const context = FakeAudioContext.last!;

    // The first notes start at once: the A of the piano and the violin's G, and the drums
    expect(
      context.started.filter((start) => start.type === "oscillator").map((start) => Math.round(start.frequency ?? 0))
    ).toContain(440);
    context.currentTime = 1.1;
    vi.advanceTimersByTime(50);
    expect(synth.position()).toMatchObject({ m: 0, off: expect.closeTo(0.55, 2) });
    context.currentTime = 4.2;
    vi.advanceTimersByTime(50);
    expect(synth.isPlaying).toBe(false);
    expect(changes).toHaveBeenCalled();
  });

  it("seeks, changes the tempo and mixes the parts", () => {
    synth.seekMeasure(1);
    expect(synth.time()).toBeCloseTo(2);
    synth.setScale(2);
    expect(synth.scale).toBe(2);
    synth.setPart(0, { solo: true });
    synth.setPart(1, { mute: true });
    synth.play();

    const context = FakeAudioContext.last!;
    const before = context.started.length;

    context.currentTime = 0.5;
    vi.advanceTimersByTime(50);
    expect(synth.time()).toBeCloseTo(3);
    synth.pause();
    expect(synth.isPlaying).toBe(false);
    expect(context.started.length).toBeGreaterThanOrEqual(before);
    synth.seek(-5);
    expect(synth.time()).toBe(0);
  });
});
