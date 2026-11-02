import "server-only";

import {apiFetch} from "@/lib/api.server";

/**
 * Spexify's Subsonic gateway, called with the user's Keycloak token, for what lives in Navidrome per user: stars,
 * playlists, play counts, when the user last played a song or album, ratings and the play queue, which the user's
 * apps share.
 */
async function subsonic<T>(endpoint: string, params: Record<string, string | string[]> = {}): Promise<T> {
    const query = new URLSearchParams({v: "1.16.1", c: "spexify-web", f: "json"});

    for (const [key, value] of Object.entries(params)) {
        for (const item of Array.isArray(value) ? value : [value]) {
            query.append(key, item);
        }
    }

    const response = await apiFetch(`/rest/${endpoint}?${query.toString()}`);
    const body = await response.json() as { "subsonic-response": { status: string; error?: { message: string } } & T };
    const result = body["subsonic-response"];

    if (result.status !== "ok") {
        throw new Error(result.error?.message ?? "Subsonic error");
    }
    return result;
}

export type SubsonicSong = {
    id: string;
    title: string;
    album: string;
    albumId: string;
    duration?: number;
    /** How often the user played it; missing when never. */
    playCount?: number;
    /** When the user last played it; missing when never. */
    played?: string;
    /** The user's rating, 1 to 5; missing when not rated. */
    userRating?: number;
};
export type SubsonicAlbum = { id: string; name: string; playCount?: number; played?: string; userRating?: number };
/** Play counts, when last played and the user's rating (0 when not rated), by Navidrome's song id. */
export type Plays = Record<string, { playCount: number; played: string | null; rating: number }>;

export function playsOf(songs: SubsonicSong[]): Plays {
    return Object.fromEntries(songs.map(song => [song.id,
        {playCount: song.playCount ?? 0, played: song.played ?? null, rating: song.userRating ?? 0}]));
}
export type SubsonicPlaylist = { id: string; name: string; songCount: number; duration: number };

export async function getStarred(): Promise<SubsonicSong[]> {
    return (await getStarredAll()).songs;
}

/**
 * The user's starred songs and albums.
 */
export async function getStarredAll(): Promise<{ songs: SubsonicSong[]; albums: SubsonicAlbum[] }> {
    const result = await subsonic<{ starred2: { song?: SubsonicSong[]; album?: SubsonicAlbum[] } }>("getStarred2");

    return {songs: result.starred2.song ?? [], albums: result.starred2.album ?? []};
}

/**
 * The songs of an album in Navidrome, with the user's play counts.
 */
export async function getAlbumSongs(navidromeAlbumId: string): Promise<SubsonicSong[]> {
    return (await getAlbumWithSongs(navidromeAlbumId)).songs;
}

/**
 * An album in Navidrome with the user's rating and whether it is starred, and its songs with the user's plays.
 */
export async function getAlbumWithSongs(navidromeAlbumId: string): Promise<{ rating: number; starred: boolean; songs: SubsonicSong[] }> {
    const result = await subsonic<{ album: { userRating?: number; starred?: string; song?: SubsonicSong[] } }>("getAlbum", {id: navidromeAlbumId});

    return {rating: result.album.userRating ?? 0, starred: Boolean(result.album.starred), songs: result.album.song ?? []};
}

/**
 * The user's recently played ("recent"), most played ("frequent") or highest rated ("highest") albums, at most
 * {@code size}.
 */
export async function getAlbumList(type: "recent" | "frequent" | "highest", size: number): Promise<SubsonicAlbum[]> {
    const result = await subsonic<{ albumList2: { album?: SubsonicAlbum[] } }>("getAlbumList2", {type, size: String(size)});

    return result.albumList2.album ?? [];
}

export async function star(navidromeId: string, starred: boolean) {
    await subsonic(starred ? "star" : "unstar", {id: navidromeId});
}

export async function starAlbum(navidromeAlbumId: string, starred: boolean) {
    await subsonic(starred ? "star" : "unstar", {albumId: navidromeAlbumId});
}

/**
 * Rates a song or an album from 1 to 5; 0 removes the rating.
 */
export async function setRating(navidromeId: string, rating: number) {
    await subsonic("setRating", {id: navidromeId, rating: String(rating)});
}

/**
 * The play queue the user's apps share: the songs, the one playing, and how far into it, in milliseconds.
 */
export async function getPlayQueue(): Promise<{ ids: string[]; current: string | null; positionMs: number } | null> {
    const result = await subsonic<{ playQueue?: { current?: string; position?: number; entry?: SubsonicSong[] } }>("getPlayQueue");

    if (!result.playQueue) {
        return null;
    }
    return {
        ids: (result.playQueue.entry ?? []).map(song => song.id),
        current: result.playQueue.current ?? null,
        positionMs: result.playQueue.position ?? 0,
    };
}

export async function savePlayQueue(ids: string[], current: string | null, positionMs: number) {
    await subsonic("savePlayQueue", {
        id: ids,
        ...(current ? {current} : {}),
        position: String(Math.max(0, Math.round(positionMs))),
    });
}

export async function scrobble(navidromeId: string, submission: boolean) {
    await subsonic("scrobble", {id: navidromeId, submission: String(submission)});
}

export async function getPlaylists(): Promise<SubsonicPlaylist[]> {
    const result = await subsonic<{ playlists: { playlist?: SubsonicPlaylist[] } }>("getPlaylists");

    return result.playlists.playlist ?? [];
}

export async function getPlaylist(id: string): Promise<SubsonicPlaylist & { entry: SubsonicSong[] }> {
    const result = await subsonic<{ playlist: SubsonicPlaylist & { entry?: SubsonicSong[] } }>("getPlaylist", {id});

    return {...result.playlist, entry: result.playlist.entry ?? []};
}

export async function createPlaylist(name: string, songIds: string[]) {
    await subsonic("createPlaylist", {name, songId: songIds});
}

export async function addToPlaylist(playlistId: string, songIds: string[]) {
    await subsonic("updatePlaylist", {playlistId, songIdToAdd: songIds});
}

export async function removeFromPlaylist(playlistId: string, index: number) {
    await subsonic("updatePlaylist", {playlistId, songIndexToRemove: String(index)});
}

export async function deletePlaylist(id: string) {
    await subsonic("deletePlaylist", {id});
}
