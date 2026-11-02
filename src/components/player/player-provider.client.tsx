"use client";

import * as React from "react";
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {loadPlayQueueAction, savePlayQueueAction, scrobbleAction} from "@/components/player/actions.server";

export type PlayerTrack = {
    id: string;
    title: string;
    albumId: string;
    albumTitle: string;
    performers?: string | null;
    durationMs: number;
    navidromeId?: string | null;
    lyrics?: string | null;
    lyricsSynced?: boolean;
};

type Repeat = "off" | "all" | "one";

type PlayerState = {
    queue: PlayerTrack[];
    index: number;
    current: PlayerTrack | null;
    playing: boolean;
    /** The current track could not be loaded; {@link toggle} tries again from where it stopped. */
    failed: boolean;
    time: number;
    duration: number;
    shuffle: boolean;
    repeat: Repeat;
    playQueue: (tracks: PlayerTrack[], start?: number) => void;
    enqueue: (tracks: PlayerTrack[]) => void;
    toggle: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    jump: (index: number) => void;
    setShuffle: (shuffle: boolean) => void;
    cycleRepeat: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error("usePlayer must be used inside PlayerProvider");
    }
    return context;
}

function shuffled<T>(items: T[], first: number): T[] {
    const rest = items.filter((_, i) => i !== first);

    for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return [items[first], ...rest];
}

/**
 * Plays tracks through one audio element that lives as long as the app's layout, so playing continues while the user
 * navigates. Audio comes from {@code /api/audio/[id]}, which streams with the user's session. The browser's media
 * controls (lock screen, keyboard keys) work through the Media Session API. When a track cannot be loaded, the player
 * stops and says so instead of looking as if it is loading; playing again retries, and skipping moves on as usual.
 *
 * The queue is shared with the user's apps through Navidrome's play queue: it is saved when it changes, when playing
 * pauses and every half minute while playing, and on the first page load an empty player takes it up again, paused
 * where it was left.
 */
export function PlayerProvider({children}: { children: React.ReactNode }) {
    const audio = useRef<HTMLAudioElement | null>(null);
    const [queue, setQueue] = useState<PlayerTrack[]>([]);
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [shuffle, setShuffleState] = useState(false);
    const [repeat, setRepeat] = useState<Repeat>("off");
    const scrobbled = useRef<string | null>(null);
    // Nothing is saved before the saved queue was read, or an empty player would overwrite it
    const restored = useRef(false);
    const current = queue[index] ?? null;
    const queueRef = useRef(queue);

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    const load = useCallback((track: PlayerTrack | undefined, autoplay: boolean) => {
        const element = audio.current;

        if (!element || !track) {
            return;
        }
        setFailed(false);
        element.src = `/api/audio/${track.id}`;
        scrobbled.current = null;
        if (autoplay) {
            void element.play().catch(() => setPlaying(false));
            if (track.navidromeId) {
                void scrobbleAction(track.navidromeId, false);
            }
        }
    }, []);

    const playQueue = useCallback((tracks: PlayerTrack[], start = 0) => {
        if (tracks.length === 0) {
            return;
        }

        const ordered = shuffle ? shuffled(tracks, start) : tracks;
        const first = shuffle ? 0 : start;

        setQueue(ordered);
        setIndex(first);
        load(ordered[first], true);
    }, [load, shuffle]);

    const enqueue = useCallback((tracks: PlayerTrack[]) => {
        setQueue(existing => {
            if (existing.length === 0) {
                load(tracks[0], true);
            }
            return [...existing, ...tracks];
        });
    }, [load]);

    const jump = useCallback((target: number) => {
        if (target < 0 || target >= queue.length) {
            return;
        }
        setIndex(target);
        load(queue[target], true);
    }, [load, queue]);

    const next = useCallback(() => {
        if (index + 1 < queue.length) {
            jump(index + 1);
        } else if (repeat === "all" && queue.length > 0) {
            jump(0);
        } else {
            audio.current?.pause();
        }
    }, [index, jump, queue.length, repeat]);

    const previous = useCallback(() => {
        const element = audio.current;

        if (element && element.currentTime > 3) {
            element.currentTime = 0;
        } else if (index > 0) {
            jump(index - 1);
        }
    }, [index, jump]);

    const toggle = useCallback(() => {
        const element = audio.current;

        if (!element || !current) {
            return;
        }
        if (failed) {
            const position = element.currentTime;

            setFailed(false);
            element.load();
            element.addEventListener("loadedmetadata", () => {
                element.currentTime = position;
            }, {once: true});
            void element.play().catch(() => setPlaying(false));
        } else if (element.paused) {
            void element.play().catch(() => setPlaying(false));
        } else {
            element.pause();
        }
    }, [current, failed]);

    const seek = useCallback((target: number) => {
        if (audio.current) {
            audio.current.currentTime = target;
        }
    }, []);

    const setShuffle = useCallback((value: boolean) => {
        setShuffleState(value);
        if (value && queue.length > 1) {
            const reordered = shuffled(queue, index);

            setQueue(reordered);
            setIndex(0);
        }
    }, [index, queue]);

    const cycleRepeat = useCallback(() => {
        setRepeat(value => value === "off" ? "all" : value === "all" ? "one" : "off");
    }, []);

    useEffect(() => {
        const element = audio.current;

        if (!element) {
            return;
        }

        const onTime = () => {
            setTime(element.currentTime);
            if (current?.navidromeId && scrobbled.current !== current.id && element.duration > 0
                && element.currentTime > Math.min(element.duration / 2, 240)) {
                scrobbled.current = current.id;
                void scrobbleAction(current.navidromeId, true);
            }
        };
        const onEnded = () => {
            if (repeat === "one") {
                element.currentTime = 0;
                void element.play();
            } else {
                next();
            }
        };
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onDuration = () => setDuration(element.duration);
        const onError = () => {
            setFailed(true);
            setPlaying(false);
        };

        element.addEventListener("timeupdate", onTime);
        element.addEventListener("ended", onEnded);
        element.addEventListener("play", onPlay);
        element.addEventListener("pause", onPause);
        element.addEventListener("durationchange", onDuration);
        element.addEventListener("error", onError);
        return () => {
            element.removeEventListener("timeupdate", onTime);
            element.removeEventListener("ended", onEnded);
            element.removeEventListener("play", onPlay);
            element.removeEventListener("pause", onPause);
            element.removeEventListener("durationchange", onDuration);
            element.removeEventListener("error", onError);
        };
    }, [current, next, repeat]);

    useEffect(() => {
        let cancelled = false;

        loadPlayQueueAction().then(saved => {
            if (cancelled) {
                return;
            }
            // The user may have started something while the saved queue was on its way
            if (queueRef.current.length > 0 || !saved || saved.tracks.length === 0) {
                return;
            }

            const element = audio.current;

            setQueue(saved.tracks);
            setIndex(saved.index);
            load(saved.tracks[saved.index], false);
            if (element && saved.positionSeconds > 0) {
                element.addEventListener("loadedmetadata", () => {
                    element.currentTime = saved.positionSeconds;
                }, {once: true});
                setTime(saved.positionSeconds);
            }
        }).catch(() => undefined).finally(() => {
            restored.current = true;
        });
        return () => {
            cancelled = true;
        };
    }, [load]);

    const save = useCallback(() => {
        const withIds = queue.filter(track => track.navidromeId);

        if (!restored.current || withIds.length === 0) {
            return;
        }
        void savePlayQueueAction(withIds.map(track => track.navidromeId!), current?.navidromeId ?? null,
            (audio.current?.currentTime ?? 0) * 1000).catch(() => undefined);
    }, [current, queue]);

    useEffect(() => {
        const timer = setTimeout(save, 1000);

        return () => clearTimeout(timer);
        // A changed queue or track is saved; time alone is saved by the interval below
    }, [save]);

    useEffect(() => {
        if (!playing) {
            save();
            return;
        }

        const timer = setInterval(save, 30_000);

        return () => clearInterval(timer);
    }, [playing, save]);

    useEffect(() => {
        if (!("mediaSession" in navigator) || !current) {
            return;
        }
        navigator.mediaSession.metadata = new MediaMetadata({
            title: current.title,
            artist: current.performers ?? "",
            album: current.albumTitle,
            artwork: [{src: `${window.location.origin}/api/cover/${current.albumId}`, sizes: "600x600"}],
        });
        navigator.mediaSession.setActionHandler("play", toggle);
        navigator.mediaSession.setActionHandler("pause", toggle);
        navigator.mediaSession.setActionHandler("nexttrack", next);
        navigator.mediaSession.setActionHandler("previoustrack", previous);
        navigator.mediaSession.setActionHandler("seekto", details => details.seekTime !== undefined && seek(details.seekTime));
    }, [current, next, previous, seek, toggle]);

    const value = useMemo<PlayerState>(() => ({
        queue, index, current, playing, failed, time, duration, shuffle, repeat,
        playQueue, enqueue, toggle, next, previous, seek, jump, setShuffle, cycleRepeat,
    }), [queue, index, current, playing, failed, time, duration, shuffle, repeat, playQueue, enqueue, toggle, next, previous, seek, jump, setShuffle, cycleRepeat]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
            <audio ref={audio} preload="metadata" className="hidden"/>
        </PlayerContext.Provider>
    );
}
