import { getTranslations } from "next-intl/server";
import { AlbumGrid } from "@/components/album/album-grid";
import { TrackList } from "@/components/album/track-list.client";
import { toRows } from "@/components/album/to-rows";
import { search } from "@/lib/catalog/catalog.server";
import { getListeningState } from "@/lib/catalog/listening.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Search");
    const q = ((await searchParams).q ?? "").slice(0, 200);
    const [result, listening] = q.trim().length >= 2
      ? await Promise.all([search(q), getListeningState()])
      : [undefined, { starred: [], playlists: [] }];

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{q ? t("resultsFor", { q }) : t("title")}</h1>
        {!result && <p className="text-muted-foreground">{t("hint")}</p>}
        {result && result.albums.length === 0 && result.tracks.length === 0 && (
          <p className="text-muted-foreground">{t("none")}</p>
        )}
        {result && result.albums.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t("albums")}</h2>
            <AlbumGrid albums={result.albums} />
          </section>
        )}
        {result && result.tracks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t("tracks")}</h2>
            <TrackList tracks={toRows(result.tracks)} starred={listening.starred}
                       playlists={listening.playlists} spexflixUrl={null} showAlbum />
          </section>
        )}
      </div>
    );
  });
}
