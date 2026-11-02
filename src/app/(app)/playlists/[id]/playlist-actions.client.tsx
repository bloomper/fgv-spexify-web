"use client";

import {useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Globe, Lock, MessageSquareText, Pencil, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {deletePlaylistAction, updatePlaylistAction} from "@/app/(app)/actions.server";
import {useDialogs} from "@/components/dialogs.client";

type Props = { id: string; name: string; comment: string; isPublic: boolean };

/**
 * The owner's changes to a playlist: its name, description, whether other users can listen to it, and deleting it.
 */
export function PlaylistActions({id, name, comment, isPublic}: Props) {
    const t = useTranslations("Playlists");
    const {confirm, prompt} = useDialogs();
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const update = (info: { name?: string; comment?: string; public?: boolean }, done: string) => {
        startTransition(async () => {
            const result = await updatePlaylistAction(id, info);

            if (result.ok) {
                toast.success(done);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <>
            <Button variant="outline" disabled={pending} onClick={async () => {
                const value = await prompt({title: t("rename"), label: t("name"), confirmLabel: t("save"), maxLength: 100, defaultValue: name});

                if (value && value.trim() !== name) {
                    update({name: value}, t("renamed"));
                }
            }}>
                <Pencil/>{t("rename")}
            </Button>
            <Button variant="outline" disabled={pending} onClick={async () => {
                const value = await prompt({title: t("describe"), label: t("description"), confirmLabel: t("save"), maxLength: 500, defaultValue: comment});

                if (value !== null && value !== undefined && value.trim() !== comment) {
                    update({comment: value}, t("described"));
                }
            }}>
                <MessageSquareText/>{t("describe")}
            </Button>
            <Button variant="outline" disabled={pending} aria-pressed={isPublic}
                    onClick={() => update({public: !isPublic}, isPublic ? t("madePrivate") : t("madePublic"))}>
                {isPublic ? <Lock/> : <Globe/>}{isPublic ? t("makePrivate") : t("makePublic")}
            </Button>
            <Button variant="outline" disabled={pending} onClick={async () => {
                if (!await confirm({title: t("confirmDelete"), confirmLabel: t("delete"), destructive: true})) {
                    return;
                }
                startTransition(async () => {
                    const result = await deletePlaylistAction(id);

                    if (result.ok) {
                        router.push("/playlists");
                    } else {
                        toast.error(result.message);
                    }
                });
            }}>
                <Trash2/>{t("delete")}
            </Button>
        </>
    );
}
