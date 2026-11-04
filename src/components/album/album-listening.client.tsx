"use client";

import * as React from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RatingInput } from "@/components/rating.client";
import { rateAction, starAlbumAction } from "@/app/(app)/actions.server";
import { cn } from "@/utils/utils";
import { track } from "@/utils/umami";
import { useServerState } from "@/hooks/use-server-state.client";

/**
 * Whether the user likes an album (starred, in Navidrome's terms) and their rating of it, which live in Navidrome. Both change at once and go back when they cannot be
 * saved.
 */
export function AlbumListening({ navidromeId, starred: initialStarred, rating: initialRating }: {
  navidromeId: string;
  starred: boolean;
  rating: number;
}) {
  const t = useTranslations("Album");
  const [starred, setStarred] = useServerState(initialStarred);
  const [rating, setRating] = useServerState(initialRating);
  const [, startTransition] = useTransition();

  const toggleStar = () => {
    const next = !starred;

    setStarred(next);
    startTransition(async () => {
      const result = await starAlbumAction(navidromeId, next);

      if (result.ok) {
        track("album-star", { starred: next });
      } else {
        setStarred(!next);
        toast.error(t("starFailed"));
      }
    });
  };

  const rate = (next: number) => {
    const previous = rating;

    setRating(next);
    startTransition(async () => {
      const result = await rateAction(navidromeId, next);

      if (result.ok) {
        track("album-rate", { rating: next });
      } else {
        setRating(previous);
        toast.error(t("rateFailed"));
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={toggleStar} aria-pressed={starred}>
        <Heart className={cn(starred && "fill-current text-rose-500")} />
        {starred ? t("unstarAlbum") : t("starAlbum")}
      </Button>
      <RatingInput value={rating} onChange={rate} label={t("rateAlbum")} />
    </div>
  );
}
