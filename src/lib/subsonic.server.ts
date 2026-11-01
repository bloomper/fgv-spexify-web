import "server-only";

import {apiFetch} from "@/lib/api.server";

/**
 * Spexify's Subsonic gateway, called with the user's Keycloak token, for what lives in Navidrome per user: stars,
 * playlists and play counts.
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

export type SubsonicSong = { id: string; title: string; album: string; albumId: string; duration?: number };
export type SubsonicPlaylist = { id: string; name: string; songCount: number; duration: number };

export async function getStarred(): Promise<SubsonicSong[]> {
    const result = await subsonic<{ starred2: { song?: SubsonicSong[] } }>("getStarred2");

    return result.starred2.song ?? [];
}

export async function star(navidromeId: string, starred: boolean) {
    await subsonic(starred ? "star" : "unstar", {id: navidromeId});
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
