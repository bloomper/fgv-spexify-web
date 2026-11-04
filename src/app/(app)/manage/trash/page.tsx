import { getTranslations } from "next-intl/server";
import { getTrash } from "@/lib/admin/admin.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { isAdmin } from "@/utils/auth";
import { TrashList } from "./trash.client";

export default async function TrashPage() {
  return withPolicyPage(Policies.editor.requireEditor, async (authz) => {
    const t = await getTranslations("Trash");
    const trash = await getTrash();

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{isAdmin(authz.roles) ? t("textAdmin") : t("text")}</p>
        <TrashList admin={isAdmin(authz.roles)}
                   albums={(trash?.albums ?? []).map(album => ({
                     id: album.id, title: album.title, trashedAt: album.trashedAt,
                     detail: [album.year, t("tracks", { count: album.trackCount })].filter(Boolean).join(" · "),
                   }))}
                   tracks={(trash?.tracks ?? []).map(track => ({
                     id: track.id, title: track.title, trashedAt: track.trashedAt,
                     detail: track.albumTitle, albumId: track.albumId,
                   }))} />
      </div>
    );
  });
}
