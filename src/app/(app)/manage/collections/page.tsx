import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCollections } from "@/lib/catalog/catalog.server";
import { formatInstant } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@/components/data-empty";

export default async function ManageCollectionsPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Collections");
    const collections = await getCollections();

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{t("manageTitle")}</h1>
          <Button nativeButton={false} render={<Link href="/manage/collections/new" />}><Plus />{t("new")}</Button>
        </div>
        <p className="max-w-prose text-sm text-muted-foreground">{t("manageText")}</p>
        {collections.length === 0 ? <DataEmpty title={t("none")} description={null} /> : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("titleLabel")}</TableHead>
                  <TableHead>{t("albumsLabel")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("changed")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map(collection => (
                  <TableRow key={collection.id}>
                    <TableCell className="whitespace-normal">
                      <Link href={`/manage/collections/${collection.id}`}
                            className="font-medium hover:text-primary">{collection.title}</Link>
                    </TableCell>
                    <TableCell className="tabular-nums">{collection.albums.length}</TableCell>
                    <TableCell
                      className="hidden tabular-nums sm:table-cell">{formatInstant(collection.lastModifiedAt ?? collection.createdAt)?.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  });
}
