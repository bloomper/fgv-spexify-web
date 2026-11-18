"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BookOpenText, ChevronDown, ListX, Pause, Play, Repeat, Repeat1, RotateCcw, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/album/cover-image.client";
import { NumberKindIcon } from "@/components/album/number-kind-icon";
import { formatDuration } from "@/components/player/lyrics";
import { LyricsView } from "@/components/player/lyrics-view.client";
import { type PlayerTrack, usePlayer } from "@/components/player/player-provider.client";
import { QueueList } from "@/components/player/queue-list.client";
import { useCycleRepeat } from "@/components/player/repeat.client";
import { creditHref, splitCredits } from "@/lib/credits";
import { kindName } from "@/utils/format";
import { cn } from "@/utils/utils";

type Tab = "playing" | "lyrics" | "queue" | "about";

/**
 * The player in full screen: the cover large with the controls, and beside it (below it on a phone, as tabs) the
 * lyrics, which follow the playing line and seek when a line is tapped, the queue, and what is known about the number.
 */
export function NowPlaying({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("Player");
  const locale = useLocale();
  const player = usePlayer();
  const cycleRepeat = useCycleRepeat();
  const [tab, setTab] = useState<Tab>("playing");
  const { current } = player;

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);

  if (!open || !current) {
    return null;
  }

  // On a large screen the cover is always there, so the panel beside it shows the lyrics or the queue
  const panel: Exclude<Tab, "playing"> = tab === "playing" ? (current.lyrics ? "lyrics" : "queue") : tab;
  const tabs: Tab[] = ["playing", ...(current.lyrics ? ["lyrics" as const] : []), "queue", "about"];
  const duration = player.duration || current.durationMs / 1000;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={t("nowPlaying")}
         className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background animate-in slide-in-from-bottom-8 fade-in duration-200">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <CoverImage albumId={current.albumId} title="" className="size-full scale-125 opacity-40 blur-3xl saturate-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>
      <div className="relative flex items-center gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-6">
        <Button variant="ghost" size="icon-lg" onClick={onClose} aria-label={t("closeNowPlaying")}>
          <ChevronDown className="size-6" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("nowPlaying")}</div>
          <Link href={`/albums/${current.albumId}`} onClick={onClose} className="block truncate text-sm font-medium hover:underline">
            {current.albumTitle}
          </Link>
        </div>
        <div className="size-10" />
      </div>
      <div role="tablist" aria-label={t("nowPlaying")} className="relative flex gap-1 px-3 py-2 md:justify-end md:px-8">
        {tabs.map(item => (
          <button key={item} type="button" role="tab" aria-selected={tab === item || (item === panel && tab === "playing")}
                  onClick={() => setTab(item)}
                  className={cn("min-h-9 flex-1 rounded-full px-3 text-sm font-medium md:flex-none md:px-4",
                    item === "playing" && "md:hidden",
                    tab === item ? "bg-foreground text-background" : "bg-secondary/80 hover:bg-secondary",
                    tab === "playing" && item === panel && "md:bg-foreground md:text-background")}>
            {t(`tabs.${item}`)}
          </button>
        ))}
      </div>
      <div className="relative grid min-h-0 flex-1 gap-8 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-8 lg:px-16">
        <div className={cn("min-h-0 flex-col items-center justify-center gap-4 md:flex", tab === "playing" ? "flex" : "hidden")}>
          <CoverImage albumId={current.albumId} title={current.albumTitle}
                      className="aspect-square w-full max-w-[min(26rem,55vh)] rounded-lg shadow-2xl" />
          <div className="w-full max-w-[26rem] space-y-4">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-2xl font-bold leading-tight">
                {current.numberKind && <NumberKindIcon kind={current.numberKind} locale={locale} />}
                <span className="truncate">{current.title}</span>
              </h2>
              {player.failed
                ? <p role="alert" className="text-sm text-destructive">{t("error")}</p>
                : <p className="truncate text-muted-foreground">{current.performers ?? current.albumTitle}</p>}
            </div>
            <div>
              <input type="range" min={0} max={duration} step={1} value={player.time}
                     onChange={event => player.seek(Number(event.target.value))}
                     aria-label={t("seek")} className="block h-6 w-full cursor-pointer accent-primary" />
              <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
                <span>{formatDuration(player.time)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon-lg" onClick={() => player.setShuffle(!player.shuffle)}
                      aria-pressed={player.shuffle} aria-label={t("shuffle")}>
                <Shuffle className={cn(player.shuffle && "text-primary")} />
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={player.previous} aria-label={t("previous")}>
                <SkipBack className="size-6 fill-current" />
              </Button>
              <Button className="size-16 rounded-full" onClick={player.toggle}
                      aria-label={player.failed ? t("retry") : player.playing ? t("pause") : t("play")}>
                {player.failed ? <RotateCcw className="size-7" /> : player.playing
                  ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={player.next} aria-label={t("next")}>
                <SkipForward className="size-6 fill-current" />
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={cycleRepeat} aria-label={t(`repeat.${player.repeat}`)}>
                {player.repeat === "one" ? <Repeat1 className="text-primary" />
                  : <Repeat className={cn(player.repeat === "all" && "text-primary")} />}
              </Button>
            </div>
          </div>
        </div>
        <div role="tabpanel" className={cn("min-h-0 overflow-y-auto overscroll-contain md:block md:py-4", tab === "playing" ? "hidden" : "block")}>
          {panel === "lyrics" && current.lyrics && <LyricsView track={current} follow large />}
          {panel === "queue" && (
            <>
              <div className="mb-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => {
                  onClose();
                  player.clear();
                }}>
                  <ListX />{t("clearQueue")}
                </Button>
              </div>
              <QueueList />
            </>
          )}
          {panel === "about" && <AboutTrack track={current} onNavigate={onClose} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * What Spexify knows about the playing number: its title and kind in Spexipedia, who sings it, the original song and
 * the credits, each linking to everything else of theirs, and the number's place in Spexipedia.
 */
function AboutTrack({ track, onNavigate }: { track: PlayerTrack; onNavigate: () => void }) {
  const t = useTranslations("Player");
  const locale = useLocale();
  const credit = (kind: "PERFORMER" | "MELODY" | "LYRICS_AUTHOR" | "ARRANGER", value: string) => {
    const names = kind === "MELODY" ? [value.trim()] : splitCredits(value);

    return names.map((name, i) => (
      <React.Fragment key={name}>
        {i > 0 && ", "}
        <Link href={creditHref(kind, name)} onClick={onNavigate} className="hover:underline">{name}</Link>
      </React.Fragment>
    ));
  };
  const rows: [string, React.ReactNode][] = [
    ...(track.numberTitle ? [[t("about.number"), track.numberTitle] as [string, React.ReactNode]] : []),
    ...(track.numberKind ? [[t("about.kind"), kindName(track.numberKind, locale)] as [string, React.ReactNode]] : []),
    ...(track.performers ? [[t("about.performers"), credit("PERFORMER", track.performers)] as [string, React.ReactNode]] : []),
    ...(track.melody ? [[t("about.melody"), credit("MELODY", track.melody)] as [string, React.ReactNode]] : []),
    ...(track.lyricsAuthor ? [[t("about.lyricsAuthor"), credit("LYRICS_AUTHOR", track.lyricsAuthor)] as [string, React.ReactNode]] : []),
    ...(track.arranger ? [[t("about.arranger"), credit("ARRANGER", track.arranger)] as [string, React.ReactNode]] : []),
    [t("about.album"), <Link key="album" href={`/albums/${track.albumId}`} onClick={onNavigate} className="hover:underline">{track.albumTitle}</Link>],
  ];

  return (
    <div className="max-w-xl space-y-6">
      <h3 className="text-2xl font-bold">{track.title}</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      {track.spexipediaUrl && (
        <Button variant="outline" nativeButton={false}
                render={<a href={track.spexipediaUrl} target="_blank" rel="noopener noreferrer" />}>
          <BookOpenText />{t("about.inSpexipedia")}
        </Button>
      )}
    </div>
  );
}
