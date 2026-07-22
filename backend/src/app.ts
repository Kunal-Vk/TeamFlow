import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import authRoutes from "./modules/auth/routes/auth.routes";
import organizationRoutes from "./modules/organizations/routes/organizations.routes";
import userRoutes from "./modules/users/routes/users.routes";
import projectRoutes from "./modules/projects/projects.routes";
import teamRoutes from "./modules/teams/teams.routes";
import taskRoutes from "./modules/tasks/tasks.routes";
import commentRoutes from "./modules/comments/comments.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import searchRoutes from "./modules/search/search.routes";

import cookieParser from "cookie-parser";

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Public Health Checks
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to TeamFlow API",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "TeamFlow API is running",
  });
});

// Domain API Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);

// Entity-Specific Prefixed Sub-Routers
app.use("/api/organizations/:orgSlug/projects", projectRoutes);
app.use("/api/organizations/:orgSlug/teams", teamRoutes);
app.use("/api/organizations/:orgSlug/projects/:projectSlug/tasks", taskRoutes);
app.use("/api/organizations/:orgSlug/projects/:projectSlug/tasks/:taskId/comments", commentRoutes);
app.use("/api/organizations/:orgSlug/dashboard", dashboardRoutes);
app.use("/api/organizations/:orgSlug/search", searchRoutes);

export default app;