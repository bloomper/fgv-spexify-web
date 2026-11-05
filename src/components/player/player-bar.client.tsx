"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Keyboard,
  ListMusic,
  ListX,
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
  X,
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
import { currentLine, formatDuration, parseLrc } from "@/components/player/lyrics";
import { CoverImage } from "@/components/album/cover-image.client";
import { cn } from "@/utils/utils";

/**
 * The player at the bottom of every page: what plays, controls, a seek bar, the volume, a menu with ReplayGain and the
 * keyboard shortcuts, and panels for the queue (which can be reordered and pruned) and the lyrics.
 */
export function PlayerBar() {
  const t = useTranslations("Player");
  const player = usePlayer();
  // Off, all (the whole queue, e.g. the album) and one (the song) look much alike, so the new mode is said too
  const cycleRepeat = () => {
    const next = player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off";

    player.cycleRepeat();
    toast(t(`repeat.${next}`), { id: "repeat", duration: 1500 });
  };
  const [panel, setPanel] = useState<"queue" | "lyrics" | null>(null);
  const { current } = player;
  const lines = useMemo(() => current?.lyrics && current.lyricsSynced ? parseLrc(current.lyrics) : [], [current]);
  const active = currentLine(lines, player.time);
  const bar = useRef<HTMLDivElement>(null);
  const visible = current !== null;

  // The bar covers the bottom of the page, so the page and the sidebar (with the account menu and logout at its
  // bottom) end above it: they read its height from --player-height
  useEffect(() => {
    const element = bar.current;
    const root = document.documentElement;

    if (!visible || !element) {
      root.style.removeProperty("--player-height");
      return;
    }

    const update = () => root.style.setProperty("--player-height", `${element.offsetHeight}px`);
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--player-height");
    };
  }, [visible]);

  if (!current) {
    return null;
  }

  return (
    <div ref={bar} className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur print:hidden"
         role="region" aria-label={t("label")}>
      <input
        type="range"
        min={0}
        max={player.duration || current.durationMs / 1000}
        step={1}
        value={player.time}
        onChange={event => player.seek(Number(event.target.value))}
        aria-label={t("seek")}
        className="block h-4 w-full cursor-pointer accent-primary sm:h-1"
      />
      <div className="flex items-center gap-3 px-3 py-2 sm:px-4">
        <Link href={`/albums/${current.albumId}`} className="flex min-w-0 flex-1 items-center gap-3">
          <CoverImage albumId={current.albumId} title={current.albumTitle} className="size-11 shrink-0 rounded" />
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
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex"
                  onClick={() => player.setShuffle(!player.shuffle)}
                  aria-pressed={player.shuffle} aria-label={t("shuffle")}>
            <Shuffle className={cn(player.shuffle && "text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" onClick={player.previous} aria-label={t("previous")}>
            <SkipBack />
          </Button>
          <Button size="icon" onClick={player.toggle}
                  aria-label={player.failed ? t("retry") : player.playing ? t("pause") : t("play")}>
            {player.failed ? <RotateCcw /> : player.playing ? <Pause /> : <Play />}
          </Button>
          <Button variant="ghost" size="icon" onClick={player.next} aria-label={t("next")}>
            <SkipForward />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={cycleRepeat}
                  aria-label={t(`repeat.${player.repeat}`)} title={t(`repeat.${player.repeat}`)}>
            {player.repeat === "one" ? <Repeat1 className="text-primary" /> :
              <Repeat className={cn(player.repeat === "all" && "text-primary")} />}
          </Button>
        </div>
        <div className="hidden w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground md:block">
          {formatDuration(player.time)} / {formatDuration(player.duration || current.durationMs / 1000)}
        </div>
        <div className="hidden shrink-0 items-center lg:flex">
          <Button variant="ghost" size="icon" onClick={player.toggleMute}
                  aria-label={player.muted ? t("unmute") : t("mute")} aria-pressed={player.muted}>
            {player.muted || player.volume === 0 ? <VolumeX /> : player.volume < 0.5 ? <Volume1 /> : <Volume2 />}
          </Button>
          <input type="range" min={0} max={1} step={0.01} value={player.muted ? 0 : player.volume}
                 onChange={event => player.setVolume(Number(event.target.value))}
                 aria-label={t("volume")} aria-valuetext={`${Math.round((player.muted ? 0 : player.volume) * 100)} %`}
                 className="w-24 cursor-pointer accent-primary" />
        </div>
        <div className="flex shrink-0 items-center">
          {current.lyrics && (
            <Button variant="ghost" size="icon" onClick={() => setPanel("lyrics")} aria-label={t("lyrics")}>
              <Mic2 />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setPanel("queue")} aria-label={t("queue")}>
            <ListMusic />
          </Button>
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
        </div>
      </div>
      <Sheet open={panel !== null} onOpenChange={open => !open && setPanel(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{panel === "lyrics" ? `${t("lyrics")}: ${current.title}` : t("queue")}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            {panel === "lyrics" && (lines.length > 0 ? (
              <ol className="space-y-2 text-lg leading-snug">
                {lines.map((line, i) => (
                  <li key={`${line.time}-${i}`}
                      className={cn("transition-colors", i === active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    <button type="button" className="text-left" onClick={() => player.seek(line.time)}>
                      {line.text || "♪"}
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="whitespace-pre-line text-base leading-relaxed">{current.lyrics}</p>
            ))}
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
            {panel === "queue" && (
              // Shuffle and repeat have no room in the bar on a phone, so they are offered here
              <div className="mb-3 flex gap-2 sm:hidden">
                <Button variant="outline" size="sm" onClick={() => player.setShuffle(!player.shuffle)}
                        aria-pressed={player.shuffle}>
                  <Shuffle className={cn(player.shuffle && "text-primary")} />
                  {t("shuffle")}
                </Button>
                <Button variant="outline" size="sm" onClick={cycleRepeat}>
                  {player.repeat === "one" ? <Repeat1 className="text-primary" /> :
                    <Repeat className={cn(player.repeat === "all" && "text-primary")} />}
                  {t(`repeat.${player.repeat}`)}
                </Button>
              </div>
            )}
            {panel === "queue" && (
              <ol className="space-y-1">
                {player.queue.map((track, i) => (
                  <li key={`${track.id}-${i}`} className="group/queue flex items-center gap-1">
                    <button type="button" onClick={() => player.jump(i)}
                            className={cn("flex min-w-0 flex-1 items-center gap-3 rounded px-2 py-2 text-left hover:bg-muted",
                              i === player.index && "bg-muted font-medium")}
                            aria-current={i === player.index ? "true" : undefined}>
                      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm">{track.title}</span>
                                                <span
                                                  className="block truncate text-xs text-muted-foreground">{track.albumTitle}</span>
                                            </span>
                      <span
                        className="text-xs tabular-nums text-muted-foreground">{formatDuration(track.durationMs / 1000)}</span>
                    </button>
                    <Button variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => player.move(i, i - 1)}
                            aria-label={t("moveUp", { title: track.title })}>
                      <ArrowUp />
                    </Button>
                    <Button variant="ghost" size="icon-sm" disabled={i === player.queue.length - 1}
                            onClick={() => player.move(i, i + 1)} aria-label={t("moveDown", { title: track.title })}>
                      <ArrowDown />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => player.remove(i)}
                            aria-label={t("removeFromQueue", { title: track.title })}>
                      <X />
                    </Button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
