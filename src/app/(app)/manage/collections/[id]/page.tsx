import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RecordHistory } from "@/components/audit/change-log";
import { getAlbums, getCollection } from "@/lib/catalog/catalog.server";
import { isAdmin } from "@/utils/auth";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { auditLink } from "../../audit/links";
import { CollectionEditor } from "../collection-editor.client";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.editor.requireEditor, async (authz) => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Collections");
    const [collection, data] = await Promise.all([getCollection(id), getAlbums({ includeUnpublished: true })]);

    if (!collection) {
      notFound();
    }
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{collection.title}</h1>
          <Link href={`/collections/${collection.id}`}
                className="text-sm text-primary hover:underline">{t("view")}</Link>
        </div>
        <CollectionEditor collection={{
          id: collection.id, title: collection.title, description: collection.description,
          albumIds: collection.albums.map(album => album.id),
        }} albums={data?.albums ?? []} canDelete={isAdmin(authz.roles)} />
        <RecordHistory entityId={collection.id} path="/manage/audit" linkOf={auditLink} />
      </div>
    );
  });
}
