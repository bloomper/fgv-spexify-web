import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAlbum, getAlbumKinds, getAlbumMedia, getSpexNumbers } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { AlbumEditor } from "./album-editor.client";
import { RecordHistory } from "@/components/audit/change-log";
import { auditLink } from "../../audit/links";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

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
      <Page variant="content">
        <PageHeader title={album.title} actions={<Link href={`/albums/${album.id}`}
                className="text-sm text-link hover:text-link/80">{t("viewAsListener")}</Link>}/>
        <AlbumEditor album={album} kinds={kinds} media={media} numbers={numbers}
                     spexipediaUrl={process.env.SPEXIPEDIA_WEB_URL?.trim().replace(/\/+$/, "") || null} />
        <RecordHistory entityId={album.id} path="/manage/audit" linkOf={auditLink} />
      </Page>
    );
  });
}
