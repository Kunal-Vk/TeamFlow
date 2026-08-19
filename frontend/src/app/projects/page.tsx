"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { projectService } from "@/services/project.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, updateProjectSchema, CreateProjectFormData, UpdateProjectFormData } from "@/schemas";
import { Project } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function ProjectsPage() {
  const { currentOrg, user } = useAuth();
  const orgSlug = currentOrg?.slug || "";
  const queryClient = useQueryClient();
  const toast = useToast();

  const isOwner = user?.role === "owner";

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Fetch Projects List
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", orgSlug],
    queryFn: () => projectService.getProjects(orgSlug),
    enabled: !!orgSlug,
    refetchInterval: 3000,
  });

  const projects = data?.data || [];
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create Project Mutation
  const createForm = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  });

  const createMutation = useMutation({
    mutationFn: (formData: CreateProjectFormData) => projectService.createProject(orgSlug, formData),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Project Created", `Successfully created "${res.data?.name}".`);
        queryClient.invalidateQueries({ queryKey: ["projects", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        createForm.reset();
        setCreateDialogOpen(false);
      } else {
        toast.error("Create Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to create project.");
    },
  });

  // Update Project Mutation
  const updateForm = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
  });

  const updateMutation = useMutation({
    mutationFn: ({ projectSlug, formData }: { projectSlug: string; formData: UpdateProjectFormData }) =>
      projectService.updateProject(orgSlug, projectSlug, formData),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Project Updated", "Project details saved successfully.");
        queryClient.invalidateQueries({ queryKey: ["projects", orgSlug] });
        setEditingProject(null);
      } else {
        toast.error("Update Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to update project.");
    },
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: (projectSlug: string) => projectService.deleteProject(orgSlug, projectSlug),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Project Deleted", "Project was deleted successfully.");
        queryClient.invalidateQueries({ queryKey: ["projects", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        setDeletingProject(null);
      } else {
        toast.error("Delete Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to delete project.");
    },
  });

  const handleCreateSubmit = (formData: CreateProjectFormData) => {
    createMutation.mutate(formData);
  };

  const handleUpdateSubmit = (formData: UpdateProjectFormData) => {
    if (!editingProject) return;
    updateMutation.mutate({ projectSlug: editingProject.slug, formData });
  };

  const startEdit = (p: Project) => {
    setEditingProject(p);
    updateForm.reset({
      name: p.name,
      description: p.description || "",
      slug: p.slug,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize workspace projects for{" "}
              <span className="font-semibold text-foreground">{currentOrg?.name}</span>
            </p>
          </div>

          {isOwner ? (
            <Button onClick={() => setCreateDialogOpen(true)} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          ) : (
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
              Member View Only
            </Badge>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">No projects found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery
                ? `No projects match "${searchQuery}"`
                : "Get started by creating your first project for this organization."}
            </p>
            {isOwner && !searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p) => (
              <Card key={p.id} className="group relative flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold line-clamp-1">{p.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          /{p.slug}
                        </Badge>
                      </div>
                    </div>

                    {isOwner && (
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => startEdit(p)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeletingProject(p)} destructive>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                        </DropdownMenuItem>
                      </DropdownMenu>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 mt-3 text-xs leading-relaxed">
                    {p.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                  <Link href={`/projects/${p.slug}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                      <span>View Tasks</span>
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent onClose={() => setCreateDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to organization {currentOrg?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proj-name">Project Name</Label>
                <Input id="proj-name" placeholder="API Gateway V2" {...createForm.register("name")} />
                {createForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-desc">Description (Optional)</Label>
                <Textarea id="proj-desc" placeholder="Project goals and technical specifications" rows={3} {...createForm.register("description")} />
                {createForm.formState.errors.description && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.description.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Project Modal */}
        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent onClose={() => setEditingProject(null)}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project details for {editingProject?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-proj-name">Project Name</Label>
                <Input id="edit-proj-name" {...updateForm.register("name")} />
                {updateForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-proj-slug">Project Slug</Label>
                <Input id="edit-proj-slug" {...updateForm.register("slug")} />
                {updateForm.formState.errors.slug && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-proj-desc">Description</Label>
                <Textarea id="edit-proj-desc" rows={3} {...updateForm.register("description")} />
                {updateForm.formState.errors.description && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.description.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
          <DialogContent onClose={() => setDeletingProject(null)}>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Delete Project</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{deletingProject?.name}</span>?
                This action cannot be undone and will delete all tasks and comments associated with this project.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingProject(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingProject && deleteMutation.mutate(deletingProject.slug)}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
