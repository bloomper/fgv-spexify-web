import { getTranslations } from "next-intl/server";
import { getTrash } from "@/lib/admin/admin.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { isAdmin } from "@/utils/auth";
import { TrashList } from "./trash.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function TrashPage() {
  return withPolicyPage(Policies.editor.requireEditor, async (authz) => {
    const t = await getTranslations("Trash");
    const trash = await getTrash();

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={isAdmin(authz.roles) ? t("textAdmin") : t("text")}
        />
        <TrashList
          admin={isAdmin(authz.roles)}
          albums={(trash?.albums ?? []).map((album) => ({
            id: album.id,
            title: album.title,
            trashedAt: album.trashedAt,
            detail: [album.year, t("tracks", { count: album.trackCount })].filter(Boolean).join(" · "),
          }))}
          tracks={(trash?.tracks ?? []).map((track) => ({
            id: track.id,
            title: track.title,
            trashedAt: track.trashedAt,
            detail: track.albumTitle,
            albumId: track.albumId,
          }))}
        />
      </Page>
    );
  });
}
