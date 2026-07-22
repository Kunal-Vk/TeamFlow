"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import { userService } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, FolderKanban, Plus, ListTodo, CheckCircle2, Clock, Calendar, Users, UserPlus, UserMinus } from "lucide-react";

export default function SingleProjectPage({ params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = use(params);
  const { currentOrg, user } = useAuth();
  const orgSlug = currentOrg?.slug || "";
  const queryClient = useQueryClient();
  const toast = useToast();

  const isOwner = user?.role === "owner";

  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");

  // Fetch Single Project
  const {
    data: projectData,
    isLoading: isProjectLoading,
  } = useQuery({
    queryKey: ["project", orgSlug, projectSlug],
    queryFn: () => projectService.getProjectBySlug(orgSlug, projectSlug),
    enabled: !!orgSlug && !!projectSlug,
  });

  // Fetch Project Tasks
  const {
    data: tasksData,
    isLoading: isTasksLoading,
  } = useQuery({
    queryKey: ["tasks", orgSlug, projectSlug],
    queryFn: () => taskService.getTasks(orgSlug, projectSlug),
    enabled: !!orgSlug && !!projectSlug,
  });

  // Fetch Project Explicit Members
  const {
    data: projectMembersData,
    isLoading: isProjectMembersLoading,
  } = useQuery({
    queryKey: ["projectMembers", orgSlug, projectSlug],
    queryFn: () => projectService.getProjectMembers(orgSlug, projectSlug),
    enabled: !!orgSlug && !!projectSlug,
  });

  // Fetch All Org Members
  const { data: orgMembersData } = useQuery({
    queryKey: ["members", orgSlug],
    queryFn: () => userService.getOrgMembers(orgSlug),
    enabled: !!orgSlug,
  });

  const project = projectData?.data;
  const tasks = tasksData?.data || [];
  const projectMembers = projectMembersData?.data || [];
  const orgMembers = orgMembersData?.data || [];

  // Add Member to Project Mutation
  const addProjectMemberMutation = useMutation({
    mutationFn: (userId: string) => projectService.addProjectMember(orgSlug, projectSlug, userId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Member Added to Project");
        queryClient.invalidateQueries({ queryKey: ["projectMembers", orgSlug, projectSlug] });
        setSelectedUserToAdd("");
      } else {
        toast.error("Failed to Add Member", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to add project member.");
    },
  });

  // Remove Member from Project Mutation
  const removeProjectMemberMutation = useMutation({
    mutationFn: (userId: string) => projectService.removeProjectMember(orgSlug, projectSlug, userId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Member Removed from Project");
        queryClient.invalidateQueries({ queryKey: ["projectMembers", orgSlug, projectSlug] });
      } else {
        toast.error("Failed to Remove Member", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to remove project member.");
    },
  });

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation back */}
        <div className="flex items-center space-x-2">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-xs">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Projects
            </Button>
          </Link>
        </div>

        {/* Project Header */}
        {isProjectLoading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : !project ? (
          <Card className="p-8 text-center border-dashed">
            <h3 className="font-semibold text-lg">Project not found</h3>
            <p className="text-sm text-muted-foreground mt-1">The requested project slug could not be located.</p>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      /{project.slug}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">{project.description || "No description provided."}</CardDescription>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isOwner && (
                  <Button variant="outline" size="sm" onClick={() => setManageMembersOpen(true)}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Project Members ({projectMembers.length})
                  </Button>
                )}
                {!isOwner && projectMembers.some((pm) => pm.id === user?.id) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={removeProjectMemberMutation.isPending}
                    onClick={() => user && removeProjectMemberMutation.mutate(user.id)}
                  >
                    <UserMinus className="mr-1.5 h-3.5 w-3.5" /> Leave Project
                  </Button>
                )}
                <Link href="/tasks">
                  <Button size="sm">
                    <ListTodo className="mr-2 h-4 w-4" /> View All Tasks
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Assigned Project Members Bar */}
        {project && (
          <Card className="p-4 bg-muted/20 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Project Team Members ({projectMembers.length})
                </span>
              </div>

              {isProjectMembersLoading ? (
                <Skeleton className="h-6 w-36" />
              ) : projectMembers.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">No members assigned to this project yet.</span>
              ) : (
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {projectMembers.map((m) => (
                    <div key={m.id} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-border bg-card text-xs">
                      <Avatar name={m.name} className="h-5 w-5 text-[9px]" />
                      <span className="font-medium text-foreground">{m.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Task Columns Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* TODO Column */}
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>To Do</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {todoTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isTasksLoading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : todoTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No TODO tasks</p>
              ) : (
                todoTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1 shadow-2xs">
                    <div className="font-semibold text-foreground">{t.title}</div>
                    {t.description && <p className="text-muted-foreground line-clamp-2">{t.description}</p>}
                    <div className="pt-2 flex items-center justify-between">
                      <Badge variant={t.priority === "HIGH" ? "destructive" : t.priority === "MEDIUM" ? "warning" : "secondary"}>
                        {t.priority}
                      </Badge>
                      {t.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          <Calendar className="mr-1 h-3 w-3" /> {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* IN_PROGRESS Column */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>In Progress</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {inProgressTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isTasksLoading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : inProgressTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No tasks in progress</p>
              ) : (
                inProgressTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1 shadow-2xs">
                    <div className="font-semibold text-foreground">{t.title}</div>
                    {t.description && <p className="text-muted-foreground line-clamp-2">{t.description}</p>}
                    <div className="pt-2 flex items-center justify-between">
                      <Badge variant={t.priority === "HIGH" ? "destructive" : t.priority === "MEDIUM" ? "warning" : "secondary"}>
                        {t.priority}
                      </Badge>
                      {t.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          <Calendar className="mr-1 h-3 w-3" /> {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* DONE Column */}
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Completed</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {doneTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isTasksLoading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : doneTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No completed tasks</p>
              ) : (
                doneTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1 shadow-2xs opacity-80">
                    <div className="font-semibold text-foreground line-through">{t.title}</div>
                    {t.description && <p className="text-muted-foreground line-clamp-2">{t.description}</p>}
                    <div className="pt-2 flex items-center justify-between">
                      <Badge variant="success">DONE</Badge>
                      {t.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center">
                          <Calendar className="mr-1 h-3 w-3" /> {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Manage Project Members Modal */}
        <Dialog open={manageMembersOpen} onOpenChange={setManageMembersOpen}>
          <DialogContent onClose={() => setManageMembersOpen(false)} className="max-w-md">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <DialogTitle>Project Members: {project?.name}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Assign organization members to work on project {project?.name}
              </DialogDescription>
            </DialogHeader>

            {/* Add Member Dropdown */}
            {isOwner && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-xs font-semibold">Add Member to Project</Label>
                <div className="flex space-x-2">
                  <Select
                    value={selectedUserToAdd}
                    onChange={(e) => setSelectedUserToAdd(e.target.value)}
                    className="text-xs flex-1"
                  >
                    <option value="">Select Organization Member...</option>
                    {orgMembers
                      .filter((om) => !projectMembers.some((pm) => pm.id === om.id))
                      .map((om) => (
                        <option key={om.id} value={om.id}>
                          {om.name} ({om.email})
                        </option>
                      ))}
                  </Select>
                  <Button
                    size="sm"
                    disabled={!selectedUserToAdd || addProjectMemberMutation.isPending}
                    onClick={() => selectedUserToAdd && addProjectMemberMutation.mutate(selectedUserToAdd)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Project Members List */}
            <div className="space-y-3 pt-4 border-t border-border max-h-60 overflow-y-auto">
              <h4 className="text-xs font-semibold text-muted-foreground">Current Project Members ({projectMembers.length})</h4>
              {isProjectMembersLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : projectMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">No members assigned to this project yet.</p>
              ) : (
                <div className="space-y-2">
                  {projectMembers.map((pm) => (
                    <div key={pm.id} className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <Avatar name={pm.name} className="h-7 w-7" />
                        <div>
                          <div className="font-semibold text-foreground">{pm.name}</div>
                          <div className="text-[10px] text-muted-foreground">{pm.email}</div>
                        </div>
                      </div>

                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={removeProjectMemberMutation.isPending}
                          onClick={() => removeProjectMemberMutation.mutate(pm.id)}
                          className="h-7 px-2 text-destructive hover:bg-destructive/10"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setManageMembersOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
