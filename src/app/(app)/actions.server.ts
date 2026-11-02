"use server";

import {revalidatePath} from "next/cache";
import {
    addToPlaylist,
    createPlaylist,
    deletePlaylist,
    removeFromPlaylist,
    setPlaylistSongs,
    setRating,
    star,
    starAlbum,
    updatePlaylistInfo,
} from "@/lib/subsonic.server";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

export type SimpleResult = { ok: true } | { ok: false; message: string };

async function attempt(work: () => Promise<void>): Promise<SimpleResult> {
    try {
        await work();
        return {ok: true};
    } catch (error) {
        return {ok: false, message: error instanceof Error ? error.message : String(error)};
    }
}

export async function starAction(navidromeId: string, starred: boolean): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        await star(navidromeId, starred);
        revalidatePath("/starred");
    }));
}

export async function starAlbumAction(navidromeAlbumId: string, starred: boolean): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        await starAlbum(navidromeAlbumId, starred);
        revalidatePath("/starred");
    }));
}

/**
 * Rates a song or an album, by its Navidrome id, from 1 to 5; 0 removes the rating.
 */
export async function rateAction(navidromeId: string, rating: number): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            throw new Error("Invalid rating");
        }
        await setRating(navidromeId, rating);
        revalidatePath("/");
    }));
}

export async function addToPlaylistAction(playlistId: string | null, name: string | null, songIds: string[]): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        if (playlistId) {
            await addToPlaylist(playlistId, songIds);
        } else {
            await createPlaylist(name?.trim() || "Spellista", songIds);
        }
        revalidatePath("/playlists");
    }));
}

export async function removeFromPlaylistAction(playlistId: string, index: number): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        await removeFromPlaylist(playlistId, index);
        revalidatePath(`/playlists/${playlistId}`);
    }));
}

export async function updatePlaylistAction(playlistId: string, info: { name?: string; comment?: string; public?: boolean }): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        const name = info.name?.trim();

        if (info.name !== undefined && (!name || name.length > 100)) {
            throw new Error("Invalid name");
        }
        await updatePlaylistInfo(playlistId, {...info, name, comment: info.comment?.trim().slice(0, 500)});
        revalidatePath("/playlists");
        revalidatePath(`/playlists/${playlistId}`);
    }));
}

/**
 * Puts a playlist's songs in a new order; the ids are Navidrome's, every song of the playlist once.
 */
export async function reorderPlaylistAction(playlistId: string, songIds: string[]): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        await setPlaylistSongs(playlistId, songIds);
        revalidatePath(`/playlists/${playlistId}`);
    }));
}

export async function deletePlaylistAction(playlistId: string): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        await deletePlaylist(playlistId);
        revalidatePath("/playlists");
    }));
}
