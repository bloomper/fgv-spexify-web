import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlbumGrid } from "@/components/album/album-grid";
import { PlayAllButtons, TrackList } from "@/components/album/track-list.client";
import { toRows } from "@/components/album/to-rows";
import { LinkSegments, LinkTabs } from "@/components/link-tabs";
import { AverageRating } from "@/components/rating.client";
import { getTop } from "@/lib/catalog/catalog.server";
import { getListeningState } from "@/lib/catalog/listening.server";
import type { TopBy } from "@/gql/graphql";
import { decadesOf, parseDecade } from "@/utils/decades";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { cn } from "@/utils/utils";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BY: TopBy[] = ["RATED", "LIKED", "PLAYED"];

type Params = { what?: string; by?: string; decade?: string; category?: string };
type Counts = { averageRating?: number | null; ratingCount: number; likeCount: number; totalPlays: number };

/**
 * Everyone's favourites: the tracks or albums with the best weighted average rating, the most likes or the most plays,
 * for a decade or a category. What it ranks by is chosen with tabs, songs or albums with a switch, and the chips below
 * narrow the list; every row says the number it is ranked by.
 */
export default async function TopPage({ searchParams }: { searchParams: Promise<Params> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Top");
    const query = await searchParams;
    const what = query.what === "albums" ? "albums" : "tracks";
    const by = BY.find(candidate => candidate === query.by) ?? "RATED";
    const decade = parseDecade(query.decade);
    const categoryId = query.category && ID.test(query.category) ? query.category : null;
    const [data, listening] = await Promise.all([
      getTop(by, { categoryId, fromYear: decade, toYear: decade ? decade + 9 : null }),
      getListeningState(),
    ]);
    const current = { what, by, decade, category: categoryId };
    const link = (changes: Partial<{ what: string; by: TopBy; decade: number | null; category: string | null }>) => {
      const params = { ...current, ...changes };
      const search = new URLSearchParams();

      if (params.what !== "tracks") {
        search.set("what", params.what);
      }
      if (params.by !== "RATED") {
        search.set("by", params.by);
      }
      if (params.decade) {
        search.set("decade", String(params.decade));
      }
      if (params.category) {
        search.set("category", params.category);
      }
      return `/top${search.size ? `?${search}` : ""}`;
    };
    const chip = (active: boolean) => cn("rounded-full border px-2.5 py-0.5 text-xs",
      active ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground");
    // The user's own rating is known only for the songs Navidrome gave us; the others show everyone's average alone
    const rows = toRows(data?.topTracks ?? [], listening.starredPlays)
      .map(row => row.navidromeId && listening.starredPlays[row.navidromeId] ? row : { ...row, rating: undefined });
    const value = (item: Counts) => by === "LIKED"
      ? t("likes", { count: item.likeCount })
      : by === "PLAYED" ? t("plays", { count: item.totalPlays }) : null;
    // Rows the user can rate already show everyone's average beside their own rating
    const ratable = new Set(rows.filter(row => row.rating !== undefined).map(row => row.id));
    const stats = Object.fromEntries((data?.topTracks ?? [])
      .filter(item => by !== "RATED" || !ratable.has(item.id))
      .map(item => [item.id, value(item) ?? <AverageRating average={item.averageRating} count={item.ratingCount} stars />]));

    return (
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="max-w-3xl text-pretty text-sm text-muted-foreground">{t(`text.${by}`)}</p>
          </div>
          <LinkSegments label={t("what")} items={[
            { href: link({ what: "tracks" }), label: t("tracks"), active: what === "tracks" },
            { href: link({ what: "albums" }), label: t("albums"), active: what === "albums" },
          ]} />
        </div>
        <LinkTabs label={t("by")} items={BY.map(item => ({
          href: link({ by: item }), label: t(`byLabel.${item}`), active: by === item,
        }))} />
        <nav aria-label={t("filters")} className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            <Link href={link({ category: null })} className={chip(!categoryId)}>{t("allCategories")}</Link>
            {data?.categories.map(item => (
              <Link key={item.id} href={link({ category: item.id })} className={chip(categoryId === item.id)}
                    aria-current={categoryId === item.id ? "page" : undefined}>{item.name}</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link href={link({ decade: null })} className={chip(!decade)}>{t("allYears")}</Link>
            {decadesOf(data?.years ?? []).map(item => (
              <Link key={item} href={link({ decade: item })} className={cn(chip(decade === item), "tabular-nums")}
                    aria-current={decade === item ? "page" : undefined}>{t("decade", { decade: item })}</Link>
            ))}
          </div>
        </nav>
        {what === "albums" ? (
          data && data.topAlbums.length > 0
            ? <AlbumGrid albums={data.topAlbums} ranked
                         label={album => value(data.topAlbums.find(item => item.id === album.id)!)} />
            : <p className="text-muted-foreground">{t("none")}</p>
        ) : rows.length > 0 ? (
          <div className="space-y-3">
            <PlayAllButtons tracks={rows} />
            <TrackList tracks={rows} starred={listening.starred} playlists={listening.playlists} spexflixUrl={null}
                       showAlbum ranked stats={stats} />
          </div>
        ) : <p className="text-muted-foreground">{t("none")}</p>}
      </div>
    );
  });
}
