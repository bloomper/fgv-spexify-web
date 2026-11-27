import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AlbumCard } from "@/components/album/album-card";
import { Shelf, ShelfItem } from "@/components/shelf";
import { RatingStars } from "@/components/rating.client";
import { RandomRadioButton } from "@/components/player/radio.client";
import { RadioShelfItems } from "@/components/player/radio-shelf.client";
import { TrackShelfItems } from "@/components/player/track-shelf.client";
import { getHome, getMe } from "@/lib/catalog/catalog.server";
import { getListeningState, getPlayedAlbums, getStarredAlbums } from "@/lib/catalog/listening.server";
import { byDecade, byKind } from "@/utils/decades";
import { formatDate, kindName } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page } from "@bloomper/fgv-web-ui/shell/page-header";

const SHELF = 16;
const RADIO_SEEDS = 8;

/**
 * The start page: shelves that scroll sideways, as in a music streaming service. What the user played comes first,
 * then what is new, this day in spex history, a shelf per decade, per album kind and per number kind (both kinds are
 * data, so a new kind gives a new shelf), radio, and what the user likes and rates.
 */
export default async function HomePage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Home");
    const locale = await getLocale();
    const [home, me, played, listening] = await Promise.all([getHome(), getMe(), getPlayedAlbums(SHELF), getListeningState()]);
    const liked = await getStarredAlbums(listening.starredAlbums.slice(0, SHELF));
    const welcome = locale === "en" ? me?.settings.welcomeEn : me?.settings.welcomeSv;
    const chip = "shrink-0 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-accent";
    const albums = home?.albums ?? [];
    const seeds = [...new Map([...played.recent, ...played.frequent].map(album => [album.id, album])).values()]
      .slice(0, RADIO_SEEDS);

    return (
      <Page variant="content" className="min-w-0">
        <section className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("greeting", { name: me?.me.displayName ?? me?.me.username ?? "" })}
            </h1>
            <RandomRadioButton />
          </div>
          <p className="max-w-4xl whitespace-pre-line text-pretty text-muted-foreground">{welcome || t("intro")}</p>
        </section>

        {home && home.categories.length > 0 && (
          <nav aria-label={t("browse")}
               className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            {home.categories.map(category => (
              <Link key={category.id} href={`/albums?category=${category.id}`} className={chip}>
                {category.name} <span className="ml-1 text-muted-foreground">{category.albumCount}</span>
              </Link>
            ))}
            <Link href="/top" className={chip}>{t("topList")}</Link>
          </nav>
        )}

        {played.recent.length > 0 && (
          <Shelf id="recently-played" title={t("recentlyPlayed")} more={{ href: "/recent", label: t("showAll") }}>
            {played.recent.map(album => {
              const date = formatDate(album.played);

              return (
                <ShelfItem key={album.id}>
                  <AlbumCard album={album} label={date ? t("lastPlayed", { date }) : undefined} />
                </ShelfItem>
              );
            })}
          </Shelf>
        )}

        {played.frequent.length > 0 && (
          <Shelf id="most-played" title={t("mostPlayed")}>
            {played.frequent.map(album => (
              <ShelfItem key={album.id}>
                <AlbumCard album={album} label={t("plays", { count: album.playCount })} />
              </ShelfItem>
            ))}
          </Shelf>
        )}

        {home && home.recentAlbums.length > 0 ? (
          <Shelf id="recent" title={t("recent")} more={{ href: "/albums?sort=PUBLISHED", label: t("allAlbums") }}>
            {home.recentAlbums.map(album => <ShelfItem key={album.id}><AlbumCard album={album} /></ShelfItem>)}
          </Shelf>
        ) : (
          <section className="space-y-3" aria-labelledby="recent">
            <h2 id="recent" className="text-xl font-bold tracking-tight">{t("recent")}</h2>
            <DataEmpty title={t("empty")} description={null} />
          </section>
        )}

        {home && home.thisDayAlbums.length > 0 && (
          <Shelf id="this-day" title={t("thisDay")}>
            {home.thisDayAlbums.map(album => (
              <ShelfItem key={album.id}>
                <AlbumCard album={album} label={album.year ? t("premiered", { year: album.year }) : undefined} />
              </ShelfItem>
            ))}
          </Shelf>
        )}

        {byDecade(albums).map(({ decade, albums: inDecade }) => (
          <Shelf key={decade} id={`decade-${decade}`} title={t("decade", { decade })}
                 more={{ href: `/albums?decade=${decade}`, label: t("showAll") }}>
            {inDecade.slice(0, SHELF).map(album => <ShelfItem key={album.id}><AlbumCard album={album} /></ShelfItem>)}
          </Shelf>
        ))}

        {home && byKind(albums, home.albumKinds).map(({ kind, albums: ofKind }) => (
          <Shelf key={kind.id} id={`kind-${kind.id}`} title={kindName(kind, locale)}
                 more={{ href: `/albums?kind=${kind.id}`, label: t("showAll") }}>
            {ofKind.slice(0, SHELF).map(album => <ShelfItem key={album.id}><AlbumCard album={album} /></ShelfItem>)}
          </Shelf>
        ))}

        {home?.numberKinds.filter(kind => kind.tracks.length > 0).map(kind => (
          <Shelf key={kind.id} id={`number-kind-${kind.id}`} title={kindName(kind, locale)}>
            <TrackShelfItems tracks={kind.tracks} />
          </Shelf>
        ))}

        <Shelf id="radio" title={t("radio")}>
          <RadioShelfItems albums={seeds.map(album => ({ id: album.id, title: album.title }))} />
        </Shelf>

        {liked.length > 0 && (
          <Shelf id="liked" title={t("liked")} more={{ href: "/starred", label: t("allLiked") }}>
            {liked.map(album => <ShelfItem key={album.id}><AlbumCard album={album} /></ShelfItem>)}
          </Shelf>
        )}

        {played.highest.length > 0 && (
          <Shelf id="highest-rated" title={t("highestRated")}>
            {played.highest.map(album => (
              <ShelfItem key={album.id}>
                <AlbumCard album={album} label={<RatingStars value={album.rating} />} />
              </ShelfItem>
            ))}
          </Shelf>
        )}

        {home && home.topAlbums.length > 0 && (
          <Shelf id="top" title={t("topRated")} more={{ href: "/top", label: t("wholeTopList") }}>
            {home.topAlbums.map(album => <ShelfItem key={album.id}><AlbumCard album={album} /></ShelfItem>)}
          </Shelf>
        )}
      </Page>
    );
  });
}
