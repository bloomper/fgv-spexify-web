import { type KindName, kindName } from "@/utils/format";
import { cn } from "@/utils/utils";

// Literal classes, so that Tailwind keeps them; the theme's chart colours
const COLOURS = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
];

/** A colour per kind that stays the same wherever the kind is shown, from its id. */
export function colourOf(id: string): string {
  let hash = 0;

  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return COLOURS[hash % COLOURS.length];
}

/**
 * A number kind (overture, finale…) as a small badge with its initial and its name as tooltip. The kinds are
 * Spexipedia's data and have no icons of their own, so each gets its initial in a colour of its own.
 */
export function NumberKindIcon({
  kind,
  locale,
  className,
}: {
  kind: KindName & { id: string };
  locale: string;
  className?: string;
}) {
  const name = kindName(kind, locale);

  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded text-[0.65rem] font-bold uppercase",
        colourOf(kind.id),
        className
      )}
    >
      {name.charAt(0)}
    </span>
  );
}
