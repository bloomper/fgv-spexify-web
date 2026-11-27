import Form from "next/form";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { SubmitButton } from "@/components/submit-button.client";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@bloomper/fgv-web-ui/ui/empty";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { AlbumGrid } from "@/components/album/album-grid";
import { TrackList } from "@/components/album/track-list.client";
import { toRows } from "@/components/album/to-rows";
import { search } from "@/lib/catalog/catalog.server";
import { getListeningState } from "@/lib/catalog/listening.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Search");
    const q = ((await searchParams).q ?? "").slice(0, 200);
    const ready = q.trim().length >= 2;
    const tooShort = q.trim().length === 1;
    const [result, listening] = ready
      ? await Promise.all([search(q), getListeningState()])
      : [undefined, { starred: [], playlists: [] }];

    return (
      <Page variant="content">
        <PageHeader title={ready ? t("resultsFor", { q }) : t("title")} />
        <Form
          action="/search"
          role="search"
          className="flex max-w-xl gap-2"
        >
          <Input
            key={q}
            name="q"
            type="search"
            defaultValue={q}
            maxLength={200}
            placeholder={t("placeholder")}
            aria-label={t("query")}
            aria-invalid={tooShort || undefined}
            aria-describedby={tooShort ? "search-q-error" : undefined}
          />
          <SubmitButton>{t("title")}</SubmitButton>
        </Form>
        {tooShort && (
          <p
            id="search-q-error"
            className="text-destructive -mt-4 text-sm"
          >
            {t("tooShort")}
          </p>
        )}
        {!q.trim() && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("hint")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href="/albums"
                className="text-link hover:text-link/80 text-sm"
              >
                {t("browse")}
              </Link>
            </EmptyContent>
          </Empty>
        )}
        {result && result.albums.length === 0 && result.tracks.length === 0 && (
          <DataEmpty
            title={t("none")}
            description={null}
          />
        )}
        {result && result.albums.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t("albums")}</h2>
            <AlbumGrid albums={result.albums} />
          </section>
        )}
        {result && result.tracks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t("tracks")}</h2>
            <TrackList
              tracks={toRows(result.tracks)}
              starred={listening.starred}
              playlists={listening.playlists}
              spexflixUrl={null}
              showAlbum
            />
          </section>
        )}
      </Page>
    );
  });
}
