import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, renderHook} from "@testing-library/react";
import * as React from "react";
import {PlayerProvider, type PlayerTrack, usePlayer} from "@/components/player/player-provider.client";

const scrobbleAction = vi.hoisted(() => vi.fn());

vi.mock("@/components/player/actions.server", () => ({scrobbleAction}));

const track = (id: string, navidromeId: string | null = `nd-${id}`): PlayerTrack =>
    ({id, title: `Låt ${id}`, albumId: "1", albumTitle: "Nobel", durationMs: 60_000, navidromeId});
const TRACKS = [track("1"), track("2"), track("3", null)];

const audio = () => document.querySelector("audio") as HTMLAudioElement;

function render() {
    return renderHook(() => usePlayer(), {wrapper: ({children}: { children: React.ReactNode }) => <PlayerProvider>{children}</PlayerProvider>});
}

describe("PlayerProvider", () => {
    beforeEach(() => {
        scrobbleAction.mockReset();
        vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
            this.dispatchEvent(new Event("play"));
            return Promise.resolve();
        });
        vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
            this.dispatchEvent(new Event("pause"));
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("plays a queue from the chosen track through the audio route and reports the play", () => {
        const {result} = render();

        act(() => result.current.playQueue(TRACKS, 1));

        expect(result.current.current?.id).toBe("2");
        expect(audio().src).toMatch(/\/api\/audio\/2$/);
        expect(result.current.playing).toBe(true);
        expect(scrobbleAction).toHaveBeenCalledWith("nd-2", false);
    });

    it("moves on, stops at the end, and starts over when repeating all", () => {
        const {result} = render();

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
        const {result} = render();

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
        const {result} = render();

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
        const {result} = render();

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
        const {result} = render();

        act(() => result.current.playQueue(TRACKS, 1));
        act(() => result.current.setShuffle(true));

        expect(result.current.shuffle).toBe(true);
        expect(result.current.current?.id).toBe("2");
        expect(result.current.queue.map(t => t.id).sort()).toEqual(["1", "2", "3"]);
    });

    it("toggles pause and play", () => {
        const {result} = render();

        act(() => result.current.toggle());
        expect(result.current.playing).toBe(false);

        act(() => result.current.playQueue(TRACKS));
        Object.defineProperty(audio(), "paused", {configurable: true, get: () => false});
        act(() => result.current.toggle());
        expect(result.current.playing).toBe(false);
    });

    it("counts a play once half of the track or four minutes have been heard", () => {
        const {result} = render();

        act(() => result.current.playQueue(TRACKS));
        Object.defineProperty(audio(), "duration", {configurable: true, get: () => 60});
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
});
