import type { ReactNode } from "react";
import Link from "next/link";
import { ShelfScroller } from "@/components/shelf-scroller.client";
import { cn } from "@/utils/utils";

/**
 * A shelf of the start page: a heading, a link to everything of its kind, and large covers that scroll sideways.
 * Its children are {@link ShelfItem}s.
 */
export function Shelf({ id, title, more, children }: {
  id: string;
  title: string;
  more?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-3" aria-labelledby={id}>
      <div className="flex items-baseline gap-x-4 pr-0 md:pr-20">
        <h2 id={id} className="text-xl font-bold tracking-tight">{title}</h2>
        {more && <Link href={more.href} className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground md:ml-0">{more.label}</Link>}
      </div>
      <ShelfScroller label={title}>{children}</ShelfScroller>
    </section>
  );
}

export function ShelfItem({ children, className }: { children: ReactNode; className?: string }) {
  return <li className={cn("w-36 shrink-0 snap-start sm:w-44", className)}>{children}</li>;
}
