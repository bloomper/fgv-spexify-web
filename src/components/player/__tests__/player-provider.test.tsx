import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import * as React from "react";
import {
  gainFactor,
  playedSince,
  PlayerProvider,
  type PlayerTrack,
  usePlayer,
} from "@/components/player/player-provider.client";

const scrobbleAction = vi.hoisted(() => vi.fn());
const loadPlayQueueAction = vi.hoisted(() => vi.fn());
const savePlayQueueAction = vi.hoisted(() => vi.fn());

vi.mock("@/components/player/actions.server", () => ({ scrobbleAction, loadPlayQueueAction, savePlayQueueAction }));

const track = (id: string, navidromeId: string | null = `nd-${id}`): PlayerTrack =>
  ({ id, title: `Låt ${id}`, albumId: "1", albumTitle: "Nobel", durationMs: 60_000, navidromeId });
const TRACKS = [track("1"), track("2"), track("3", null)];

// The element that plays; the other one holds the preloaded next track
const audio = () => {
  const [first, second] = Array.from(document.querySelectorAll("audio"));

  return second?.getAttribute("src") && !first.getAttribute("src") ? second : first;
};

function render() {
  return renderHook(() => usePlayer(), {
    wrapper: ({ children }: { children: React.ReactNode }) => <PlayerProvider>{children}</PlayerProvider>,
  });
}

describe("PlayerProvider", () => {
  beforeEach(() => {
    scrobbleAction.mockReset();
    loadPlayQueueAction.mockReset().mockResolvedValue(null);
    savePlayQueueAction.mockReset().mockResolvedValue(undefined);
    localStorage.clear();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function(this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function(this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("plays a queue from the chosen track through the audio route and reports the play", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 1));

    expect(result.current.current?.id).toBe("2");
    expect(audio().src).toMatch(/\/api\/audio\/2$/);
    expect(result.current.playing).toBe(true);
    expect(scrobbleAction).toHaveBeenCalledWith("nd-2", false);
  });

  it("renews an expired link once, then says when a track cannot be loaded, retries from where it stopped, and clears the error on another track", () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 0));
    audio().currentTime = 42;
    // The first error mid-track may be an expired link: a new one is asked for, without telling the user
    act(() => {
      audio().dispatchEvent(new Event("error"));
    });
    expect(result.current.failed).toBe(false);
    expect(audio().src).toContain("/api/audio/1");
    audio().currentTime = 42;
    act(() => {
      audio().dispatchEvent(new Event("error"));
    });
    expect(result.current.failed).toBe(true);
    expect(result.current.playing).toBe(false);

    act(() => result.current.toggle());
    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.failed).toBe(false);
    expect(result.current.playing).toBe(true);
    act(() => {
      audio().dispatchEvent(new Event("loadedmetadata"));
    });
    expect(audio().currentTime).toBe(42);

    act(() => {
      audio().dispatchEvent(new Event("error"));
    });
    act(() => result.current.next());
    expect(result.current.current?.id).toBe("2");
    expect(result.current.failed).toBe(false);
  });

  it("moves on, stops at the end, and starts over when repeating all", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 2));
    act(() => result.current.next());
    expect(result.current.current?.id).toBe("3");
    expect(result.current.playing).toBe(false);

    act(() => result.current.cycleRepeat());
    expect(result.current.repeat).toBe("all");
    act(() => result.current.next());
    expect(result.current.current?.id).toBe("1");
  });

  it("goes back a track, or to the start of the track after three seconds", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 1));
    act(() => {
      audio().currentTime = 10;
    });
    act(() => result.current.previous());
    expect(result.current.current?.id).toBe("2");
    expect(audio().currentTime).toBe(0);

    act(() => result.current.previous());
    expect(result.current.current?.id).toBe("1");
  });

  it("plays the next track when one ends, or the same one when repeating it", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS));
    act(() => audio().dispatchEvent(new Event("ended")));
    expect(result.current.current?.id).toBe("2");

    act(() => {
      result.current.cycleRepeat();
      result.current.cycleRepeat();
    });
    expect(result.current.repeat).toBe("one");
    act(() => audio().dispatchEvent(new Event("ended")));
    expect(result.current.current?.id).toBe("2");
  });

  it("adds to the queue and starts playing when it was empty", () => {
    const { result } = render();

    act(() => result.current.enqueue([track("9")]));
    expect(result.current.current?.id).toBe("9");
    act(() => result.current.enqueue([track("10")]));
    expect(result.current.queue.map(t => t.id)).toEqual(["9", "10"]);
    act(() => result.current.jump(1));
    expect(result.current.current?.id).toBe("10");
    act(() => result.current.jump(5));
    expect(result.current.current?.id).toBe("10");
  });

  it("keeps the playing track first when shuffling", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 1));
    act(() => result.current.setShuffle(true));

    expect(result.current.shuffle).toBe(true);
    expect(result.current.current?.id).toBe("2");
    expect(result.current.queue.map(t => t.id).sort()).toEqual(["1", "2", "3"]);
  });

  it("toggles pause and play", () => {
    const { result } = render();

    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);

    act(() => result.current.playQueue(TRACKS));
    Object.defineProperty(audio(), "paused", { configurable: true, get: () => false });
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);
  });

  it("counts a play once half of the track or four minutes have been heard", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS));
    Object.defineProperty(audio(), "duration", { configurable: true, get: () => 60 });
    act(() => {
      audio().currentTime = 31;
      audio().dispatchEvent(new Event("timeupdate"));
      audio().dispatchEvent(new Event("timeupdate"));
    });

    expect(scrobbleAction).toHaveBeenCalledWith("nd-1", true);
    expect(scrobbleAction.mock.calls.filter(call => call[1] === true)).toHaveLength(1);
    expect(result.current.time).toBe(31);
  });

  it("is only available inside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderHook(() => usePlayer())).toThrow("usePlayer must be used inside PlayerProvider");
  });

  it("takes up the saved queue, paused where it was left, without reporting a play", async () => {
    loadPlayQueueAction.mockResolvedValue({ tracks: TRACKS.slice(0, 2), index: 1, positionSeconds: 42 });
    const { result } = render();

    await vi.waitFor(() => expect(result.current.current?.id).toBe("2"));
    expect(result.current.queue).toHaveLength(2);
    expect(result.current.playing).toBe(false);
    expect(result.current.time).toBe(42);
    expect(audio().src).toMatch(/\/api\/audio\/2$/);
    expect(scrobbleAction).not.toHaveBeenCalled();
  });

  it("keeps what the user started while the saved queue was on its way", async () => {
    let answer: (value: unknown) => void = () => undefined;

    loadPlayQueueAction.mockReturnValue(new Promise(resolve => answer = resolve));
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 0));
    await act(async () => answer({ tracks: [track("9")], index: 0, positionSeconds: 0 }));

    expect(result.current.current?.id).toBe("1");
  });

  it("saves the queue's songs Navidrome knows, the current one and the position, once the saved queue was read", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { result } = render();

      await act(async () => undefined);
      act(() => result.current.playQueue(TRACKS, 1));
      audio().currentTime = 12;
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(savePlayQueueAction).toHaveBeenLastCalledWith(["nd-1", "nd-2"], "nd-2", 12000);
    } finally {
      vi.useRealTimers();
    }
  });

  it("saves nothing before the saved queue was read", () => {
    loadPlayQueueAction.mockReturnValue(new Promise(() => undefined));
    vi.useFakeTimers();
    try {
      const { result } = render();

      act(() => result.current.playQueue(TRACKS, 0));
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(savePlayQueueAction).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("removes, moves and clears tracks in the queue, keeping the playing track", () => {
    const { result } = render();

    act(() => result.current.playQueue([track("1"), track("2"), track("4"), track("5")], 1));
    act(() => result.current.move(3, 0));
    expect(result.current.queue.map(t => t.id)).toEqual(["5", "1", "2", "4"]);
    expect(result.current.current?.id).toBe("2");

    act(() => result.current.remove(0));
    expect(result.current.queue.map(t => t.id)).toEqual(["1", "2", "4"]);
    expect(result.current.current?.id).toBe("2");

    act(() => result.current.remove(1));
    expect(result.current.current?.id).toBe("4");
    expect(audio().src).toMatch(/\/api\/audio\/4$/);

    act(() => result.current.clear());
    expect(result.current.queue).toEqual([]);
    expect(result.current.current).toBeNull();
  });

  it("keeps the volume and mute in the browser and turns tracks down by their ReplayGain", () => {
    const { result, unmount } = render();
    const loud: PlayerTrack = {
      ...track("1"),
      replayGain: { trackGain: -6, trackPeak: 0.9, albumGain: -3, albumPeak: 0.9 },
    };

    act(() => result.current.playQueue([loud], 0));
    expect(audio().volume).toBeCloseTo(0.501, 2);

    act(() => result.current.setVolume(0.5));
    expect(audio().volume).toBeCloseTo(0.2506, 3);
    act(() => result.current.setReplayGain("album"));
    expect(audio().volume).toBeCloseTo(0.354, 2);
    act(() => result.current.toggleMute());
    expect(audio().volume).toBe(0);
    unmount();

    const again = render();

    expect(again.result.current.volume).toBe(0.5);
    expect(again.result.current.muted).toBe(true);
    expect(again.result.current.replayGain).toBe("album");
  });

  it("preloads the next track in the other element and switches to it", () => {
    vi.useFakeTimers();
    try {
      const { result } = render();
      const [first, second] = Array.from(document.querySelectorAll("audio"));

      act(() => result.current.playQueue(TRACKS, 0));
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(second.getAttribute("src")).toBe("/api/audio/2");

      Object.defineProperty(second, "readyState", { value: 4, configurable: true });
      Object.defineProperty(second, "duration", { value: 95, configurable: true });
      // The preloaded element says how long it is while it waits
      act(() => {
        second.dispatchEvent(new Event("durationchange"));
      });
      act(() => {
        first.dispatchEvent(new Event("ended"));
      });
      expect(result.current.duration).toBe(95);
      expect(result.current.current?.id).toBe("2");
      expect(first.getAttribute("src")).toBeNull();
      expect(second.getAttribute("src")).toBe("/api/audio/2");
      expect(result.current.playing).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays playing when a track ends and the next one starts in the other element", () => {
    vi.useFakeTimers();
    try {
      const { result } = render();
      const [first, second] = Array.from(document.querySelectorAll("audio"));

      act(() => result.current.playQueue(TRACKS, 0));
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      Object.defineProperty(second, "readyState", { value: 4, configurable: true });
      // A track that ends pauses before it says it ended, and the next one starts before React has rendered again
      act(() => {
        first.dispatchEvent(new Event("pause"));
        first.dispatchEvent(new Event("ended"));
      });
      expect(result.current.playing).toBe(true);

      // The element that stopped no longer speaks for the player
      act(() => {
        first.dispatchEvent(new Event("pause"));
      });
      expect(result.current.playing).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("counts a heard track among this session's plays", () => {
    const { result } = render();

    act(() => result.current.playQueue(TRACKS, 0));
    Object.defineProperty(audio(), "duration", { value: 60, configurable: true });
    audio().currentTime = 31;
    act(() => {
      audio().dispatchEvent(new Event("timeupdate"));
    });
    expect(result.current.plays["nd-1"]?.count).toBe(1);
  });
});

describe("gainFactor and playedSince", () => {
  it("only turns down, and never past the peak", () => {
    expect(gainFactor({ trackGain: -6.0206, trackPeak: 0.5 }, "track")).toBeCloseTo(0.5, 3);
    expect(gainFactor({ trackGain: 6, trackPeak: 0.5 }, "track")).toBe(1);
    expect(gainFactor({ trackGain: 6, trackPeak: 1.25 }, "track")).toBeCloseTo(0.8, 3);
    expect(gainFactor({ trackGain: -6, trackPeak: 0.5, albumGain: null }, "album")).toBeCloseTo(0.501, 2);
    expect(gainFactor({ trackGain: -6, trackPeak: 0.5 }, "off")).toBe(1);
    expect(gainFactor(null, "track")).toBe(1);
  });

  it("tells whether Navidrome's numbers lag behind a play", () => {
    expect(playedSince(null, "2026-11-02T10:00:00Z")).toBe(true);
    expect(playedSince("2026-11-01T10:00:00Z", "2026-11-02T10:00:00Z")).toBe(true);
    expect(playedSince("2026-11-02T10:00:05Z", "2026-11-02T10:00:00Z")).toBe(false);
  });
});
