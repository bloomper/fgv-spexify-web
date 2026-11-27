import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { CoverImage } from "@/components/album/cover-image.client";
import { AlbumPlayButton } from "@/components/album/album-play-button.client";
import type { AlbumSummary } from "@/components/album/album-grid";
import { kindName } from "@/utils/format";

/**
 * An album on a shelf: a large cover with a play button, the title, and the year and category, or another line.
 */
export function AlbumCard({ album, label }: { album: AlbumSummary; label?: ReactNode }) {
  const t = useTranslations("Album");
  const locale = useLocale();

  return (
    <div className="group/card relative">
      <Link
        href={`/albums/${album.id}`}
        className="focus-visible:ring-ring block rounded-md outline-none focus-visible:ring-2"
      >
        <CoverImage
          albumId={album.id}
          title={album.title}
          className="bg-muted w-full rounded-md shadow-md"
        />
        <div className="mt-2 line-clamp-2 text-sm leading-tight font-semibold">{album.title}</div>
        <div className="text-muted-foreground mt-0.5 truncate text-xs">
          {label ?? [album.year, album.spex?.[0]?.categoryName].filter(Boolean).join(" · ")}
        </div>
        {(!album.kind.isDefault || album.spex?.[0]?.revival) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {!album.kind.isDefault && <Badge variant="secondary">{kindName(album.kind, locale)}</Badge>}
            {album.spex?.[0]?.revival && <Badge variant="secondary">{t("revival")}</Badge>}
          </div>
        )}
      </Link>
      {album.trackCount > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-square">
          <AlbumPlayButton
            albumId={album.id}
            title={album.title}
            className="pointer-events-auto absolute right-2 bottom-2"
          />
        </div>
      )}
    </div>
  );
}
