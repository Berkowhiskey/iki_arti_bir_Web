"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Contact,
  ExternalLink,
  LayoutDashboard,
  Info,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

/** CLAUDE.md Faz 4'teki CMS modüllerinin tamamı burada listelenir. */
const NAV_GROUPS = [
  {
    label: "Genel",
    items: [{ href: "/admin/dashboard", label: "Panel", icon: LayoutDashboard }],
  },
  {
    label: "İçerik Yönetimi",
    items: [
      { href: "/admin/hero-settings", label: "Hero Ayarları", icon: Sparkles },
      { href: "/admin/about-settings", label: "Hakkımızda", icon: Info },
      { href: "/admin/team-settings", label: "Ekip", icon: Users },
      { href: "/admin/portfolio", label: "Projeler", icon: Building2 },
      { href: "/admin/contact-settings", label: "İletişim", icon: Contact },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 px-2 py-3"
        >
          <span className="flex items-center gap-1 font-mono text-base font-light">
            <span>2</span>
            <span className="text-mese-600 dark:text-mese-400">+</span>
            <span>1</span>
          </span>
          <span className="truncate font-mono text-[10px] tracking-[0.2em] text-muted-foreground group-data-[collapsible=icon]:hidden">
            İKİ ARTI BİR
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <item.icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Siteyi görüntüle">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" />
                <span>Siteyi görüntüle</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
