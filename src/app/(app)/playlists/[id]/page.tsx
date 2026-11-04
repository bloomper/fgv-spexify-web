import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PlayAllButtons, TrackList } from "@/components/album/track-list.client";
import { toRows } from "@/components/album/to-rows";
import { getTracksByNavidromeIds } from "@/lib/catalog/catalog.server";
import { getListeningState } from "@/lib/catalog/listening.server";
import { getPlaylist, playsOf } from "@/lib/subsonic.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Badge } from "@/components/ui/badge";
import { PlaylistActions } from "./playlist-actions.client";

const ID = /^[A-Za-z0-9_-]{1,64}$/;

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }

    const t = await getTranslations("Playlists");
    const playlist = await getPlaylist(id).catch(() => null);

    if (!playlist) {
      notFound();
    }

    const [tracks, listening] = await Promise.all([
      getTracksByNavidromeIds(playlist.entry.map(entry => entry.id)),
      getListeningState(),
    ]);
    // Positions are the playlist's own, so removing and moving are offered only to the owner, and only when every
    // entry is a track Spexify still lists
    const rows = toRows(tracks, playsOf(playlist.entry));
    const editable = !playlist.readonly;

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{playlist.name}</h1>
            {playlist.public && <Badge variant="outline">{t("public")}</Badge>}
          </div>
          {playlist.readonly && playlist.owner &&
            <p className="text-sm text-muted-foreground">{t("by", { owner: playlist.owner })}</p>}
          {playlist.comment &&
            <p className="max-w-prose whitespace-pre-line text-sm text-muted-foreground">{playlist.comment}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <PlayAllButtons tracks={rows} />
          {editable && <PlaylistActions id={id} name={playlist.name} comment={playlist.comment ?? ""}
                                        isPublic={playlist.public === true} />}
        </div>
        {rows.length > 0 ? (
          <TrackList tracks={rows} starred={listening.starred} playlists={listening.playlists}
                     spexflixUrl={null} showAlbum
                     playlistId={editable && rows.length === playlist.entry.length ? id : undefined} />
        ) : <p className="text-muted-foreground">{t("empty")}</p>}
      </div>
    );
  });
}
