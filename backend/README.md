# ⚙️ TeamFlow Backend API Service

High-performance Node.js / Express REST API built with TypeScript, PostgreSQL, Drizzle ORM, CQRS architecture, HttpOnly cookie rotation, multi-assignee task management, and automated workspace audit logging.

---

## 🏗️ Architectural Patterns

* **CQRS Pattern**: Clear separation of write operations (Commands) and read queries (Repositories).
* **Repository Pattern**: Abstracted database access layer using Drizzle ORM.
* **HttpOnly Cookie Authentication**:
  * **Access Token**: Short-lived (15 min) JWT held in-memory by frontend client.
  * **Refresh Token**: Long-lived (7 days) stateful token stored in `refresh_tokens` database table and sent as an `HttpOnly`, `SameSite=lax` cookie.
* **Multi-Tenant Scoping**: All queries explicitly scoped by `organization_id` or owner validation.

---

## 🛠️ Technology Stack

* **Runtime**: Node.js v18+ & Express v4
* **Language**: TypeScript v5
* **Database**: PostgreSQL
* **ORM**: Drizzle ORM & Drizzle Kit
* **Authentication**: JSON Web Token (JWT) & `cookie-parser`
* **Validation**: Zod Schemas

---

## 🗄️ Database Schema & Junction Tables

* `users`: Primary user accounts (`role`: `owner` \| `member`).
* `organizations`: Workspaces owned by users (`slug` unique).
* `refresh_tokens`: Stateful rotated refresh tokens.
* `projects`: Projects scoped to organizations.
* `project_members`: Junction table linking members to specific projects.
* `teams`: Cross-functional workspace teams.
* `team_members`: Junction table linking users to teams.
* `tasks`: Task items with priority, status (`TODO`, `IN_PROGRESS`, `DONE`), and due date.
* `task_assignees`: Junction table enabling multiple assignees per task.
* `comments`: Discussion comments & automated `[AUDIT_LOG]` status change entries.

---

## 📡 REST API Reference Summary

### Authentication (`/api/auth`)
* `POST /login`: Authenticates user, sets `refreshToken` HttpOnly cookie, returns in-memory access token.
* `POST /register`: Registers new user account.
* `POST /refresh`: Reads HttpOnly cookie, verifies token in DB, issues new access token & rotates refresh cookie.
* `POST /logout`: Clears HttpOnly cookie and invalidates refresh token record in DB.
* `GET /me`: Returns real-time user profile directly from PostgreSQL.

### User & Organization Lifecycle (`/api/users`)
* `POST /leave`: Leave current organization workspace (`POST /api/users/leave`).
* `GET /search?email=`: Search registered users by email (Owners).
* `GET /organizations/:slug/users`: List all workspace members.
* `POST /organizations/:slug/users`: Add member to workspace (Owner only).
* `DELETE /organizations/:slug/users/:userId`: Remove member from workspace (Owner only).

### Projects & Project Members (`/api/organizations/:slug/projects`)
* `GET /`: List workspace projects.
* `POST /`: Create project (Owner).
* `GET /:projectSlug`: Fetch single project details.
* `PUT /:projectSlug`: Update project (Owner).
* `DELETE /:projectSlug`: Delete project (Owner).
* `GET /:projectSlug/members`: List members assigned to project.
* `POST /:projectSlug/members`: Add member to project (Owner).
* `DELETE /:projectSlug/members/:userId`: Remove member from project (Owner or Member leaving).

### Teams & Team Members (`/api/organizations/:slug/teams`)
* `GET /`: List teams.
* `POST /`: Create team (Owner).
* `PUT /:teamId`: Update team (Owner).
* `DELETE /:teamId`: Delete team (Owner).
* `GET /:teamId/members`: List team members.
* `POST /:teamId/members`: Add user to team.
* `DELETE /:teamId/members/:userId`: Remove user from team.

### Tasks & Audit Trails (`/api/organizations/:slug/projects/:projectSlug/tasks`)
* `GET /`: List tasks with multi-assignees.
* `POST /`: Create task (Owner only).
* `PUT /:taskId`: Update task & status (Owner or Assigned Member). Generates `[AUDIT_LOG]` entry.
* `DELETE /:taskId`: Delete task (Owner).
* `GET /:taskId/comments`: Fetch discussion comments & audit logs.
* `POST /:taskId/comments`: Post discussion comment.

### Dashboard & Workspace Audits (`/api/organizations/:slug/dashboard`)
* `GET /`: Overview metrics (tasks, projects, teams, members).
* `GET /audit-logs`: Real-time organization status audit trail feed.

---

## 🧪 Build & Test Verification

```bash
# Typecheck and build TypeScript output
npm run build
```
Backend compiles with **0 TypeScript errors**.
