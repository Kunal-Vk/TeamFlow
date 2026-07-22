"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/common/auth-guard";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useAuth } from "@/providers/auth-provider";
import { OrganizationModal } from "./organization-modal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const { currentOrg, user, isLoading } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

        {/* Main Section */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {!isLoading && !currentOrg ? (
              <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center text-center">
                <Card className="max-w-md w-full border-dashed border-2 border-border p-6 shadow-none">
                  <CardHeader className="flex flex-col items-center pb-2">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">No Organization Selected</CardTitle>
                    <CardDescription className="text-sm">
                      You currently do not belong to an active organization workspace. Create a new organization as an Owner or join an existing organization by slug.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex flex-col space-y-3">
                    <Button onClick={() => setCreateOrgOpen(true)} className="w-full">
                      <Building2 className="mr-2 h-4 w-4" />
                      Create or Join Organization
                    </Button>
                  </CardContent>
                </Card>

                <OrganizationModal open={createOrgOpen} onOpenChange={setCreateOrgOpen} />
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
