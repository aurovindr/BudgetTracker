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

1. **Authentication** — Member login/registration (email + 4-digit PIN)
2. **Expense Entry** — Add daily expenses with date, amount, category, description, and who paid
3. **Dashboard** — Monthly spending summary by category and by member
4. **Budget Split** — Calculate each member's share and show who owes whom

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase (Postgres)
- **Deployment**: Vercel

## Project Structure

```
BudgetTracker/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   └── lib/              # Supabase client, utilities
├── supabase/             # DB migrations and schema
└── public/
```

## Auth Design

- Registration: full name, email, 4-digit PIN
- Login: email + 4-digit PIN
- Sessions persisted on device
- Single shared household group — all members belong to one group

## Development Notes

- Personal/home-use app — small number of users, no enterprise scale needed
- Mobile-first responsive design (works as PWA)
- All members share a single household group (no multi-tenancy)
