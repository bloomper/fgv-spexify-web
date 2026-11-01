"use client";

import {useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {deletePlaylistAction} from "@/app/(app)/actions.server";

export function DeletePlaylistButton({id}: { id: string }) {
    const t = useTranslations("Playlists");
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <Button variant="outline" disabled={pending} onClick={() => {
            if (!window.confirm(t("confirmDelete"))) {
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
    );
}
