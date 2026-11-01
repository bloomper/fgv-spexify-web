"use client";

import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {AlbumForm} from "@/components/album/album-form.client";
import {createAlbumAction} from "@/app/(app)/manage/actions.server";
import {track} from "@/utils/umami";

export function NewAlbum() {
    const t = useTranslations("Manage");
    const router = useRouter();

    return (
        <AlbumForm submitLabel={t("create")} onSubmit={async input => {
            const result = await createAlbumAction(input);

            if (result.ok && result.data) {
                track("album-create", {kind: input.kind});
                router.push(`/manage/albums/${result.data}`);
                return true;
            }
            toast.error(result.ok ? t("failed") : result.message);
            return false;
        }}/>
    );
}
