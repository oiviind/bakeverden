drop extension if exists "pg_net";


  create table "public"."batch_ingredients" (
    "id" uuid not null default gen_random_uuid(),
    "batch_id" uuid,
    "ingredient_id" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."batch_ingredients" enable row level security;


  create table "public"."cake_requests" (
    "id" uuid not null default gen_random_uuid(),
    "occasion" text not null,
    "num_people" integer,
    "desired_date" date,
    "description" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text,
    "status" text not null default 'ny'::text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."cake_requests" enable row level security;


  create table "public"."gallery_images" (
    "id" uuid not null default gen_random_uuid(),
    "image_url" text not null,
    "category" text not null,
    "created_at" timestamp with time zone default now(),
    "title" text
      );


alter table "public"."gallery_images" enable row level security;


  create table "public"."ingredients" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "allergen" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ingredients" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "batch_id" uuid not null,
    "quantity" integer not null,
    "price_at_time" integer not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."order_items" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "phone" text not null,
    "pickup_time" timestamp without time zone,
    "status" text default 'confirmed'::text,
    "internal_note" text,
    "created_at" timestamp without time zone default now(),
    "total_price" integer not null default 0,
    "email" text,
    "sms_sent" boolean not null default false,
    "email_sent" boolean not null default false
      );


alter table "public"."orders" enable row level security;


  create table "public"."product_batches" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "image_url" text,
    "pickup_start" timestamp without time zone not null,
    "pickup_end" timestamp without time zone not null,
    "total_quantity" integer not null,
    "remaining_quantity" integer not null,
    "is_active" boolean default true,
    "created_at" timestamp without time zone default now(),
    "price" numeric(10,2),
    "original_price" integer,
    "discount_percent" integer
      );


alter table "public"."product_batches" enable row level security;

CREATE UNIQUE INDEX batch_ingredients_batch_id_ingredient_id_key ON public.batch_ingredients USING btree (batch_id, ingredient_id);

CREATE UNIQUE INDEX batch_ingredients_pkey ON public.batch_ingredients USING btree (id);

CREATE UNIQUE INDEX cake_requests_pkey ON public.cake_requests USING btree (id);

CREATE UNIQUE INDEX gallery_images_pkey ON public.gallery_images USING btree (id);

CREATE INDEX idx_order_items_batch_id ON public.order_items USING btree (batch_id);

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);

CREATE INDEX idx_orders_email ON public.orders USING btree (email);

CREATE INDEX idx_orders_status ON public.orders USING btree (status);

CREATE UNIQUE INDEX ingredients_name_key ON public.ingredients USING btree (name);

CREATE UNIQUE INDEX ingredients_pkey ON public.ingredients USING btree (id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX product_batches_pkey ON public.product_batches USING btree (id);

alter table "public"."batch_ingredients" add constraint "batch_ingredients_pkey" PRIMARY KEY using index "batch_ingredients_pkey";

alter table "public"."cake_requests" add constraint "cake_requests_pkey" PRIMARY KEY using index "cake_requests_pkey";

alter table "public"."gallery_images" add constraint "gallery_images_pkey" PRIMARY KEY using index "gallery_images_pkey";

alter table "public"."ingredients" add constraint "ingredients_pkey" PRIMARY KEY using index "ingredients_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."product_batches" add constraint "product_batches_pkey" PRIMARY KEY using index "product_batches_pkey";

alter table "public"."batch_ingredients" add constraint "batch_ingredients_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.product_batches(id) ON DELETE CASCADE not valid;

alter table "public"."batch_ingredients" validate constraint "batch_ingredients_batch_id_fkey";

alter table "public"."batch_ingredients" add constraint "batch_ingredients_batch_id_ingredient_id_key" UNIQUE using index "batch_ingredients_batch_id_ingredient_id_key";

alter table "public"."batch_ingredients" add constraint "batch_ingredients_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE not valid;

alter table "public"."batch_ingredients" validate constraint "batch_ingredients_ingredient_id_fkey";

alter table "public"."ingredients" add constraint "ingredients_name_key" UNIQUE using index "ingredients_name_key";

alter table "public"."order_items" add constraint "order_items_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.product_batches(id) not valid;

alter table "public"."order_items" validate constraint "order_items_batch_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."order_items" validate constraint "order_items_quantity_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_order(p_batch_id uuid, p_name text, p_phone text, p_quantity integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid;
  v_remaining int;
  v_updated_rows int;
BEGIN
  SELECT remaining_quantity INTO v_remaining
  FROM product_batches
  WHERE id = p_batch_id
  AND is_active = true;

  IF v_remaining IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Produktet finnes ikke'
    );
  END IF;

  IF v_remaining < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Kun %s igjen', v_remaining)
    );
  END IF;

  UPDATE product_batches
  SET remaining_quantity = remaining_quantity - p_quantity
  WHERE id = p_batch_id
  AND remaining_quantity >= p_quantity
  AND is_active = true;

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  
  IF v_updated_rows = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Kunne ikke oppdatere lager'
    );
  END IF;

  INSERT INTO orders (batch_id, name, phone, quantity)
  VALUES (p_batch_id, p_name, p_phone, p_quantity)
  RETURNING id INTO v_order_id;

  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$
;

grant delete on table "public"."batch_ingredients" to "anon";

grant insert on table "public"."batch_ingredients" to "anon";

grant references on table "public"."batch_ingredients" to "anon";

grant select on table "public"."batch_ingredients" to "anon";

grant trigger on table "public"."batch_ingredients" to "anon";

grant truncate on table "public"."batch_ingredients" to "anon";

grant update on table "public"."batch_ingredients" to "anon";

grant delete on table "public"."batch_ingredients" to "authenticated";

grant insert on table "public"."batch_ingredients" to "authenticated";

grant references on table "public"."batch_ingredients" to "authenticated";

grant select on table "public"."batch_ingredients" to "authenticated";

grant trigger on table "public"."batch_ingredients" to "authenticated";

grant truncate on table "public"."batch_ingredients" to "authenticated";

grant update on table "public"."batch_ingredients" to "authenticated";

grant delete on table "public"."batch_ingredients" to "service_role";

grant insert on table "public"."batch_ingredients" to "service_role";

grant references on table "public"."batch_ingredients" to "service_role";

grant select on table "public"."batch_ingredients" to "service_role";

grant trigger on table "public"."batch_ingredients" to "service_role";

grant truncate on table "public"."batch_ingredients" to "service_role";

grant update on table "public"."batch_ingredients" to "service_role";

grant delete on table "public"."cake_requests" to "anon";

grant insert on table "public"."cake_requests" to "anon";

grant references on table "public"."cake_requests" to "anon";

grant select on table "public"."cake_requests" to "anon";

grant trigger on table "public"."cake_requests" to "anon";

grant truncate on table "public"."cake_requests" to "anon";

grant update on table "public"."cake_requests" to "anon";

grant delete on table "public"."cake_requests" to "authenticated";

grant insert on table "public"."cake_requests" to "authenticated";

grant references on table "public"."cake_requests" to "authenticated";

grant select on table "public"."cake_requests" to "authenticated";

grant trigger on table "public"."cake_requests" to "authenticated";

grant truncate on table "public"."cake_requests" to "authenticated";

grant update on table "public"."cake_requests" to "authenticated";

grant delete on table "public"."cake_requests" to "service_role";

grant insert on table "public"."cake_requests" to "service_role";

grant references on table "public"."cake_requests" to "service_role";

grant select on table "public"."cake_requests" to "service_role";

grant trigger on table "public"."cake_requests" to "service_role";

grant truncate on table "public"."cake_requests" to "service_role";

grant update on table "public"."cake_requests" to "service_role";

grant delete on table "public"."gallery_images" to "anon";

grant insert on table "public"."gallery_images" to "anon";

grant references on table "public"."gallery_images" to "anon";

grant select on table "public"."gallery_images" to "anon";

grant trigger on table "public"."gallery_images" to "anon";

grant truncate on table "public"."gallery_images" to "anon";

grant update on table "public"."gallery_images" to "anon";

grant delete on table "public"."gallery_images" to "authenticated";

grant insert on table "public"."gallery_images" to "authenticated";

grant references on table "public"."gallery_images" to "authenticated";

grant select on table "public"."gallery_images" to "authenticated";

grant trigger on table "public"."gallery_images" to "authenticated";

grant truncate on table "public"."gallery_images" to "authenticated";

grant update on table "public"."gallery_images" to "authenticated";

grant delete on table "public"."gallery_images" to "service_role";

grant insert on table "public"."gallery_images" to "service_role";

grant references on table "public"."gallery_images" to "service_role";

grant select on table "public"."gallery_images" to "service_role";

grant trigger on table "public"."gallery_images" to "service_role";

grant truncate on table "public"."gallery_images" to "service_role";

grant update on table "public"."gallery_images" to "service_role";

grant delete on table "public"."ingredients" to "anon";

grant insert on table "public"."ingredients" to "anon";

grant references on table "public"."ingredients" to "anon";

grant select on table "public"."ingredients" to "anon";

grant trigger on table "public"."ingredients" to "anon";

grant truncate on table "public"."ingredients" to "anon";

grant update on table "public"."ingredients" to "anon";

grant delete on table "public"."ingredients" to "authenticated";

grant insert on table "public"."ingredients" to "authenticated";

grant references on table "public"."ingredients" to "authenticated";

grant select on table "public"."ingredients" to "authenticated";

grant trigger on table "public"."ingredients" to "authenticated";

grant truncate on table "public"."ingredients" to "authenticated";

grant update on table "public"."ingredients" to "authenticated";

grant delete on table "public"."ingredients" to "service_role";

grant insert on table "public"."ingredients" to "service_role";

grant references on table "public"."ingredients" to "service_role";

grant select on table "public"."ingredients" to "service_role";

grant trigger on table "public"."ingredients" to "service_role";

grant truncate on table "public"."ingredients" to "service_role";

grant update on table "public"."ingredients" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."product_batches" to "anon";

grant insert on table "public"."product_batches" to "anon";

grant references on table "public"."product_batches" to "anon";

grant select on table "public"."product_batches" to "anon";

grant trigger on table "public"."product_batches" to "anon";

grant truncate on table "public"."product_batches" to "anon";

grant update on table "public"."product_batches" to "anon";

grant delete on table "public"."product_batches" to "authenticated";

grant insert on table "public"."product_batches" to "authenticated";

grant references on table "public"."product_batches" to "authenticated";

grant select on table "public"."product_batches" to "authenticated";

grant trigger on table "public"."product_batches" to "authenticated";

grant truncate on table "public"."product_batches" to "authenticated";

grant update on table "public"."product_batches" to "authenticated";

grant delete on table "public"."product_batches" to "service_role";

grant insert on table "public"."product_batches" to "service_role";

grant references on table "public"."product_batches" to "service_role";

grant select on table "public"."product_batches" to "service_role";

grant trigger on table "public"."product_batches" to "service_role";

grant truncate on table "public"."product_batches" to "service_role";

grant update on table "public"."product_batches" to "service_role";


  create policy "Allow admin delete batch_ingredients"
  on "public"."batch_ingredients"
  as permissive
  for delete
  to public
using (true);



  create policy "Allow authenticated insert batch_ingredients"
  on "public"."batch_ingredients"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow public insert batch_ingredients"
  on "public"."batch_ingredients"
  as permissive
  for insert
  to anon, authenticated
with check (true);



  create policy "Allow public read batch_ingredients"
  on "public"."batch_ingredients"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "public_insert"
  on "public"."cake_requests"
  as permissive
  for insert
  to anon
with check (true);



  create policy "public_select"
  on "public"."gallery_images"
  as permissive
  for select
  to anon
using (true);



  create policy "Allow authenticated insert ingredients"
  on "public"."ingredients"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow public read ingredients"
  on "public"."ingredients"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow all operations on order_items"
  on "public"."order_items"
  as permissive
  for all
  to public
using (true);



  create policy "Allow public insert orders"
  on "public"."orders"
  as permissive
  for insert
  to anon
with check (true);



  create policy "Allow public read orders"
  on "public"."orders"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow public to update orders"
  on "public"."orders"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Allow authenticated insert product_batches"
  on "public"."product_batches"
  as permissive
  for insert
  to authenticated, anon
with check (true);



  create policy "Allow authenticated update product_batches"
  on "public"."product_batches"
  as permissive
  for update
  to authenticated, anon
using (true)
with check (true);



  create policy "Allow function updates"
  on "public"."product_batches"
  as permissive
  for update
  to anon, authenticated
using (true)
with check (true);



  create policy "Allow public read access"
  on "public"."product_batches"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Allow public delete 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Allow public delete 16wiy3a_1"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Allow public read 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Policy for bildeopplasting 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'product-images'::text));



