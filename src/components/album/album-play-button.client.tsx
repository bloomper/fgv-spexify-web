"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { albumTracksAction } from "@/components/player/actions.server";
import { usePlayer } from "@/components/player/player-provider.client";
import { cn } from "@/utils/utils";

/**
 * The round play button on an album's cover, shown when the cover is hovered or focused (always on touch screens).
 * Plays the album from its first track.
 */
export function AlbumPlayButton({ albumId, title, className }: { albumId: string; title: string; className?: string }) {
  const t = useTranslations("Album");
  const player = usePlayer();
  const [pending, startTransition] = useTransition();

  return (
    <button type="button" disabled={pending} aria-label={t("playAlbum", { title })} title={t("playAlbum", { title })}
            onClick={() => startTransition(async () => {
              const tracks = await albumTracksAction(albumId);

              if (!tracks || tracks.length === 0) {
                toast.error(t(tracks ? "noTracks" : "playFailed"));
                return;
              }
              player.playQueue(tracks, 0);
            })}
            className={cn("flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition",
              "hover:scale-105 active:scale-95 disabled:opacity-60",
              "[@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
              className)}>
      <Play className="size-5 fill-current" />
    </button>
  );
}
