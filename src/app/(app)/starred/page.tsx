import { getTranslations } from "next-intl/server";
import { AlbumGrid } from "@/components/album/album-grid";
import { PlayAllButtons, TrackList } from "@/components/album/track-list.client";
import { toRows } from "@/components/album/to-rows";
import { getTracksByNavidromeIds } from "@/lib/catalog/catalog.server";
import { getListeningState, getStarredAlbums } from "@/lib/catalog/listening.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function StarredPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Starred");
    const listening = await getListeningState();
    const [tracks, albums] = await Promise.all([
      getTracksByNavidromeIds(listening.starred),
      getStarredAlbums(listening.starredAlbums),
    ]);
    const rows = toRows(tracks, listening.starredPlays);

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
        {albums.length > 0 && (
          <section className="space-y-3" aria-labelledby="starred-albums">
            <h2 id="starred-albums" className="text-lg font-semibold">{t("albums")}</h2>
            <AlbumGrid albums={albums} />
          </section>
        )}
        {rows.length > 0 && (
          <section className="space-y-3" aria-labelledby="starred-tracks">
            <h2 id="starred-tracks" className="text-lg font-semibold">{t("tracks")}</h2>
            <PlayAllButtons tracks={rows} />
            <TrackList tracks={rows} starred={listening.starred} playlists={listening.playlists} spexflixUrl={null}
                       showAlbum />
          </section>
        )}
        {albums.length === 0 && rows.length === 0 && <p className="text-muted-foreground">{t("none")}</p>}
      </div>
    );
  });
}
