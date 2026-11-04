import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAlbum, getAlbumKinds } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { AlbumEditor } from "./album-editor.client";
import { RecordHistory } from "@/components/audit/change-log";
import { auditLink } from "../../audit/links";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Manage");
    const [album, kinds] = await Promise.all([getAlbum(id), getAlbumKinds()]);

    if (!album || album.trashedAt) {
      notFound();
    }

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{album.title}</h1>
          <Link href={`/albums/${album.id}`}
                className="text-sm text-primary hover:underline">{t("viewAsListener")}</Link>
        </div>
        <AlbumEditor album={album} kinds={kinds} />
        <RecordHistory entityId={album.id} path="/manage/audit" linkOf={auditLink} />
      </div>
    );
  });
}
