"use server";

import {revalidatePath} from "next/cache";
import {addToPlaylist, createPlaylist, deletePlaylist, removeFromPlaylist, star} from "@/lib/subsonic.server";
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

export async function deletePlaylistAction(playlistId: string): Promise<SimpleResult> {
    return withPolicyAction(Policies.app.requireAccess, () => attempt(async () => {
        await deletePlaylist(playlistId);
        revalidatePath("/playlists");
    }));
}
