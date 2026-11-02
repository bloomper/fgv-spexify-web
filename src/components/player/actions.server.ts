"use server";

import {getPlayQueue, savePlayQueue, scrobble} from "@/lib/subsonic.server";
import {getTracksByNavidromeIds} from "@/lib/catalog/catalog.server";
import type {PlayerTrack} from "@/components/player/player-provider.client";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

/**
 * Tells Navidrome what is playing ({@code submission} false) and that a track was listened to (true), for play counts
 * and "recently played" in the user's apps. Failures are ignored: playing does not depend on it.
 */
export async function scrobbleAction(navidromeId: string, submission: boolean): Promise<void> {
    await withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await scrobble(navidromeId, submission);
        } catch {
            // Navidrome is unavailable; the track still plays
        }
    });
}

export type SavedQueue = { tracks: PlayerTrack[]; index: number; positionSeconds: number };

/**
 * The play queue saved in Navidrome, by this web or the user's apps, as tracks Spexify still lists; null when there is
 * none or Navidrome is unavailable.
 */
export async function loadPlayQueueAction(): Promise<SavedQueue | null> {
    return withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            const saved = await getPlayQueue();

            if (!saved || saved.ids.length === 0) {
                return null;
            }

            const tracks = await getTracksByNavidromeIds(saved.ids);

            if (tracks.length === 0) {
                return null;
            }

            const index = Math.max(0, tracks.findIndex(track => track.navidromeId === saved.current));
            const atCurrent = tracks[index]?.navidromeId === saved.current;

            return {
                tracks: tracks.map(track => ({
                    id: track.id, title: track.title, albumId: track.albumId, albumTitle: track.albumTitle,
                    performers: track.performers, durationMs: track.durationMs, navidromeId: track.navidromeId,
                    lyrics: track.lyrics, lyricsSynced: track.lyricsSynced,
                })),
                index,
                positionSeconds: atCurrent ? saved.positionMs / 1000 : 0,
            };
        } catch {
            return null;
        }
    });
}

/**
 * Saves the play queue in Navidrome, so the user's apps and other browsers can continue from it. Failures are ignored.
 */
export async function savePlayQueueAction(navidromeIds: string[], current: string | null, positionMs: number): Promise<void> {
    await withPolicyAction(Policies.app.requireAccess, async () => {
        try {
            await savePlayQueue(navidromeIds.slice(0, 1000), current, positionMs);
        } catch {
            // Navidrome is unavailable; the queue is saved next time
        }
    });
}
