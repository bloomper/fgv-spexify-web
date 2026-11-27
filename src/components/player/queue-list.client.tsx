"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { formatDuration } from "@/components/player/lyrics";
import { usePlayer } from "@/components/player/player-provider.client";
import { cn } from "@/utils/utils";

/**
 * The play queue: jump to a track, move it or take it out.
 */
export function QueueList() {
  const t = useTranslations("Player");
  const player = usePlayer();

  return (
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
              <span className="block truncate text-xs text-muted-foreground">{track.albumTitle}</span>
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">{formatDuration(track.durationMs / 1000)}</span>
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
  );
}
