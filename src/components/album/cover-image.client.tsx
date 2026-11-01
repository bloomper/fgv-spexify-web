"use client";

import {useCallback, useState} from "react";
import {Disc3} from "lucide-react";
import {cn} from "@/utils/utils";

/**
 * An album's cover, or its spex poster, from {@code /api/cover/[id]}; a disc when it has neither.
 */
export function CoverImage({albumId, title, className}: { albumId: string; title: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    // An image that failed before React hydrated never fires onError, so a broken one is caught when it mounts
    const checkLoaded = useCallback((image: HTMLImageElement | null) => {
        if (image?.complete && image.naturalWidth === 0) {
            setFailed(true);
        }
    }, []);

    if (failed) {
        return (
            <div className={cn("flex aspect-square items-center justify-center bg-muted text-muted-foreground", className)}
                 role="img" aria-label={title}>
                <Disc3 className="size-1/2"/>
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/cover/${albumId}`} alt={title} loading="lazy" ref={checkLoaded} onError={() => setFailed(true)}
             className={cn("aspect-square object-cover", className)}/>
    );
}
