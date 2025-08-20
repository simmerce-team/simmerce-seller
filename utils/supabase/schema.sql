-- Enable necessary extensions
create extension if not exists "pgcrypto" with schema public; -- use gen_random_uuid

-- 0. Countries (only India for now, but scalable)
create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  iso_code text,
  phone_code text,
  currency text,
  currency_symbol text,
  status text default 'active',
  slug text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 1. States
create table if not exists states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id uuid not null references countries(id) on delete cascade,
  slug text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_state_name_country unique (name, country_id)
);

-- 2. Cities
create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state_id uuid references states(id) on delete set null,
  country_id uuid references countries(id) on delete set null,
  slug text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_city_state_country unique (name, state_id, country_id)
);

-- 3. Users (Profile table extending auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique not null,
  phone text,
  role text not null default 'buyer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Business Types
create table if not exists business_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Businesses
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  gst_number text,
  pan_number text,
  udyam_number text,
  address text not null,
  pincode text not null,
  city_id uuid references cities(id) on delete set null,
  business_type_id uuid references business_types(id) on delete set null,
  verification_status text not null default 'pending',
  verification_level int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. User-Business Mapping
create table if not exists user_businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_user_business unique (user_id, business_id)
);

-- 7. Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon_url text,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  specifications jsonb,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  unit text not null,
  moq int not null default 1 check (moq > 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku text,
  is_active boolean not null default true,
  view_count int not null default 0,
  enquiry_count int not null default 0,
  pdf_url text,
  youtube_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_product_business_slug unique (business_id, slug)
);

-- 9. Product Files
create table if not exists product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  file_type text not null,
  alt_text text,
  display_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- 10. Conversations (WhatsApp-like enquiry system)
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references users(id) on delete set null,
  seller_business_id uuid references businesses(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Conversation Messages
create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid references users(id) on delete set null,
  message_type text not null default 'text',
  message_content text,
  attachment_url text,
  created_at timestamptz not null default now()
);

-- 12. Buy Leads (RFQs)
create table if not exists buy_leads (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references users(id) on delete set null,
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  quantity int,
  unit text,
  target_price numeric(10,2),
  status text not null default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 13. Responses to Buy Leads
create table if not exists buy_lead_responses (
  id uuid primary key default gen_random_uuid(),
  buy_lead_id uuid not null references buy_leads(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  message text,
  offer_price numeric(10,2),
  created_at timestamptz default now()
);

-- 14. Verification (business and user)
create table if not exists business_verification (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  status text not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_business_verification unique (business_id)
);

create table if not exists verification_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  document_number text,
  expiry_date date,
  is_verified boolean not null default false,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_verification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  identity_verified boolean not null default false,
  verification_level int not null default 0,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_verification unique (user_id)
);

-- 15. OTP Auth
create table if not exists auth_otp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  phone_number text not null,
  otp_code char(6) not null,
  is_used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 16. Indexes
create index idx_products_business on products(business_id);
create index idx_products_category on products(category_id);
create index idx_products_name on products(name);
create index idx_products_created_at on products(created_at);
create index idx_conversations_buyer on conversations(buyer_id);
create index idx_conversations_seller on conversations(seller_business_id);
create index idx_conversation_messages_conversation on conversation_messages(conversation_id);
create index idx_buy_leads_category on buy_leads(category_id);
create index idx_buy_leads_status on buy_leads(status);
create index idx_buy_lead_responses_buy_lead on buy_lead_responses(buy_lead_id);
create index idx_user_verification_user on user_verification(user_id);
