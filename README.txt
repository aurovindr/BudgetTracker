BudgetTracker
=============

A shared household budget tracker for family members or housemates to manage
daily expenses and consolidate budget utilization at the end of each month.

WHAT IT DOES
------------
- Members log in and add daily expenses
- Expenses are tagged with category, amount, date, and who paid
- Monthly dashboard shows spending breakdown by category and by member
- Month-end budget split shows who owes whom

WHO IT'S FOR
------------
Family members or friends sharing a home who want a simple way to track
and split common household expenses.

HOW TO USE
----------
1. Register an account or log in (email + 4-digit PIN)
2. Add expenses as you spend throughout the month
3. View the monthly dashboard to see category-wise spending
4. Use the budget split view at month-end to settle up

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

See README.md for full details, local URLs, and common commands.

STATUS
------
Functional. Runs locally against a containerized Supabase stack.
