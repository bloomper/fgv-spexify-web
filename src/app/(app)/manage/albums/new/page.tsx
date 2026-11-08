import { getTranslations } from "next-intl/server";
import { getAlbumKinds } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { NewAlbum } from "./new-album.client";

export default async function NewAlbumPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const kinds = await getAlbumKinds();

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("newAlbum")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("newAlbumText")}</p>
        <NewAlbum kinds={kinds} />
      </div>
    );
  });
}
