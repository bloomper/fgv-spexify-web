import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { CoverImage } from "@/components/album/cover-image.client";
import { AverageRating } from "@/components/rating.client";
import { type KindName, kindName } from "@/utils/format";

export type AlbumSummary = {
  id: string;
  title: string;
  year?: number | null;
  kind: KindName & { isDefault: boolean };
  published?: boolean;
  trackCount: number;
  /** Everyone's average rating, or null when nobody rated it. */
  averageRating?: number | null;
  ratingCount?: number;
  /** The main spex first. */
  spex?: { categoryName?: string | null; revival?: boolean | null }[];
};

/**
 * Albums as cover cards with everyone's average rating. A link per card; the badges say what is not obvious from the
 * title.
 */
export function AlbumGrid({
  albums,
  hrefFor,
  label,
  ranked = false,
}: {
  albums: AlbumSummary[];
  /** Numbers the covers 1, 2, 3…, for a top list. */
  ranked?: boolean;
  hrefFor?: (id: string) => string;
  /** An extra line per album, e.g. how often it was played. */
  label?: (album: AlbumSummary) => ReactNode;
}) {
  const t = useTranslations("Album");
  const locale = useLocale();

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {albums.map((album, i) => (
        <li
          key={album.id}
          className="relative"
        >
          {ranked && (
            <span className="bg-background/90 pointer-events-none absolute top-2 left-2 z-10 flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums shadow">
              {i + 1}
            </span>
          )}
          <Link
            href={hrefFor ? hrefFor(album.id) : `/albums/${album.id}`}
            className="group focus-visible:ring-ring block rounded-lg outline-none focus-visible:ring-2"
          >
            <CoverImage
              albumId={album.id}
              title={album.title}
              className="w-full rounded-lg shadow-sm transition-transform group-hover:scale-[1.02]"
            />
            <div className="mt-2 space-y-0.5">
              <div className="line-clamp-2 text-sm leading-tight font-medium">{album.title}</div>
              <div className="text-muted-foreground text-xs">
                {[album.year, album.spex?.[0]?.categoryName].filter(Boolean).join(" · ")}
              </div>
              <AverageRating
                average={album.averageRating}
                count={album.ratingCount}
              />
              {label?.(album) && <div className="text-muted-foreground text-xs">{label(album)}</div>}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {!album.kind.isDefault && <Badge variant="secondary">{kindName(album.kind, locale)}</Badge>}
                {album.spex?.[0]?.revival && <Badge variant="secondary">{t("revival")}</Badge>}
                {album.published === false && <Badge variant="outline">{t("unpublished")}</Badge>}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
