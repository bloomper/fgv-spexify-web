import { getTranslations } from "next-intl/server";
import { getAlbums } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { CollectionEditor } from "../collection-editor.client";

export default async function NewCollectionPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Collections");
    const data = await getAlbums({ includeUnpublished: true });

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("new")}</h1>
        <CollectionEditor albums={data?.albums ?? []} />
      </div>
    );
  });
}
