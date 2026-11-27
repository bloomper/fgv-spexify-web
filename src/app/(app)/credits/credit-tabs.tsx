import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CREDIT_KINDS } from "@/lib/credits";
import { cn } from "@/utils/utils";

/**
 * Links between the kinds of credit, the current one marked.
 */
export async function CreditTabs({ current }: { current: string }) {
  const t = await getTranslations("Credits");

  return (
    <nav
      aria-label={t("kinds")}
      className="flex flex-wrap gap-2"
    >
      {Object.keys(CREDIT_KINDS).map((segment) => (
        <Link
          key={segment}
          href={`/credits/${segment}`}
          aria-current={segment === current ? "page" : undefined}
          className={cn(
            "hover:bg-accent rounded-full border px-3 py-1 text-sm",
            segment === current && "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {t(`kind.${segment}`)}
        </Link>
      ))}
    </nav>
  );
}
