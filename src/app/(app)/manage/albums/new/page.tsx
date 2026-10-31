import {getTranslations} from "next-intl/server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {NewAlbum} from "./new-album.client";

export default async function NewAlbumPage() {
    return withPolicyPage(Policies.editor.requireEditor, async () => {
        const t = await getTranslations("Manage");

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("newAlbum")}</h1>
                <p className="max-w-prose text-sm text-muted-foreground">{t("newAlbumText")}</p>
                <NewAlbum/>
            </div>
        );
    });
}
