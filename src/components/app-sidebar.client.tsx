"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  Drama,
  Heart,
  History,
  House,
  Layers,
  Library,
  ListMusic,
  type LucideIcon,
  Pencil,
  Settings,
  Smartphone,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";

import { NavMain } from "@bloomper/fgv-web-ui/shell/nav-main";
import { NavSecondary, SidebarBrand } from "@bloomper/fgv-web-ui/shell/sidebar-parts";
import { NavUser } from "@/components/nav-user.client";
import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@bloomper/fgv-web-ui/ui/sidebar";
import { Role } from "@/types/auth";
import { isAdmin, isEditor } from "@/utils/auth";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useIsClient } from "@bloomper/fgv-web-ui/hooks/use-is-client";

interface NavLink {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavLink[];
}

/** A group without an address only opens and closes its entries. */
interface NavItem extends Omit<NavLink, "url"> {
  url?: string;
}

interface NavSecondaryItem extends Omit<NavLink, "icon"> {
  icon: LucideIcon;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  roles: Role[];
  accountUrl: string;
}

export function AppSidebar({ roles, accountUrl, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const isClient = useIsClient();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeOnNavigate = (event: React.MouseEvent) => {
    if (isMobile && (event.target as Element).closest("a")) {
      setOpenMobile(false);
    }
  };

  const navigation = useMemo((): { main: NavItem[]; secondary: NavSecondaryItem[] } => {
    const mainItems: NavItem[] = [
      { title: t("Nav.home"), url: "/", icon: House, isActive: pathname === "/" },
      { title: t("Nav.albums"), url: "/albums", icon: Library, isActive: pathname.startsWith("/albums") },
      { title: t("Nav.top"), url: "/top", icon: Trophy, isActive: pathname.startsWith("/top") },
      { title: t("Nav.collections"), url: "/collections", icon: Layers, isActive: pathname.startsWith("/collections") },
      { title: t("Nav.starred"), url: "/starred", icon: Heart, isActive: pathname.startsWith("/starred") },
      { title: t("Nav.recent"), url: "/recent", icon: History, isActive: pathname.startsWith("/recent") },
      { title: t("Nav.playlists"), url: "/playlists", icon: ListMusic, isActive: pathname.startsWith("/playlists") },
      { title: t("Nav.credits"), url: "/credits", icon: Users, isActive: pathname.startsWith("/credits") },
      { title: t("Nav.apps"), url: "/apps", icon: Smartphone, isActive: pathname.startsWith("/apps") },
    ];

    if (isEditor(roles)) {
      mainItems.push({
        title: t("Nav.manage"),
        icon: Pencil,
        isActive: pathname.startsWith("/manage"),
        items: [
          { title: t("Nav.manageAlbums"), url: "/manage/albums" },
          { title: t("Nav.manageCollections"), url: "/manage/collections" },
          { title: t("Nav.trash"), url: "/manage/trash" },
          { title: t("Nav.auditLog"), url: "/manage/audit" },
        ],
      });
    }

    if (isAdmin(roles)) {
      mainItems.push({
        title: t("Nav.admin"),
        icon: Settings,
        isActive: pathname.startsWith("/admin/"),
        items: [
          { title: t("Nav.adminLibrary"), url: "/admin/library" },
          { title: t("Nav.adminUsers"), url: "/admin/users" },
          { title: t("Nav.adminKinds"), url: "/admin/kinds" },
          { title: t("Nav.adminMedia"), url: "/admin/media" },
          { title: t("Nav.adminMaintenance"), url: "/admin/maintenance" },
          { title: t("Nav.adminSettings"), url: "/admin/settings" },
        ],
      });
    }

    return {
      main: mainItems,
      secondary: [
        {
          title: t("Support.title"),
          url: "/support",
          icon: Wrench,
        },
        {
          title: t("About.title"),
          url: "/about",
          icon: Drama,
        },
      ],
    };
  }, [roles, pathname, t]);

  return (
    <Sidebar
      collapsible="icon"
      className="top-(--header-height) h-[calc(100svh-var(--header-height)-var(--player-height,0px))]!"
      {...props}
    >
      <SidebarBrand />
      <SidebarContent onClickCapture={closeOnNavigate}>
        {isClient ? (
          <>
            <NavMain items={navigation.main} />
            <NavSecondary
              items={navigation.secondary}
              className="mt-auto"
            />
          </>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-2 py-1.5"
              >
                <div className="bg-sidebar-accent/50 size-4 shrink-0 animate-pulse rounded" />
                <div className="bg-sidebar-accent/50 h-3 w-24 animate-pulse rounded group-data-[collapsible=icon]:hidden" />
              </div>
            ))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter onClickCapture={closeOnNavigate}>{isClient && <NavUser accountUrl={accountUrl} />}</SidebarFooter>
    </Sidebar>
  );
}
