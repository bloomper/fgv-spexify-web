"use client";

import { useEffect, useMemo, useRef } from "react";
import { currentLine, parseLrc } from "@/components/player/lyrics";
import { type PlayerTrack, usePlayer } from "@/components/player/player-provider.client";
import { cn } from "@/utils/utils";

/**
 * The playing track's lyrics. Synchronised ones follow the playing line, which scrolls into the middle when
 * {@code follow} is set, and a line can be tapped to seek to it; others are plain text.
 */
export function LyricsView({ track, follow = false, large = false }: { track: PlayerTrack; follow?: boolean; large?: boolean }) {
  const player = usePlayer();
  const lines = useMemo(() => track.lyrics && track.lyricsSynced ? parseLrc(track.lyrics) : [], [track]);
  const active = currentLine(lines, player.time);
  const activeLine = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (follow && active >= 0) {
      activeLine.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [active, follow]);

  if (lines.length === 0) {
    return <p className={cn("whitespace-pre-line leading-relaxed", large ? "text-xl" : "text-base")}>{track.lyrics}</p>;
  }
  return (
    <ol className={cn("leading-snug", large ? "space-y-4 text-2xl font-bold md:text-3xl" : "space-y-2 text-lg")}>
      {lines.map((line, i) => (
        <li key={`${line.time}-${i}`} ref={i === active ? activeLine : undefined}
            className={cn("transition-colors", i === active ? "text-foreground" : "text-muted-foreground",
              i === active && !large && "font-semibold")}
            aria-current={i === active ? "true" : undefined}>
          <button type="button" className="text-left hover:text-foreground" onClick={() => player.seek(line.time)}>
            {line.text || "♪"}
          </button>
        </li>
      ))}
    </ol>
  );
}
