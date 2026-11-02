import "server-only";

import {getAlbumList, getAlbumSongs, getPlaylists, getStarred, type Plays, playsOf} from "@/lib/subsonic.server";
import {getAlbumsByNavidromeIds} from "@/lib/catalog/catalog.server";

/**
 * What the track list needs from Navidrome: the user's starred songs (with their plays) and playlists. Navidrome being
 * unavailable must not break the page, so both fall back to empty.
 */
export async function getListeningState(): Promise<{ starred: string[]; starredPlays: Plays; playlists: { id: string; name: string }[] }> {
    const [songs, playlists] = await Promise.all([
        getStarred().catch(() => []),
        getPlaylists().then(list => list.map(playlist => ({id: playlist.id, name: playlist.name}))).catch(() => []),
    ]);

    return {starred: songs.map(song => song.id), starredPlays: playsOf(songs), playlists};
}

/**
 * How often the user played each song of an album and when last; empty when the album is not in Navidrome or Navidrome
 * is unavailable.
 */
export async function getAlbumPlays(navidromeAlbumId: string | null | undefined): Promise<Plays> {
    return navidromeAlbumId ? getAlbumSongs(navidromeAlbumId).then(playsOf).catch(() => ({})) : {};
}

/**
 * The user's recently and most played albums, as Spexify's albums with Navidrome's play count and last play. Albums
 * no longer listed are left out; Navidrome being unavailable gives empty lists.
 */
export async function getPlayedAlbums(size = 12) {
    const [recent, frequent] = await Promise.all([
        getAlbumList("recent", size).catch(() => []),
        getAlbumList("frequent", size).catch(() => []),
    ]);
    const albums = await getAlbumsByNavidromeIds([...new Set([...recent, ...frequent].map(album => album.id))]).catch(() => []);
    const byId = new Map(albums.map(album => [album.navidromeId, album]));
    const join = (list: typeof recent) => list.flatMap(played => {
        const album = byId.get(played.id);

        return album ? [{...album, playCount: played.playCount ?? 0, played: played.played ?? null}] : [];
    });

    return {recent: join(recent), frequent: join(frequent).filter(album => album.playCount > 0)};
}

/**
 * Spexflix's address, for links from tracks to videos; null when it is not configured.
 */
export function spexflixUrl(): string | null {
    return process.env.SPEXFLIX_WEB_URL?.replace(/\/$/, "") || null;
}
