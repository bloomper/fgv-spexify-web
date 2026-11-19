import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLyricsEditor } from "@/lib/catalog/sheet-music.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { LyricsEditor } from "./lyrics-editor.client";

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
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title", { title: track.title })}</h1>
            <p className="text-sm text-muted-foreground">{track.albumTitle}</p>
          </div>
          <Link href={`/manage/albums/${track.albumId}`} className="text-sm text-primary hover:text-primary/80">{t("backToAlbum")}</Link>
        </div>
        <LyricsEditor track={track} />
      </div>
    );
  });
}
