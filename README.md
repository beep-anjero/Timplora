# Timplora

Timplora is a responsive employee scheduling and rest day management system for a
single restaurant. It will give employees one place to manage availability and
rest day requests while keeping schedule approval and publication under manager
control.

This repository currently contains the Phase 1 project foundation only. Product
screens, authentication, persistence, and scheduling behavior are intentionally
reserved for later approved phases.

## Technology stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Supabase Authentication and PostgreSQL (planned)
- Supabase Row Level Security (planned)
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
npm run build
```

Never commit `.env.local` or credentials. `.env.example` contains names and safe
placeholder values only.

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

1. Project setup
2. UI/UX foundation
3. Employee screens with mock data
4. Manager screens with mock data
5. Database and authentication
6. Employee and availability management
7. Rest day request system
8. Weekly scheduling
9. Validation and notifications
10. Testing and deployment

Each phase begins only after explicit approval. Automated schedule generation is
outside the MVP.
