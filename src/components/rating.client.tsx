"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * One to five stars to rate with; choosing the current rating again removes it (0). Keyboard: arrow keys move, as in
 * a radio group.
 */
export function RatingInput({ value, onChange, label, disabled, className }: {
  value: number;
  onChange: (rating: number) => void;
  /** What is rated, for screen readers, e.g. "Betyg för Ouvertyr". */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("Rating");
  const [hover, setHover] = React.useState(0);
  const shown = hover || value;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(5, value + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(0, value - 1));
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex items-center", className)}
         onMouseLeave={() => setHover(0)} onKeyDown={onKeyDown}>
      {[1, 2, 3, 4, 5].map(rating => (
        <button key={rating} type="button" role="radio" aria-checked={value === rating} disabled={disabled}
                aria-label={t("stars", { count: rating })}
                tabIndex={value === rating || (value === 0 && rating === 1) ? 0 : -1}
                className="rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                onMouseEnter={() => setHover(rating)}
                onClick={() => onChange(rating === value ? 0 : rating)}>
          <Star className={cn("size-4", rating <= shown && "fill-current text-amber-500")} />
        </button>
      ))}
    </div>
  );
}

/**
 * A rating shown, not changed: filled stars for the rating, nothing when unrated.
 */
export function RatingStars({ value, className }: { value: number; className?: string }) {
  const t = useTranslations("Rating");

  if (value <= 0) {
    return null;
  }
  return (
    <span className={cn("inline-flex items-center text-amber-500", className)} role="img"
          aria-label={t("rated", { count: value })}>
            {Array.from({ length: value }, (_, i) => <Star key={i} className="size-3 fill-current" />)}
        </span>
  );
}

/**
 * Everyone's average rating, as a star and the average with one decimal, and how many rated; nothing when nobody has.
 * With {@code stars}, five stars filled to the nearest half instead of the one star.
 */
export function AverageRating({ average, count, stars = false, className }: {
  average?: number | null;
  count?: number | null;
  stars?: boolean;
  className?: string;
}) {
  const t = useTranslations("Rating");
  const locale = useLocale();

  if (!average || !count) {
    return null;
  }

  const decimal = new Intl.NumberFormat(locale === "en" ? "en" : "sv", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(average);
  const halves = Math.round(average * 2);

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums", className)}
          role="img"
          aria-label={t("average", { average: decimal, count })} title={t("average", { average: decimal, count })}>
            {stars ? (
              <span className="inline-flex items-center text-amber-500" aria-hidden>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className="relative inline-block size-3">
                            <Star className="absolute inset-0 size-3" />
                        {halves >= star * 2 - 1 && (
                          <span className="absolute inset-0 overflow-hidden"
                                style={{ width: halves >= star * 2 ? "100%" : "50%" }}>
                                    <Star className="size-3 fill-current" />
                                </span>
                        )}
                        </span>
                    ))}
                </span>
            ) : <Star className="size-3 fill-current text-amber-500" aria-hidden />}
      <span aria-hidden>{decimal}</span>
            <span aria-hidden>({count})</span>
        </span>
  );
}
