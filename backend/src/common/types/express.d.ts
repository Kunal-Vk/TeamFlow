import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: string | null;
        organizationId: string | null;
        iat: number;
        exp: number;
      };
    }
  }
}