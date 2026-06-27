-- Table-level privileges for the Supabase API roles.
--
-- Hosted Supabase grants these to `anon`/`authenticated` by default; the local
-- stack does not apply them to migration-created tables, so we grant explicitly
-- here to keep the schema self-contained and reproducible on any machine.
-- Row-level access is still governed by the RLS policies in 001/002 — these
-- grants only make the tables visible to the API roles at all.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete
  on public.members, public.expenses, public.expense_splits
  to authenticated;
