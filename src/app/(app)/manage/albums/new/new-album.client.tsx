"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlbumForm, type KindOption } from "@/components/album/album-form.client";
import { createAlbumAction } from "@/app/(app)/manage/actions.server";
import { track } from "@/utils/umami";

/**
 * The form for a new album. Cache Components keep the page mounted after leaving it, so the form starts over once an
 * album was created; otherwise the next new album would begin with the previous one's spex.
 */
export function NewAlbum({ kinds }: { kinds: KindOption[] }) {
  const t = useTranslations("Manage");
  const router = useRouter();
  const [generation, setGeneration] = useState(0);

  return (
    <AlbumForm key={generation} kinds={kinds} submitLabel={t("create")} onSubmit={async input => {
      const result = await createAlbumAction(input);

      if (result.ok && result.data) {
        track("album-create", { defaultKind: !input.kindId || input.kindId === kinds[0]?.id });
        router.push(`/manage/albums/${result.data}`);
        setGeneration(current => current + 1);
        return true;
      }
      toast.error(result.ok ? t("failed") : result.message);
      return false;
    }} />
  );
}
