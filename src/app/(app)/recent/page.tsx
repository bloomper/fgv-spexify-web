import { getTranslations } from "next-intl/server";
import { AlbumGrid } from "@/components/album/album-grid";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { getPlayedAlbums } from "@/lib/catalog/listening.server";
import { formatDate } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

const RECENT = 50;

/**
 * The albums the user played lately, most recent first, from Navidrome; empty when it is unavailable.
 */
export default async function RecentPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Recent");
    const { recent } = await getPlayedAlbums(RECENT);

    return (
      <Page variant="content">
        <PageHeader title={t("title")} />
        {recent.length > 0 ? (
          <AlbumGrid
            albums={recent}
            label={(album) => {
              const date = formatDate(recent.find((item) => item.id === album.id)?.played);

              return date ? t("lastPlayed", { date }) : null;
            }}
          />
        ) : (
          <DataEmpty
            title={t("empty")}
            description={null}
          />
        )}
      </Page>
    );
  });
}
