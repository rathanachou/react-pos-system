"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  ScanQrCode,
  Settings2,
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  BarChart2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { isAdmin, getCurrentUser } from "@/utils/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [adminOnly, setAdminOnly] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ name?: string; email?: string } | null>(null);

  React.useEffect(() => {
    const user = getCurrentUser();
    setAdminOnly(isAdmin());
    setCurrentUser(user);
  }, []);

  const data = {
    user: {
      name:   currentUser?.name  ?? "User",
      email:  currentUser?.email ?? "",
      avatar: "/LEVA store logo.png",
    },
    teams: [
      {
        name:   "Levarstore",
        logo:   GalleryVerticalEnd,
        plan:   "POS System",
        avatar: "/LEVA store logo.png",
      },
    ],
    navMain: [
      // ─── POS (admin + cashier) ────────────────────────
      {
        title:    "POS",
        url:      "/admin/pos",
        icon:     ScanQrCode,
        isActive: true,
        items:    [],
      },

      // ─── Admin only ───────────────────────────────────
      ...(adminOnly ? [
        {
          title: "Dashboard",
          url:   "/admin/dashboard",
          icon:  LayoutDashboard,
          items: [
            { title: "Overview", url: "/admin/dashboard" },
          ],
        },
        {
          title: "Products",
          url:   "/admin/products",
          icon:  Package,
          items: [
            { title: "All Products", url: "/admin/products"   },
            { title: "Categories",   url: "/admin/categories" },
          ],
        },
        {
          title: "Orders",
          url:   "/admin/orders",
          icon:  ClipboardList,
          items: [
            { title: "All Orders", url: "/admin/orders" },
          ],
        },
        {
          title: "Reports",
          url:   "/admin/reports",
          icon:  BarChart2,
          items: [
            { title: "Daily",   url: "/admin/reports/daily"   },
            { title: "Monthly", url: "/admin/reports/monthly" },
          ],
        },
        {
          title: "Users",
          url:   "/admin/users",
          icon:  Users,
          items: [
            { title: "All Users", url: "/admin/users" },
          ],
        },
      ] : []),

      // ─── Settings (admin + cashier) ───────────────────
      // {
      //   title: "Settings",
      //   url:   "#",
      //   icon:  Settings2,
      //   items: [
      //     { title: "General", url: "#" },
      //   ],
      // },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}