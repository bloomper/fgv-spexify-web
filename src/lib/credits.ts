import type { CreditKind } from "@/gql/graphql";

/** The kinds of credit by their path segment under /credits. */
export const CREDIT_KINDS: Record<string, CreditKind> = {
  "performers": "PERFORMER",
  "melodies": "MELODY",
  "original-artists": "ORIGINAL_ARTIST",
  "lyrics-authors": "LYRICS_AUTHOR",
  "arrangers": "ARRANGER",
};

export function creditSegment(kind: CreditKind): string {
  return Object.entries(CREDIT_KINDS).find(([, value]) => value === kind)![0];
}

export function creditHref(kind: CreditKind, name: string): string {
  return `/credits/${creditSegment(kind)}/${encodeURIComponent(name)}`;
}

/**
 * Names as the server splits them: on commas, semicolons, slashes and ampersands, without duplicates.
 */
export function splitCredits(value: string | null | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  const seen = new Set<string>();

  return value.trim().split(/\s*[,;/&]\s*/).map(name => name.trim()).filter(name => {
    const key = name.toLowerCase();

    if (!name || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
