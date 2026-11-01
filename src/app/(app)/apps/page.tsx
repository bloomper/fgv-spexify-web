import {connection} from "next/server";
import {getTranslations} from "next-intl/server";
import {getApps} from "@/lib/account/account.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {AppsManager} from "./apps.client";

export default async function AppsPage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        await connection();

        const t = await getTranslations("Apps");
        const data = await getApps();
        const serverUrl = (process.env.SUBSONIC_URL || process.env.BETTER_AUTH_URL || "").replace(/\/$/, "");

        return (
            <div className="max-w-3xl space-y-6 p-4 sm:p-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("intro", {months: data?.settings.appPasswordExpiryMonths ?? 12})}</p>
                </div>
                <AppsManager serverUrl={serverUrl} username={data?.me.username ?? ""}
                             passwords={data?.appPasswords ?? []} apiKeys={data?.apiKeys ?? []}/>
            </div>
        );
    });
}
