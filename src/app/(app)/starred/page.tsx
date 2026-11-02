import {getTranslations} from "next-intl/server";
import {PlayAllButtons, TrackList} from "@/components/album/track-list.client";
import {toRows} from "@/components/album/to-rows";
import {getTracksByNavidromeIds} from "@/lib/catalog/catalog.server";
import {getListeningState} from "@/lib/catalog/listening.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

export default async function StarredPage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Starred");
        const listening = await getListeningState();
        const rows = toRows(await getTracksByNavidromeIds(listening.starred), listening.starredPlays);

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                <p className="max-w-prose text-sm text-muted-foreground">{t("text")}</p>
                {rows.length > 0 ? (
                    <>
                        <PlayAllButtons tracks={rows}/>
                        <TrackList tracks={rows} starred={listening.starred} playlists={listening.playlists} spexflixUrl={null} showAlbum/>
                    </>
                ) : <p className="text-muted-foreground">{t("none")}</p>}
            </div>
        );
    });
}
