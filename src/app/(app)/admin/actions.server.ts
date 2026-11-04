"use server";

import { revalidatePath } from "next/cache";
import {
  libraryRescan,
  maintenanceJobRun,
  settingsUpdate,
  userCredentialsRevoke,
  userUnlock,
} from "@/lib/admin/admin.server";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import type { AlbumKindInput, MaintenanceJob, SettingsInput } from "@/gql/graphql";
import { albumKindCreate, albumKindDelete, albumKindsReorder, albumKindUpdate } from "@/lib/catalog/catalog.server";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";

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

const kinds = <T, >(work: () => Promise<T>) => admin(async () => {
  const result = await work();

  revalidatePath("/admin/kinds");
  revalidatePath("/", "layout");
  return result;
});

export async function createKindAction(input: AlbumKindInput): Promise<ActionResult<null>> {
  return kinds(async () => {
    await albumKindCreate(input);
    return null;
  });
}

export async function updateKindAction(id: string, input: AlbumKindInput): Promise<ActionResult<null>> {
  return kinds(async () => {
    await albumKindUpdate(id, input);
    return null;
  });
}

/**
 * Every kind's id in the new order; the first becomes the default.
 */
export async function reorderKindsAction(ids: string[]): Promise<ActionResult<null>> {
  return kinds(async () => {
    await albumKindsReorder(ids);
    return null;
  });
}

export async function deleteKindAction(id: string): Promise<ActionResult<null>> {
  return kinds(async () => {
    await albumKindDelete(id);
    return null;
  });
}
