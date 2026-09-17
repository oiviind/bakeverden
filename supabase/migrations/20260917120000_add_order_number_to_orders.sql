-- Human-readable order number (#1001, #1002, ...). Existing orders are numbered automatically.
alter table public.orders
  add column order_number bigint generated always as identity (start with 1001) unique;
