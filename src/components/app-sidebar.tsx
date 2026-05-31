"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  ScanQrCode,
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  BarChart2,
  UserPlus,
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
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RegisterForm from "./LoginForm/RegisterForm";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [adminOnly, setAdminOnly] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ name?: string; email?: string } | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

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
      {
        title:    "POS",
        url:      "/admin/pos",
        icon:     ScanQrCode,
        isActive: true,
        items:    [],
      },

      ...(adminOnly ? [
        {
          title: "Dashboard",
          url:   "/admin/dashboard",
          icon:  LayoutDashboard,
          items: [{ title: "Overview", url: "/admin/dashboard" }],
        },
        {
          title: "Products",
          url:   "/admin/products",
          icon:  Package,
          items: [
            { title: "All Products", url: "/admin/products" },
            { title: "Categories",   url: "/admin/categories" },
          ],
        },
        {
          title: "Orders",
          url:   "/admin/orders",
          icon:  ClipboardList,
          items: [{ title: "All Orders", url: "/admin/orders" }],
        },
        {
          title: "Reports",
          url:   "/admin/reports",
          icon:  BarChart2,
          items: [
            { title: "Daily",   url: "/admin/reports/daily" },
            { title: "Monthly", url: "/admin/reports/monthly" },
          ],
        },
        {
          title: "Users",
          url:   "/admin/users",
          icon:  Users,
          items: [{ title: "All Users", url: "/admin/users" }],
        },
      ] : []),
    ],
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>
        <SidebarFooter>
          {adminOnly && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setRegisterOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Register User
            </Button>
          )}
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {adminOnly && (
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new account.
              </DialogDescription>
            </DialogHeader>
            <RegisterForm onSuccess={() => setRegisterOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}