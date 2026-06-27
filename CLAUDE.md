# BudgetTracker

A shared household budget tracker for managing daily expenses and monthly budget consolidation among family members or housemates.

## Project Goal

Enable multiple users sharing a home to:
- Log daily expenses individually
- View monthly expenditure broken down by category
- Split and settle shared costs at month-end

## Target Users

Family members or friends sharing a house who need to track and split common household expenses.

## Success Criteria

- Members can register and log in
- Members can add daily expenses with category and amount
- Monthly dashboard shows spending per category and per member
- Budget split/settlement view available at month-end

## Core Features

1. **Authentication** — Member login/registration (name + 4-digit PIN)
2. **Expense Entry** — Add daily expenses with date, amount, category, description, and who paid
3. **Dashboard** — Monthly spending summary by category and by member
4. **Budget Split** — Calculate each member's share and show who owes whom

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript, Turbopack), React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui; local system-font stack (no remote fonts)
- **Database & Auth**: Supabase (Postgres) — runs **locally** via the Supabase CLI + Docker
- **Charts**: Recharts
- **Runs entirely on the local machine** — no cloud or external-network dependencies

## Project Structure

```
BudgetTracker/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # login + register
│   │   ├── dashboard/    # monthly summary (server + client)
│   │   ├── expenses/     # expense list
│   │   ├── profile/      # member profile
│   │   └── middleware.ts # auth-guard redirects (lives in src/)
│   ├── components/       # ui/, layout/, dashboard/, expenses/
│   └── lib/              # supabase client/server, dashboard queries, utils
├── supabase/
│   ├── config.toml       # local stack config (analytics disabled for Colima)
│   └── migrations/       # 001_init, 002_expenses, 003_grants
└── public/
```

## Running Locally

The whole stack runs on this machine — no hosted Supabase, no internet calls.

Prerequisites (one-time): Colima (Docker runtime) and the Supabase CLI.

```bash
brew install colima docker supabase/tap/supabase   # one-time
colima start          # start the Docker runtime (after each reboot)
supabase start        # start local Postgres + Auth (API at 127.0.0.1:54321)
npm run dev           # run the app at http://localhost:3000
```

`.env.local` points `NEXT_PUBLIC_SUPABASE_URL` at the local API (`http://127.0.0.1:54321`).
Useful local URLs: Studio `http://localhost:54323`, Mailpit (catches auth emails) `http://localhost:54324`.

Other commands: `supabase db reset` (wipe + re-apply migrations), `supabase stop`, `colima stop`.

## Auth Design

- Registration: full name, 4-digit PIN
- Login: name + 4-digit PIN
- No email is collected; Supabase Auth requires one internally, so a stable
  address is derived from the member's name (`nameToEmail` in `src/lib/utils.ts`)
- Sessions persisted on device
- Single shared household group — all members belong to one group

## Development Notes

- Personal/home-use app — small number of users, no enterprise scale needed
- Mobile-first responsive design (works as PWA)
- All members share a single household group (no multi-tenancy)
- Runs fully offline on a local machine; the Supabase stack is containerized via Colima
- DB privileges: migrations grant the `authenticated` role table access explicitly
  (`003_grants.sql`) since the local stack does not apply Supabase's default grants.
  RLS policies in `001`/`002` still govern row-level access.
- Local Supabase services bind to `0.0.0.0` with shared default dev keys — fine for
  local use, never for production.
