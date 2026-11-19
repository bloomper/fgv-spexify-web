"use server";

import { revalidatePath } from "next/cache";
import {
  albumCoverRemove,
  albumCreate,
  albumDelete,
  albumPublish,
  albumRestore,
  albumTrash,
  albumUpdate,
  collectionCreate,
  collectionDelete,
  collectionUpdate,
  searchSpex,
  trackCreate,
  trackDelete,
  trackPublish,
  trackReplaceAudio,
  trackRestore,
  tracksReorder,
  trackTrash,
  trackSetNumber,
  trackUpdate,
} from "@/lib/catalog/catalog.server";
import { trashEmpty } from "@/lib/admin/admin.server";
import { trackLyricsRestore, trackLyricsUpdate } from "@/lib/catalog/sheet-music.server";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import type { AlbumInput, CollectionInput, TrackInput } from "@/gql/graphql";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

type LyricsState = Awaited<ReturnType<typeof trackLyricsUpdate>>;

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

export async function setTrackNumberAction(albumId: string, id: string, numberId: string | null): Promise<ActionResult<null>> {
  requireId(id);
  if (numberId !== null) {
    requireId(numberId);
  }
  return editor(async () => {
    await trackSetNumber(id, numberId);
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

function collectionsChanged(id?: string) {
  revalidatePath("/collections");
  revalidatePath("/manage/collections");
  if (id) {
    revalidatePath(`/collections/${id}`);
    revalidatePath(`/manage/collections/${id}`);
  }
}

function checkCollection(input: CollectionInput) {
  if (!input.albumIds.every(id => ID.test(String(id)))) {
    throw new Error("Invalid id");
  }
}

export async function createCollectionAction(input: CollectionInput): Promise<ActionResult<string | undefined>> {
  checkCollection(input);
  return editor(async () => {
    const created = await collectionCreate(input);

    collectionsChanged();
    return created?.id;
  });
}

export async function updateCollectionAction(id: string, input: CollectionInput): Promise<ActionResult<null>> {
  requireId(id);
  checkCollection(input);
  return editor(async () => {
    await collectionUpdate(id, input);
    collectionsChanged(id);
    return null;
  });
}

export async function deleteCollectionAction(id: string): Promise<ActionResult<null>> {
  requireId(id);
  return admin(async () => {
    await collectionDelete(id);
    collectionsChanged(id);
    return null;
  });
}

export async function saveLyricsAction(albumId: string, trackId: string, lyrics: string | null, synced: boolean,
                                       baseRevisionId: string | null): Promise<ActionResult<LyricsState | undefined>> {
  requireId(albumId);
  requireId(trackId);
  return editor(async () => {
    const saved = await trackLyricsUpdate(trackId, lyrics, synced, baseRevisionId);

    changed(albumId);
    return saved;
  });
}

export async function restoreLyricsAction(albumId: string, trackId: string, revisionId: string): Promise<ActionResult<LyricsState | undefined>> {
  requireId(albumId);
  requireId(trackId);
  return editor(async () => {
    const restored = await trackLyricsRestore(trackId, revisionId.slice(0, 20));

    changed(albumId);
    return restored;
  });
}
