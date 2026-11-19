import { vi } from "vitest";

/** A Web Audio stand-in: nodes that connect and schedule, and a clock the test moves. */
export class FakeAudioContext {
  static last: FakeAudioContext | null = null;
  currentTime = 0;
  sampleRate = 8000;
  state = "running";
  destination = {};
  started: { type: string; at: number; frequency?: number }[] = [];

  constructor() {
    FakeAudioContext.last = this;
  }

  resume = vi.fn(async () => undefined);
  close = vi.fn(async () => undefined);

  private param() {
    return {
      value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn(),
    };
  }

  private node(type: string) {
    const node = {
      type, gain: this.param(), frequency: this.param(), buffer: null as unknown, onended: null as null | (() => void),
      connect: vi.fn((target: unknown) => target),
      disconnect: vi.fn(),
      start: vi.fn((at: number) => this.started.push({ type, at, frequency: node.frequency.setValueAtTime.mock.calls[0]?.[0] })),
      stop: vi.fn(() => node.onended?.()),
    };

    return node;
  }

  createGain = () => this.node("gain");
  createOscillator = () => this.node("oscillator");
  createBiquadFilter = () => this.node("filter");
  createBufferSource = () => this.node("noise");
  createBuffer = (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) });
}
