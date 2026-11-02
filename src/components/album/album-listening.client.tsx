"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Star} from "lucide-react";
import {Button} from "@/components/ui/button";
import {RatingInput} from "@/components/rating.client";
import {rateAction, starAlbumAction} from "@/app/(app)/actions.server";
import {cn} from "@/utils/utils";
import {track} from "@/utils/umami";

/**
 * The user's star and rating of an album, which live in Navidrome. Both change at once and go back when they cannot be
 * saved.
 */
export function AlbumListening({navidromeId, starred: initialStarred, rating: initialRating}: {
    navidromeId: string;
    starred: boolean;
    rating: number;
}) {
    const t = useTranslations("Album");
    const [starred, setStarred] = useState(initialStarred);
    const [rating, setRating] = useState(initialRating);
    const [, startTransition] = useTransition();

    const toggleStar = () => {
        const next = !starred;

        setStarred(next);
        startTransition(async () => {
            const result = await starAlbumAction(navidromeId, next);

            if (result.ok) {
                track("album-star", {starred: next});
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
                track("album-rate", {rating: next});
            } else {
                setRating(previous);
                toast.error(t("rateFailed"));
            }
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={toggleStar} aria-pressed={starred}>
                <Star className={cn(starred && "fill-current text-yellow-500")}/>
                {starred ? t("unstarAlbum") : t("starAlbum")}
            </Button>
            <RatingInput value={rating} onChange={rate} label={t("rateAlbum")}/>
        </div>
    );
}
