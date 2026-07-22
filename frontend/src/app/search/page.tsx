"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { searchService } from "@/services/search.service";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, FolderKanban, Users, CheckSquare, ArrowRight, CornerDownRight } from "lucide-react";

export default function SearchPage() {
  const { currentOrg } = useAuth();
  const orgSlug = currentOrg?.slug || "";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute search query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", orgSlug, debouncedQuery],
    queryFn: () => searchService.search(orgSlug, debouncedQuery),
    enabled: !!orgSlug && debouncedQuery.length > 0,
  });

  const results = data?.data;
  const projects = results?.projects || [];
  const teams = results?.teams || [];
  const tasks = results?.tasks || [];
  const totalResults = projects.length + teams.length + tasks.length;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Global Search</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search projects, teams, and tasks across{" "}
            <span className="font-semibold text-foreground">{currentOrg?.name}</span>
          </p>
        </div>

        {/* Big Search Bar Input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Type to search projects, teams, or tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-4 text-base rounded-2xl shadow-sm border-border focus-visible:ring-primary"
            autoFocus
          />
          {isFetching && (
            <div className="absolute right-4 top-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {/* Results Section */}
        {debouncedQuery.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-semibold text-lg text-foreground">Start typing to search</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Search by project name, project slug, team name, or task title.
            </p>
          </Card>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : totalResults === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <h3 className="font-semibold text-lg text-foreground">No results found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No projects, teams, or tasks matched &quot;{debouncedQuery}&quot;.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-medium">
              <span>Found {totalResults} result(s)</span>
              <span>Showing matches for &quot;{debouncedQuery}&quot;</span>
            </div>

            {/* Projects Category */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  <span>Projects ({projects.length})</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.map((p) => (
                    <Card key={p.id} className="p-4 hover:border-primary/50 transition-all flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground">{p.name}</div>
                        <Badge variant="outline" className="text-[10px]">
                          /{p.slug}
                        </Badge>
                      </div>
                      <Link href={`/projects/${p.slug}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <span>View</span>
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Category */}
            {teams.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Teams ({teams.length})</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {teams.map((t) => (
                    <Card key={t.id} className="p-4 hover:border-primary/50 transition-all">
                      <div className="font-bold text-sm text-foreground">{t.name}</div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{t.description || "No description."}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Category */}
            {tasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500" />
                  <span>Tasks ({tasks.length})</span>
                </h3>
                <div className="divide-y divide-border rounded-xl border border-border bg-card">
                  {tasks.map((t) => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-foreground">{t.title}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={t.status === "DONE" ? "success" : "info"} className="text-[10px]">
                            {t.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {t.priority} Priority
                          </Badge>
                        </div>
                      </div>
                      <Link href="/tasks">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Go to Tasks
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
