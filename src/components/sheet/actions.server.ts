"use server";

import { getSessionContext } from "@/utils/auth.server";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import { getTrackStudio, scoreAlign, scoreSyncDelete, scoreSyncSave } from "@/lib/catalog/sheet-music.server";
import type { ScoreSyncInput } from "@/gql/graphql";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireId(...ids: string[]) {
  if (ids.some((id) => !ID.test(id))) {
    throw new Error("Invalid id");
  }
}

export type TrackStudio = NonNullable<Awaited<ReturnType<typeof getTrackStudio>>> & { editor: boolean };
export type ScoreSync = TrackStudio["scoreSyncs"][number];

/**
 * What the full-screen player shows beside the lyrics: the sheet music from Spexarkivet, the maps that make its cursor
 * follow the recording, and the singers of the lyrics. Null when the server could not be reached.
 */
export async function trackStudioAction(trackId: string): Promise<TrackStudio | null> {
  requireId(trackId);
  return withPolicyAction(Policies.app.requireAccess, async () => {
    try {
      const [studio, { roles }] = await Promise.all([getTrackStudio(trackId), getSessionContext()]);

      return studio ? { ...studio, editor: roles.includes("EDITOR") || roles.includes("ADMIN") } : null;
    } catch {
      return null;
    }
  });
}

const editor = <T>(work: () => Promise<T>) =>
  withPolicyAction(Policies.editor.requireEditor, () => toActionResult(work));

export async function saveScoreSyncAction(
  trackId: string,
  fileId: string,
  input: ScoreSyncInput,
  version: number | null
): Promise<ActionResult<ScoreSync | undefined>> {
  requireId(trackId, fileId);
  return editor(() => scoreSyncSave(trackId, fileId, input, version));
}

export async function deleteScoreSyncAction(trackId: string, fileId: string): Promise<ActionResult<boolean>> {
  requireId(trackId, fileId);
  return editor(() => scoreSyncDelete(trackId, fileId));
}

export async function alignScoreAction(trackId: string, fileId: string): Promise<ActionResult<ScoreSync | undefined>> {
  requireId(trackId, fileId);
  return editor(() => scoreAlign(trackId, fileId));
}
