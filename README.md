# 🚀 TeamFlow — Enterprise-Grade SaaS Project Management Platform

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js 15](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/React%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

---

## 📌 Executive Overview

**TeamFlow** is a full-stack, production-style SaaS project management platform built to showcase enterprise software architecture. It features multi-tenant organization scoping, Command Query Responsibility Segregation (CQRS), Repository Pattern, stateful refresh token rotation via `HttpOnly` cookies, multi-assignee task workflows, and automated workspace audit trails.

---

## 🏗️ Ecosystem Architecture

```
TeamFlow Monorepo Engine
│
├── ⚙️ Backend API Service (Node.js / Express / TypeScript / Drizzle ORM)
│   ├── CQRS Architecture (Controller → Command → Repository → PostgreSQL)
│   ├── HttpOnly Cookie Refresh Tokens + In-Memory JWT Access Tokens (XSS & CSRF Protection)
│   ├── Relational Database Engine (PostgreSQL via Drizzle ORM)
│   ├── Junction Tables (team_members, project_members, task_assignees, refresh_tokens)
│   └── Real-Time System Status Audit Trail Generator
│
└── 🎨 Frontend SaaS Web App (Next.js 15 App Router / Tailwind CSS / React Query v5)
    ├── App Router Pages (Dashboard, Projects, Single Project, Teams, Tasks, Search, Profile, Settings)
    ├── Axios Interceptors with Automatic Silent Cookie Refresh Flow
    ├── Reusable Component System built with Tailwind CSS & Lucide Icons
    ├── React Hook Form & Zod Validation Schemas
    └── Dark / Light / System Theme Customization
```

---

## ✨ Core Features & Technical Highlights

### 🔒 Enterprise Security Architecture
* **HttpOnly Cookie Refresh Tokens**: 7-day Refresh Tokens are stored as `HttpOnly`, `SameSite=lax` cookies, immunizing credentials against **Cross-Site Scripting (XSS)**.
* **In-Memory Access Tokens**: 15-minute JWT Access Tokens are stored strictly in JavaScript runtime memory and attached via `Authorization: Bearer <token>` headers, preventing **CSRF** exploits.
* **Silent Session Rehydration**: On page refresh (`F5`), the client automatically executes `POST /api/auth/refresh` with `withCredentials: true` to obtain a fresh access token seamlessly.

### 🏢 Multi-Tenant Workspace & Member Access Control
* **Owner-Driven Invites**: To maintain strict security, members cannot self-join organizations. Organization Owners invite registered users by email address (`GET /api/users/search?email=`).
* **Member Exit Controls**: Members can exit an organization via **Leave Workspace** on their Profile page or leave individual projects via **Leave Project**.
* **Role-Based Access Control (RBAC)**: Distinct permissions for `Owner` (Full Workspace CRUD, Team & Member Management) vs `Member` (Updating Assigned Tasks & Leaving Projects).

### 👥 Teams, Projects & Multi-Assignee Tasks
* **Team Members**: Owners can group organization members into cross-functional teams (`team_members` junction table).
* **Project Members**: Owners can assign specific members to work on individual projects (`project_members` junction table).
* **Multi-Assignee Tasks**: Tasks can be assigned to multiple organization members simultaneously (`task_assignees` junction table).
* **Owner-Only Task Creation**: Task creation is restricted to Organization Owners. Assigned members can update task status (`TODO` / `IN_PROGRESS` $\rightarrow$ `DONE`).

### 🛡️ Live Workspace Audit Trail & Activity Feed
* **Automated Audit Events**: Modifying a task's status automatically logs a timestamped system audit comment (`[AUDIT_LOG] User updated status...`).
* **Highlighted Discussion Banners**: Audit logs display as distinct blue system banners inside task discussion modals.
* **Dashboard Audit Feed**: A live **Workspace Status Audit Trail** widget on the main Dashboard gives Owners complete visibility over all workspace activity in real-time.

---

## 📁 Repository Structure

| Module | Technical Specification | Path |
|---|---|---|
| **Backend API** | Node.js, Express, CQRS, Drizzle ORM, HttpOnly Cookies, PostgreSQL | [`/backend`](./backend) |
| **Frontend Web App** | Next.js 15 App Router, React Query v5, Tailwind CSS, Zod, Axios | [`/frontend`](./frontend) |

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js**: v18.x or higher
* **PostgreSQL**: v14.x or higher

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/teamflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000

# Execute database migrations
npm run db:migrate

# Start development server
npm run dev
```
Backend runs at `http://localhost:8000/api`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start Next.js development server
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## 📄 License
Distributed under the MIT License.
