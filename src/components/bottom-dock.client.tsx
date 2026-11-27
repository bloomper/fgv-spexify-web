"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart, House, Library, ListMusic, Search } from "lucide-react";
import { PlayerBar } from "@/components/player/player-bar.client";
import { cn } from "@/utils/utils";

const TABS = [
  { href: "/", label: "Nav.home", icon: House, active: (path: string) => path === "/" },
  { href: "/search", label: "Search.title", icon: Search, active: (path: string) => path.startsWith("/search") },
  { href: "/albums", label: "Nav.albums", icon: Library, active: (path: string) => path.startsWith("/albums") },
  { href: "/starred", label: "Nav.starred", icon: Heart, active: (path: string) => path.startsWith("/starred") },
  {
    href: "/playlists",
    label: "Nav.playlists",
    icon: ListMusic,
    active: (path: string) => path.startsWith("/playlists"),
  },
] as const;

/**
 * On a phone, the library as tabs at the bottom, as the sidebar is on a larger screen; the rest is in the menu in the
 * header.
 */
export function MobileTabBar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("Nav.tabs")}
      className="bg-background/95 flex border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.active(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem]",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <tab.icon
              className="size-5"
              aria-hidden
            />
            <span className="max-w-full truncate px-0.5">{t(tab.label)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The bottom of every page: the player and, on a phone, the tabs below it. It sets {@code --player-height} on
 * {@code <html>} to its height, so that the page and the sidebar end above it.
 */
export function BottomDock() {
  const dock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = dock.current;
    const root = document.documentElement;

    if (!element) {
      return;
    }

    const update = () => {
      if (element.offsetHeight > 0) {
        root.style.setProperty("--player-height", `${element.offsetHeight}px`);
      } else {
        root.style.removeProperty("--player-height");
      }
    };
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--player-height");
    };
  }, []);

  return (
    <div
      ref={dock}
      className="fixed inset-x-0 bottom-0 z-40"
    >
      <PlayerBar />
      <MobileTabBar />
    </div>
  );
}
