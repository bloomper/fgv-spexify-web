import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAlbum, getAlbumKinds, getAlbumMedia, getSpexNumbers } from "@/lib/catalog/catalog.server";
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
    const [album, kinds, media] = await Promise.all([getAlbum(id), getAlbumKinds(), getAlbumMedia()]);

    if (!album || album.trashedAt) {
      notFound();
    }

    const numbers = await getSpexNumbers(album.spex.map(spex => spex.id));

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{album.title}</h1>
          <Link href={`/albums/${album.id}`}
                className="text-sm text-primary hover:text-primary/80">{t("viewAsListener")}</Link>
        </div>
        <AlbumEditor album={album} kinds={kinds} media={media} numbers={numbers} />
        <RecordHistory entityId={album.id} path="/manage/audit" linkOf={auditLink} />
      </div>
    );
  });
}
