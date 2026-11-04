import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AlbumGrid } from "@/components/album/album-grid";
import { HomeSection } from "@/components/home-section";
import { RatingStars } from "@/components/rating.client";
import { RandomRadioButton } from "@/components/player/radio.client";
import { getHome, getMe } from "@/lib/catalog/catalog.server";
import { getListeningState, getPlayedAlbums, getStarredAlbums } from "@/lib/catalog/listening.server";
import { decadesOf } from "@/utils/decades";
import { formatDate } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

const SHELF = 6;

export default async function HomePage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Home");
    const locale = await getLocale();
    const [home, me, played, listening] = await Promise.all([getHome(), getMe(), getPlayedAlbums(), getListeningState()]);
    const liked = await getStarredAlbums(listening.starredAlbums.slice(0, SHELF));
    const welcome = locale === "en" ? me?.settings.welcomeEn : me?.settings.welcomeSv;
    const chip = "rounded-full border px-3 py-1 text-sm hover:bg-accent";

    return (
      <div className="space-y-8 p-4 sm:p-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("greeting", { name: me?.me.displayName ?? me?.me.username ?? "" })}
          </h1>
          <p className="max-w-4xl whitespace-pre-line text-pretty text-muted-foreground">{welcome || t("intro")}</p>
          <div className="pt-1">
            <RandomRadioButton />
          </div>
        </section>

        {home && (home.categories.length > 0 || home.years.length > 0) && (
          <nav aria-label={t("browse")} className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {home.categories.map(category => (
                <Link key={category.id} href={`/albums?category=${category.id}`} className={chip}>
                  {category.name} <span className="ml-1 text-muted-foreground">{category.albumCount}</span>
                </Link>
              ))}
              <Link href="/top" className={chip}>{t("topList")}</Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {decadesOf(home.years).map(decade => (
                <Link key={decade} href={`/albums?decade=${decade}`}
                      className="rounded-md border px-2.5 py-1 text-sm tabular-nums hover:bg-accent">
                  {t("decade", { decade })}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {played.recent.length > 0 && (
          <HomeSection id="recently-played" title={t("recentlyPlayed")}>
            <AlbumGrid albums={played.recent.slice(0, SHELF)}
                       label={album => {
                         const date = formatDate(played.recent.find(item => item.id === album.id)?.played);

                         return date ? t("lastPlayed", { date }) : null;
                       }} />
          </HomeSection>
        )}

        {home && home.topAlbums.length > 0 && (
          <HomeSection id="top" title={t("topRated")} more={{ href: "/top", label: t("wholeTopList") }}>
            <AlbumGrid albums={home.topAlbums} />
          </HomeSection>
        )}

        <HomeSection id="recent" title={t("recent")} more={{ href: "/albums?sort=PUBLISHED", label: t("allAlbums") }}>
          {home && home.recentAlbums.length > 0
            ? <AlbumGrid albums={home.recentAlbums.slice(0, SHELF * 2)} />
            : <p className="text-muted-foreground">{t("empty")}</p>}
        </HomeSection>

        {liked.length > 0 && (
          <HomeSection id="liked" title={t("liked")} more={{ href: "/starred", label: t("allLiked") }}>
            <AlbumGrid albums={liked} />
          </HomeSection>
        )}

        {played.frequent.length > 0 && (
          <HomeSection id="most-played" title={t("mostPlayed")}>
            <AlbumGrid albums={played.frequent.slice(0, SHELF)}
                       label={album => t("plays", { count: played.frequent.find(item => item.id === album.id)?.playCount ?? 0 })} />
          </HomeSection>
        )}

        {played.highest.length > 0 && (
          <HomeSection id="highest-rated" title={t("highestRated")}>
            <AlbumGrid albums={played.highest.slice(0, SHELF)}
                       label={album => <RatingStars
                         value={played.highest.find(item => item.id === album.id)?.rating ?? 0} />} />
          </HomeSection>
        )}
      </div>
    );
  });
}
