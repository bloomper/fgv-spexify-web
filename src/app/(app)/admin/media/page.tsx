import { getTranslations } from "next-intl/server";
import { getAlbumMedia } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { MediaEditor } from "./media-editor.client";

/**
 * The album media of the discography (LP, EP, CD …): admins add, rename, reorder and delete them.
 */
export default async function MediaPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const t = await getTranslations("AdminMedia");
    const media = await getAlbumMedia();

    return (
      <div className="max-w-3xl flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
        <MediaEditor media={media.map(medium => ({ ...medium, isDefault: false }))} />
      </div>
    );
  });
}
