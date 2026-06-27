BudgetTracker
=============

A shared household budget tracker for family members or housemates to manage
daily expenses and consolidate budget utilization at the end of each month.

WHAT IT DOES
------------
- Members log in (name + 4-digit PIN, no email) and add daily expenses
- Expenses are tagged with category, amount (in INR, Rs.), date, and who paid
- Monthly dashboard shows spending by category and by member, plus a 3-month trend
- Shared expenses are split equally; the dashboard shows your "You Owe" amount

WHO IT'S FOR
------------
Family members or friends sharing a home who want a simple way to track
and split common household expenses.

HOW TO USE
----------
1. Register an account or log in (name + 4-digit PIN)
2. Add expenses as you spend throughout the month (mark shared ones as "split")
3. View the monthly dashboard for category/member breakdown and the 3-month trend
4. Check your "You Owe" amount on the dashboard to settle up at month-end

TECH STACK
----------
- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (Postgres) running locally via Docker
- Recharts for dashboard charts

Runs entirely on the local machine - no cloud or external-network dependencies.

LOCAL SETUP
-----------
One-time install (macOS):
  brew install colima docker supabase/tap/supabase

Run:
  colima start      # start the Docker runtime (once per reboot)
  supabase start    # start local Postgres + Auth
  npm install       # first time only
  npm run dev       # app at http://localhost:3000

To open on a phone (same Wi-Fi): point NEXT_PUBLIC_SUPABASE_URL in .env.local at
your Mac's LAN IP (e.g. http://192.168.1.5:54321), add that IP to
allowedDevOrigins in next.config.ts (otherwise the page loads but forms won't
submit on the phone), run "npm run dev:mobile", then open http://<MAC_IP>:3000
on the phone. If the LAN IP changes, update both files.

See README.md for full details, local URLs, and common commands.

STATUS
------
Functional. Runs locally against a containerized Supabase stack.
