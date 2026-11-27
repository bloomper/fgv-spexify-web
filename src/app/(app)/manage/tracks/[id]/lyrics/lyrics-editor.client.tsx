"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Minus, Pause, Play, Plus, RotateCcw, Stamp, Trash2 } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Textarea } from "@bloomper/fgv-web-ui/ui/textarea";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { usePlayer } from "@/components/player/player-provider.client";
import { formatDuration } from "@/components/player/lyrics";
import { lineAt, lrcTime, parseTime, type TimedLine, toLines, toLyrics, withText } from "@/components/player/lrc";
import { restoreLyricsAction, saveLyricsAction } from "@/app/(app)/manage/actions.server";
import { cn } from "@/utils/utils";

type Revision = { id: string; lyrics?: string | null; synced: boolean; createdAt: string; createdBy?: string | null };

type EditorTrack = {
  id: string;
  albumId: string;
  title: string;
  durationMs: number;
  lyrics?: string | null;
  lyricsSynced: boolean;
  fileMissing: boolean;
  lyricsRevisions: Revision[];
  waveform: number[];
};

const NUDGE = 0.1;

/**
 * The lyrics editor: the text, and the time each line starts, set by tapping once per line while the track plays and
 * then nudged; the waveform shows where the lines fall. Saving keeps the earlier version, and any saved version can be
 * restored.
 */
export function LyricsEditor({ track }: { track: EditorTrack }) {
  const t = useTranslations("LyricsEditor");
  const format = useFormatter();
  const router = useRouter();
  const dialogs = useDialogs();
  const player = usePlayer();
  const audio = useRef<HTMLAudioElement>(null);
  const [lines, setLines] = useState<TimedLine[]>(() => toLines(track.lyrics, track.lyricsSynced));
  const [text, setText] = useState(() =>
    toLines(track.lyrics, track.lyricsSynced)
      .map((line) => line.text)
      .join("\n")
  );
  const [revisions, setRevisions] = useState(track.lyricsRevisions);
  const [base, setBase] = useState<string | null>(track.lyricsRevisions[0]?.id ?? null);
  const [next, setNext] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const duration = track.durationMs / 1000;
  const current = lineAt(lines, time);

  const change = (updated: TimedLine[]) => {
    setLines(updated);
    setDirty(true);
  };

  // The page's own audio element, so that the queue is left alone; the player pauses while it plays
  useEffect(() => {
    const element = audio.current;

    if (!element) {
      return;
    }

    let frame = 0;
    const tick = () => {
      setTime(element.currentTime);
      frame = requestAnimationFrame(tick);
    };
    const play = () => {
      setPlaying(true);
      frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      setPlaying(false);
      cancelAnimationFrame(frame);
      setTime(element.currentTime);
    };

    element.addEventListener("play", play);
    element.addEventListener("pause", pause);
    element.addEventListener("seeked", pause);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("play", play);
      element.removeEventListener("pause", pause);
      element.removeEventListener("seeked", pause);
    };
  }, []);

  const toggle = useCallback(() => {
    const element = audio.current;

    if (!element) {
      return;
    }
    if (element.paused) {
      if (player.playing) {
        player.toggle();
      }
      void element.play().catch(() => toast.error(t("couldNotPlay")));
    } else {
      element.pause();
    }
  }, [player, t]);

  const seek = useCallback(
    (seconds: number) => {
      const element = audio.current;

      if (element) {
        element.currentTime = Math.min(Math.max(0, seconds), duration);
        setTime(element.currentTime);
      }
    },
    [duration]
  );

  const stamp = useCallback(() => {
    if (next >= lines.length) {
      return;
    }

    const at = Math.round((audio.current?.currentTime ?? 0) * 100) / 100;

    change(lines.map((line, i) => (i === next ? { ...line, time: at } : line)));
    setNext(next + 1);
  }, [lines, next]);

  // Space plays and pauses, Enter stamps the next line, unless a field has the focus
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName)) {
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      } else if (event.key === "Enter") {
        event.preventDefault();
        stamp();
      }
    };

    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [toggle, stamp]);

  const shift = (index: number, by: number) =>
    change(
      lines.map((line, i) =>
        i === index && line.time !== null
          ? { ...line, time: Math.max(0, Math.round((line.time + by) * 100) / 100) }
          : line
      )
    );

  const shiftAll = (by: number) =>
    change(
      lines.map((line) =>
        line.time === null ? line : { ...line, time: Math.max(0, Math.round((line.time + by) * 100) / 100) }
      )
    );

  const save = async () => {
    const { lyrics, synced } = toLyrics(lines);

    setSaving(true);

    const result = await saveLyricsAction(track.albumId, track.id, lyrics, synced, base);

    setSaving(false);
    if (result.ok && result.data) {
      setRevisions(result.data.lyricsRevisions);
      setBase(result.data.lyricsRevisions[0]?.id ?? null);
      setDirty(false);
      toast.success(synced ? t("savedSynced") : t("savedPlain"));
      router.refresh();
    } else if (!result.ok) {
      toast.error(result.message);
    }
  };

  const restore = async (revision: Revision) => {
    if (
      !(await dialogs.confirm({
        title: t("restoreTitle"),
        description: t("restoreDescription"),
        confirmLabel: t("restore"),
      }))
    ) {
      return;
    }

    const result = await restoreLyricsAction(track.albumId, track.id, revision.id);

    if (result.ok && result.data) {
      const restored = toLines(result.data.lyrics, result.data.lyricsSynced);

      setLines(restored);
      setText(restored.map((line) => line.text).join("\n"));
      setRevisions(result.data.lyricsRevisions);
      setBase(result.data.lyricsRevisions[0]?.id ?? null);
      setDirty(false);
      toast.success(t("restored"));
      router.refresh();
    } else if (!result.ok) {
      toast.error(result.message);
    }
  };

  const timed = lines.filter((line) => line.time !== null).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-4">
        <section
          aria-labelledby="text-heading"
          className="space-y-2"
        >
          <h2
            id="text-heading"
            className="text-lg font-semibold"
          >
            {t("text")}
          </h2>
          <Textarea
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="font-mono text-sm"
            aria-describedby="text-hint"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => change(withText(lines, text))}
            >
              {t("useText")}
            </Button>
            <span
              id="text-hint"
              className="text-muted-foreground text-xs"
            >
              {t("textHint")}
            </span>
          </div>
        </section>

        <section
          aria-labelledby="timing-heading"
          className="space-y-3"
        >
          <h2
            id="timing-heading"
            className="text-lg font-semibold"
          >
            {t("timing")}
          </h2>
          {track.fileMissing ? (
            <p className="text-destructive text-sm">{t("fileMissing")}</p>
          ) : (
            <>
              <audio
                ref={audio}
                src={`/api/audio/${track.id}`}
                preload="metadata"
                className="hidden"
              />
              <Waveform
                peaks={track.waveform}
                duration={duration}
                time={time}
                lines={lines}
                current={current}
                onSeek={seek}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={toggle}
                  aria-label={playing ? t("pause") : t("play")}
                >
                  {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                  <span className="tabular-nums">
                    {formatDuration(time)} / {formatDuration(duration)}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={stamp}
                  disabled={next >= lines.length}
                >
                  <Stamp />
                  {next < lines.length ? t("stamp", { line: next + 1 }) : t("allStamped")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => seek(time - 3)}
                >
                  {t("back3")}
                </Button>
                <div className="flex-1" />
                <span className="text-muted-foreground text-sm">{t("shiftAll")}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shiftAll(-NUDGE)}
                  aria-label={t("earlierAll")}
                >
                  <Minus />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => shiftAll(NUDGE)}
                  aria-label={t("laterAll")}
                >
                  <Plus />
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">{t("howTo")}</p>
            </>
          )}
          <ol className="divide-y rounded-lg border">
            {lines.map((line, i) => (
              <LineRow
                key={i}
                index={i}
                line={line}
                current={i === current}
                next={i === next}
                onTime={(value) => change(lines.map((other, k) => (k === i ? { ...other, time: value } : other)))}
                onText={(value) => change(lines.map((other, k) => (k === i ? { ...other, text: value } : other)))}
                onShift={(by) => shift(i, by)}
                onNow={() =>
                  change(lines.map((other, k) => (k === i ? { ...other, time: Math.round(time * 100) / 100 } : other)))
                }
                onNext={() => setNext(i)}
                onSeek={() => line.time !== null && seek(line.time)}
                onRemove={() => change(lines.filter((_, k) => k !== i))}
              />
            ))}
          </ol>
          <Button
            variant="outline"
            size="sm"
            onClick={() => change([...lines, { time: null, text: "" }])}
          >
            <Plus />
            {t("addLine")}
          </Button>
        </section>

        <div className="bg-background/95 sticky bottom-[calc(var(--player-height,0px)+0.5rem)] flex flex-wrap items-center gap-3 rounded-lg border p-3 backdrop-blur">
          <span className="text-muted-foreground text-sm">{t("timedCount", { timed, lines: lines.length })}</span>
          <div className="flex-1" />
          {dirty && <span className="text-muted-foreground text-sm">{t("unsaved")}</span>}
          <Button
            onClick={save}
            disabled={saving || !dirty}
          >
            {timed === lines.length && timed > 0 ? t("saveSynced") : t("savePlain")}
          </Button>
        </div>
      </div>

      <aside
        aria-labelledby="history-heading"
        className="space-y-2"
      >
        <h2
          id="history-heading"
          className="text-lg font-semibold"
        >
          {t("history")}
        </h2>
        {revisions.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("noHistory")}</p>
        ) : (
          <ol className="space-y-2">
            {revisions.map((revision, i) => (
              <li
                key={revision.id}
                className="rounded-md border p-2 text-sm"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{revision.createdBy ?? t("original")}</span>
                  <time
                    dateTime={revision.createdAt}
                    className="text-muted-foreground text-xs"
                  >
                    {format.dateTime(new Date(revision.createdAt), { dateStyle: "short", timeStyle: "short" })}
                  </time>
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {revision.synced ? t("synced") : t("plain")} ·{" "}
                  {(revision.lyrics ?? "").replace(/\[[\d:.]+]/g, "").slice(0, 120) || t("empty")}
                </p>
                {i > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => restore(revision)}
                  >
                    <RotateCcw />
                    {t("restore")}
                  </Button>
                )}
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}

function LineRow({
  index,
  line,
  current,
  next,
  onTime,
  onText,
  onShift,
  onNow,
  onNext,
  onSeek,
  onRemove,
}: {
  index: number;
  line: TimedLine;
  current: boolean;
  next: boolean;
  onTime: (time: number | null) => void;
  onText: (text: string) => void;
  onShift: (by: number) => void;
  onNow: () => void;
  onNext: () => void;
  onSeek: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("LyricsEditor");
  const [typed, setTyped] = useState<string | null>(null);

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-1 px-2 py-1",
        current && "bg-primary/10",
        next && "border-l-primary border-l-4"
      )}
    >
      <span className="text-muted-foreground w-8 text-xs tabular-nums">{index + 1}</span>
      <Input
        value={typed ?? (line.time === null ? "" : lrcTime(line.time))}
        placeholder="--:--.--"
        aria-label={t("timeOf", { line: index + 1 })}
        className="h-8 w-24 font-mono text-xs"
        onChange={(event) => setTyped(event.target.value)}
        onBlur={() => {
          if (typed !== null) {
            onTime(typed.trim() === "" ? null : (parseTime(typed) ?? line.time));
            setTyped(null);
          }
        }}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onShift(-NUDGE)}
        disabled={line.time === null}
        aria-label={t("earlier", { line: index + 1 })}
      >
        <Minus />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onShift(NUDGE)}
        disabled={line.time === null}
        aria-label={t("later", { line: index + 1 })}
      >
        <Plus />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNow}
      >
        {t("now")}
      </Button>
      <Input
        value={line.text}
        onChange={(event) => onText(event.target.value)}
        aria-label={t("textOf", { line: index + 1 })}
        className="h-8 min-w-40 flex-1"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onSeek}
        disabled={line.time === null}
        aria-label={t("playFrom", { line: index + 1 })}
      >
        <Play />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        aria-pressed={next}
      >
        {t("stampFrom")}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={t("removeLine", { line: index + 1 })}
      >
        <Trash2 />
      </Button>
    </li>
  );
}

/**
 * The recording's loudness over time, the lines' starts as marks and where it plays; a click seeks.
 */
function Waveform({
  peaks,
  duration,
  time,
  lines,
  current,
  onSeek,
}: {
  peaks: number[];
  duration: number;
  time: number;
  lines: TimedLine[];
  current: number;
  onSeek: (seconds: number) => void;
}) {
  const t = useTranslations("LyricsEditor");
  const width = 1000;
  const height = 80;
  const path = useMemo(() => {
    const step = width / Math.max(1, peaks.length);

    return peaks
      .map(
        (peak, i) =>
          `M${(i * step).toFixed(1)} ${(height / 2 - (peak * height) / 2).toFixed(1)}V${(height / 2 + (peak * height) / 2).toFixed(1)}`
      )
      .join("");
  }, [peaks]);
  const x = (seconds: number) => (duration > 0 ? (seconds / duration) * width : 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="slider"
      tabIndex={0}
      aria-label={t("waveform")}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={formatDuration(time)}
      className="bg-secondary/50 text-link h-20 w-full cursor-pointer rounded-md"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          onSeek(time + (event.key === "ArrowLeft" ? -2 : 2));
        }
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();

        onSeek(((event.clientX - bounds.left) / bounds.width) * duration);
      }}
    >
      <path
        d={path}
        stroke="currentColor"
        strokeOpacity={0.45}
        strokeWidth={(width / Math.max(1, peaks.length)) * 0.8}
      />
      {lines.map((line, i) =>
        line.time === null ? null : (
          <line
            key={i}
            x1={x(line.time)}
            x2={x(line.time)}
            y1={0}
            y2={height}
            stroke="currentColor"
            strokeWidth={i === current ? 3 : 1.5}
            vectorEffect="non-scaling-stroke"
            strokeOpacity={i === current ? 1 : 0.6}
          />
        )
      )}
      <line
        x1={x(time)}
        x2={x(time)}
        y1={0}
        y2={height}
        stroke="var(--foreground)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
