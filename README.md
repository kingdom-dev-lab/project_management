# ProjectFlow SaaS (Asana-like)

A multi-tenant project management SaaS with one-click launch, setup wizard, role-based access, Kanban board, and analytics dashboard.

## One-Click Launch

### Linux / macOS

```bash
./start.sh
```

### Windows

```bat
start.bat
```

Both scripts run:
1. `npm install`
2. `npx prisma generate --schema backend/prisma/schema.prisma`
3. `npx prisma db push --schema backend/prisma/schema.prisma`
4. `npm run dev`

## Setup Wizard

Open `http://localhost:3000/setup` on first launch.

- Creates `.env` values
- Initializes SQLite DB (if missing)
- Creates initial admin user
- Automatically creates `Initial Team`
- Links admin to team as `OWNER`
- Marks installation complete and redirects to login

## Stack

- Frontend: Next.js App Router, Tailwind CSS, React Query, Lucide, Recharts, DnD Kit
- Backend: Express, Prisma, SQLite, JWT auth + refresh tokens

## Required env template

See `.env.example` (all sensitive runtime settings centralized there).

## Key APIs

- `POST /api/setup`
- `POST /api/auth/login`
- `GET /api/dashboard/stats`
- `GET|POST /api/projects`
- `GET|POST /api/tasks`

## Docker (SQLite-ready)

```bash
docker compose up --build
```

The compose stack mounts SQLite volume at `backend/prisma` and runs `prisma db push` on container start.
