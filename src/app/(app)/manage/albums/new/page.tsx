import { getTranslations } from "next-intl/server";
import { getAlbumKinds, getAlbumMedia } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { NewAlbum } from "./new-album.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function NewAlbumPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const [kinds, media] = await Promise.all([getAlbumKinds(), getAlbumMedia()]);

    return (
      <Page variant="content">
        <PageHeader title={t("newAlbum")} description={t("newAlbumText")}/>
        <NewAlbum kinds={kinds} media={media} />
      </Page>
    );
  });
}
