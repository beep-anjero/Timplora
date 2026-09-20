# Timplora

**Restaurant crew scheduling that respects real availability.**

Timplora brings crew accounts, class schedules, rest-day requests, and weekly
shift planning into one responsive workspace. Managers can generate a practical
schedule from the team's actual constraints, review conflicts, make adjustments,
and publish the final roster for everyone to see.

## Key features

### Smart weekly schedule generation

- Builds a complete weekly schedule from active crew, approved rest days, class
  schedules, shift preferences, and the manager's minimum staffing requirement.
- Uses staggered, overlapping shifts to support smooth hand-offs throughout the
  day without forcing a fixed number of openers, relievers, or closers.
- Assigns at least one weekly rest day to every crew member whenever staffing
  allows, including people who did not submit a request.
- Distributes closing shifts and rest days more fairly across the team.
- Produces clear warnings when a shift cannot be filled or a crew member still
  needs a rest day.

### Rest-day request workflow

- Crew select the exact day of the week they want off.
- A reason form opens immediately after choosing a day.
- Each date shows its remaining request capacity and accepts a maximum of three
  active requests.
- Crew can review their request history and cancel a pending request.
- Managers can approve or decline requests and include a note in their decision.
- Approved requests automatically become scheduling constraints.

### Class-aware crew availability

- Working students can record recurring class times for each weekday.
- The scheduler avoids shifts that overlap a class, including overnight shifts
  that extend into the next day.
- Crew can set a preferred work period—morning, afternoon, evening, or flexible.
- Managers can see each crew member's classification and preference while
  planning the week.

### Manager workspace

- View team, request, and scheduling information from one dashboard.
- Create both **Crew** and **Manager** accounts using a username and temporary
  password—email addresses are not required.
- Search accounts and manage account status and credentials.
- Configure shift templates, minimum daily staffing, and scheduling rules.
- Generate a draft, edit individual assignments, validate conflicts, and publish
  the completed schedule.
- Review previously published schedule revisions.
- Keep the signed-in manager's own account separate from the managed account list.

### Crew workspace

- Sign in with a username and password supplied by a manager.
- Change the temporary password from the crew profile.
- Submit rest-day requests and maintain class availability.
- View the published weekly schedule in a mobile-friendly layout.
- Receive in-app updates when requests are decided or a schedule is published.

### Built for reliable day-to-day use

- Role-based manager and crew workspaces.
- Secure first-manager setup that locks after the initial account is created.
- Neon Auth, PostgreSQL persistence, and row-level security.
- Conflict checks for approved rest days, class overlaps, invalid shift times,
  minimum staffing, and missing weekly rest days.
- Responsive interface for desktop, tablet, and mobile use.
- Safe demo mode with fictional data when Neon is not configured.
- Automated tests for scheduling rules and production security headers.

## Typical workflow

1. A manager creates Crew or Manager accounts.
2. Crew sign in, change their temporary passwords, and add class availability.
3. Crew choose preferred rest days; each day accepts up to three requests.
4. The manager reviews and decides the requests.
5. Timplora generates a weekly draft using approved rest days, class schedules,
   preferences, shift templates, and staffing requirements.
6. The manager resolves any warnings, adjusts the draft, and publishes it.
7. Crew receive the update and view the final schedule in their portal.

## Technology stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- ESLint
- Neon Auth
- Neon serverless PostgreSQL with Row Level Security
- Vitest

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm

Install the dependencies and create a local environment file:

```bash
npm install
cp .env.example .env.local
```

On PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env.local
```

Start the application, then open [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

### Database and authentication

For a connected Neon project, enable Neon Auth and the Data API, copy the
required values from `.env.example`, and run:

```bash
npm run db:migrate
```

Open `/setup` once to create the first manager. The setup route automatically
locks after the first profile exists. If Neon variables are absent, Timplora
runs in demo mode with fictional data.

Never commit `.env.local` or credentials. `.env.example` contains only variable
names and safe placeholder values.

## Quality checks

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

## Project structure

```text
src/
├── app/
│   ├── (employee)/      # Crew portal routes
│   ├── (manager)/       # Manager workspace routes
│   ├── actions/         # Authenticated server actions
│   ├── login/           # Shared username sign-in
│   └── setup/           # First-manager onboarding
├── components/
│   ├── employee/        # Crew scheduling and request interfaces
│   ├── manager/         # Account, request, and schedule management
│   └── ui/              # Shared interface components
├── lib/
│   ├── data/            # Persistent data services
│   ├── neon/            # Authentication and database clients
│   └── scheduling/      # Generation and conflict-validation rules
└── types/               # Shared application types
```
