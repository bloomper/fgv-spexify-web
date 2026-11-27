"use client";

import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { CoverImage } from "@/components/album/cover-image.client";
import { type PlayerTrack, usePlayer } from "@/components/player/player-provider.client";
import { cn } from "@/utils/utils";

/**
 * Songs on a shelf, e.g. the finales: each with its album's cover; playing one plays the shelf from it.
 */
export function TrackShelfItems({ tracks }: { tracks: PlayerTrack[] }) {
  const t = useTranslations("Album");
  const player = usePlayer();

  return tracks.map((track, i) => {
    const isCurrent = player.current?.id === track.id;

    return (
      <li
        key={track.id}
        className="w-36 shrink-0 snap-start sm:w-44"
      >
        <button
          type="button"
          className="group/card focus-visible:ring-ring relative block w-full rounded-md text-left outline-none focus-visible:ring-2"
          aria-label={
            isCurrent && player.playing ? t("pause", { title: track.title }) : t("play", { title: track.title })
          }
          onClick={() => (isCurrent ? player.toggle() : player.playQueue(tracks, i))}
        >
          <CoverImage
            albumId={track.albumId}
            title=""
            className="bg-muted w-full rounded-md shadow-md"
          />
          <span
            className={cn(
              "bg-primary text-primary-foreground absolute right-2 bottom-2 flex size-11 items-center justify-center rounded-full shadow-lg transition",
              !isCurrent &&
                "group-focus-visible/card:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100"
            )}
          >
            {isCurrent && player.playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </span>
        </button>
        <div className="mt-2 line-clamp-2 text-sm leading-tight font-semibold">{track.title}</div>
        <Link
          href={`/albums/${track.albumId}`}
          className="text-muted-foreground hover:text-foreground mt-0.5 block truncate text-xs"
        >
          {track.albumTitle}
        </Link>
      </li>
    );
  });
}
