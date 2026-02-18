# ProjectFlow SaaS (Asana-like)

Production-oriented SaaS project management platform with multi-tenant teams, projects, tasks, Kanban workflow, dependencies, comments, attachments, activity logs, and role-based access.

## Folder Structure

```text
.
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── tests/
├── frontend/
│   ├── src/app/
│   │   ├── setup/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   └── tasks/
│   ├── src/components/
│   └── src/lib/
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Features

- Multi-tenant team isolation (`x-team-id` scoped API)
- Roles: Owner/Admin/Member/Viewer
- Dashboard analytics: due today, overdue, workload, project progress
- Projects: CRUD endpoints and UI
- Tasks: subtasks, dependencies, comments, attachments, activity logs
- JWT + refresh token authentication
- Security middleware: Helmet, CORS, rate limit, validation with Zod
- Installer wizard (WordPress-like) on first launch

## First-time setup wizard

1. Visit `http://localhost:3000/setup`.
2. Wizard checks `/api/setup/status`.
3. If not installed, enter:
   - System Name
   - Database Host
   - Database Name
   - Database User
   - Database Password
   - Admin Email
   - Admin Password
4. Installer will:
   - write `.env`
   - run Prisma migrations
   - create admin owner user/team
   - mark installation complete
5. Redirects to Login.

## Scripts

From root:

- `npm run dev` – run backend + frontend
- `npm run build` – build workspaces
- `npm run migrate` – run backend prisma migration deploy
- `npm run install` – run installer CLI (one-click interactive)
- `npm test` – backend tests

## Docker

```bash
docker-compose up --build
```

Services:
- `db` PostgreSQL 16
- `app` Node monorepo (frontend:3000, backend:4000)

## API namespaces

- `/api/auth`
- `/api/projects`
- `/api/tasks`
- `/api/teams`
- `/api/dashboard`
- `/api/setup`

## Notes for production hardening

- Replace JWT secrets
- Use HTTPS and secure cookies
- Configure S3 env vars for object storage
- Add audit/event queue and background workers
