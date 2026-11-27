import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { getApps } from "@/lib/account/account.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { AppsManager } from "./apps.client";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function AppsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    await connection();

    const t = await getTranslations("Apps");
    const data = await getApps();
    const serverUrl = (process.env.SUBSONIC_URL || process.env.BETTER_AUTH_URL || "").replace(/\/$/, "");

    return (
      <Page
        variant="content"
        className="max-w-3xl"
      >
        <PageHeader
          title={t("title")}
          description={t("intro", { months: data?.settings.appPasswordExpiryMonths ?? 12 })}
        />
        <AppsManager
          serverUrl={serverUrl}
          username={data?.me.username ?? ""}
          passwords={data?.appPasswords ?? []}
          apiKeys={data?.apiKeys ?? []}
        />
      </Page>
    );
  });
}
