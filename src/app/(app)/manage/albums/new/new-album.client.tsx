"use client";

import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {AlbumForm, type KindOption} from "@/components/album/album-form.client";
import {createAlbumAction} from "@/app/(app)/manage/actions.server";
import {track} from "@/utils/umami";

export function NewAlbum({kinds}: { kinds: KindOption[] }) {
    const t = useTranslations("Manage");
    const router = useRouter();

    return (
        <AlbumForm kinds={kinds} submitLabel={t("create")} onSubmit={async input => {
            const result = await createAlbumAction(input);

            if (result.ok && result.data) {
                track("album-create", {defaultKind: !input.kindId || input.kindId === kinds[0]?.id});
                router.push(`/manage/albums/${result.data}`);
                return true;
            }
            toast.error(result.ok ? t("failed") : result.message);
            return false;
        }}/>
    );
}
