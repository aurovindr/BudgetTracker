-- Expenses table
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  category text not null check (category in (
    'Groceries','Utilities','Rent','Dining','Transport',
    'Healthcare','Entertainment','Other'
  )),
  amount numeric(10,2) not null check (amount > 0),
  date date not null,
  paid_by uuid references public.members(id) on delete cascade not null,
  is_split boolean default false,
  is_recurring boolean default false,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "authenticated members can read all expenses"
  on public.expenses for select
  using (auth.role() = 'authenticated');

create policy "members can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = paid_by);

create policy "members can update own expenses"
  on public.expenses for update
  using (auth.uid() = paid_by);

create policy "members can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = paid_by);

-- Expense splits table
create table public.expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  member_id uuid references public.members(id) on delete cascade not null,
  amount numeric(10,2) not null,
  is_settled boolean default false,
  created_at timestamptz default now()
);

alter table public.expense_splits enable row level security;

create policy "authenticated members can read all splits"
  on public.expense_splits for select
  using (auth.role() = 'authenticated');

create policy "allow insert splits"
  on public.expense_splits for insert
  with check (auth.role() = 'authenticated');

create policy "members can update own splits"
  on public.expense_splits for update
  using (auth.uid() = member_id);
