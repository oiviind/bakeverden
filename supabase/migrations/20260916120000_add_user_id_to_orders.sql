-- Link orders to Supabase Auth users (nullable: guest checkout keeps working)
alter table public.orders
  add column user_id uuid references auth.users(id) on delete set null;

create index idx_orders_user_id on public.orders (user_id);

-- INSERT: anon may only create guest orders, authenticated may only self-attribute
drop policy "Allow public insert orders" on public.orders;

create policy "Allow anon insert guest orders"
  on public.orders
  as permissive
  for insert
  to anon
  with check (user_id is null);

create policy "Allow authenticated insert own orders"
  on public.orders
  as permissive
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- SELECT: anon sees only guest orders, authenticated sees only their own
drop policy "Allow public read orders" on public.orders;

create policy "Allow anon read guest orders"
  on public.orders
  as permissive
  for select
  to anon
  using (user_id is null);

create policy "Allow authenticated read own orders"
  on public.orders
  as permissive
  for select
  to authenticated
  using (user_id = auth.uid());
