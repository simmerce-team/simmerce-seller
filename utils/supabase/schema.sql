-- 1. Users Table
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamp with time zone default now()
);

-- 2. Cities Table
create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  country text default 'India',
  created_at timestamp with time zone default now()
);

-- 3. Business Types Table
create table business_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default now()
);

-- 4. Businesses Table
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  gst_number text,
  address text,
  pincode text,
  city_id uuid references cities(id) on delete set null,
  business_type_id uuid references business_types(id) on delete set null,
  is_verified boolean default false,
  created_at timestamp with time zone default now()
);

-- 5. User ↔ Business Mapping
create table user_businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  role text default 'owner', -- owner, manager, etc.
  created_at timestamp with time zone default now(),
  constraint unique_user_business unique (user_id, business_id)
);

-- 6. Categories Table (self-referential)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 7. Products Table
create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description jsonb,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null,
  unit text not null,
  moq int not null default 1,
  stock_quantity int default 0,
  sku text,
  barcode text,
  is_active boolean default true,
  is_featured boolean default false,
  view_count int default 0,
  enquiry_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint positive_moq check (moq > 0),
  constraint positive_stock check (stock_quantity >= 0)
);

-- 8. Product Images
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order int default 0,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- 9. Product Views
create table product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- 10. Enquiries
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  message text,
  status text default 'new', -- new, contacted, quoted, closed
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 11. Buy Leads
create table buy_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  quantity int,
  unit text,
  target_price numeric(10,2),
  status text default 'open', -- open, in_negotiation, closed
  created_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for better performance
create index idx_products_business_id on products(business_id);
create index idx_products_category_id on products(category_id);
create index idx_products_is_active on products(is_active);
create index idx_product_images_product_id on product_images(product_id);
create index idx_enquiries_business_id on enquiries(business_id);
create index idx_buy_leads_business_id on buy_leads(business_id);

-- Function to get business metrics for dashboard
create or replace function public.get_business_metrics(p_business_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_metrics jsonb;
  v_total_products int;
  v_active_enquiries int;
  v_open_buy_leads int;
  v_conversion_rate numeric(10,2);
  v_total_views int;
  v_total_enquiries int;
begin
  -- Get total products
  select count(*) into v_total_products
  from products
  where business_id = p_business_id
  and is_active = true;

  -- Get active enquiries
  select count(*) into v_active_enquiries
  from enquiries
  where business_id = p_business_id
  and status in ('new', 'contacted', 'quoted');

  -- Get open buy leads
  select count(*) into v_open_buy_leads
  from buy_leads
  where business_id = p_business_id
  and status = 'open';

  -- Calculate conversion rate (enquiries / views)
  select 
    count(distinct e.id) as enquiries,
    count(distinct pv.id) as views
  into v_total_enquiries, v_total_views
  from products p
  left join product_views pv on pv.product_id = p.id
  left join enquiries e on e.product_id = p.id
  where p.business_id = p_business_id;

  if v_total_views > 0 then
    v_conversion_rate := (v_total_enquiries::numeric / v_total_views) * 100;
  else
    v_conversion_rate := 0;
  end if;

  -- Build the result
  v_metrics := jsonb_build_object(
    'total_products', v_total_products,
    'active_enquiries', v_active_enquiries,
    'open_buy_leads', v_open_buy_leads,
    'conversion_rate', round(v_conversion_rate, 2),
    'last_updated', now()
  );

  return v_metrics;
end;
$$;

-- Function to get product with primary image
create or replace function public.get_product_with_primary_image(p_product_id uuid)
returns jsonb
language sql
as $$
  select jsonb_build_object(
    'product', to_jsonb(p.*),
    'primary_image', (
      select to_jsonb(pi.*)
      from product_images pi
      where pi.product_id = p.id
      and pi.is_primary = true
      limit 1
    )
  )
  from products p
  where p.id = p_product_id;
$$;

