"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Search, LogOut, User as UserIcon, Settings, Menu, Shield } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, currentOrg, logout, logoutAll } = useAuth();
  const { theme, setTheme } = useTheme();

  const getBreadcrumbTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";
    if (pathname.startsWith("/projects")) return "Projects";
    if (pathname.startsWith("/teams")) return "Teams";
    if (pathname.startsWith("/tasks")) return "Tasks Management";
    if (pathname.startsWith("/search")) return "Global Search";
    if (pathname.startsWith("/profile")) return "User Profile";
    if (pathname.startsWith("/settings")) return "Workspace Settings";
    return "TeamFlow";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-muted-foreground hover:text-foreground lg:hidden rounded-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">{getBreadcrumbTitle()}</h1>
          {currentOrg && (
            <p className="text-xs text-muted-foreground hidden sm:block">
              Organization: <span className="font-medium text-foreground">{currentOrg.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Quick Search Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/search")}
          className="hidden md:flex items-center space-x-2 text-muted-foreground text-xs"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search workspace...</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title="Toggle Theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-accent transition-colors">
              <Avatar name={user?.name} className="h-8 w-8" />
            </div>
          }
        >
          <div className="px-3 py-2 text-xs">
            <div className="font-semibold text-foreground">{user?.name}</div>
            <div className="text-muted-foreground text-[11px] truncate">{user?.email}</div>
            <div className="mt-1 flex items-center space-x-1">
              <Badge variant={user?.role === "owner" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
                {user?.role === "owner" ? "Owner" : user?.role === "member" ? "Member" : "Unassigned"}
              </Badge>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")} className="text-xs">
            <UserIcon className="mr-2 h-4 w-4" />
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")} className="text-xs">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} destructive className="text-xs">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logoutAll} destructive className="text-xs">
            <Shield className="mr-2 h-4 w-4" />
            Sign Out All Devices
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
