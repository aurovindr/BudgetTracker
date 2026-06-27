# BudgetTracker

A shared household budget tracker for managing daily expenses and splitting shared
costs among family members or housemates. Runs **entirely on your local machine** —
no cloud services or external-network dependencies.

## Features

- **Authentication** — member registration & login with name + 4-digit PIN
- **Expense entry** — log daily expenses with date, amount, category, description, payer
- **Dashboard** — monthly spending by category and by member, plus trend charts
- **Budget split** — see each member's share and who owes whom at month-end

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19, TypeScript, Turbopack |
| Styling | Tailwind CSS v4 + shadcn/ui (local system fonts) |
| Database / Auth | Supabase (Postgres), running locally via Docker |
| Charts | Recharts |

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Homebrew](https://brew.sh) (macOS)
- A Docker runtime + the Supabase CLI (installed below). This project uses
  [Colima](https://github.com/abiosoft/colima) as a lightweight, CLI-only Docker runtime.

One-time install:

```bash
brew install colima docker supabase/tap/supabase
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the Docker runtime (needed once per reboot)
colima start

# 3. Start the local Supabase stack (Postgres + Auth)
#    First run pulls Docker images and applies the migrations.
supabase start

# 4. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first use, register a member,
then log in with your name + 4-digit PIN.

`.env.local` is preconfigured to point at the local Supabase API
(`http://127.0.0.1:54321`).

## Running on a phone

The app is mobile-first and works as a PWA. To open it on a phone on the same
Wi-Fi network:

1. Find your Mac's LAN IP: `ipconfig getifaddr en0` (e.g. `192.168.1.5`).
2. Point the browser Supabase client at that IP instead of `127.0.0.1` — the
   client runs in the **phone's** browser, where `127.0.0.1` would mean the phone
   itself. In `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://<YOUR_MAC_IP>:54321
   ```

3. Start the server bound to the network: `npm run dev:mobile`.
4. On the phone, open `http://<YOUR_MAC_IP>:3000`. Optionally use
   Share → Add to Home Screen for a fullscreen app-like experience.

Notes: the macOS firewall may block incoming connections (allow `node` if so),
and your Mac's LAN IP can change when it rejoins Wi-Fi — update `.env.local` if
the phone suddenly can't sign in.

## Local URLs

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Supabase Studio (DB GUI) | http://localhost:54323 |
| Mailpit (catches auth emails) | http://localhost:54324 |
| Supabase API | http://127.0.0.1:54321 |

## Common Commands

```bash
npm run dev          # start the dev server (desktop, localhost only)
npm run dev:mobile   # start bound to 0.0.0.0 so other devices on the LAN can reach it
npm run build        # production build
npm run start        # serve the production build
npm run lint         # run ESLint

supabase start       # start the local DB/Auth stack
supabase stop        # stop the stack
supabase db reset    # wipe the DB and re-apply all migrations
colima stop          # stop the Docker runtime
```

## Project Structure

```
BudgetTracker/
├── src/
│   ├── app/            # App Router pages: (auth), dashboard, expenses, profile
│   ├── components/     # ui/, layout/, dashboard/, expenses/
│   ├── lib/            # Supabase client/server, dashboard queries, utils
│   └── middleware.ts   # auth-guard redirects
├── supabase/
│   ├── config.toml     # local stack config
│   └── migrations/     # 001_init, 002_expenses, 003_grants
└── public/
```

## Database

Schema is defined in `supabase/migrations/` and applied automatically by
`supabase start` / `supabase db reset`:

- `001_init.sql` — `members` table, RLS policies, and a trigger that creates a
  member row on signup
- `002_expenses.sql` — `expenses` and `expense_splits` tables with RLS policies
- `003_grants.sql` — grants the `authenticated` role table access (the local stack
  does not apply Supabase's default grants; RLS still governs row access)

## Notes

- Mobile-first responsive design (works as a PWA).
- All members share a single household group (no multi-tenancy).
- The local Supabase services use shared default dev keys and bind to `0.0.0.0` —
  intended for local development only, never production.
