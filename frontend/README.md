# 🎨 TeamFlow Frontend Application

Modern Next.js 15 SaaS application built with TypeScript, Tailwind CSS, TanStack Query (React Query v5), React Hook Form, and Zod.

---

## 🚀 Key Client Architecture Features

* **Next.js 15 App Router**: 100% pre-rendered and statically optimized pages with zero build errors across all 12 application routes.
* **In-Memory Token Storage**: Access tokens are kept strictly in-memory (`tokenStorage`) and sent via Axios request interceptors. Refresh tokens are automatically sent via browser `HttpOnly` cookies (`withCredentials: true`).
* **Silent Auth Rehydration**: `AuthProvider` silently rehydrates tokens on app mount or refresh (`F5`) via `POST /api/auth/refresh`.
* **Multi-Assignee UI**: Task dialogs allow selecting multiple organization members with visual avatar stacks.
* **Workspace Status Audit Trail**: Real-Time System Audit Log widget on the Dashboard and highlighted blue `SYSTEM AUDIT LOG` banners in task discussions.
* **Member Invite & Exit Workflows**: Direct owner invites by registered email, member exit via Profile page, and project exit via Project page.

---

## 🛠️ Technology Stack

* **Framework**: Next.js 15 (App Router) & React 19
* **Styling**: Tailwind CSS & Lucide Icons
* **State & Data Fetching**: TanStack Query (React Query v5)
* **Form Handling**: React Hook Form & Zod
* **HTTP Client**: Axios with interceptors & silent queueing

---

## 🗺️ Application Routes

| Route | Purpose | Access Control |
|---|---|---|
| `/login` | User sign-in | Public |
| `/register` | User sign-up | Public |
| `/dashboard` | Metrics & Real-time Audit Trail | Authenticated |
| `/projects` | Workspace Projects | Authenticated |
| `/projects/[projectSlug]` | Interactive Kanban & Project Members | Authenticated |
| `/teams` | Teams & Team Member Management | Authenticated |
| `/tasks` | Filterable Tasks & Multi-Assignees | Authenticated |
| `/search` | Organization Global Search | Authenticated |
| `/profile` | Profile & Leave Workspace | Authenticated |
| `/settings` | Organization Settings | Owner |

---

## 🧪 Build & Test Verification

```bash
# Production Next.js build
npm run build
```
Frontend builds successfully with **0 errors across all 12 routes**.
