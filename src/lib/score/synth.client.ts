"use client";

import { instrumentFor, type Voice } from "@/lib/score/instruments";
import type { ParsedScore } from "@/lib/score/parse";
import { baseQpm, buildEvents, buildTimeline, type NoteEvent, positionAt, type Timeline, timeOfMeasure } from "@/lib/score/timeline";

/**
 * A part of the score as the listener mixes it.
 */
export type PartState = { name: string; voice: Voice; mute: boolean; solo: boolean; volume: number };

type Timbre = { wave: OscillatorType; attack: number; decay: number; sustain: number; release: number; cutoff: number; vibrato?: number };

/**
 * Timbres by General MIDI program family: oscillators and envelopes, no samples, so that nothing has to be downloaded
 * and no sound font licence comes along. Good enough to hear the parts, not to sound like the band.
 */
function timbre(program: number): Timbre {
  if (program < 8 || (program >= 24 && program < 32) || program === 46) {
    return { wave: "triangle", attack: 0.005, decay: 0.9, sustain: 0.15, release: 0.25, cutoff: 5000 };
  }
  if (program >= 8 && program < 16) {
    return { wave: "sine", attack: 0.002, decay: 1.2, sustain: 0.05, release: 0.6, cutoff: 8000 };
  }
  if (program >= 16 && program < 24) {
    return { wave: "square", attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.08, cutoff: 2500 };
  }
  if (program >= 32 && program < 40) {
    return { wave: "triangle", attack: 0.01, decay: 0.5, sustain: 0.4, release: 0.15, cutoff: 1200 };
  }
  if (program >= 40 && program < 52) {
    return { wave: "sawtooth", attack: 0.08, decay: 0.2, sustain: 0.8, release: 0.25, cutoff: 3000, vibrato: 5 };
  }
  if (program >= 52 && program < 56) {
    return { wave: "sine", attack: 0.06, decay: 0.2, sustain: 0.85, release: 0.2, cutoff: 3000, vibrato: 5.5 };
  }
  if (program >= 56 && program < 64) {
    return { wave: "sawtooth", attack: 0.03, decay: 0.15, sustain: 0.75, release: 0.12, cutoff: 2200 };
  }
  if (program >= 64 && program < 72) {
    return { wave: "square", attack: 0.03, decay: 0.15, sustain: 0.75, release: 0.1, cutoff: 1800 };
  }
  if (program >= 72 && program < 80) {
    return { wave: "sine", attack: 0.04, decay: 0.1, sustain: 0.85, release: 0.1, cutoff: 6000, vibrato: 4.5 };
  }
  return { wave: "sawtooth", attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.15, cutoff: 2500 };
}

const LOOKAHEAD = 0.15;
const TICK_MS = 25;

/**
 * Plays the notes of one score in the browser and tells where in it the playing is, for the cursor. The clock is the
 * AudioContext's; notes are scheduled a little ahead of it, so that timing does not depend on the main thread.
 */
export class ScoreSynth {
  parts: PartState[] = [];
  timeline: Timeline | null = null;
  private events: NoteEvent[] = [];
  private next = 0;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private sounding = new Set<{ stop: (at: number) => void }>();
  private playing = false;
  private baseTime = 0;
  private baseClock = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  /** The tempo, as a factor of the score's. */
  scale = 1;
  private listeners = new Set<() => void>();

  /** Calls the listener whenever playing, the position, the tempo or the parts change; returns how to stop. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private changed() {
    this.listeners.forEach(listener => listener());
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get total(): number {
    return this.timeline?.total ?? 0;
  }

  get baseBpm(): number {
    return this.timeline ? baseQpm(this.timeline) : 120;
  }

  load(score: ParsedScore, order?: readonly number[]) {
    this.pause();
    this.timeline = buildTimeline(score.measures, undefined, order);
    this.events = buildEvents(this.timeline, score.parts);

    const voices = score.parts.map(part => instrumentFor(part.name, part.xmlProgram, part.xmlDrum));

    this.parts = score.parts.map((part, i) => ({ name: part.name, voice: voices[i], mute: false, solo: false, volume: 0.8 }));
    this.baseTime = 0;
    this.next = 0;
    this.changed();
  }

  /** Call from a click, so that the browser lets the sound start. */
  private audio(): AudioContext {
    if (!this.context) {
      const Context = window.AudioContext
        ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.context.destination);

      const length = this.context.sampleRate / 2;

      this.noise = this.context.createBuffer(1, length, this.context.sampleRate);

      const channel = this.noise.getChannelData(0);

      for (let i = 0; i < length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    }
    if (this.context.state !== "running") {
      void this.context.resume().catch(() => undefined);
    }
    return this.context;
  }

  private gain(part: number): number {
    const anySolo = this.parts.some(p => p.solo);
    const state = this.parts[part];

    return !state || state.mute || (anySolo && !state.solo) ? 0 : state.volume;
  }

  setPart(index: number, patch: Partial<Pick<PartState, "mute" | "solo" | "volume">>) {
    Object.assign(this.parts[index], patch);
    this.changed();
  }

  setScale(scale: number) {
    const now = this.time();

    this.scale = scale;
    this.rebase(now);
    this.changed();
  }

  private clock(): number {
    return this.context?.currentTime ?? 0;
  }

  private rebase(time: number) {
    this.baseTime = time;
    this.baseClock = this.clock();
  }

  /** Where the playing is, in seconds of the score at its own tempo. */
  time(): number {
    return this.playing ? Math.min(this.total, this.baseTime + (this.clock() - this.baseClock) * this.scale) : this.baseTime;
  }

  /** The written measure and the offset in it, in whole notes, for the cursor. */
  position(): { m: number; off: number } | null {
    return this.timeline ? positionAt(this.timeline, this.time()) : null;
  }

  play() {
    if (this.playing || !this.timeline) {
      return;
    }
    this.audio();
    if (this.baseTime >= this.total - 0.05) {
      this.seek(0);
    }
    this.rebase(this.baseTime);
    this.playing = true;
    this.timer = setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
    this.changed();
  }

  pause() {
    if (!this.playing) {
      return;
    }
    this.baseTime = this.time();
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = null;
    this.silence();
    this.changed();
  }

  seek(time: number) {
    const target = Math.min(Math.max(0, time), this.total);

    this.silence();
    this.rebase(target);

    let lo = 0;
    let hi = this.events.length;

    while (lo < hi) {
      const mid = (lo + hi) >> 1;

      if (this.events[mid].t < target) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    this.next = lo;
    this.changed();
  }

  seekMeasure(measure: number) {
    if (this.timeline) {
      this.seek(timeOfMeasure(this.timeline, measure));
    }
  }

  dispose() {
    this.pause();
    void this.context?.close().catch(() => undefined);
    this.context = null;
  }

  private schedule() {
    const context = this.context;

    if (!context || !this.playing) {
      return;
    }

    const now = this.time();
    const horizon = now + LOOKAHEAD * this.scale;

    while (this.next < this.events.length && this.events[this.next].t <= horizon) {
      const event = this.events[this.next++];
      const gain = this.gain(event.part);

      if (gain > 0 && event.t >= now - 0.05) {
        const at = this.baseClock + (event.t - this.baseTime) / this.scale;

        this.note(this.parts[event.part].voice, event.midi, Math.max(context.currentTime, at), Math.max(0.05, event.d / this.scale), gain);
      }
    }
    if (now >= this.total && this.next >= this.events.length) {
      this.pause();
      this.baseTime = this.total;
      this.changed();
    }
  }

  private note(voice: Voice, midi: number, at: number, duration: number, gain: number) {
    const context = this.context as AudioContext;
    const output = context.createGain();

    output.connect(this.master as GainNode);
    if (voice.drum) {
      this.drum(midi, at, gain, output);
      return;
    }

    const sound = timbre(voice.program);
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const peak = gain * 0.6;
    const end = at + duration;

    oscillator.type = sound.wave;
    oscillator.frequency.setValueAtTime(frequency, at);
    filter.type = "lowpass";
    filter.frequency.value = Math.min(sound.cutoff, frequency * 8);
    oscillator.connect(filter).connect(output);
    if (sound.vibrato) {
      const lfo = context.createOscillator();
      const depth = context.createGain();

      lfo.frequency.value = sound.vibrato;
      depth.gain.setValueAtTime(0, at);
      depth.gain.linearRampToValueAtTime(frequency * 0.006, at + 0.3);
      lfo.connect(depth).connect(oscillator.frequency);
      lfo.start(at);
      lfo.stop(end + sound.release + 0.05);
    }
    output.gain.setValueAtTime(0, at);
    output.gain.linearRampToValueAtTime(peak, at + sound.attack);
    output.gain.setTargetAtTime(peak * sound.sustain, at + sound.attack, sound.decay / 3);
    output.gain.setValueAtTime(peak * sound.sustain, end);
    output.gain.setTargetAtTime(0, end, sound.release / 3);
    oscillator.start(at);
    oscillator.stop(end + sound.release + 0.05);

    const handle = {
      stop: (when: number) => {
        output.gain.cancelScheduledValues(when);
        output.gain.setTargetAtTime(0, when, 0.02);
        try {
          oscillator.stop(when + 0.1);
        } catch {
          // already stopped
        }
      },
    };

    this.sounding.add(handle);
    oscillator.onended = () => {
      this.sounding.delete(handle);
      output.disconnect();
    };
  }

  /** A drum: a sweeping sine for the bass drum, filtered noise for the rest. */
  private drum(key: number, at: number, gain: number, output: GainNode) {
    const context = this.context as AudioContext;

    if (key === 35 || key === 36) {
      const oscillator = context.createOscillator();

      oscillator.frequency.setValueAtTime(120, at);
      oscillator.frequency.exponentialRampToValueAtTime(45, at + 0.15);
      output.gain.setValueAtTime(gain, at);
      output.gain.exponentialRampToValueAtTime(0.001, at + 0.3);
      oscillator.connect(output);
      oscillator.start(at);
      oscillator.stop(at + 0.35);
      oscillator.onended = () => output.disconnect();
      return;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const cymbal = key === 42 || key === 44 || key === 46 || key >= 49;
    const length = key === 46 || key >= 49 ? 0.6 : cymbal ? 0.08 : 0.18;

    source.buffer = this.noise;
    filter.type = cymbal ? "highpass" : "bandpass";
    filter.frequency.value = cymbal ? 7000 : 1800;
    output.gain.setValueAtTime(gain * (cymbal ? 0.35 : 0.6), at);
    output.gain.exponentialRampToValueAtTime(0.001, at + length);
    source.connect(filter).connect(output);
    source.start(at);
    source.stop(at + length + 0.02);
    source.onended = () => output.disconnect();
  }

  private silence() {
    const at = this.clock();

    this.sounding.forEach(note => note.stop(at));
    this.sounding.clear();
  }
}
