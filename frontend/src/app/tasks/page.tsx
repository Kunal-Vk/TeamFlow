"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import { commentService } from "@/services/comment.service";
import { userService } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTaskSchema,
  updateTaskSchema,
  createCommentSchema,
  updateCommentSchema,
  CreateTaskFormData,
  UpdateTaskFormData,
  CreateCommentFormData,
  UpdateCommentFormData,
} from "@/schemas";
import { Task, Comment, Project, User } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import {
  CheckSquare,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  User as UserIcon,
  MessageSquare,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FolderKanban,
  Send,
  ShieldCheck,
  Check,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function TasksPage() {
  const { currentOrg, user } = useAuth();
  const orgSlug = currentOrg?.slug || "";
  const queryClient = useQueryClient();
  const toast = useToast();

  const isOwner = user?.role === "owner";

  // Selected Project State
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Multi-Assignee State
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [activeTaskForComments, setActiveTaskForComments] = useState<Task | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  // Fetch Projects to fill project selector
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", orgSlug],
    queryFn: () => projectService.getProjects(orgSlug),
    enabled: !!orgSlug,
  });

  const projects = projectsData?.data || [];

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectSlug) {
      setSelectedProjectSlug(projects[0].slug);
    }
  }, [projects, selectedProjectSlug]);

  // Fetch Org Members (for task assignment)
  const { data: membersData } = useQuery({
    queryKey: ["members", orgSlug],
    queryFn: () => userService.getOrgMembers(orgSlug),
    enabled: !!orgSlug,
  });

  const members = membersData?.data || [];

  // Fetch Tasks for Selected Project
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", orgSlug, selectedProjectSlug],
    queryFn: () => taskService.getTasks(orgSlug, selectedProjectSlug),
    enabled: !!orgSlug && !!selectedProjectSlug,
  });

  const tasks = tasksData?.data || [];

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Fetch Comments for Active Task
  const { data: commentsData, isLoading: isCommentsLoading } = useQuery({
    queryKey: ["comments", orgSlug, selectedProjectSlug, activeTaskForComments?.id],
    queryFn: () => commentService.getComments(orgSlug, selectedProjectSlug, activeTaskForComments!.id),
    enabled: !!orgSlug && !!selectedProjectSlug && !!activeTaskForComments,
  });

  const comments = commentsData?.data || [];

  // Create Task Mutation
  const createTaskForm = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { status: "TODO", priority: "MEDIUM" },
  });

  const createTaskMutation = useMutation({
    mutationFn: (formData: CreateTaskFormData) =>
      taskService.createTask(orgSlug, selectedProjectSlug, {
        ...formData,
        assigneeIds: selectedAssigneeIds,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Task Created", `Successfully created task "${res.data?.title}".`);
        queryClient.invalidateQueries({ queryKey: ["tasks", orgSlug, selectedProjectSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        createTaskForm.reset();
        setSelectedAssigneeIds([]);
        setCreateTaskOpen(false);
      } else {
        toast.error("Create Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to create task.");
    },
  });

  // Update Task Mutation
  const updateTaskForm = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, formData }: { taskId: string; formData: UpdateTaskFormData }) =>
      taskService.updateTask(orgSlug, selectedProjectSlug, taskId, {
        ...formData,
        assigneeIds: selectedAssigneeIds,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Task Updated", "Task updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["tasks", orgSlug, selectedProjectSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["comments", orgSlug, selectedProjectSlug, activeTaskForComments?.id] });
        setEditingTask(null);
      } else {
        toast.error("Update Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to update task.");
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(orgSlug, selectedProjectSlug, taskId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Task Deleted", "Task removed successfully.");
        queryClient.invalidateQueries({ queryKey: ["tasks", orgSlug, selectedProjectSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        setDeletingTask(null);
      } else {
        toast.error("Delete Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to delete task.");
    },
  });

  // Create Comment Mutation
  const createCommentForm = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
  });

  const createCommentMutation = useMutation({
    mutationFn: (formData: CreateCommentFormData) =>
      commentService.createComment(orgSlug, selectedProjectSlug, activeTaskForComments!.id, formData),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Comment Added");
        queryClient.invalidateQueries({ queryKey: ["comments", orgSlug, selectedProjectSlug, activeTaskForComments?.id] });
        createCommentForm.reset();
      } else {
        toast.error("Comment Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to add comment.");
    },
  });

  // Update Comment Mutation
  const updateCommentForm = useForm<UpdateCommentFormData>({
    resolver: zodResolver(updateCommentSchema),
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, formData }: { commentId: string; formData: UpdateCommentFormData }) =>
      commentService.updateComment(orgSlug, selectedProjectSlug, activeTaskForComments!.id, commentId, formData),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Comment Updated");
        queryClient.invalidateQueries({ queryKey: ["comments", orgSlug, selectedProjectSlug, activeTaskForComments?.id] });
        setEditingComment(null);
      } else {
        toast.error("Update Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to edit comment.");
    },
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      commentService.deleteComment(orgSlug, selectedProjectSlug, activeTaskForComments!.id, commentId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Comment Deleted");
        queryClient.invalidateQueries({ queryKey: ["comments", orgSlug, selectedProjectSlug, activeTaskForComments?.id] });
      } else {
        toast.error("Delete Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to delete comment.");
    },
  });

  const startEditTask = (t: Task) => {
    setEditingTask(t);
    setSelectedAssigneeIds(t.assigneeIds || (t.assignedTo ? [t.assignedTo] : []));
    updateTaskForm.reset({
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo || null,
      dueDate: t.dueDate || null,
    });
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Tasks Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, assign, and track project tasks in{" "}
              <span className="font-semibold text-foreground">{currentOrg?.name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isOwner && selectedProjectSlug && (
              <Button onClick={() => { setSelectedAssigneeIds([]); setCreateTaskOpen(true); }} className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            )}
          </div>
        </div>

        {/* Project Selector & Filter Bar */}
        <Card className="p-4 bg-card shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Project Dropdown Select */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 max-w-xl">
              <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Select Project:</Label>
              {isProjectsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : projects.length === 0 ? (
                <span className="text-xs text-muted-foreground">No projects created yet.</span>
              ) : (
                <Select
                  value={selectedProjectSlug}
                  onChange={(e) => setSelectedProjectSlug(e.target.value)}
                  className="font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} (/{p.slug})
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* Status & Priority Filters */}
            <div className="flex items-center space-x-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs w-28"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>

              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 text-xs w-28"
              >
                <option value="ALL">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Task Cards Grid */}
        {!selectedProjectSlug ? (
          <Card className="p-12 text-center border-dashed">
            <p className="text-sm text-muted-foreground">Please create a project first before creating tasks.</p>
          </Card>
        ) : isTasksLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              No tasks match your filters in this project.
            </p>
            {isOwner && (
              <Button onClick={() => setCreateTaskOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create First Task
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((t) => {
              const isAssigned =
                t.assignedTo === user?.id || (t.assigneeIds && t.assigneeIds.includes(user?.id || ""));
              const canEditTask = isOwner || isAssigned;
              const taskAssigneesList = t.assignees || (t.assignedTo ? members.filter((m) => m.id === t.assignedTo) : []);

              return (
                <Card key={t.id} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            t.status === "DONE"
                              ? "success"
                              : t.status === "IN_PROGRESS"
                              ? "info"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {t.status}
                        </Badge>
                        <Badge
                          variant={
                            t.priority === "HIGH"
                              ? "destructive"
                              : t.priority === "MEDIUM"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {t.priority}
                        </Badge>
                      </div>

                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem onClick={() => setActiveTaskForComments(t)}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Comments & Audit Log
                        </DropdownMenuItem>
                        {canEditTask && (
                          <DropdownMenuItem onClick={() => startEditTask(t)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit / Update Status
                          </DropdownMenuItem>
                        )}
                        {isOwner && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeletingTask(t)} destructive>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenu>
                    </div>

                    <CardTitle className="text-base font-bold mt-2 line-clamp-1">{t.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {t.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 text-xs space-y-2">
                    {/* Multi-Assignee Avatar List */}
                    <div className="flex items-center justify-between text-muted-foreground pt-1">
                      <div className="flex items-center space-x-1.5">
                        <UserIcon className="h-3.5 w-3.5 shrink-0" />
                        {taskAssigneesList.length === 0 ? (
                          <span className="text-[11px]">Unassigned</span>
                        ) : (
                          <div className="flex items-center -space-x-1 overflow-hidden">
                            {taskAssigneesList.map((a) => (
                              <Avatar key={a.id} name={a.name} className="h-5 w-5 text-[9px] border border-background" />
                            ))}
                            <span className="text-[11px] font-medium ml-1.5 text-foreground">
                              {taskAssigneesList.map((a) => a.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      {t.dueDate && (
                        <span className="flex items-center text-[10px]">
                          <Calendar className="mr-1 h-3 w-3" /> {t.dueDate}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTaskForComments(t)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Discussion & Audit
                    </Button>

                    {!canEditTask && (
                      <span className="text-[10px] text-muted-foreground italic">View Only</span>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Task Modal */}
        <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
          <DialogContent onClose={() => setCreateTaskOpen(false)}>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a task with status, priority, and assignees</DialogDescription>
            </DialogHeader>

            <form onSubmit={createTaskForm.handleSubmit((d) => createTaskMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input id="task-title" placeholder="Implement Refresh Token Rotation" {...createTaskForm.register("title")} />
                {createTaskForm.formState.errors.title && (
                  <p className="text-xs text-destructive">{createTaskForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-desc">Description (Optional)</Label>
                <Textarea id="task-desc" placeholder="Details and acceptance criteria..." rows={3} {...createTaskForm.register("description")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select id="task-status" {...createTaskForm.register("status")}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select id="task-priority" {...createTaskForm.register("priority")}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>
                </div>
              </div>

              {/* Multiple Assignees Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Assignees (Select Multiple)</Label>
                <div className="border border-border rounded-lg p-3 max-h-36 overflow-y-auto space-y-1.5">
                  {members.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No members in organization.</p>
                  ) : (
                    members.map((m) => {
                      const isSelected = selectedAssigneeIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleAssignee(m.id)}
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs ${
                            isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar name={m.name} className="h-6 w-6 text-[10px]" />
                            <span className="font-medium text-foreground">{m.name}</span>
                            <span className="text-[10px] text-muted-foreground">({m.email})</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-duedate">Due Date</Label>
                <Input id="task-duedate" type="date" {...createTaskForm.register("dueDate")} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Task Modal */}
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent onClose={() => setEditingTask(null)}>
            <DialogHeader>
              <DialogTitle>Edit Task & Update Status</DialogTitle>
              <DialogDescription>Update status or assignees for {editingTask?.title}</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={updateTaskForm.handleSubmit((d) => editingTask && updateTaskMutation.mutate({ taskId: editingTask.id, formData: d }))}
              className="space-y-4"
            >
              {isOwner && (
                <div className="space-y-2">
                  <Label htmlFor="edit-task-title">Title</Label>
                  <Input id="edit-task-title" {...updateTaskForm.register("title")} />
                </div>
              )}

              {isOwner && (
                <div className="space-y-2">
                  <Label htmlFor="edit-task-desc">Description</Label>
                  <Textarea id="edit-task-desc" rows={3} {...updateTaskForm.register("description")} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-status">Status</Label>
                  <Select id="edit-task-status" {...updateTaskForm.register("status")}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done (Completed)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-task-priority">Priority</Label>
                  <Select id="edit-task-priority" {...updateTaskForm.register("priority")} disabled={!isOwner}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>
                </div>
              </div>

              {isOwner && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Assignees (Select Multiple)</Label>
                  <div className="border border-border rounded-lg p-3 max-h-36 overflow-y-auto space-y-1.5">
                    {members.map((m) => {
                      const isSelected = selectedAssigneeIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleAssignee(m.id)}
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs ${
                            isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar name={m.name} className="h-6 w-6 text-[10px]" />
                            <span className="font-medium text-foreground">{m.name}</span>
                            <span className="text-[10px] text-muted-foreground">({m.email})</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Task Confirmation Modal */}
        <Dialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
          <DialogContent onClose={() => setDeletingTask(null)}>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Delete Task</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{deletingTask?.title}</span>?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTask(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteTaskMutation.isPending}
                onClick={() => deletingTask && deleteTaskMutation.mutate(deletingTask.id)}
              >
                {deleteTaskMutation.isPending ? "Deleting..." : "Delete Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Details, Comments & SYSTEM AUDIT TRAIL Modal */}
        <Dialog open={!!activeTaskForComments} onOpenChange={(open) => !open && setActiveTaskForComments(null)}>
          <DialogContent onClose={() => setActiveTaskForComments(null)} className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Badge variant={activeTaskForComments?.status === "DONE" ? "success" : "info"}>
                  {activeTaskForComments?.status}
                </Badge>
                <Badge variant="outline">{activeTaskForComments?.priority} Priority</Badge>
              </div>
              <DialogTitle className="text-xl mt-2">{activeTaskForComments?.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {activeTaskForComments?.description || "No description provided."}
              </DialogDescription>
            </DialogHeader>

            {/* Comments & System Audit Trail Section */}
            <div className="space-y-4 py-4 border-t border-border max-h-[350px] overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Discussion & Audit Trail ({comments.length})</span>
              </h4>

              {isCommentsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No discussion comments or audit logs yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => {
                    const isAuditLog = c.content.includes("[AUDIT_LOG]") || c.content.includes("[Audit Trail]");
                    const isCommentAuthor = c.userId === user?.id;
                    const canManageComment = isOwner || isCommentAuthor;

                    // Render Highlighted System Audit Trail Banner for Status Changes
                    if (isAuditLog) {
                      const cleanMessage = c.content
                        .replace("[AUDIT_LOG]", "")
                        .replace("[Audit Trail]", "")
                        .trim();

                      return (
                        <div
                          key={c.id}
                          className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                              <ShieldCheck className="h-4 w-4" />
                              <span>SYSTEM AUDIT LOG</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-foreground font-semibold">{cleanMessage}</p>
                        </div>
                      );
                    }

                    // Render Standard User Discussion Comment
                    return (
                      <div key={c.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-foreground">
                              {members.find((m) => m.id === c.userId)?.name || "Member"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {canManageComment && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setEditingComment(c);
                                  updateCommentForm.reset({ content: c.content });
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteCommentMutation.mutate(c.id)}
                                className="p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingComment?.id === c.id ? (
                          <form
                            onSubmit={updateCommentForm.handleSubmit((d) =>
                              updateCommentMutation.mutate({ commentId: c.id, formData: d })
                            )}
                            className="space-y-2 pt-1"
                          >
                            <Input {...updateCommentForm.register("content")} className="text-xs h-8" />
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingComment(null)} className="h-6 text-xs">
                                Cancel
                              </Button>
                              <Button type="submit" size="sm" disabled={updateCommentMutation.isPending} className="h-6 text-xs">
                                Save
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-foreground leading-relaxed">{c.content}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={createCommentForm.handleSubmit((d) => createCommentMutation.mutate(d))} className="flex items-center space-x-2 pt-2">
              <Input placeholder="Write a comment..." className="text-xs" {...createCommentForm.register("content")} />
              <Button type="submit" size="sm" disabled={createCommentMutation.isPending}>
                <Send className="h-3.5 w-3.5 mr-1" /> Send
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
