"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { orgService } from "@/services/org.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateOrgSchema, UpdateOrgFormData } from "@/schemas";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, Sun, Moon, Laptop, ShieldAlert, Edit2, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { currentOrg, user, refreshUserAndOrgs, setCurrentOrg } = useAuth();
  const orgSlug = currentOrg?.slug || "";
  const queryClient = useQueryClient();
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const isOwner = user?.role === "owner";

  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);

  // Update Org Form
  const updateOrgForm = useForm<UpdateOrgFormData>({
    resolver: zodResolver(updateOrgSchema),
  });

  const openEditModal = () => {
    if (currentOrg) {
      updateOrgForm.reset({
        name: currentOrg.name,
        description: currentOrg.description || "",
        slug: currentOrg.slug,
      });
    }
    setEditOrgOpen(true);
  };

  const updateOrgMutation = useMutation({
    mutationFn: (formData: UpdateOrgFormData) => orgService.updateOrganization(orgSlug, formData),
    onSuccess: async (res) => {
      if (res.success && res.data) {
        toast.success("Organization Updated", "Workspace details updated successfully.");
        setCurrentOrg(res.data);
        await refreshUserAndOrgs();
        setEditOrgOpen(false);
      } else {
        toast.error("Update Failed", res.message || "Failed to update organization.");
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to update organization.");
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: () => orgService.deleteOrganization(orgSlug),
    onSuccess: async (res) => {
      if (res.success) {
        toast.success("Organization Deleted", "Organization was deleted.");
        await refreshUserAndOrgs();
        setDeleteOrgOpen(false);
      } else {
        toast.error("Delete Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to delete organization.");
    },
  });

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Workspace Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure organization parameters and application appearance</p>
        </div>

        {/* Organization Settings Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Organization Settings</span>
              </CardTitle>
              <CardDescription>Manage workspace details for {currentOrg?.name}</CardDescription>
            </div>

            {isOwner && (
              <Button onClick={openEditModal} size="sm">
                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
              </Button>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Organization Name</div>
                <div className="font-semibold text-sm text-foreground">{currentOrg?.name}</div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Organization Slug</div>
                <div className="font-semibold text-sm text-foreground">/{currentOrg?.slug}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Description</div>
              <div className="text-sm text-foreground">{currentOrg?.description || "No description provided."}</div>
            </div>

            {isOwner && (
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-destructive">Danger Zone</div>
                  <div className="text-xs text-muted-foreground">Deleting this organization clears all members and permanently deletes projects, teams, tasks, and comments.</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setDeleteOrgOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Organization
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme & Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance & Theme</CardTitle>
            <CardDescription>Customize interface theme preference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  theme === "light" ? "border-primary bg-primary/10 font-bold" : "border-border hover:bg-accent"
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-xs">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  theme === "dark" ? "border-primary bg-primary/10 font-bold" : "border-border hover:bg-accent"
                }`}
              >
                <Moon className="h-6 w-6 text-indigo-400" />
                <span className="text-xs">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                  theme === "system" ? "border-primary bg-primary/10 font-bold" : "border-border hover:bg-accent"
                }`}
              >
                <Laptop className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Organization Modal */}
        <Dialog open={editOrgOpen} onOpenChange={setEditOrgOpen}>
          <DialogContent onClose={() => setEditOrgOpen(false)}>
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>Update details for {currentOrg?.name}</DialogDescription>
            </DialogHeader>

            <form onSubmit={updateOrgForm.handleSubmit((d) => updateOrgMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-org-name">Name</Label>
                <Input id="edit-org-name" {...updateOrgForm.register("name")} />
                {updateOrgForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{updateOrgForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-org-slug">Slug</Label>
                <Input id="edit-org-slug" {...updateOrgForm.register("slug")} />
                {updateOrgForm.formState.errors.slug && (
                  <p className="text-xs text-destructive">{updateOrgForm.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-org-desc">Description</Label>
                <Textarea id="edit-org-desc" rows={3} {...updateOrgForm.register("description")} />
                {updateOrgForm.formState.errors.description && (
                  <p className="text-xs text-destructive">{updateOrgForm.formState.errors.description.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOrgOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateOrgMutation.isPending}>
                  {updateOrgMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Organization Modal */}
        <Dialog open={deleteOrgOpen} onOpenChange={setDeleteOrgOpen}>
          <DialogContent onClose={() => setDeleteOrgOpen(false)}>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Delete Organization</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{currentOrg?.name}</span>?
                This will permanently delete all projects, teams, tasks, and comments.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOrgOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteOrgMutation.isPending}
                onClick={() => deleteOrgMutation.mutate()}
              >
                {deleteOrgMutation.isPending ? "Deleting..." : "Delete Organization"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
