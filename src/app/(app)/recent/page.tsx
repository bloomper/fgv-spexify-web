import { getTranslations } from "next-intl/server";
import { AlbumGrid } from "@/components/album/album-grid";
import { DataEmpty } from "@/components/data-empty";
import { getPlayedAlbums } from "@/lib/catalog/listening.server";
import { formatDate } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

const RECENT = 50;

/**
 * The albums the user played lately, most recent first, from Navidrome; empty when it is unavailable.
 */
export default async function RecentPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Recent");
    const { recent } = await getPlayedAlbums(RECENT);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        {recent.length > 0 ? (
          <AlbumGrid albums={recent} label={album => {
            const date = formatDate(recent.find(item => item.id === album.id)?.played);

            return date ? t("lastPlayed", { date }) : null;
          }} />
        ) : <DataEmpty title={t("empty")} description={null} />}
      </div>
    );
  });
}
