"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AudioLines, LocateFixed, Pause, Piano, Play, Sparkles, Trash2, Undo2, Wand2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePlayer } from "@/components/player/player-provider.client";
import { formatDuration } from "@/components/player/lyrics";
import { alignScoreAction, deleteScoreSyncAction, type ScoreSync, saveScoreSyncAction } from "@/components/sheet/actions.server";
import { scoreText } from "@/lib/score/mxl";
import { parseMidiFile } from "@/lib/score/midi";
import { type ParsedScore, parseMusicXml } from "@/lib/score/parse";
import { ScoreSynth } from "@/lib/score/synth.client";
import { type AlignMap, buildAlignMap, buildTimeline, expandOrder, orderFromJumps, positionAt, recTimeOfMeasure, scoreTimeAt,
  type Timeline } from "@/lib/score/timeline";
import { cn } from "@/utils/utils";

/** What the cursor follows: the recording through a sync map, the notes played by the synth, or an editor's taps. */
export type ScoreMode = "recording" | "notes" | "sync";

type Point = { seconds: number; measure: number; beat: number };

// OpenSheetMusicDisplay's API, as far as this view uses it
type Osmd = {
  load: (xml: string) => Promise<void>;
  render: () => void;
  zoom: number;
  cursor: {
    show: () => void;
    hide: () => void;
    reset: () => void;
    update: () => void;
    cursorElement?: HTMLElement;
    Iterator: {
      EndReached: boolean;
      moveToNext: () => void;
      CurrentMeasureIndex: number;
      currentTimeStamp: { RealValue: number };
      CurrentMeasure: { AbsoluteTimestamp: { RealValue: number } };
    };
  };
  GraphicSheet: { MeasureList: Array<Array<{ PositionAndShape?: Box } | undefined>> };
  clear: () => void;
};
type Box = { AbsolutePosition: { x: number; y: number }; BorderLeft: number; BorderRight: number; BorderTop: number; BorderBottom: number };

let osmdModule: Promise<new (element: HTMLElement, options: object) => Osmd> | null = null;

function loadOsmd() {
  osmdModule ??= import("opensheetmusicdisplay").then(module => module.OpenSheetMusicDisplay as unknown as new (element: HTMLElement, options: object) => Osmd);
  return osmdModule;
}

/**
 * The play order a map was made for: the recording's own walk through the score when it says how, else the repeats.
 */
export function playOrder(score: ParsedScore, sync: ScoreSync | null | undefined): number[] {
  return sync?.jumps.length ? orderFromJumps(score.measures.length, sync.jumps) : expandOrder(score.measures);
}

/**
 * A map from the recording to the score: points as [seconds, measure, beat].
 */
export function alignMap(timeline: Timeline, points: Point[]): AlignMap | null {
  return buildAlignMap(timeline, points.map(point => [point.seconds, point.measure, point.beat] as const));
}

/**
 * A score from Spexarkivet: MusicXML drawn as notes with a cursor that follows the recording or the notes as the
 * browser plays them, or a MIDI file that is only played. Editors also sync the score with the recording here, by
 * tapping at the start of each measure while the track plays, or by asking the server to align them.
 */
export function ScoreView({ trackId, fileId, title, midi, syncs, editor, onChanged }: {
  trackId: string;
  fileId: string;
  title: string;
  /** A MIDI file, which is played but has no notes to show. */
  midi: boolean;
  /** This score's maps: for listeners the one that is done, for editors every one. */
  syncs: ScoreSync[];
  editor: boolean;
  onChanged: () => Promise<void>;
}) {
  const t = useTranslations("Sheet");
  const player = usePlayer();
  const host = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const osmd = useRef<Osmd | null>(null);
  const steps = useRef<{ m: number; off: number }[]>([]);
  const stepShown = useRef(-1);
  const userScrolledAt = useRef(0);
  const synth = useMemo(() => new ScoreSynth(), []);
  const [xml, setXml] = useState<string | null>(null);
  const [score, setScore] = useState<ParsedScore | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [zoom, setZoom] = useState(0.8);
  const [, setTick] = useState(0);
  const manual = syncs.find(sync => sync.method === "MANUAL") ?? null;
  const automatic = syncs.find(sync => sync.method === "AUTOMATIC") ?? null;
  const active = syncs.find(sync => sync.status === "DONE") ?? null;
  const [mode, setMode] = useState<ScoreMode>(midi || !active ? "notes" : "recording");
  const [draft, setDraft] = useState<Point[]>([]);
  const [nextOcc, setNextOcc] = useState(0);
  const [saving, setSaving] = useState(false);

  // The file: MusicXML (also compressed) to draw and play, or MIDI to play
  useEffect(() => {
    let dead = false;

    (async () => {
      try {
        const response = await fetch(`/api/sheet-music/${trackId}/${fileId}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const bytes = await response.arrayBuffer();

        if (midi) {
          const parsed = parseMidiFile(new Uint8Array(bytes));

          if (!dead) {
            setScore(parsed);
            setXml(null);
            setState("ready");
          }
          return;
        }

        const text = await scoreText(bytes);
        const parsed = parseMusicXml(text);

        if (!dead) {
          setScore(parsed);
          setXml(text);
        }
      } catch {
        if (!dead) {
          setState("error");
        }
      }
    })();
    return () => {
      dead = true;
    };
  }, [trackId, fileId, midi]);

  const order = useMemo(() => score ? playOrder(score, mode === "sync" ? manual : active) : [], [score, mode, manual, active]);
  const timeline = useMemo(() => score ? buildTimeline(score.measures, undefined, order) : null, [score, order]);
  const map = useMemo(() => {
    if (!timeline) {
      return null;
    }
    return mode === "sync" ? (draft.length >= 2 ? alignMap(timeline, draft) : null) : active ? alignMap(timeline, active.points) : null;
  }, [timeline, mode, draft, active]);

  // The synth plays the same order as the cursor walks
  useEffect(() => {
    if (score) {
      synth.load(score, order);
    }
  }, [synth, score, order]);

  useEffect(() => {
    const stop = synth.subscribe(() => setTick(tick => tick + 1));

    return () => {
      stop();
      synth.dispose();
    };
  }, [synth]);

  // Only one thing plays at a time
  useEffect(() => {
    if (player.playing && synth.isPlaying) {
      synth.pause();
    }
  }, [player.playing, synth]);

  // Draw the score; again when the zoom changes
  useEffect(() => {
    const element = host.current;

    if (!xml || !element) {
      return;
    }

    let dead = false;

    (async () => {
      try {
        const Osmd = await loadOsmd();

        element.innerHTML = "";

        const display = new Osmd(element, {
          autoResize: true, backend: "svg", drawTitle: false, drawSubtitle: false, drawComposer: false, drawLyricist: false,
          drawPartNames: true, followCursor: false, cursorsOptions: [{ type: 0, color: "#ec4899", alpha: 0.5, follow: false }],
        });

        await display.load(xml);
        if (dead) {
          return;
        }
        display.zoom = zoom;
        display.render();

        // Every cursor step in the order the cursor walks, as written measure and offset, so that a position can be found
        const iterator = display.cursor.Iterator;
        const list: { m: number; off: number }[] = [];

        display.cursor.reset();
        for (let guard = 0; !iterator.EndReached && guard < 50_000; guard++) {
          list.push({ m: iterator.CurrentMeasureIndex, off: iterator.currentTimeStamp.RealValue - iterator.CurrentMeasure.AbsoluteTimestamp.RealValue });
          iterator.moveToNext();
        }
        display.cursor.reset();
        display.cursor.hide();
        osmd.current = display;
        steps.current = list;
        stepShown.current = -1;
        setState("ready");
      } catch {
        if (!dead) {
          setState("error");
        }
      }
    })();
    return () => {
      dead = true;
      osmd.current = null;
    };
  }, [xml, zoom]);

  const position = useCallback((): { m: number; off: number } | null => {
    if (!timeline) {
      return null;
    }
    if (mode === "notes") {
      return synth.isPlaying || synth.time() > 0 ? synth.position() : null;
    }

    const scoreTime = map ? scoreTimeAt(map, player.position()) : null;

    return scoreTime === null ? null : positionAt(timeline, scoreTime);
  }, [timeline, mode, map, synth, player]);

  // The cursor, every frame
  useEffect(() => {
    if (state !== "ready" || midi) {
      return;
    }

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);

      const display = osmd.current;
      const at = position();

      if (!display) {
        return;
      }
      if (!at) {
        if (stepShown.current >= 0) {
          display.cursor.hide();
          stepShown.current = -1;
        }
        return;
      }

      const list = steps.current;
      let index = -1;

      for (let i = 0; i < list.length; i++) {
        if (list[i].m === at.m && list[i].off <= at.off + 1e-6) {
          index = i;
        } else if (list[i].m > at.m && index >= 0) {
          break;
        }
      }
      if (index < 0 || index === stepShown.current) {
        return;
      }
      if (stepShown.current < 0 || index < stepShown.current) {
        display.cursor.reset();
        display.cursor.show();
        for (let k = 0; k < index; k++) {
          display.cursor.Iterator.moveToNext();
        }
      } else {
        for (let k = stepShown.current; k < index; k++) {
          display.cursor.Iterator.moveToNext();
        }
      }
      display.cursor.update();
      stepShown.current = index;

      // Keep the playing line in view, unless the reader scrolled away a moment ago
      const cursor = display.cursor.cursorElement;
      const box = scroller.current;

      if (cursor && box && Date.now() - userScrolledAt.current > 4000) {
        const top = cursor.getBoundingClientRect().top - box.getBoundingClientRect().top;

        if (top < 0 || top > box.clientHeight * 0.6) {
          box.scrollBy({ top: top - box.clientHeight * 0.2, behavior: "smooth" });
        }
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state, midi, position]);

  // A tap on a measure: play from there, or, while syncing, say which measure the next tap is for
  const measureAt = (event: React.MouseEvent): number | null => {
    const display = osmd.current;

    if (!display || !host.current) {
      return null;
    }

    const bounds = host.current.getBoundingClientRect();
    const unit = 10 * display.zoom;
    const x = (event.clientX - bounds.left) / unit;
    const y = (event.clientY - bounds.top) / unit;
    let best: number | null = null;
    let distance = Infinity;

    display.GraphicSheet.MeasureList.forEach((staves, m) => {
      for (const measure of staves ?? []) {
        const shape = measure?.PositionAndShape;

        if (!shape) {
          continue;
        }

        const x0 = shape.AbsolutePosition.x + shape.BorderLeft;
        const x1 = shape.AbsolutePosition.x + shape.BorderRight;
        const y0 = shape.AbsolutePosition.y + shape.BorderTop;
        const y1 = shape.AbsolutePosition.y + shape.BorderBottom;
        const d = Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));

        if (d < distance) {
          distance = d;
          best = m;
        }
      }
    });
    return distance < 6 ? best : null;
  };

  const tapMeasure = (event: React.MouseEvent) => {
    const m = measureAt(event);

    if (m === null || !timeline) {
      return;
    }
    if (mode === "sync") {
      const after = timeline.occs.findIndex((occ, i) => i >= nextOcc && occ.m === m);

      setNextOcc(after >= 0 ? after : Math.max(0, timeline.occs.findIndex(occ => occ.m === m)));
    } else if (mode === "notes") {
      synth.seekMeasure(m);
    } else if (map) {
      const scoreTime = scoreTimeAt(map, player.position());
      const seconds = recTimeOfMeasure(timeline, map, m, scoreTime ?? 0);

      if (seconds !== null) {
        player.seek(seconds);
      }
    }
  };

  // ---- syncing by hand
  const startSync = () => {
    setDraft(manual?.points.map(point => ({ seconds: point.seconds, measure: point.measure, beat: point.beat })) ?? []);
    setNextOcc(0);
    setMode("sync");
  };

  const tap = () => {
    if (!timeline || nextOcc >= timeline.occs.length) {
      return;
    }

    const seconds = Math.round(player.position() * 100) / 100;

    if (draft.length > 0 && seconds <= draft[draft.length - 1].seconds) {
      toast.error(t("sync.tapInOrder"));
      return;
    }
    setDraft([...draft, { seconds, measure: timeline.occs[nextOcc].m, beat: 0 }]);
    setNextOcc(nextOcc + 1);
  };

  const undo = () => {
    setDraft(draft.slice(0, -1));
    setNextOcc(Math.max(0, nextOcc - 1));
  };

  const save = async () => {
    setSaving(true);

    const result = await saveScoreSyncAction(trackId, fileId, { points: draft, jumps: manual?.jumps ?? [] }, manual?.version ?? null);

    setSaving(false);
    if (result.ok) {
      toast.success(t("sync.saved"));
      await onChanged();
      setMode("recording");
    } else {
      toast.error(result.message);
    }
  };

  const remove = async () => {
    const result = await deleteScoreSyncAction(trackId, fileId);

    if (result.ok) {
      toast.success(t("sync.removed"));
      await onChanged();
    } else {
      toast.error(result.message);
    }
  };

  const align = async () => {
    const result = await alignScoreAction(trackId, fileId);

    if (result.ok) {
      toast.success(t("sync.queued"));
      await onChanged();
    } else {
      toast.error(result.message);
    }
  };

  // While the server aligns, look again every few seconds
  const aligning = automatic?.status === "PENDING" || automatic?.status === "RUNNING";

  useEffect(() => {
    if (!aligning) {
      return;
    }

    const timer = setInterval(() => void onChanged(), 4000);

    return () => clearInterval(timer);
  }, [aligning, onChanged]);

  const playNotes = () => {
    if (synth.isPlaying) {
      synth.pause();
      return;
    }
    if (player.playing) {
      player.toggle();
    }
    synth.play();
  };

  const parts = synth.parts;
  const tempo = Math.round(synth.baseBpm * synth.scale);

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1">
        {!midi && (
          <div role="radiogroup" aria-label={t("follow")} className="flex rounded-full bg-secondary/80 p-0.5">
            <button type="button" role="radio" aria-checked={mode === "recording"} disabled={!active}
                    onClick={() => {
                      synth.pause();
                      setMode("recording");
                    }}
                    title={active ? undefined : t("notSynced")}
                    className={cn("flex min-h-8 items-center gap-1 rounded-full px-3 text-sm disabled:opacity-50",
                      mode === "recording" && "bg-foreground text-background")}>
              <AudioLines className="size-4" />{t("followRecording")}
            </button>
            <button type="button" role="radio" aria-checked={mode === "notes"} onClick={() => setMode("notes")}
                    className={cn("flex min-h-8 items-center gap-1 rounded-full px-3 text-sm",
                      mode === "notes" && "bg-foreground text-background")}>
              <Piano className="size-4" />{t("playNotes")}
            </button>
          </div>
        )}
        <div className="flex-1" />
        {!midi && (
          <>
            <Button variant="ghost" size="icon" onClick={() => {
              userScrolledAt.current = 0;
              stepShown.current = -1;
            }} aria-label={t("followCursor")}><LocateFixed /></Button>
            <Button variant="ghost" size="icon" disabled={zoom <= 0.4} onClick={() => setZoom(Math.round((zoom - 0.1) * 10) / 10)}
                    aria-label={t("zoomOut")}><ZoomOut /></Button>
            <Button variant="ghost" size="icon" disabled={zoom >= 2} onClick={() => setZoom(Math.round((zoom + 0.1) * 10) / 10)}
                    aria-label={t("zoomIn")}><ZoomIn /></Button>
          </>
        )}
      </div>

      {mode === "notes" && score && (
        <div className="flex flex-wrap items-center gap-3 rounded-md bg-secondary/50 p-2">
          <Button size="sm" onClick={playNotes} aria-label={synth.isPlaying ? t("pauseNotes") : t("playNotes")}>
            {synth.isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
            {synth.isPlaying ? t("pauseNotes") : t("playNotes")}
          </Button>
          <label className="flex items-center gap-2 text-sm">
            {t("tempo")}
            <input type="range" min={0.5} max={1.5} step={0.05} value={synth.scale}
                   onChange={event => synth.setScale(Number(event.target.value))} className="w-28 accent-primary" />
            <span className="w-16 tabular-nums">{t("bpm", { bpm: tempo })}</span>
          </label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatDuration(synth.time() / synth.scale)} / {formatDuration(synth.total / synth.scale)}
          </span>
          {parts.length > 1 && (
            <ul aria-label={t("parts")} className="flex w-full flex-wrap gap-1">
              {parts.map((part, i) => (
                <li key={`${part.name}-${i}`} className="flex items-center gap-1 rounded-full bg-background/70 py-0.5 pl-3 pr-1 text-xs">
                  <span className={cn(part.mute && "line-through opacity-60")}>{part.name}</span>
                  <button type="button" aria-pressed={part.solo} onClick={() => synth.setPart(i, { solo: !part.solo })}
                          aria-label={t("solo", { part: part.name })}
                          className={cn("rounded-full px-1.5 font-semibold", part.solo ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}>S</button>
                  <button type="button" aria-pressed={part.mute} onClick={() => synth.setPart(i, { mute: !part.mute })}
                          aria-label={t("mute", { part: part.name })}
                          className={cn("rounded-full px-1.5 font-semibold", part.mute ? "bg-destructive text-white" : "hover:bg-secondary")}>M</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mode === "recording" && !active && !midi && <p className="text-sm text-muted-foreground">{t("notSynced")}</p>}

      {editor && !midi && (
        <SyncTools mode={mode} manual={manual} automatic={automatic} draft={draft} saving={saving}
                   nextMeasure={timeline && nextOcc < timeline.occs.length ? timeline.occs[nextOcc].m + 1 : null}
                   onStart={startSync} onTap={tap} onUndo={undo} onClear={() => {
                     setDraft([]);
                     setNextOcc(0);
                   }}
                   onSave={save} onCancel={() => setMode(active ? "recording" : "notes")} onRemove={remove} onAlign={align} />
      )}

      <div ref={scroller} className="min-h-0 flex-1 overflow-auto rounded-md bg-white text-black"
           onWheel={() => (userScrolledAt.current = Date.now())} onTouchMove={() => (userScrolledAt.current = Date.now())}>
        {state === "loading" && <div className="flex justify-center p-8"><Spinner /></div>}
        {state === "error" && <p role="alert" className="p-4 text-sm text-destructive">{t("couldNotLoad")}</p>}
        {midi && state === "ready" && <p className="p-4 text-sm text-neutral-600">{t("midiOnly", { title })}</p>}
        {!midi && <div ref={host} onClick={tapMeasure} className="cursor-pointer" data-testid="score" aria-label={title} />}
      </div>
    </div>
  );
}

/**
 * The editor's tools: tap the measures in while the track plays, or have the server align the recording.
 */
function SyncTools({ mode, manual, automatic, draft, saving, nextMeasure, onStart, onTap, onUndo, onClear, onSave, onCancel, onRemove, onAlign }: {
  mode: ScoreMode;
  manual: ScoreSync | null;
  automatic: ScoreSync | null;
  draft: Point[];
  saving: boolean;
  nextMeasure: number | null;
  onStart: () => void;
  onTap: () => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
  onAlign: () => void;
}) {
  const t = useTranslations("Sheet.sync");
  const status = automatic ? t(`status.${automatic.status}`, {
    quality: Math.round((automatic.quality ?? 0) * 100),
    error: automatic.error ?? "",
  }) : t("status.NONE");

  if (mode !== "sync") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed p-2 text-sm">
        <span className="text-muted-foreground">
          {manual ? t("manualExists", { points: manual.points.length }) : t("noManual")} · {status}
          {(manual?.stale || automatic?.stale) && ` · ${t("stale")}`}
        </span>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={onStart}><Wand2 />{manual ? t("edit") : t("start")}</Button>
        <Button size="sm" variant="outline" onClick={onAlign}
                disabled={automatic?.status === "PENDING" || automatic?.status === "RUNNING"}><Sparkles />{t("automatic")}</Button>
        {manual && <Button size="sm" variant="ghost" onClick={onRemove} aria-label={t("remove")}><Trash2 /></Button>}
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-md border border-primary p-2 text-sm">
      <p className="text-muted-foreground">{t("howTo")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onTap} disabled={nextMeasure === null} className="min-w-40">
          {nextMeasure === null ? t("done") : t("tap", { measure: nextMeasure })}
        </Button>
        <Button variant="outline" size="sm" onClick={onUndo} disabled={draft.length === 0}><Undo2 />{t("undo")}</Button>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={draft.length === 0}>{t("clear")}</Button>
        <span className="tabular-nums text-muted-foreground">{t("points", { points: draft.length })}</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onCancel}>{t("cancel")}</Button>
        <Button size="sm" onClick={onSave} disabled={saving || draft.length < 2}>{t("save")}</Button>
      </div>
    </div>
  );
}
