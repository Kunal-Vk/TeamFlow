"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils/utils";
import { OrganizationModal } from "./organization-modal";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Search,
  User,
  Settings,
  LogOut,
  Building2,
  Plus,
  ChevronDown,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, currentOrg, organizations, setCurrentOrg, logout } = useAuth();
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Search", href: "/search", icon: Search },
  ];

  const secondaryNav = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-sidebar-foreground">TeamFlow</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">SaaS V1</span>
            </div>
          </Link>
        </div>

        {/* Organization Switcher */}
        <div className="p-3 border-b border-sidebar-border">
          <DropdownMenu
            align="left"
            className="w-58"
            trigger={
              <div className="flex items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2.5 hover:bg-sidebar-accent transition-colors">
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left truncate">
                    <span className="text-xs font-semibold truncate text-sidebar-foreground">
                      {currentOrg ? currentOrg.name : "No Organization"}
                    </span>
                    {currentOrg && (
                      <span className="text-[10px] text-muted-foreground truncate">/{currentOrg.slug}</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            }
          >
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Organizations</div>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setCurrentOrg(org)}
                className={cn("flex items-center justify-between text-xs", currentOrg?.id === org.id && "font-semibold text-primary bg-primary/10")}
              >
                <span className="truncate">{org.name}</span>
                {currentOrg?.id === org.id && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCreateOrgOpen(true)} className="text-xs text-primary font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workspace</div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen?.(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account</div>
            <nav className="space-y-1">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen?.(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Info Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between p-2 rounded-lg bg-sidebar-accent/30">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="flex flex-col truncate text-left">
                <span className="text-xs font-semibold truncate text-sidebar-foreground">{user?.name}</span>
                <div className="flex items-center space-x-1">
                  <Badge variant={user?.role === "owner" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0 h-4">
                    {user?.role === "owner" ? "Owner" : user?.role === "member" ? "Member" : "Unassigned"}
                  </Badge>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <OrganizationModal open={createOrgOpen} onOpenChange={setCreateOrgOpen} />
    </>
  );
}
