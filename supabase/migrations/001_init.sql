-- Members table (extends Supabase auth.users)
create table public.members (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.members enable row level security;

-- Members can read all members in the household
create policy "members can view all members"
  on public.members for select
  using (auth.role() = 'authenticated');

-- Members can only update their own profile
create policy "members can update own profile"
  on public.members for update
  using (auth.uid() = id);

-- Allow insert on registration (handled via trigger)
create policy "allow insert on registration"
  on public.members for insert
  with check (auth.uid() = id);

-- Auto-create member record when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.members (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
