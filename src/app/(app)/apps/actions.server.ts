"use server";

import {revalidatePath} from "next/cache";
import {apiKeyCreate, apiKeyRevoke, appPasswordCreate, appPasswordRevoke} from "@/lib/account/account.server";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {withPolicyAction} from "@/utils/route.server";
import {Policies} from "@/utils/policy.server";

export async function createAppPasswordAction(name: string): Promise<ActionResult<{ password: string; username: string } | undefined>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const created = await appPasswordCreate(name);

        revalidatePath("/apps");
        return created ? {password: created.password, username: created.username} : undefined;
    }));
}

export async function revokeAppPasswordAction(id: string): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        await appPasswordRevoke(id);
        revalidatePath("/apps");
        return null;
    }));
}

export async function createApiKeyAction(name: string): Promise<ActionResult<string | undefined>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const created = await apiKeyCreate(name);

        revalidatePath("/apps");
        return created?.key;
    }));
}

export async function revokeApiKeyAction(id: string): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        await apiKeyRevoke(id);
        revalidatePath("/apps");
        return null;
    }));
}
