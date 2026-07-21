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

const app = express();

// Security headers
app.use(helmet());

// Cross origin requests
app.use(
  cors({
    origin: env.CORS_ORIGIN,
  })
);

// Body parser
app.use(express.json());

// Logger
app.use(morgan("dev"));

// Health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to TeamFlow API",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", teamRoutes);
app.use("/api", taskRoutes);
app.use("/api", commentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", searchRoutes);

export default app;