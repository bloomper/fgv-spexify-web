"use client";

import * as React from "react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";

/**
 * A row that scrolls sideways, by swiping or with the arrows beside the shelf's heading on larger screens.
 */
export function ShelfScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTranslations("Home");
  const list = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const element = list.current;

    element?.scrollBy({ left: direction * Math.max(200, element.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="absolute -top-11 right-0 hidden gap-1 md:flex">
        <Button variant="ghost" size="icon-sm" onClick={() => scroll(-1)} aria-label={t("scrollBack", { shelf: label })}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => scroll(1)} aria-label={t("scrollOn", { shelf: label })}>
          <ChevronRight />
        </Button>
      </div>
      <ul ref={list} aria-label={label}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:-mx-8 md:scroll-px-8 md:px-8 [&::-webkit-scrollbar]:hidden">
        {children}
      </ul>
    </div>
  );
}
