import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCredits } from "@/lib/catalog/catalog.server";
import { CREDIT_KINDS, creditHref } from "@/lib/credits";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { CreditTabs } from "../credit-tabs";
import { DataEmpty } from "@/components/data-empty";

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
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t(`text.${segment}`)}</p>
        <CreditTabs current={segment} />
        {credits.length === 0 ? <DataEmpty title={t("none")} description={null} /> : (
          <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {credits.map(credit => (
              <li key={credit.name}>
                <Link href={creditHref(kind, credit.name)}
                      className="flex items-baseline justify-between gap-3 rounded px-2 py-1.5 hover:bg-accent">
                  <span className="min-w-0 truncate">{credit.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                        {t("tracks", { count: credit.trackCount })}
                                    </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
