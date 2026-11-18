"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Keyboard,
  ListMusic,
  ListX,
  Maximize2,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  RotateCcw,
  Settings2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ReplayGainMode, usePlayer } from "@/components/player/player-provider.client";
import { SHOW_SHORTCUTS } from "@/components/player/shortcuts.client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDuration } from "@/components/player/lyrics";
import { LyricsView } from "@/components/player/lyrics-view.client";
import { QueueList } from "@/components/player/queue-list.client";
import { NowPlaying } from "@/components/player/now-playing.client";
import { useCycleRepeat } from "@/components/player/repeat.client";
import { CoverImage } from "@/components/album/cover-image.client";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/utils/utils";

/**
 * The player at the bottom of every page. On a large screen a bar with what plays, the controls and a seek bar in the
 * middle, and the volume, lyrics, queue, a menu with ReplayGain and the keyboard shortcuts, and full screen on the
 * right; on a phone a mini player that opens the full-screen player. {@link BottomDock} places it.
 */
export function PlayerBar() {
  const t = useTranslations("Player");
  const player = usePlayer();
  const isMobile = useIsMobile();
  const cycleRepeat = useCycleRepeat();
  const [panel, setPanel] = useState<"queue" | "lyrics" | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const { current } = player;

  if (!current) {
    return null;
  }

  const duration = player.duration || current.durationMs / 1000;
  const nowPlaying = <NowPlaying open={fullScreen} onClose={() => setFullScreen(false)} />;

  if (isMobile) {
    return (
      <div className="px-2 pt-2 print:hidden" role="region" aria-label={t("label")}>
        <div className="relative flex items-center gap-2 overflow-hidden rounded-lg bg-secondary/95 pr-1 shadow-lg backdrop-blur">
          <button type="button" onClick={() => setFullScreen(true)} aria-label={t("openNowPlaying")}
                  className="flex min-w-0 flex-1 items-center gap-3 p-1.5 text-left">
            <CoverImage albumId={current.albumId} title="" className="size-11 shrink-0 rounded" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{current.title}</span>
              {player.failed
                ? <span role="alert" className="block truncate text-xs text-destructive">{t("error")}</span>
                : <span className="block truncate text-xs text-muted-foreground">{current.performers ?? current.albumTitle}</span>}
            </span>
          </button>
          <Button variant="ghost" size="icon-lg" onClick={player.toggle}
                  aria-label={player.failed ? t("retry") : player.playing ? t("pause") : t("play")}>
            {player.failed ? <RotateCcw /> : player.playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
          </Button>
          <Button variant="ghost" size="icon-lg" onClick={player.next} aria-label={t("next")}>
            <SkipForward className="fill-current" />
          </Button>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground/10">
            <div className="h-full bg-primary" style={{ width: `${duration ? Math.min(100, player.time / duration * 100) : 0}%` }} />
          </div>
        </div>
        {nowPlaying}
      </div>
    );
  }

  return (
    <div className="border-t bg-background/95 backdrop-blur print:hidden" role="region" aria-label={t("label")}>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4 px-4 py-2">
        <Link href={`/albums/${current.albumId}`} className="flex min-w-0 items-center gap-3">
          <CoverImage albumId={current.albumId} title={current.albumTitle} className="size-14 shrink-0 rounded shadow" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{current.title}</div>
            {player.failed ? (
              <div role="alert" className="truncate text-xs text-destructive">{t("error")}</div>
            ) : (
              <div className="truncate text-xs text-muted-foreground">
                {current.performers ? `${current.performers} · ` : ""}{current.albumTitle}
              </div>
            )}
          </div>
        </Link>
        <div className="flex min-w-0 flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => player.setShuffle(!player.shuffle)}
                    aria-pressed={player.shuffle} aria-label={t("shuffle")}>
              <Shuffle className={cn(player.shuffle && "text-primary")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={player.previous} aria-label={t("previous")}>
              <SkipBack className="fill-current" />
            </Button>
            <Button size="icon-lg" className="rounded-full" onClick={player.toggle}
                    aria-label={player.failed ? t("retry") : player.playing ? t("pause") : t("play")}>
              {player.failed ? <RotateCcw /> : player.playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={player.next} aria-label={t("next")}>
              <SkipForward className="fill-current" />
            </Button>
            <Button variant="ghost" size="icon" onClick={cycleRepeat}
                    aria-label={t(`repeat.${player.repeat}`)} title={t(`repeat.${player.repeat}`)}>
              {player.repeat === "one" ? <Repeat1 className="text-primary" /> :
                <Repeat className={cn(player.repeat === "all" && "text-primary")} />}
            </Button>
          </div>
          <div className="flex w-full max-w-xl items-center gap-2 text-xs tabular-nums text-muted-foreground">
            <span className="w-10 text-right">{formatDuration(player.time)}</span>
            <input type="range" min={0} max={duration} step={1} value={player.time}
                   onChange={event => player.seek(Number(event.target.value))}
                   aria-label={t("seek")} className="h-1 min-w-0 flex-1 cursor-pointer accent-primary" />
            <span className="w-10">{formatDuration(duration)}</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end">
          {current.lyrics && (
            <Button variant="ghost" size="icon" onClick={() => setPanel("lyrics")} aria-label={t("lyrics")}>
              <Mic2 />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setPanel("queue")} aria-label={t("queue")}>
            <ListMusic />
          </Button>
          <div className="hidden items-center lg:flex">
            <Button variant="ghost" size="icon" onClick={player.toggleMute}
                    aria-label={player.muted ? t("unmute") : t("mute")} aria-pressed={player.muted}>
              {player.muted || player.volume === 0 ? <VolumeX /> : player.volume < 0.5 ? <Volume1 /> : <Volume2 />}
            </Button>
            <input type="range" min={0} max={1} step={0.01} value={player.muted ? 0 : player.volume}
                   onChange={event => player.setVolume(Number(event.target.value))}
                   aria-label={t("volume")} aria-valuetext={`${Math.round((player.muted ? 0 : player.volume) * 100)} %`}
                   className="w-24 cursor-pointer accent-primary" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t("settings")} />}>
              <Settings2 />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("replayGain.label")}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={player.replayGain}
                                        onValueChange={value => player.setReplayGain(value as ReplayGainMode)}>
                  {(["off", "track", "album"] as const).map(mode => (
                    <DropdownMenuRadioItem key={mode} value={mode}>{t(`replayGain.${mode}`)}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.dispatchEvent(new Event(SHOW_SHORTCUTS))}>
                <Keyboard />{t("shortcuts")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={() => setFullScreen(true)} aria-label={t("openNowPlaying")}>
            <Maximize2 />
          </Button>
        </div>
      </div>
      <Sheet open={panel !== null} onOpenChange={open => !open && setPanel(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{panel === "lyrics" ? `${t("lyrics")}: ${current.title}` : t("queue")}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            {panel === "lyrics" && <LyricsView track={current} />}
            {panel === "queue" && (
              <div className="mb-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setPanel(null);
                  player.clear();
                }}>
                  <ListX />{t("clearQueue")}
                </Button>
              </div>
            )}
            {panel === "queue" && <QueueList />}
          </div>
        </SheetContent>
      </Sheet>
      {nowPlaying}
    </div>
  );
}
