"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionForm, type CollectionAlbumOption } from "@/components/album/collection-form.client";
import {
  createCollectionAction,
  deleteCollectionAction,
  updateCollectionAction,
} from "@/app/(app)/manage/actions.server";
import { useDialogs } from "@/components/dialogs.client";
import { track } from "@/utils/umami";

type Props = {
  collection?: { id: string; title: string; description?: string | null; albumIds: string[] };
  albums: CollectionAlbumOption[];
  canDelete?: boolean;
};

/**
 * Creates a collection, or changes or (for ADMIN) deletes one. The new collection's form starts over after saving, as
 * Cache Components keep the page mounted.
 */
export function CollectionEditor({ collection, albums, canDelete = false }: Props) {
  const t = useTranslations("Collections");
  const router = useRouter();
  const { confirm } = useDialogs();
  const [generation, setGeneration] = useState(0);

  return (
    <div className="space-y-6">
      <CollectionForm key={generation} albums={albums} submitLabel={collection ? t("save") : t("create")}
                      initial={collection ? {
                        title: collection.title,
                        description: collection.description,
                        albumIds: collection.albumIds,
                      } : undefined}
                      onSubmit={async input => {
                        const result = collection ? await updateCollectionAction(collection.id, input) : await createCollectionAction(input);

                        if (!result.ok) {
                          toast.error(result.message);
                          return false;
                        }
                        if (collection) {
                          toast.success(t("saved"));
                          router.refresh();
                        } else {
                          track("collection-create", { albums: input.albumIds.length });
                          router.push(`/manage/collections/${result.data}`);
                          setGeneration(current => current + 1);
                        }
                        return true;
                      }} />
      {collection && canDelete && (
        <Button variant="outline" onClick={async () => {
          if (!await confirm({
            title: t("confirmDelete"),
            description: t("confirmDeleteText"),
            confirmLabel: t("delete"),
            destructive: true,
          })) {
            return;
          }

          const result = await deleteCollectionAction(collection.id);

          if (result.ok) {
            router.push("/manage/collections");
          } else {
            toast.error(result.message);
          }
        }}>
          <Trash2 />{t("delete")}
        </Button>
      )}
    </div>
  );
}
