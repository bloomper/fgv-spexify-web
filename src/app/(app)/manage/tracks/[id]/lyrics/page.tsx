import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLyricsEditor } from "@/lib/catalog/sheet-music.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { LyricsEditor } from "./lyrics-editor.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The lyrics editor: the text, the time each line starts, set by tapping while the track plays, and the saved versions.
 */
export default async function EditLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("LyricsEditor");
    const track = await getLyricsEditor(id, 1500);

    if (!track) {
      notFound();
    }
    return (
      <Page variant="content">
        <PageHeader
          title={t("title", { title: track.title })}
          description={track.albumTitle}
          actions={
            <Link
              href={`/manage/albums/${track.albumId}`}
              className="text-link hover:text-link/80 text-sm"
            >
              {t("backToAlbum")}
            </Link>
          }
        />
        <LyricsEditor track={track} />
      </Page>
    );
  });
}
