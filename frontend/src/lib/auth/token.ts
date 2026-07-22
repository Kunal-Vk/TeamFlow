// In-memory access token storage (XSS immune for refresh token, in-memory for access token)
let inMemoryAccessToken: string | null = null;
const USER_KEY = "teamflow_user";

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
  },

  getUser(): any | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: any): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAll(): void {
    inMemoryAccessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },
};
