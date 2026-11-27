import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bloomper/fgv-web-ui/ui/table";
import { getAlbums } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { kindName } from "@/utils/format";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function ManageAlbumsPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const locale = await getLocale();
    const data = await getAlbums({ includeUnpublished: true });

    return (
      <Page variant="content">
        <PageHeader title={t("albums")} actions={<Button nativeButton={false} render={<Link href="/manage/albums/new" />}><Plus />{t("newAlbum")}</Button>}/>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("year")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("category")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("tracks")}</TableHead>
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.albums.map(album => (
                <TableRow key={album.id}>
                  <TableCell className="whitespace-normal">
                    <Link href={`/manage/albums/${album.id}`}
                          className="font-medium hover:text-link">{album.title}</Link>
                    {!album.kind.isDefault &&
                      <span className="ml-2 text-xs text-muted-foreground">{kindName(album.kind, locale)}</span>}
                  </TableCell>
                  <TableCell className="tabular-nums">{album.year}</TableCell>
                  <TableCell className="hidden sm:table-cell">{album.spex[0]?.categoryName}</TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">{album.trackCount}</TableCell>
                  <TableCell>
                    {album.published
                      ? <Badge variant="secondary">{t("published")}</Badge>
                      : <Badge variant="outline">{t("unpublished")}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Page>
    );
  });
}
