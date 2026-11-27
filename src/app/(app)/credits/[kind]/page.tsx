import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCredits } from "@/lib/catalog/catalog.server";
import { CREDIT_KINDS, creditHref } from "@/lib/credits";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { CreditTabs } from "../credit-tabs";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

export default async function CreditKindPage({ params }: { params: Promise<{ kind: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const { kind: segment } = await params;
    const kind = CREDIT_KINDS[segment];

    if (!kind) {
      notFound();
    }

    const t = await getTranslations("Credits");
    const credits = await getCredits(kind);

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t(`text.${segment}`)}
        />
        <CreditTabs current={segment} />
        {credits.length === 0 ? (
          <DataEmpty
            title={t("none")}
            description={null}
          />
        ) : (
          <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {credits.map((credit) => (
              <li key={credit.name}>
                <Link
                  href={creditHref(kind, credit.name)}
                  className="hover:bg-accent flex items-baseline justify-between gap-3 rounded px-2 py-1.5"
                >
                  <span className="min-w-0 truncate">{credit.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {t("tracks", { count: credit.trackCount })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Page>
    );
  });
}
