"use client";

import {useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {formatInstant} from "@/utils/format";
import {deleteAlbumAction, deleteTrackAction, emptyTrashAction, trashAlbumAction, trashTrackAction} from "@/app/(app)/manage/actions.server";
import {useDialogs} from "@/components/dialogs.client";

type Item = { id: string; title: string; trashedAt?: string | null; detail?: string; albumId?: string };

/**
 * Trashed albums and tracks: editors restore, admins delete for good, which deletes the files.
 */
export function TrashList({albums, tracks, admin}: { albums: Item[]; tracks: Item[]; admin: boolean }) {
    const t = useTranslations("Trash");
    const {confirm} = useDialogs();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const run = (work: () => Promise<{ ok: boolean; message?: string }>) => startTransition(async () => {
        const result = await work();

        if (result.ok) {
            router.refresh();
        } else {
            toast.error(result.message);
        }
    });

    const list = (items: Item[], kind: "album" | "track") => (
        <ul className="divide-y rounded-lg border">
            {items.map(item => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                            {[item.detail, item.trashedAt ? t("trashedAt", {date: formatInstant(item.trashedAt) ?? ""}) : null].filter(Boolean).join(" · ")}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" disabled={pending}
                            onClick={() => run(() => kind === "album" ? trashAlbumAction(item.id, false) : trashTrackAction(item.albumId!, item.id, false))}>
                        {t("restore")}
                    </Button>
                    {admin && (
                        <Button variant="destructive" size="sm" disabled={pending} onClick={async () => {
                            if (await confirm({title: t("confirmDelete", {title: item.title}), confirmLabel: t("delete"), destructive: true})) {
                                run(() => kind === "album" ? deleteAlbumAction(item.id) : deleteTrackAction(item.id));
                            }
                        }}>{t("delete")}</Button>
                    )}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="space-y-6">
            {albums.length === 0 && tracks.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
            {admin && (albums.length > 0 || tracks.length > 0) && (
                <Button variant="destructive" disabled={pending} onClick={async () => {
                    if (await confirm({title: t("confirmEmpty"), confirmLabel: t("emptyTrash"), destructive: true})) {
                        run(emptyTrashAction);
                    }
                }}>{t("emptyTrash")}</Button>
            )}
            {albums.length > 0 && <section className="space-y-2"><h2 className="text-lg font-semibold">{t("albums")}</h2>{list(albums, "album")}</section>}
            {tracks.length > 0 && <section className="space-y-2"><h2 className="text-lg font-semibold">{t("tracks")}</h2>{list(tracks, "track")}</section>}
        </div>
    );
}
