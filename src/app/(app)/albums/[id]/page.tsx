import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Download, Pencil } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { CoverImage } from "@/components/album/cover-image.client";
import { PlayAllButtons, TrackList } from "@/components/album/track-list.client";
import { toRows } from "@/components/album/to-rows";
import { formatDuration } from "@/components/player/lyrics";
import { getAlbum, getAlbumsOfSpex, getMe } from "@/lib/catalog/catalog.server";
import { AlbumGrid } from "@/components/album/album-grid";
import { getAlbumListening, getListeningState, spexflixUrl } from "@/lib/catalog/listening.server";
import { AlbumListening } from "@/components/album/album-listening.client";
import { AverageRating } from "@/components/rating.client";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { isEditor } from "@/utils/auth";
import { kindName } from "@/utils/format";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { AlbumBackdrop } from "@/components/album/album-backdrop.client";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async (authz) => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Album");
    const tc = await getTranslations("Collections");
    const locale = await getLocale();
    const [album, listening, me] = await Promise.all([getAlbum(id), getListeningState(), getMe()]);

    if (!album) {
      notFound();
    }

    const [albumListening, related] = await Promise.all([
      getAlbumListening(album.navidromeId),
      getAlbumsOfSpex(album.spex.map((spex) => spex.familyId)),
    ]);
    const others = related.filter((other) => other.id !== album.id);
    const main = album.spex[0];
    const rows = toRows(album.tracks, albumListening?.plays);

    return (
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <header className="relative isolate px-4 pt-6 pb-4 md:px-8 md:pt-10">
          <AlbumBackdrop albumId={album.id} />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <CoverImage
              albumId={album.id}
              title={album.title}
              className="w-48 shrink-0 self-center rounded-lg shadow-2xl sm:w-56 sm:self-end lg:w-64"
            />
            <div className="min-w-0 space-y-3">
              <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <span>{kindName(album.kind, locale)}</span>
                {main?.revival && <Badge variant="secondary">{t("revival")}</Badge>}
                {!album.published && <Badge variant="outline">{t("unpublished")}</Badge>}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {album.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {[
                  album.year,
                  main?.categoryName,
                  t("tracks", { count: album.trackCount }),
                  formatDuration(album.durationMs / 1000),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {(album.catalogueNumber || album.medium || album.released || album.conductor) && (
                <p className="text-muted-foreground text-sm">
                  {[
                    album.catalogueNumber,
                    album.medium && kindName(album.medium, locale),
                    album.released && t("released", { date: album.released }),
                    album.conductor && t("conductor", { name: album.conductor }),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <AverageRating
                average={album.averageRating}
                count={album.ratingCount}
                stars
                className="text-sm"
              />
            </div>
          </div>
        </header>
        <div className="flex flex-col gap-6 px-4 pb-4 md:px-8 md:pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <PlayAllButtons
              tracks={rows}
              radioAlbumId={album.published && !album.trashedAt ? album.id : undefined}
            />
            {album.navidromeId && albumListening && (
              <AlbumListening
                navidromeId={album.navidromeId}
                starred={albumListening.starred}
                rating={albumListening.rating}
              />
            )}
            <Button
              variant="ghost"
              nativeButton={false}
              render={
                <a
                  href={`/api/download/album/${album.id}`}
                  download
                  data-umami-event="album-download"
                />
              }
            >
              <Download />
              {t("downloadAlbum")}
            </Button>
            {isEditor(authz.roles) && (
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href={`/manage/albums/${album.id}`} />}
              >
                <Pencil />
                {t("edit")}
              </Button>
            )}
          </div>
          {album.description && (
            <p className="max-w-4xl text-sm text-pretty whitespace-pre-line">{album.description}</p>
          )}
          {(album.collections.length > 0 || album.spex.length > 0) && (
            <div className="space-y-1 text-sm">
              {album.collections.length > 0 && (
                <p className="text-muted-foreground">
                  {tc("inCollections")}{" "}
                  {album.collections.map((collection, i) => (
                    <span key={collection.id}>
                      {i > 0 && ", "}
                      <Link
                        href={`/collections/${collection.id}`}
                        className="text-link hover:text-link/80"
                      >
                        {collection.title}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
              {album.spex.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                  {album.spex.map((spex) => {
                    const name = [spex.title, spex.year].filter(Boolean).join(" ");

                    return (
                      <li key={spex.id}>
                        <Link
                          href={`/albums?spex=${spex.familyId}`}
                          className="text-link hover:text-link/80"
                        >
                          {t("allFromSpex", { title: spex.title ?? name })}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          {rows.length > 0 ? (
            <TrackList
              tracks={rows}
              starred={listening.starred}
              playlists={listening.playlists}
              spexflixUrl={me?.me.spexflixUser ? spexflixUrl() : null}
            />
          ) : (
            <DataEmpty
              title={t("noTracks")}
              description={null}
            />
          )}
          {others.length > 0 && (
            <section
              aria-labelledby="same-spex"
              className="space-y-3"
            >
              <h2
                id="same-spex"
                className="text-lg font-semibold"
              >
                {t("sameSpex")}
              </h2>
              <AlbumGrid albums={others} />
            </section>
          )}
        </div>
      </div>
    );
  });
}
