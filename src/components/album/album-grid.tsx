import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
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
export function AlbumGrid({ albums, hrefFor, label }: {
  albums: AlbumSummary[];
  hrefFor?: (id: string) => string;
  /** An extra line per album, e.g. how often it was played. */
  label?: (album: AlbumSummary) => ReactNode;
}) {
  const t = useTranslations("Album");
  const locale = useLocale();

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {albums.map(album => (
        <li key={album.id}>
          <Link href={hrefFor ? hrefFor(album.id) : `/albums/${album.id}`}
                className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <CoverImage albumId={album.id} title={album.title}
                        className="w-full rounded-lg shadow-sm transition-transform group-hover:scale-[1.02]" />
            <div className="mt-2 space-y-0.5">
              <div className="line-clamp-2 text-sm font-medium leading-tight">{album.title}</div>
              <div className="text-xs text-muted-foreground">
                {[album.year, album.spex?.[0]?.categoryName].filter(Boolean).join(" · ")}
              </div>
              <AverageRating average={album.averageRating} count={album.ratingCount} />
              {label?.(album) && <div className="text-xs text-muted-foreground">{label(album)}</div>}
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
