"use client";

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { dashboardService } from "@/services/dashboard.service";
import { projectService } from "@/services/project.service";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FolderKanban,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  History,
} from "lucide-react";

export default function DashboardPage() {
  const { currentOrg, user } = useAuth();
  const orgSlug = currentOrg?.slug || "";

  // Fetch Dashboard Stats
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["dashboard", orgSlug],
    queryFn: () => dashboardService.getDashboard(orgSlug),
    enabled: !!orgSlug,
    refetchInterval: 3000,
  });

  // Fetch Recent Projects
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
  } = useQuery({
    queryKey: ["projects", orgSlug],
    queryFn: () => projectService.getProjects(orgSlug),
    enabled: !!orgSlug,
    refetchInterval: 3000,
  });

  // Fetch Audit Logs for Workspace
  const {
    data: auditLogsData,
    isLoading: isAuditLogsLoading,
  } = useQuery({
    queryKey: ["auditLogs", orgSlug],
    queryFn: () => dashboardService.getAuditLogs(orgSlug),
    enabled: !!orgSlug,
    refetchInterval: 3000,
  });

  const stats = dashboardData?.data;
  const recentProjects = projectsData?.data?.slice(0, 5) || [];
  const auditLogs = auditLogsData?.data || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of metrics and activities for{" "}
              <span className="font-semibold text-foreground">{currentOrg?.name}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {user?.role === "owner" && (
              <Link href="/projects">
                <Button size="sm" className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Projects Metric */}
          <Card className="hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FolderKanban className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalProjects ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" /> Active organization projects
              </p>
            </CardContent>
          </Card>

          {/* Teams Metric */}
          <Card className="hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalTeams ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Cross-functional groups</p>
            </CardContent>
          </Card>

          {/* Members Metric */}
          <Card className="hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalMembers ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Active team collaborators</p>
            </CardContent>
          </Card>

          {/* Total Tasks Metric */}
          <Card className="hover:border-primary/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ListTodo className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.totalTasks ?? 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tracked task items</p>
            </CardContent>
          </Card>
        </div>

        {/* Task Breakdown Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {stats?.completedTasks ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Pending Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {stats?.pendingTasks ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 bg-rose-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Overdue Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                  {stats?.overdueTasks ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail Section */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Workspace Status Audit Trail</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Real-Time Audit Log
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Live audit trail of task status modifications across all workspace projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuditLogsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                No task status modifications logged yet.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {auditLogs.map((log) => {
                  const cleanMessage = log.content
                    .replace("[AUDIT_LOG]", "")
                    .replace("[Audit Trail]", "")
                    .trim();

                  return (
                    <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                          <History className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{cleanMessage}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Task: <span className="font-medium text-foreground">{log.taskTitle}</span> (/{log.projectSlug})
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground whitespace-nowrap pl-4">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects Section */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Projects inside {currentOrg?.name}</CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-xs">
                <span>View All</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isProjectsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
                <FolderKanban className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No projects found</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first project to start organizing tasks</p>
                {user?.role === "owner" && (
                  <Link href="/projects">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Create Project
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <Link href={`/projects/${p.slug}`} className="font-semibold text-sm hover:underline text-foreground">
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
                          {p.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-[10px]">
                        /{p.slug}
                      </Badge>
                      <Link href={`/projects/${p.slug}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          Tasks
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
