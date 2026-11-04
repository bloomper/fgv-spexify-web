import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import { AlbumGrid } from "@/components/album/album-grid";
import { SortSelect } from "@/components/sort-select.client";
import { getAlbums } from "@/lib/catalog/catalog.server";
import type { AlbumSort } from "@/gql/graphql";
import { decadesOf, parseDecade } from "@/utils/decades";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { cn } from "@/utils/utils";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SORTS: AlbumSort[] = ["YEAR_DESC", "YEAR_ASC", "TITLE", "PUBLISHED", "RATING", "LIKES", "PLAYS"];

type Params = { category?: string; year?: string; decade?: string; spex?: string; sort?: string; liked?: string };

export default async function AlbumsPage({ searchParams }: { searchParams: Promise<Params> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Albums");
    const { category, year, decade, spex, sort, liked } = await searchParams;
    const categoryId = category && ID.test(category) ? category : null;
    const yearNumber = year && /^\d{4}$/.test(year) ? Number(year) : null;
    const decadeNumber = yearNumber ? Math.floor(yearNumber / 10) * 10 : parseDecade(decade);
    const spexId = spex && ID.test(spex) ? spex : null;
    const sortBy = SORTS.find(candidate => candidate === sort) ?? "YEAR_DESC";
    const onlyLiked = liked === "1";
    const data = await getAlbums({
      categoryId,
      year: yearNumber,
      spexId,
      sort: sortBy,
      liked: onlyLiked || null,
      fromYear: !yearNumber && decadeNumber ? decadeNumber : null,
      toYear: !yearNumber && decadeNumber ? decadeNumber + 9 : null,
    });
    // The spex as the albums have it: the original when the filter is one, else the revival itself.
    const linked = data?.albums.flatMap(album => album.spex);
    const spexTitle = spexId ? (linked?.find(item => item.id === spexId)?.title ?? linked?.find(item => item.familyId === spexId)?.title) : null;
    const current = {
      category: categoryId,
      year: yearNumber,
      decade: decadeNumber,
      sort: sortBy === "YEAR_DESC" ? null : sortBy,
      liked: onlyLiked,
    };
    const link = (changes: Partial<typeof current>) => {
      const params = { ...current, ...changes };
      const query = new URLSearchParams();

      if (params.category) {
        query.set("category", params.category);
      }
      if (params.year) {
        query.set("year", String(params.year));
      } else if (params.decade) {
        query.set("decade", String(params.decade));
      }
      if (params.liked) {
        query.set("liked", "1");
      }
      if (params.sort) {
        query.set("sort", params.sort);
      }
      return `/albums${query.size ? `?${query}` : ""}`;
    };
    const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-sm", active ? "bg-primary text-primary-foreground" : "hover:bg-accent");
    const years = data?.years ?? [];

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={link({ liked: !onlyLiked })} className={cn(chip(onlyLiked), "inline-flex items-center gap-1.5")}
                  aria-pressed={onlyLiked}>
              <Heart className={cn("size-4", onlyLiked && "fill-current")} />{t("onlyLiked")}
            </Link>
            <Suspense>
              <SortSelect label={t("sortLabel")} value={sortBy}
                          options={SORTS.map(value => ({ value, label: t(`sort.${value}`) }))} />
            </Suspense>
          </div>
        </div>
        {spexId && (
          <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <span>{t("spexFilter", { title: spexTitle ?? "?" })}</span>
            <Link href={link({})} className="text-primary hover:underline">{t("clearSpex")}</Link>
          </p>
        )}
        <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
          <Link href={link({ category: null })} className={chip(!categoryId)}>{t("allCategories")}</Link>
          {data?.categories.map(item => (
            <Link key={item.id} href={link({ category: item.id })}
                  className={chip(categoryId === item.id)} aria-current={categoryId === item.id ? "page" : undefined}>
              {item.name}
            </Link>
          ))}
        </nav>
        <nav aria-label={t("years")} className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <Link href={link({ year: null, decade: null })} className={chip(!decadeNumber)}>{t("allYears")}</Link>
            {decadesOf(years).map(item => (
              <Link key={item} href={link({ year: null, decade: item })}
                    className={cn(chip(decadeNumber === item && !yearNumber), "tabular-nums")}
                    aria-current={decadeNumber === item && !yearNumber ? "page" : undefined}>
                {t("decade", { decade: item })}
              </Link>
            ))}
          </div>
          {decadeNumber && (
            <div className="flex flex-wrap gap-1.5">
              {years.filter(item => item >= decadeNumber && item < decadeNumber + 10).map(item => (
                <Link key={item} href={link({ year: item })}
                      className={cn(chip(yearNumber === item), "tabular-nums")}
                      aria-current={yearNumber === item ? "page" : undefined}>
                  {item}
                </Link>
              ))}
            </div>
          )}
        </nav>
        {data && data.albums.length > 0
          ? <AlbumGrid albums={data.albums} />
          : <p className="text-muted-foreground">{t("none")}</p>}
      </div>
    );
  });
}
