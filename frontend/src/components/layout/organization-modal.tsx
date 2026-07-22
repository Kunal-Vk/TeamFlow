"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrgSchema, CreateOrgFormData } from "@/schemas";
import { orgService } from "@/services/org.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Info } from "lucide-react";

interface OrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationModal({ open, onOpenChange }: OrganizationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUserAndOrgs, setCurrentOrg } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
  });

  const onCreateSubmit = async (data: CreateOrgFormData) => {
    setIsSubmitting(true);
    try {
      const res = await orgService.createOrganization(data);
      if (res.success && res.data) {
        toast.success("Organization Created", `Successfully created "${res.data.name}".`);
        setCurrentOrg(res.data);
        await refreshUserAndOrgs();
        reset();
        onOpenChange(false);
      } else {
        toast.error("Failed to Create Organization", res.message);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create organization.";
      toast.error("Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>Setup a new organization workspace as Owner</DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 pt-2">
          <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-foreground">
              To join an existing workspace, ask your Organization Owner to add your email address on their <span className="font-semibold">Teams & Members</span> page.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input id="org-name" placeholder="Acme Corp" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-desc">Description (Optional)</Label>
            <Textarea
              id="org-desc"
              placeholder="Enterprise workspace for product & engineering teams"
              rows={3}
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Creating...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Organization</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
