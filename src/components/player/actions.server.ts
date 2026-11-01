"use server";

import {scrobble} from "@/lib/subsonic.server";
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
