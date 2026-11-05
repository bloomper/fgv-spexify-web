import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AlbumGrid } from "@/components/album/album-grid";
import { Button } from "@/components/ui/button";
import { getCollection } from "@/lib/catalog/catalog.server";
import { isEditor } from "@/utils/auth";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A collection's albums in its order.
 */
export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async (authz) => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Collections");
    const collection = await getCollection(id);

    if (!collection) {
      notFound();
    }
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{collection.title}</h1>
          {collection.description &&
            <p className="max-w-prose whitespace-pre-line text-sm text-muted-foreground">{collection.description}</p>}
        </div>
        {isEditor(authz.roles) && (
          <Button variant="ghost" nativeButton={false} render={<Link href={`/manage/collections/${collection.id}`} />}>
            <Pencil />{t("edit")}
          </Button>
        )}
        {collection.albums.length > 0 ? <AlbumGrid albums={collection.albums} /> :
          <p className="text-muted-foreground">{t("empty")}</p>}
      </div>
    );
  });
}
