"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/providers/auth-provider";
import { teamService, TeamMember } from "@/services/team.service";
import { userService } from "@/services/user.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTeamSchema,
  updateTeamSchema,
  searchUserSchema,
  CreateTeamFormData,
  UpdateTeamFormData,
  SearchUserFormData,
} from "@/schemas";
import { Team, User } from "@/types";
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
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  Mail,
  ShieldAlert,
  Building2,
  UserCheck,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function TeamsPage() {
  const { currentOrg, user, refreshUserAndOrgs } = useAuth();
  const orgSlug = currentOrg?.slug || "";
  const queryClient = useQueryClient();
  const toast = useToast();

  const isOwner = user?.role === "owner";

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [managingTeamMembers, setManagingTeamMembers] = useState<Team | null>(null);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>("");
  const [foundUser, setFoundUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // Fetch Teams List
  const { data: teamsData, isLoading: isTeamsLoading } = useQuery({
    queryKey: ["teams", orgSlug],
    queryFn: () => teamService.getTeams(orgSlug),
    enabled: !!orgSlug,
    refetchInterval: 3000,
  });

  // Fetch Org Members List
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", orgSlug],
    queryFn: () => userService.getOrgMembers(orgSlug),
    enabled: !!orgSlug,
    refetchInterval: 3000,
  });

  const teams = teamsData?.data || [];
  const members = membersData?.data || [];

  // Fetch Members for active Team being managed
  const { data: teamMembersData, isLoading: isTeamMembersLoading } = useQuery({
    queryKey: ["teamMembers", orgSlug, managingTeamMembers?.id],
    queryFn: () => teamService.getTeamMembers(orgSlug, managingTeamMembers!.id),
    enabled: !!orgSlug && !!managingTeamMembers,
    refetchInterval: 3000,
  });

  const currentTeamMembers = teamMembersData?.data || [];

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create Team Mutation
  const createForm = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
  });

  const createMutation = useMutation({
    mutationFn: (formData: CreateTeamFormData) => teamService.createTeam(orgSlug, formData),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Team Created", `Successfully created team "${res.data?.name}".`);
        queryClient.invalidateQueries({ queryKey: ["teams", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        createForm.reset();
        setCreateDialogOpen(false);
      } else {
        toast.error("Create Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to create team.");
    },
  });

  // Update Team Mutation
  const updateForm = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema),
  });

  const updateMutation = useMutation({
    mutationFn: ({ teamId, formData }: { teamId: string; formData: UpdateTeamFormData }) =>
      teamService.updateTeam(orgSlug, teamId, formData),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Team Updated", "Team details updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["teams", orgSlug] });
        setEditingTeam(null);
      } else {
        toast.error("Update Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to update team.");
    },
  });

  // Delete Team Mutation
  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(orgSlug, teamId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Team Deleted", "Team deleted successfully.");
        queryClient.invalidateQueries({ queryKey: ["teams", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        setDeletingTeam(null);
      } else {
        toast.error("Delete Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to delete team.");
    },
  });

  // Add Member to Team Mutation
  const addTeamMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.addTeamMember(orgSlug, managingTeamMembers!.id, userId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Member Added to Team");
        queryClient.invalidateQueries({ queryKey: ["teamMembers", orgSlug, managingTeamMembers?.id] });
        setSelectedUserToAdd("");
      } else {
        toast.error("Add Member Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to add member to team.");
    },
  });

  // Remove Member from Team Mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: (userId: string) => teamService.removeTeamMember(orgSlug, managingTeamMembers!.id, userId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Member Removed from Team");
        queryClient.invalidateQueries({ queryKey: ["teamMembers", orgSlug, managingTeamMembers?.id] });
      } else {
        toast.error("Remove Member Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to remove member from team.");
    },
  });

  // Search User by Email Mutation
  const searchUserForm = useForm<SearchUserFormData>({
    resolver: zodResolver(searchUserSchema),
  });

  const searchUserMutation = useMutation({
    mutationFn: (email: string) => userService.searchUserByEmail(email),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setFoundUser(res.data);
        toast.success("User Found", `Found account for ${res.data.email}`);
      } else {
        setFoundUser(null);
        toast.error("User Not Found", res.message || "No user matches this email.");
      }
    },
    onError: (err: any) => {
      setFoundUser(null);
      toast.error("Search Error", err?.response?.data?.message || "User search failed.");
    },
  });

  // Add User to Org Mutation
  const addUserMutation = useMutation({
    mutationFn: (userId: string) => userService.addUserToOrg(orgSlug, userId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Member Added", `Added ${res.data?.name} to organization.`);
        queryClient.invalidateQueries({ queryKey: ["members", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        setFoundUser(null);
        searchUserForm.reset();
        setAddMemberDialogOpen(false);
      } else {
        toast.error("Add Member Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to add member.");
    },
  });

  // Remove User from Org Mutation
  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => userService.removeUserFromOrg(orgSlug, userId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Member Removed", "Member was removed from the organization.");
        queryClient.invalidateQueries({ queryKey: ["members", orgSlug] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", orgSlug] });
        refreshUserAndOrgs();
      } else {
        toast.error("Remove Member Failed", res.message);
      }
    },
    onError: (err: any) => {
      toast.error("Error", err?.response?.data?.message || "Failed to remove member.");
    },
  });

  const startEdit = (t: Team) => {
    setEditingTeam(t);
    updateForm.reset({
      name: t.name,
      description: t.description || "",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Teams & Members</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team groups and organization members for{" "}
              <span className="font-semibold text-foreground">{currentOrg?.name}</span>
            </p>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => setAddMemberDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Member to Org
              </Button>
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Team
              </Button>
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Teams ({teams.length})</span>
            </h2>
            <div className="w-64">
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {isTeamsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">No teams found matching your search.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((t) => (
                <Card key={t.id} className="hover:border-primary/50 transition-all flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Users className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-bold">{t.name}</CardTitle>
                      </div>

                      {isOwner && (
                        <DropdownMenu
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownMenuItem onClick={() => setManagingTeamMembers(t)}>
                            <UserCheck className="mr-2 h-4 w-4" /> Manage Team Members
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEdit(t)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Team
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeletingTeam(t)} destructive>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Team
                          </DropdownMenuItem>
                        </DropdownMenu>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-2">{t.description || "No description provided."}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
                    <span>Created {new Date(t.createdAt).toLocaleDateString()}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManagingTeamMembers(t)}
                      className="h-7 text-xs"
                    >
                      <Users className="mr-1.5 h-3.5 w-3.5" /> Members
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Organization Members Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Organization Members ({members.length})</h2>
              <p className="text-xs text-muted-foreground">Users who belong to {currentOrg?.name}</p>
            </div>
          </div>

          {isMembersLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <Card>
              <div className="divide-y divide-border">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar name={m.name} className="h-9 w-9" />
                      <div>
                        <div className="font-semibold text-sm text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={m.role === "owner" ? "default" : "secondary"} className="text-xs">
                        {m.role === "owner" ? "Owner" : "Member"}
                      </Badge>

                      {isOwner && m.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={removeUserMutation.isPending}
                          onClick={() => removeUserMutation.mutate(m.id)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <UserMinus className="mr-1 h-3.5 w-3.5" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Manage Team Members Modal */}
        <Dialog open={!!managingTeamMembers} onOpenChange={(open) => !open && setManagingTeamMembers(null)}>
          <DialogContent onClose={() => setManagingTeamMembers(null)} className="max-w-md">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <DialogTitle>Team Members: {managingTeamMembers?.name}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Add or remove organization members assigned to team {managingTeamMembers?.name}
              </DialogDescription>
            </DialogHeader>

            {/* Add Member Dropdown */}
            {isOwner && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-xs font-semibold">Add Member to Team</Label>
                <div className="flex space-x-2">
                  <Select
                    value={selectedUserToAdd}
                    onChange={(e) => setSelectedUserToAdd(e.target.value)}
                    className="text-xs flex-1"
                  >
                    <option value="">Select Organization Member...</option>
                    {members
                      .filter((m) => !currentTeamMembers.some((tm) => tm.id === m.id))
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                  </Select>
                  <Button
                    size="sm"
                    disabled={!selectedUserToAdd || addTeamMemberMutation.isPending}
                    onClick={() => selectedUserToAdd && addTeamMemberMutation.mutate(selectedUserToAdd)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Team Members List */}
            <div className="space-y-3 pt-4 border-t border-border max-h-60 overflow-y-auto">
              <h4 className="text-xs font-semibold text-muted-foreground">Current Team Members ({currentTeamMembers.length})</h4>
              {isTeamMembersLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : currentTeamMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">No members assigned to this team yet.</p>
              ) : (
                <div className="space-y-2">
                  {currentTeamMembers.map((tm) => (
                    <div key={tm.id} className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <Avatar name={tm.name} className="h-7 w-7" />
                        <div>
                          <div className="font-semibold text-foreground">{tm.name}</div>
                          <div className="text-[10px] text-muted-foreground">{tm.email}</div>
                        </div>
                      </div>

                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={removeTeamMemberMutation.isPending}
                          onClick={() => removeTeamMemberMutation.mutate(tm.id)}
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
              <Button variant="outline" onClick={() => setManagingTeamMembers(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Team Modal */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent onClose={() => setCreateDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Add a team to group workspace members</DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" placeholder="Backend Engineering" {...createForm.register("name")} />
                {createForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-desc">Description (Optional)</Label>
                <Textarea id="team-desc" placeholder="Team responsibilities and scope" rows={3} {...createForm.register("description")} />
                {createForm.formState.errors.description && (
                  <p className="text-xs text-destructive">{createForm.formState.errors.description.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Team Modal */}
        <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
          <DialogContent onClose={() => setEditingTeam(null)}>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>Update details for team {editingTeam?.name}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={updateForm.handleSubmit((d) => editingTeam && updateMutation.mutate({ teamId: editingTeam.id, formData: d }))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-team-name">Team Name</Label>
                <Input id="edit-team-name" {...updateForm.register("name")} />
                {updateForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-team-desc">Description</Label>
                <Textarea id="edit-team-desc" rows={3} {...updateForm.register("description")} />
                {updateForm.formState.errors.description && (
                  <p className="text-xs text-destructive">{updateForm.formState.errors.description.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingTeam(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Team Modal */}
        <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
          <DialogContent onClose={() => setDeletingTeam(null)}>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Delete Team</DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{deletingTeam?.name}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTeam(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingTeam && deleteMutation.mutate(deletingTeam.id)}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog (Search by Email) */}
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent onClose={() => setAddMemberDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>Add Member to Organization</DialogTitle>
              <DialogDescription>
                Search registered users by exact email to add them to {currentOrg?.name} as a Member.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={searchUserForm.handleSubmit((d) => searchUserMutation.mutate(d.email))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-email">Registered User Email</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search-email" placeholder="user@example.com" className="pl-9" {...searchUserForm.register("email")} />
                  </div>
                  <Button type="submit" disabled={searchUserMutation.isPending}>
                    {searchUserMutation.isPending ? "Searching..." : "Search"}
                  </Button>
                </div>
                {searchUserForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{searchUserForm.formState.errors.email.message}</p>
                )}
              </div>
            </form>

            {foundUser && (
              <div className="p-4 rounded-lg border border-border bg-muted/30 flex items-center justify-between mt-4">
                <div>
                  <div className="font-semibold text-sm">{foundUser.name}</div>
                  <div className="text-xs text-muted-foreground">{foundUser.email}</div>
                </div>
                <Button
                  size="sm"
                  disabled={addUserMutation.isPending}
                  onClick={() => addUserMutation.mutate(foundUser.id)}
                >
                  {addUserMutation.isPending ? "Adding..." : "Add to Org"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
