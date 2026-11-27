import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bloomper/fgv-web-ui/ui/table";
import { getCollections } from "@/lib/catalog/catalog.server";
import { formatInstant } from "@/utils/format";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function ManageCollectionsPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Collections");
    const collections = await getCollections();

    return (
      <Page variant="content">
        <PageHeader
          title={t("manageTitle")}
          actions={
            <Button
              nativeButton={false}
              render={<Link href="/manage/collections/new" />}
            >
              <Plus />
              {t("new")}
            </Button>
          }
        />
        <p className="text-muted-foreground max-w-prose text-sm">{t("manageText")}</p>
        {collections.length === 0 ? (
          <DataEmpty
            title={t("none")}
            description={null}
          />
        ) : (
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
                {collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="whitespace-normal">
                      <Link
                        href={`/manage/collections/${collection.id}`}
                        className="hover:text-link font-medium"
                      >
                        {collection.title}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">{collection.albums.length}</TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">
                      {formatInstant(collection.lastModifiedAt ?? collection.createdAt)?.slice(0, 10)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Page>
    );
  });
}
