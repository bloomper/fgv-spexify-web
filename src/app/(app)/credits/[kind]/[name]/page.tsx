import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {PlayAllButtons, TrackList} from "@/components/album/track-list.client";
import {toRows} from "@/components/album/to-rows";
import {getCreditTracks} from "@/lib/catalog/catalog.server";
import {getListeningState} from "@/lib/catalog/listening.server";
import {CREDIT_KINDS} from "@/lib/credits";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

export default async function CreditPage({params}: { params: Promise<{ kind: string; name: string }> }) {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const {kind: segment, name: encoded} = await params;
        const kind = CREDIT_KINDS[segment];
        let name: string;

        try {
            name = decodeURIComponent(encoded).trim();
        } catch {
            notFound();
        }
        if (!kind || !name || name.length > 255) {
            notFound();
        }

        const t = await getTranslations("Credits");
        const [tracks, listening] = await Promise.all([getCreditTracks(kind, name), getListeningState()]);
        // Play counts would take a request per song to Navidrome, so the list goes without them, as search does
        const rows = toRows(tracks);

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="space-y-1">
                    <Link href={`/credits/${segment}`} className="text-sm text-primary hover:underline">{t(`kind.${segment}`)}</Link>
                    <h1 className="text-2xl font-semibold tracking-tight">{rows.length > 0 ? creditName(rows, name) : name}</h1>
                </div>
                {rows.length === 0 ? <p className="text-muted-foreground">{t("noTracks")}</p> : (
                    <>
                        <PlayAllButtons tracks={rows}/>
                        <TrackList tracks={rows} starred={listening.starred} playlists={listening.playlists} spexflixUrl={null} showAlbum/>
                    </>
                )}
            </div>
        );
    });
}

/** The name as the tracks write it, which may differ in case from the address. */
function creditName(rows: { performers?: string | null; melody?: string | null }[], name: string): string {
    const lower = name.toLowerCase();

    for (const row of rows) {
        for (const value of [row.performers, row.melody]) {
            const found = value?.split(/\s*[,;/&()]\s*/).find(part => part.trim().toLowerCase() === lower);

            if (found) {
                return found.trim();
            }
        }
    }
    return name;
}
