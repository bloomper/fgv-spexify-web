"use server";

import {revalidatePath} from "next/cache";
import {
    albumCoverRemove,
    albumCreate,
    albumDelete,
    albumPublish,
    albumRestore,
    albumTrash,
    albumUpdate,
    searchSpex,
    trackCreate,
    trackDelete,
    trackPublish,
    trackReplaceAudio,
    trackRestore,
    trackTrash,
    trackUpdate,
    tracksReorder
} from "@/lib/catalog/catalog.server";
import {trashEmpty} from "@/lib/admin/admin.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import type {AlbumInput, TrackInput} from "@/gql/graphql";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

const ID = /^\d{1,19}$/;
const UPLOAD = /^[0-9a-f-]{36}$/;

function requireId(id: string) {
    if (!ID.test(id)) {
        throw new Error("Invalid id");
    }
}

function changed(albumId?: string) {
    revalidatePath("/manage/albums");
    revalidatePath("/manage/trash");
    revalidatePath("/albums");
    if (albumId) {
        revalidatePath(`/manage/albums/${albumId}`);
        revalidatePath(`/albums/${albumId}`);
    }
}

const editor = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.editor.requireEditor, () => toActionResult(work));
const admin = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(work));

export async function searchSpexAction(q: string) {
    return editor(async () => searchSpex(q.slice(0, 100)));
}

export async function createAlbumAction(input: AlbumInput): Promise<ActionResult<string | undefined>> {
    return editor(async () => {
        const created = await albumCreate(input);

        changed();
        return created?.id;
    });
}

export async function updateAlbumAction(id: string, input: AlbumInput): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await albumUpdate(id, input);
        changed(id);
        return null;
    });
}

export async function publishAlbumAction(id: string, published: boolean): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await albumPublish(id, published);
        changed(id);
        return null;
    });
}

export async function trashAlbumAction(id: string, trashed: boolean): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await (trashed ? albumTrash(id) : albumRestore(id));
        changed(id);
        return null;
    });
}

export async function deleteAlbumAction(id: string): Promise<ActionResult<null>> {
    requireId(id);
    return admin(async () => {
        await albumDelete(id);
        changed();
        return null;
    });
}

export async function removeCoverAction(id: string): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await albumCoverRemove(id);
        changed(id);
        return null;
    });
}

export async function reorderAction(albumId: string, trackIds: string[]): Promise<ActionResult<null>> {
    requireId(albumId);
    trackIds.forEach(requireId);
    return editor(async () => {
        await tracksReorder(albumId, trackIds);
        changed(albumId);
        return null;
    });
}

export async function createTrackAction(albumId: string, uploadId: string): Promise<ActionResult<string | undefined>> {
    requireId(albumId);
    if (!UPLOAD.test(uploadId)) {
        throw new Error("Invalid upload");
    }
    return editor(async () => {
        const result = await trackCreate(albumId, uploadId);

        changed(albumId);
        return result?.trackCreate.title;
    });
}

export async function replaceAudioAction(albumId: string, id: string, uploadId: string): Promise<ActionResult<null>> {
    requireId(id);
    if (!UPLOAD.test(uploadId)) {
        throw new Error("Invalid upload");
    }
    return editor(async () => {
        await trackReplaceAudio(id, uploadId);
        changed(albumId);
        return null;
    });
}

export async function updateTrackAction(albumId: string, id: string, input: TrackInput): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await trackUpdate(id, input);
        changed(albumId);
        return null;
    });
}

export async function publishTrackAction(albumId: string, id: string, published: boolean): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await trackPublish(id, published);
        changed(albumId);
        return null;
    });
}

export async function trashTrackAction(albumId: string, id: string, trashed: boolean): Promise<ActionResult<null>> {
    requireId(id);
    return editor(async () => {
        await (trashed ? trackTrash(id) : trackRestore(id));
        changed(albumId);
        return null;
    });
}

export async function deleteTrackAction(id: string): Promise<ActionResult<null>> {
    requireId(id);
    return admin(async () => {
        await trackDelete(id);
        changed();
        return null;
    });
}

export async function emptyTrashAction(): Promise<ActionResult<null>> {
    return admin(async () => {
        await trashEmpty();
        changed();
        return null;
    });
}
