import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {AlbumGrid} from "@/components/album/album-grid";
import {getAlbums} from "@/lib/catalog/catalog.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {cn} from "@/utils/utils";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AlbumsPage({searchParams}: { searchParams: Promise<{ category?: string; year?: string; spex?: string }> }) {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Albums");
        const {category, year, spex} = await searchParams;
        const categoryId = category && ID.test(category) ? category : null;
        const yearNumber = year && /^\d{4}$/.test(year) ? Number(year) : null;
        const spexId = spex && ID.test(spex) ? spex : null;
        const data = await getAlbums({categoryId, year: yearNumber, spexId});
        // The spex as the albums have it: the original when the filter is one, else the revival itself.
        const linked = data?.albums.flatMap(album => album.spex);
        const spexTitle = spexId ? (linked?.find(item => item.id === spexId)?.title ?? linked?.find(item => item.familyId === spexId)?.title) : null;
        const link = (params: { category?: string | null; year?: number | null }) => {
            const query = new URLSearchParams();

            if (params.category) {
                query.set("category", params.category);
            }
            if (params.year) {
                query.set("year", String(params.year));
            }
            return `/albums${query.size ? `?${query}` : ""}`;
        };
        const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-sm", active ? "bg-primary text-primary-foreground" : "hover:bg-accent");

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                {spexId && (
                    <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
                        <span>{t("spexFilter", {title: spexTitle ?? "?"})}</span>
                        <Link href={link({category: categoryId, year: yearNumber})} className="text-primary hover:underline">{t("clearSpex")}</Link>
                    </p>
                )}
                <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
                    <Link href={link({year: yearNumber})} className={chip(!categoryId)}>{t("allCategories")}</Link>
                    {data?.categories.map(item => (
                        <Link key={item.id} href={link({category: item.id, year: yearNumber})}
                              className={chip(categoryId === item.id)} aria-current={categoryId === item.id ? "page" : undefined}>
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <nav aria-label={t("years")} className="flex flex-wrap gap-1.5">
                    <Link href={link({category: categoryId})} className={chip(!yearNumber)}>{t("allYears")}</Link>
                    {data?.years.map(item => (
                        <Link key={item} href={link({category: categoryId, year: item})}
                              className={cn(chip(yearNumber === item), "tabular-nums")} aria-current={yearNumber === item ? "page" : undefined}>
                            {item}
                        </Link>
                    ))}
                </nav>
                {data && data.albums.length > 0
                    ? <AlbumGrid albums={data.albums}/>
                    : <p className="text-muted-foreground">{t("none")}</p>}
            </div>
        );
    });
}
