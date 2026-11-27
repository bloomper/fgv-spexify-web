import { getTranslations } from "next-intl/server";
import { getAlbums } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { CollectionEditor } from "../collection-editor.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function NewCollectionPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Collections");
    const data = await getAlbums({ includeUnpublished: true });

    return (
      <Page variant="content">
        <PageHeader title={t("new")} />
        <CollectionEditor albums={data?.albums ?? []} />
      </Page>
    );
  });
}
