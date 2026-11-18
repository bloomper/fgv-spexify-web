"use client";

import { useCallback, useState } from "react";

/**
 * The spex poster, blurred, behind the album page's header; the album's cover when the spex has no poster, and
 * nothing when it has neither.
 */
export function AlbumBackdrop({ albumId }: { albumId: string }) {
  const [source, setSource] = useState<"poster" | "cover" | null>("poster");
  const fail = useCallback(() => setSource(current => current === "poster" ? "cover" : null), []);
  // An image that failed before React hydrated never fires onError
  const checkLoaded = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) {
      fail();
    }
  }, [fail]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {source && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={source} src={`/api/${source}/${albumId}`} alt="" ref={checkLoaded} onError={fail}
             className="size-full scale-125 object-cover opacity-60 blur-3xl saturate-150" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
    </div>
  );
}
