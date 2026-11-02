import Link from "next/link";
import {getLocale, getTranslations} from "next-intl/server";
import {AlbumGrid} from "@/components/album/album-grid";
import {Badge} from "@/components/ui/badge";
import {RandomRadioButton} from "@/components/player/radio.client";
import {getHome, getMe} from "@/lib/catalog/catalog.server";
import {getPlayedAlbums} from "@/lib/catalog/listening.server";
import {formatDate} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

export default async function HomePage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Home");
        const tr = await getTranslations("Rating");
        const locale = await getLocale();
        const [home, me, played] = await Promise.all([getHome(), getMe(), getPlayedAlbums()]);
        const welcome = locale === "en" ? me?.settings.welcomeEn : me?.settings.welcomeSv;

        return (
            <div className="space-y-8 p-4 sm:p-6">
                <section className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {t("greeting", {name: me?.me.displayName ?? me?.me.username ?? ""})}
                    </h1>
                    <p className="max-w-prose whitespace-pre-line text-muted-foreground">{welcome || t("intro")}</p>
                    <div className="pt-1">
                        <RandomRadioButton/>
                    </div>
                </section>

                {home && home.categories.length > 0 && (
                    <section className="space-y-2" aria-labelledby="categories">
                        <h2 id="categories" className="text-lg font-semibold">{t("categories")}</h2>
                        <div className="flex flex-wrap gap-2">
                            {home.categories.map(category => (
                                <Link key={category.id} href={`/albums?category=${category.id}`}>
                                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                                        {category.name} <span className="ml-1 text-muted-foreground">{category.albumCount}</span>
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {played.recent.length > 0 && (
                    <section className="space-y-3" aria-labelledby="recently-played">
                        <h2 id="recently-played" className="text-lg font-semibold">{t("recentlyPlayed")}</h2>
                        <AlbumGrid albums={played.recent.slice(0, 6)}
                                   label={album => {
                                       const date = formatDate(played.recent.find(item => item.id === album.id)?.played);

                                       return date ? t("lastPlayed", {date}) : null;
                                   }}/>
                    </section>
                )}

                {played.frequent.length > 0 && (
                    <section className="space-y-3" aria-labelledby="most-played">
                        <h2 id="most-played" className="text-lg font-semibold">{t("mostPlayed")}</h2>
                        <AlbumGrid albums={played.frequent.slice(0, 6)}
                                   label={album => t("plays", {count: played.frequent.find(item => item.id === album.id)?.playCount ?? 0})}/>
                    </section>
                )}

                {played.highest.length > 0 && (
                    <section className="space-y-3" aria-labelledby="highest-rated">
                        <h2 id="highest-rated" className="text-lg font-semibold">{t("highestRated")}</h2>
                        <AlbumGrid albums={played.highest.slice(0, 6)}
                                   label={album => tr("rated", {count: played.highest.find(item => item.id === album.id)?.rating ?? 0})}/>
                    </section>
                )}

                <section className="space-y-3" aria-labelledby="recent">
                    <div className="flex items-baseline justify-between">
                        <h2 id="recent" className="text-lg font-semibold">{t("recent")}</h2>
                        <Link href="/albums" className="text-sm text-primary hover:underline">{t("allAlbums")}</Link>
                    </div>
                    {home && home.recentAlbums.length > 0
                        ? <AlbumGrid albums={home.recentAlbums}/>
                        : <p className="text-muted-foreground">{t("empty")}</p>}
                </section>

                {home && home.years.length > 0 && (
                    <section className="space-y-2" aria-labelledby="years">
                        <h2 id="years" className="text-lg font-semibold">{t("years")}</h2>
                        <div className="flex flex-wrap gap-1.5">
                            {home.years.map(year => (
                                <Link key={year} href={`/albums?year=${year}`}
                                      className="rounded-md border px-2.5 py-1 text-sm tabular-nums hover:bg-accent">
                                    {year}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        );
    });
}
