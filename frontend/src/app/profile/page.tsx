"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { userService } from "@/services/user.service";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Mail, Shield, Building2, LogOut, LogOutIcon, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const { user, currentOrg, logout, logoutAll, refreshUserAndOrgs } = useAuth();
  const toast = useToast();

  const [leaveOrgDialogOpen, setLeaveOrgDialogOpen] = useState(false);

  const leaveOrgMutation = useMutation({
    mutationFn: () => userService.leaveOrganization(),
    onSuccess: async (res) => {
      if (res.success) {
        toast.success("Left Organization", "You have left the organization workspace.");
        await refreshUserAndOrgs();
        setLeaveOrgDialogOpen(false);
      } else {
        toast.error("Failed to Leave", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to leave organization.");
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">User Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information and active sessions</p>
        </div>

        {/* User Account Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center space-x-4">
              <Avatar name={user?.name} className="h-16 w-16 text-xl" />
              <div>
                <CardTitle className="text-xl font-bold">{user?.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user?.email}</span>
                </CardDescription>
              </div>
            </div>

            <Badge variant={user?.role === "owner" ? "default" : "secondary"} className="w-fit px-3 py-1 text-xs">
              {user?.role === "owner" ? "Organization Owner" : user?.role === "member" ? "Member" : "Unassigned User"}
            </Badge>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <div className="text-xs font-medium text-muted-foreground flex items-center">
                  <Building2 className="mr-1.5 h-4 w-4 text-primary" /> Active Organization
                </div>
                <div className="font-semibold text-sm text-foreground">{currentOrg?.name || "None"}</div>
                {currentOrg && <div className="text-xs text-muted-foreground">/{currentOrg.slug}</div>}
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <div className="text-xs font-medium text-muted-foreground flex items-center">
                  <User className="mr-1.5 h-4 w-4 text-primary" /> Account Role
                </div>
                <div className="font-semibold text-sm text-foreground capitalize">{user?.role || "Unassigned"}</div>
                <div className="text-xs text-muted-foreground">Permissions: {user?.role === "owner" ? "Full CRUD & Admin" : "Member Standard"}</div>
              </div>
            </div>

            {/* Leave Organization Option for Members */}
            {user?.role === "member" && currentOrg && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-foreground">Leave Organization Workspace</div>
                  <div className="text-xs text-muted-foreground">
                    Exit {currentOrg.name}. You will be removed from all projects, teams, and task assignments.
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setLeaveOrgDialogOpen(true)}
                >
                  <LogOutIcon className="mr-1.5 h-3.5 w-3.5" /> Leave Workspace
                </Button>
              </div>
            )}

            {/* Security Actions */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-bold text-foreground">Session & Security Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={logout} className="w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out Current Device
                </Button>
                <Button variant="destructive" onClick={logoutAll} className="w-full sm:w-auto">
                  <Shield className="mr-2 h-4 w-4" />
                  Sign Out All Devices
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Organization Confirmation Modal */}
        <Dialog open={leaveOrgDialogOpen} onOpenChange={setLeaveOrgDialogOpen}>
          <DialogContent onClose={() => setLeaveOrgDialogOpen(false)}>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Leave Organization</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to leave <span className="font-semibold text-foreground">{currentOrg?.name}</span>?
                You will lose access to all projects, teams, and assigned tasks.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setLeaveOrgDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={leaveOrgMutation.isPending}
                onClick={() => leaveOrgMutation.mutate()}
              >
                {leaveOrgMutation.isPending ? "Leaving..." : "Confirm Leave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
