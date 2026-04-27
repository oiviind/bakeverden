-- Seed data for local development
-- This file is loaded automatically by `supabase start`

-- Storage buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('gallery_images', 'gallery_images', true)
on conflict (id) do nothing;

-- Ingredients
insert into public.ingredients (name, allergen) values
  ('Hvetemel', true),
  ('Egg', true),
  ('Smør', true),
  ('Sukker', false),
  ('Melk', true),
  ('Fløte', true),
  ('Sjokolade', false),
  ('Vanilje', false),
  ('Bakepulver', false),
  ('Salt', false),
  ('Mandler', true),
  ('Hasselnøtter', true)
on conflict (name) do nothing;
