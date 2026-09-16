-- Link cake requests to Supabase Auth users (nullable: guest requests keep working)
alter table public.cake_requests
  add column user_id uuid references auth.users(id) on delete set null;

create index idx_cake_requests_user_id on public.cake_requests (user_id);

-- INSERT: anon may only create guest requests, authenticated may only self-attribute
drop policy "public_insert" on public.cake_requests;

create policy "Allow anon insert guest cake requests"
  on public.cake_requests
  as permissive
  for insert
  to anon
  with check (user_id is null);

create policy "Allow authenticated insert own cake requests"
  on public.cake_requests
  as permissive
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- SELECT: authenticated sees only their own
create policy "Allow authenticated read own cake requests"
  on public.cake_requests
  as permissive
  for select
  to authenticated
  using (user_id = auth.uid());
