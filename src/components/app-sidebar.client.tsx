"use client";

import * as React from "react";
import {useMemo} from "react";
import {Drama, House, Library, ListMusic, type LucideIcon, Pencil, Settings, Smartphone, Star, Wrench} from "lucide-react";

import {NavMain} from "@/components/nav-main.client";
import {NavSecondary} from "@/components/nav-secondary.client";
import {NavUser} from "@/components/nav-user.client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/components/ui/sidebar";
import {Logo} from "@/components/logo";
import {LogoText} from "@/components/logo-text";
import {Role} from "@/types/auth";
import {isAdmin, isEditor} from "@/utils/auth";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";
import {useIsClient} from "@/hooks/use-is-client.client";

interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: NavItem[];
}

interface NavSecondaryItem extends Omit<NavItem, "icon"> {
    icon: LucideIcon;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    roles: Role[];
    accountUrl: string;
}

export function AppSidebar({roles, accountUrl, ...props}: AppSidebarProps) {
    const pathname = usePathname();
    const t = useTranslations();
    const isClient = useIsClient();
    const {isMobile, setOpenMobile} = useSidebar();

    const closeOnNavigate = (event: React.MouseEvent) => {
        if (isMobile && (event.target as Element).closest("a")) {
            setOpenMobile(false);
        }
    };

    const navigation = useMemo((): { main: NavItem[]; secondary: NavSecondaryItem[] } => {
        const mainItems: NavItem[] = [
            {title: t("Nav.home"), url: "/", icon: House, isActive: pathname === "/"},
            {title: t("Nav.albums"), url: "/albums", icon: Library, isActive: pathname.startsWith("/albums")},
            {title: t("Nav.starred"), url: "/starred", icon: Star, isActive: pathname.startsWith("/starred")},
            {title: t("Nav.playlists"), url: "/playlists", icon: ListMusic, isActive: pathname.startsWith("/playlists")},
            {title: t("Nav.apps"), url: "/apps", icon: Smartphone, isActive: pathname.startsWith("/apps")},
        ];

        if (isEditor(roles)) {
            mainItems.push({
                title: t("Nav.manage"),
                url: "/manage/albums",
                icon: Pencil,
                isActive: pathname.startsWith("/manage"),
                items: [
                    {title: t("Nav.manageAlbums"), url: "/manage/albums"},
                    {title: t("Nav.trash"), url: "/manage/trash"},
                    {title: t("Nav.auditLog"), url: "/manage/audit"},
                ],
            });
        }

        if (isAdmin(roles)) {
            mainItems.push({
                title: t("Nav.admin"),
                url: "/admin/library",
                icon: Settings,
                isActive: pathname.startsWith("/admin/"),
                items: [
                    {title: t("Nav.adminLibrary"), url: "/admin/library"},
                    {title: t("Nav.adminUsers"), url: "/admin/users"},
                    {title: t("Nav.adminSettings"), url: "/admin/settings"},
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
            ]
        };
    }, [roles, pathname, t]);

    return (
        <Sidebar collapsible="icon"
                 className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
                 {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={
                                <a
                                    href="https://www.fgv.nu"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 flex-nowrap bg-transparent! hover:bg-transparent! active:bg-transparent! focus:bg-transparent!"
                                />
                            }
                        >
                            <div
                                className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-lg group-data-[collapsible=icon]:size-8">
                                <Logo/>
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden pl-4">
                                <LogoText className="h-10 w-auto text-foreground"/>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent onClickCapture={closeOnNavigate}>
                {isClient ? (
                    <>
                        <NavMain items={navigation.main}/>
                        <NavSecondary items={navigation.secondary} className="mt-auto"/>
                    </>
                ) : (
                    <div className="flex flex-col gap-2 p-4">
                        {Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                                <div className="size-4 shrink-0 animate-pulse rounded bg-sidebar-accent/50"/>
                                <div
                                    className="h-3 w-24 animate-pulse rounded bg-sidebar-accent/50 group-data-[collapsible=icon]:hidden"/>
                            </div>
                        ))}
                    </div>
                )}
            </SidebarContent>
            <SidebarFooter onClickCapture={closeOnNavigate}>
                {isClient && <NavUser accountUrl={accountUrl}/>}
            </SidebarFooter>
        </Sidebar>
    );
}
