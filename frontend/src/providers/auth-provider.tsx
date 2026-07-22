"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Organization } from "@/types";
import { tokenStorage } from "@/lib/auth/token";
import { authService } from "@/services/auth.service";
import { orgService } from "@/services/org.service";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface AuthContextType {
  user: User | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => void;
  refreshUserAndOrgs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setCurrentOrg = (org: Organization | null) => {
    setCurrentOrgState(org);
    if (typeof window !== "undefined") {
      if (org) {
        localStorage.setItem("teamflow_current_org", JSON.stringify(org));
      } else {
        localStorage.removeItem("teamflow_current_org");
      }
    }
  };

  const refreshUserAndOrgs = async () => {
    let accessToken = tokenStorage.getAccessToken();

    // If in-memory access token is missing (e.g. page refresh), attempt silent refresh via HttpOnly cookie
    if (!accessToken) {
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        if (data.success && data.accessToken) {
          accessToken = data.accessToken;
          tokenStorage.setAccessToken(data.accessToken);
        }
      } catch {
        // No valid session cookie found
        tokenStorage.clearAll();
        setUser(null);
        setCurrentOrgState(null);
        setOrganizations([]);
        setIsLoading(false);
        return;
      }
    }

    try {
      const meRes = await authService.getMe();
      if (meRes.success && meRes.user) {
        setUser(meRes.user);
        tokenStorage.setUser(meRes.user);

        // Load user organizations
        try {
          const orgsRes = await orgService.getOrganizations();
          if (orgsRes.success && orgsRes.data) {
            setOrganizations(orgsRes.data);

            const savedOrgStr = typeof window !== "undefined" ? localStorage.getItem("teamflow_current_org") : null;
            let savedOrg: Organization | null = null;
            if (savedOrgStr) {
              try {
                savedOrg = JSON.parse(savedOrgStr);
              } catch {
                savedOrg = null;
              }
            }

            const activeOrg =
              orgsRes.data.find((o) => o.id === meRes.user.organizationId) ||
              orgsRes.data.find((o) => o.id === savedOrg?.id) ||
              orgsRes.data[0] ||
              null;

            setCurrentOrg(activeOrg);
          }
        } catch {
          setOrganizations([]);
          setCurrentOrg(null);
        }
      } else {
        tokenStorage.clearAll();
        setUser(null);
        setCurrentOrg(null);
      }
    } catch {
      tokenStorage.clearAll();
      setUser(null);
      setCurrentOrg(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserAndOrgs();
  }, []);

  const login = async (accessToken: string, loggedUser: User) => {
    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setUser(loggedUser);
    setUser(loggedUser);

    await refreshUserAndOrgs();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore
    }
    tokenStorage.clearAll();
    setUser(null);
    setCurrentOrgState(null);
    setOrganizations([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("teamflow_current_org");
    }
    router.push("/login");
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } catch {
      // Ignore
    }
    tokenStorage.clearAll();
    setUser(null);
    setCurrentOrgState(null);
    setOrganizations([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("teamflow_current_org");
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentOrg,
        organizations,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        logoutAll,
        setCurrentOrg,
        refreshUserAndOrgs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
