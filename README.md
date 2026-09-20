# Timplora

Timplora is a responsive employee scheduling and rest day management system for a
single restaurant. It will give employees one place to manage availability and
rest day requests while keeping schedule approval and publication under manager
control.

This repository contains the implemented application through Phase 10. It includes
responsive employee and manager workspaces, Neon Auth and PostgreSQL RLS,
persistent availability and rest-day workflows, weekly schedule publishing and
revision history, conflict validation, in-app notifications, automated business-rule
tests, and production security headers.

## Technology stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Neon Auth
- Neon serverless PostgreSQL and Row Level Security
- Vercel deployment (planned)

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm

Install dependencies and create your local environment file:

```bash
npm install
cp .env.example .env.local
```

On PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env.local
```

Start the development server and open <http://localhost:3000>:

```bash
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

Never commit `.env.local` or credentials. `.env.example` contains names and safe
placeholder values only.

For a connected Neon project, enable Neon Auth and the Data API, copy the values
from `.env.example`, then apply the SQL files in `neon/migrations` in filename
order. Open `/setup` once to create the first manager account; that route locks
after the first profile exists. Without Neon variables the application runs in
a safe, fictional-data demo mode.

## Project structure

```text
src/
├── app/                  # App Router routes and layouts
│   ├── (employee)/       # Employee route group (future phases)
│   └── (manager)/        # Manager route group (future phases)
├── components/
│   ├── employee/         # Employee-specific components
│   ├── manager/          # Manager-specific components
│   └── ui/               # Shared UI primitives
├── hooks/                # Reusable React hooks
├── lib/                  # Utilities and service clients
└── types/                # Shared TypeScript definitions
```

## Development roadmap

1. ✅ Project setup
2. ✅ UI/UX foundation
3. ✅ Employee screens with mock data
4. ✅ Manager screens with mock data
5. ✅ Database and authentication
6. ✅ Employee and availability management
7. ✅ Rest day request system
8. ✅ Weekly scheduling
9. ✅ Validation and notifications
10. 🚧 Testing and deployment (deployment authorization pending)

Each phase begins only after explicit approval. Automated schedule generation is
outside the MVP.
