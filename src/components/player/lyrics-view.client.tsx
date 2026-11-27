"use client";

import { useEffect, useMemo, useRef } from "react";
import { currentLine, parseLrc, singerOf } from "@/components/player/lyrics";
import { type PlayerTrack, usePlayer } from "@/components/player/player-provider.client";
import { cn } from "@/utils/utils";

/**
 * The playing track's lyrics. Synchronised ones follow the playing line, which scrolls into the middle when
 * {@code follow} is set, and a line can be tapped to seek to it; others are plain text. A singer label at the start of
 * a line ("Ph:") is shown as the name of the character it stands for, above the line, when the server knows it.
 */
export function LyricsView({
  track,
  singers = [],
  follow = false,
  large = false,
}: {
  track: PlayerTrack;
  singers?: { label: string; name: string }[];
  follow?: boolean;
  large?: boolean;
}) {
  const player = usePlayer();
  const lines = useMemo(() => (track.lyrics && track.lyricsSynced ? parseLrc(track.lyrics) : []), [track]);
  const active = currentLine(lines, player.time);
  const activeLine = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (follow && active >= 0) {
      activeLine.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [active, follow]);

  const names = useMemo(() => new Map(singers.map((singer) => [singer.label, singer.name])), [singers]);

  if (lines.length === 0) {
    return (
      <div className={cn("leading-relaxed", large ? "text-xl" : "text-base")}>
        {(track.lyrics ?? "").split(/\r?\n/).map((raw, i) => {
          const { singer, text } = singerOf(raw, names);

          return (
            <p
              key={i}
              className="min-h-[1lh]"
            >
              {singer && <span className="text-link mr-2 text-sm font-semibold tracking-wide uppercase">{singer}</span>}
              {text}
            </p>
          );
        })}
      </div>
    );
  }
  return (
    <ol className={cn("leading-snug", large ? "space-y-4 text-2xl font-bold md:text-3xl" : "space-y-2 text-lg")}>
      {lines.map((line, i) => {
        const { singer, text } = singerOf(line.text, names);
        const previous = i > 0 ? singerOf(lines[i - 1].text, names).singer : null;

        return (
          <li
            key={`${line.time}-${i}`}
            ref={i === active ? activeLine : undefined}
            className={cn(
              "transition-colors",
              i === active ? "text-foreground" : "text-muted-foreground",
              i === active && !large && "font-semibold"
            )}
            aria-current={i === active ? "true" : undefined}
          >
            {singer && singer !== previous && (
              <div className={cn("text-link font-semibold tracking-wide uppercase", large ? "text-sm" : "text-xs")}>
                {singer}
              </div>
            )}
            <button
              type="button"
              className="hover:text-foreground text-left"
              onClick={() => player.seek(line.time)}
            >
              {text || "♪"}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
