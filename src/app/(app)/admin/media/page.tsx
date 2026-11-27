import { getTranslations } from "next-intl/server";
import { getAlbumMedia } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { MediaEditor } from "./media-editor.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The album media of the discography (LP, EP, CD …): admins add, rename, reorder and delete them.
 */
export default async function MediaPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const t = await getTranslations("AdminMedia");
    const media = await getAlbumMedia();

    return (
      <Page
        variant="content"
        className="max-w-3xl"
      >
        <PageHeader
          title={t("title")}
          description={t("text")}
        />
        <MediaEditor media={media.map((medium) => ({ ...medium, isDefault: false }))} />
      </Page>
    );
  });
}
