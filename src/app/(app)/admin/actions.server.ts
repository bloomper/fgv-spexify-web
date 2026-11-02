"use server";

import {revalidatePath} from "next/cache";
import {libraryRescan, maintenanceJobRun, settingsUpdate, userCredentialsRevoke, userUnlock} from "@/lib/admin/admin.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import type {MaintenanceJob, SettingsInput} from "@/gql/graphql";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

const admin = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(work));

export async function rescanAction(): Promise<ActionResult<null>> {
    return admin(async () => {
        await libraryRescan();
        revalidatePath("/admin/library");
        return null;
    });
}

export async function revokeCredentialsAction(userId: string): Promise<ActionResult<null>> {
    return admin(async () => {
        await userCredentialsRevoke(userId);
        revalidatePath("/admin/users");
        return null;
    });
}

export async function unlockAction(userId: string): Promise<ActionResult<null>> {
    return admin(async () => {
        await userUnlock(userId);
        revalidatePath("/admin/users");
        return null;
    });
}

export async function saveSettingsAction(input: SettingsInput): Promise<ActionResult<null>> {
    return admin(async () => {
        await settingsUpdate(input);
        revalidatePath("/admin/settings");
        revalidatePath("/");
        return null;
    });
}

/**
 * Starts a maintenance job in the background. The data is false when it is already running.
 */
export async function runMaintenanceJobAction(job: MaintenanceJob): Promise<ActionResult<boolean>> {
    return admin(async () => {
        const started = await maintenanceJobRun(job);
        revalidatePath("/admin/maintenance");
        return started;
    });
}
