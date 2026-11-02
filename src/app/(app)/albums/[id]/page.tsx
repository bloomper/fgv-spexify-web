import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {Download, Pencil} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CoverImage} from "@/components/album/cover-image.client";
import {PlayAllButtons, TrackList} from "@/components/album/track-list.client";
import {toRows} from "@/components/album/to-rows";
import {formatDuration} from "@/components/player/lyrics";
import {getAlbum, getMe} from "@/lib/catalog/catalog.server";
import {getAlbumListening, getListeningState, spexflixUrl} from "@/lib/catalog/listening.server";
import {AlbumListening} from "@/components/album/album-listening.client";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {isEditor} from "@/utils/auth";
import {kindName} from "@/utils/format";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AlbumPage({params}: { params: Promise<{ id: string }> }) {
    return withPolicyPage(Policies.app.requireAccess, async (authz) => {
        const {id} = await params;

        if (!ID.test(id)) {
            notFound();
        }

        const t = await getTranslations("Album");
        const locale = await getLocale();
        const [album, listening, me] = await Promise.all([getAlbum(id), getListeningState(), getMe()]);

        if (!album) {
            notFound();
        }

        const albumListening = await getAlbumListening(album.navidromeId);
        const rows = toRows(album.tracks, albumListening?.plays);
        const register = process.env.SPEXREGISTER_WEB_URL?.replace(/\/$/, "");

        return (
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                    <CoverImage albumId={album.id} title={album.title} className="w-48 shrink-0 self-center rounded-lg shadow sm:self-start"/>
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                            <Badge variant="secondary">{kindName(album.kind, locale)}</Badge>
                            {album.spex?.revival && <Badge variant="secondary">{t("revival")}</Badge>}
                            {!album.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{album.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {[album.year, album.spex?.categoryName, t("tracks", {count: album.trackCount}),
                                formatDuration(album.durationMs / 1000)].filter(Boolean).join(" · ")}
                        </p>
                        {album.description && <p className="max-w-prose whitespace-pre-line text-sm">{album.description}</p>}
                        {album.navidromeId && albumListening && (
                            <AlbumListening navidromeId={album.navidromeId} starred={albumListening.starred} rating={albumListening.rating}/>
                        )}
                        {album.spex && register && (
                            <a href={`${register}/spex?open=${album.spex.id}`} target="_blank" rel="noopener noreferrer"
                               className="text-sm text-primary hover:underline">{t("inSpexregister")}</a>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <PlayAllButtons tracks={rows} radioAlbumId={album.published && !album.trashedAt ? album.id : undefined}/>
                            <Button variant="outline" nativeButton={false} render={<a href={`/api/download/album/${album.id}`} download data-umami-event="album-download"/>}>
                                <Download/>{t("downloadAlbum")}
                            </Button>
                            {isEditor(authz.roles) && (
                                <Button variant="ghost" nativeButton={false} render={<Link href={`/manage/albums/${album.id}`}/>}>
                                    <Pencil/>{t("edit")}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {rows.length > 0
                    ? <TrackList tracks={rows} starred={listening.starred} playlists={listening.playlists}
                                 spexflixUrl={me?.me.spexflixUser ? spexflixUrl() : null}/>
                    : <p className="text-muted-foreground">{t("noTracks")}</p>}
            </div>
        );
    });
}
