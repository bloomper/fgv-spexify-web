import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CoverImage } from "@/components/album/cover-image.client";
import { getCollections } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

/**
 * Albums gathered in an order of their own, e.g. a spex over the years: each collection as up to four covers.
 */
export default async function CollectionsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Collections");
    const collections = await getCollections();

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
        {collections.length === 0 ? <DataEmpty title={t("none")} description={null} /> : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {collections.map(collection => (
              <li key={collection.id}>
                <Link href={`/collections/${collection.id}`}
                      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="relative grid aspect-square grid-cols-2 overflow-hidden rounded-lg bg-muted shadow-sm transition-transform group-hover:scale-[1.02]">
                    {collection.albums.length === 1
                      ? <CoverImage albumId={collection.albums[0].id} title={collection.title} className="col-span-2 size-full" />
                      : collection.albums.slice(0, 4).map(album => (
                        <CoverImage key={album.id} albumId={album.id} title="" className="size-full" />
                      ))}
                    <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
                      {t("albums", { count: collection.albums.length })}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium leading-tight">{collection.title}</div>
                  {collection.description &&
                    <p className="line-clamp-2 text-xs text-muted-foreground">{collection.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
