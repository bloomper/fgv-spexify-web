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
    replayGain?: ReplayGain | null;
};

/** ReplayGain 2.0 values from the server: gains in dB, peaks as linear amplitudes. */
export type ReplayGain = { trackGain: number; trackPeak: number; albumGain?: number | null; albumPeak?: number | null };

type Repeat = "off" | "all" | "one";

export type ReplayGainMode = "off" | "track" | "album";

/** Plays this session reported to Navidrome, by Navidrome id, until the page shows them from Navidrome itself. */
export type SessionPlays = Record<string, { count: number; at: string }>;

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
    /** From 0 to 1, before ReplayGain. */
    volume: number;
    muted: boolean;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    replayGain: ReplayGainMode;
    setReplayGain: (mode: ReplayGainMode) => void;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    clear: () => void;
    plays: SessionPlays;
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

const SETTINGS_KEY = "spexify.player";

type Settings = { volume: number; muted: boolean; replayGain: ReplayGainMode };

const DEFAULT_SETTINGS: Settings = {volume: 1, muted: false, replayGain: "track"};

function loadSettings(): Settings {
    try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as Partial<Settings> | null;

        return {
            volume: typeof stored?.volume === "number" ? Math.min(1, Math.max(0, stored.volume)) : DEFAULT_SETTINGS.volume,
            muted: stored?.muted === true,
            replayGain: stored?.replayGain === "off" || stored?.replayGain === "album" ? stored.replayGain : DEFAULT_SETTINGS.replayGain,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

/**
 * How much ReplayGain turns a track down, from 0 to 1. A browser cannot play louder than the file, so quieter tracks
 * keep their level; the peak keeps a turned-up track from clipping anyway.
 */
export function gainFactor(gain: ReplayGain | null | undefined, mode: ReplayGainMode): number {
    if (!gain || mode === "off") {
        return 1;
    }

    const album = mode === "album" && gain.albumGain != null;
    const db = album ? gain.albumGain! : gain.trackGain;
    const peak = album ? gain.albumPeak ?? gain.trackPeak : gain.trackPeak;
    const factor = Math.pow(10, db / 20);

    return Math.min(1, factor, peak > 0 ? 1 / peak : 1);
}

/** Whether Navidrome's own numbers already include a play this session reported. */
export function playedSince(played: string | null | undefined, at: string): boolean {
    return !played || Date.parse(played) < Date.parse(at) - 60_000;
}

/**
 * Plays tracks through two audio elements that live as long as the app's layout, so playing continues while the user
 * navigates. One plays while the other loads the next track, so the next track starts at once when one ends: nearly
 * gapless, though a browser's audio elements leave a few milliseconds between files. The volume, mute and ReplayGain
 * mode are kept in the browser; ReplayGain only turns tracks down. Audio comes from {@code /api/audio/[id]}, which checks
 * the user's session and redirects to a signed, expiring link on the API's own address, so audio never passes through
 * the CDN in front of the web; a link that runs out mid-track is renewed once. The browser's media
 * controls (lock screen, keyboard keys) work through the Media Session API. When a track cannot be loaded, the player
 * stops and says so instead of looking as if it is loading; playing again retries, and skipping moves on as usual.
 *
 * The queue is shared with the user's apps through Navidrome's play queue: it is saved when it changes, when playing
 * pauses and every half minute while playing, and on the first page load an empty player takes it up again, paused
 * where it was left.
 */
export function PlayerProvider({children}: { children: React.ReactNode }) {
    const first = useRef<HTMLAudioElement | null>(null);
    const second = useRef<HTMLAudioElement | null>(null);
    // Which element plays: 0 or 1. The other one holds the preloaded next track.
    const active = useRef(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const preloaded = useRef<string | null>(null);
    const playingElement = useCallback(() => active.current === 0 ? first.current : second.current, []);
    const standby = useCallback(() => active.current === 0 ? second.current : first.current, []);
    // Read from the browser at once: nothing the server renders depends on them, as the player bar shows only once a track is loaded
    const [settings, setSettings] = useState<Settings>(() => typeof window === "undefined" ? DEFAULT_SETTINGS : loadSettings());
    const [plays, setPlays] = useState<SessionPlays>({});
    const [queue, setQueue] = useState<PlayerTrack[]>([]);
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [failed, setFailed] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [shuffle, setShuffleState] = useState(false);
    const [repeat, setRepeat] = useState<Repeat>("off");
    const scrobbled = useRef<string | null>(null);
    // The track whose expired link has been renewed once, so a broken file does not retry forever
    const renewed = useRef<string | null>(null);
    // Nothing is saved before the saved queue was read, or an empty player would overwrite it
    const restored = useRef(false);
    const current = queue[index] ?? null;
    const queueRef = useRef(queue);

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const applyVolume = useCallback((element: HTMLAudioElement, track: PlayerTrack | undefined) => {
        const {volume, muted, replayGain} = settingsRef.current;

        element.volume = muted ? 0 : volume * gainFactor(track?.replayGain, replayGain);
    }, []);

    const load = useCallback((track: PlayerTrack | undefined, autoplay: boolean) => {
        const previous = playingElement();
        const next = standby();

        if (!previous || !track) {
            return;
        }

        let element = previous;

        if (next && preloaded.current === track.id && next.readyState > 0) {
            // The next track is already loaded in the other element: switch to it
            previous.pause();
            previous.removeAttribute("src");
            previous.load();
            active.current = 1 - active.current;
            setActiveIndex(active.current);
            element = next;
            element.currentTime = 0;
        } else {
            element.src = `/api/audio/${track.id}`;
        }
        preloaded.current = null;
        renewed.current = null;
        applyVolume(element, track);
        setFailed(false);
        setTime(0);
        scrobbled.current = null;
        if (autoplay) {
            void element.play().catch(() => setPlaying(false));
            if (track.navidromeId) {
                void scrobbleAction(track.navidromeId, false);
            }
        }
    }, [applyVolume, playingElement, standby]);

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
            playingElement()?.pause();
        }
    }, [playingElement, index, jump, queue.length, repeat]);

    const previous = useCallback(() => {
        const element = playingElement();

        if (element && element.currentTime > 3) {
            element.currentTime = 0;
        } else if (index > 0) {
            jump(index - 1);
        }
    }, [playingElement, index, jump]);

    const toggle = useCallback(() => {
        const element = playingElement();

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
    }, [playingElement, current, failed]);

    const seek = useCallback((target: number) => {
        const element = playingElement();

        if (element) {
            element.currentTime = target;
        }
    }, [playingElement]);

    const setShuffle = useCallback((value: boolean) => {
        setShuffleState(value);
        if (value && queue.length > 1) {
            const reordered = shuffled(queue, index);

            setQueue(reordered);
            setIndex(0);
        }
    }, [index, queue]);

    const stop = useCallback(() => {
        for (const element of [first.current, second.current]) {
            if (element) {
                element.pause();
                element.removeAttribute("src");
                element.load();
            }
        }
        preloaded.current = null;
        setPlaying(false);
        setTime(0);
        setDuration(0);
    }, []);

    const clear = useCallback(() => {
        stop();
        setQueue([]);
        setIndex(0);
        if (restored.current) {
            void savePlayQueueAction([], null, 0).catch(() => undefined);
        }
    }, [stop]);

    const remove = useCallback((target: number) => {
        if (target < 0 || target >= queue.length) {
            return;
        }

        const rest = queue.filter((_, i) => i !== target);

        if (rest.length === 0) {
            clear();
            return;
        }
        setQueue(rest);
        if (target < index) {
            setIndex(index - 1);
        } else if (target === index) {
            // The track after the removed one takes its place, playing if the removed one played
            const replacement = Math.min(index, rest.length - 1);

            setIndex(replacement);
            load(rest[replacement], playing);
        }
    }, [clear, index, load, playing, queue]);

    const move = useCallback((from: number, to: number) => {
        if (from === to || from < 0 || to < 0 || from >= queue.length || to >= queue.length) {
            return;
        }

        const reordered = [...queue];
        const [moved] = reordered.splice(from, 1);

        reordered.splice(to, 0, moved);
        setQueue(reordered);
        if (from === index) {
            setIndex(to);
        } else if (from < index && to >= index) {
            setIndex(index - 1);
        } else if (from > index && to <= index) {
            setIndex(index + 1);
        }
    }, [index, queue]);

    const setVolume = useCallback((volume: number) => {
        setSettings(current => ({...current, volume: Math.min(1, Math.max(0, volume)), muted: false}));
    }, []);

    const toggleMute = useCallback(() => {
        setSettings(current => ({...current, muted: !current.muted}));
    }, []);

    const setReplayGain = useCallback((replayGain: ReplayGainMode) => {
        setSettings(current => ({...current, replayGain}));
    }, []);

    useEffect(() => {
        const element = playingElement();

        if (element) {
            applyVolume(element, current ?? undefined);
        }
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            // Private windows and blocked storage: the settings last until the page is left
        }
    }, [activeIndex, applyVolume, playingElement, current, settings]);

    // Loads the track after the current one into the other element, once the current one has had a head start
    const upcoming = repeat === "one" ? undefined : queue[index + 1] ?? (repeat === "all" && queue.length > 1 ? queue[0] : undefined);

    useEffect(() => {
        if (!upcoming || !playing) {
            return;
        }

        const timer = setTimeout(() => {
            const element = standby();

            if (!element || preloaded.current === upcoming.id) {
                return;
            }
            element.preload = "auto";
            element.src = `/api/audio/${upcoming.id}`;
            element.load();
            preloaded.current = upcoming.id;
        }, 3000);

        return () => clearTimeout(timer);
    }, [playing, standby, upcoming]);

    const cycleRepeat = useCallback(() => {
        setRepeat(value => value === "off" ? "all" : value === "all" ? "one" : "off");
    }, []);

    useEffect(() => {
        const element = activeIndex === 0 ? first.current : second.current;

        if (!element) {
            return;
        }

        const onTime = () => {
            setTime(element.currentTime);
            if (current?.navidromeId && scrobbled.current !== current.id && element.duration > 0
                && element.currentTime > Math.min(element.duration / 2, 240)) {
                const navidromeId = current.navidromeId;

                scrobbled.current = current.id;
                void scrobbleAction(navidromeId, true);
                setPlays(existing => ({
                    ...existing,
                    [navidromeId]: {count: (existing[navidromeId]?.count ?? 0) + 1, at: new Date().toISOString()},
                }));
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
        const onDuration = () => setDuration(Number.isFinite(element.duration) ? element.duration : 0);
        const onError = () => {
            const position = element.currentTime;

            // The signed link may have run out during a long pause: ask for a new one once and carry on where it was
            if (current && renewed.current !== current.id && position > 0) {
                renewed.current = current.id;
                element.src = `/api/audio/${current.id}`;
                element.addEventListener("loadedmetadata", () => {
                    element.currentTime = position;
                    void element.play().catch(() => setPlaying(false));
                }, {once: true});
                return;
            }
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
    }, [activeIndex, current, next, repeat]);

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

            const element = playingElement();

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
    }, [load, playingElement]);

    const save = useCallback(() => {
        const withIds = queue.filter(track => track.navidromeId);

        if (!restored.current || withIds.length === 0) {
            return;
        }
        void savePlayQueueAction(withIds.map(track => track.navidromeId!), current?.navidromeId ?? null,
            (playingElement()?.currentTime ?? 0) * 1000).catch(() => undefined);
    }, [playingElement, current, queue]);

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
        volume: settings.volume, muted: settings.muted, setVolume, toggleMute, replayGain: settings.replayGain, setReplayGain,
        remove, move, clear, plays,
    }), [queue, index, current, playing, failed, time, duration, shuffle, repeat, playQueue, enqueue, toggle, next, previous,
        seek, jump, setShuffle, cycleRepeat, settings, setVolume, toggleMute, setReplayGain, remove, move, clear, plays]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
            <audio ref={first} preload="metadata" className="hidden" data-testid="audio-0"/>
            <audio ref={second} preload="none" className="hidden" data-testid="audio-1"/>
        </PlayerContext.Provider>
    );
}
