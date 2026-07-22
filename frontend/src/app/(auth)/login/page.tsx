"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { AuthGuard } from "@/components/common/auth-guard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Layers } from "lucide-react";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await authService.login(data);
      if (res.success && res.accessToken && res.user) {
        toast.success("Welcome back!", "Successfully authenticated.");
        await login(res.accessToken, res.user);
        router.push("/dashboard");
      } else {
        toast.error("Login Failed", res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid email or password.";
      toast.error("Authentication Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo / Branding */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">TeamFlow</h1>
            <p className="text-sm text-muted-foreground">Enterprise Project Management Platform</p>
          </div>

          <Card className="shadow-xl border-border/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>Enter your email and password to access your workspace</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@organization.com"
                      className="pl-9"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-semibold text-primary hover:underline">
                    Create Account
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
