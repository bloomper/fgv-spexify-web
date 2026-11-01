import "server-only";

import {getPlaylists, getStarred} from "@/lib/subsonic.server";

/**
 * What the track list needs from Navidrome: the user's starred songs and playlists. Navidrome being unavailable must
 * not break the page, so both fall back to empty.
 */
export async function getListeningState(): Promise<{ starred: string[]; playlists: { id: string; name: string }[] }> {
    const [starred, playlists] = await Promise.all([
        getStarred().then(songs => songs.map(song => song.id)).catch(() => []),
        getPlaylists().then(list => list.map(playlist => ({id: playlist.id, name: playlist.name}))).catch(() => []),
    ]);

    return {starred, playlists};
}

/**
 * Spexflix's address, for links from tracks to videos; null when it is not configured.
 */
export function spexflixUrl(): string | null {
    return process.env.SPEXFLIX_WEB_URL?.replace(/\/$/, "") || null;
}
