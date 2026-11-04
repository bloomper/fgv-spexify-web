import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAlbums } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { kindName } from "@/utils/format";

export default async function ManageAlbumsPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Manage");
    const locale = await getLocale();
    const data = await getAlbums({ includeUnpublished: true });

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{t("albums")}</h1>
          <Button nativeButton={false} render={<Link href="/manage/albums/new" />}><Plus />{t("newAlbum")}</Button>
        </div>
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
                          className="font-medium hover:underline">{album.title}</Link>
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
      </div>
    );
  });
}
