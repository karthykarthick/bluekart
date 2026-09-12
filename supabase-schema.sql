-- =========================================================================
-- BLUECART RETAIL STORE - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Run this SQL in your Supabase Project: SQL Editor -> New Query -> Run
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth or custom users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  role text default 'customer' check (role in ('admin', 'customer')),
  avatar_url text,
  phone text,
  street text,
  city text,
  state text,
  zip text,
  country text default 'United States',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories Table
create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  icon_name text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique not null,
  description text,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  category_id text references public.categories(id) on delete set null,
  category_name text,
  inventory_count integer default 0,
  sku text unique,
  images text[] default array[]::text[],
  featured_badge text check (featured_badge in ('Best Seller', 'New', 'Sale', 'Featured', null)),
  rating numeric(3, 2) default 5.0,
  reviews_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders Table
create table if not exists public.orders (
  id text primary key default gen_random_uuid()::text,
  order_number text unique not null,
  user_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  tax numeric(10, 2) not null,
  shipping_cost numeric(10, 2) default 0.00,
  discount numeric(10, 2) default 0.00,
  total numeric(10, 2) not null,
  payment_method text default 'stripe',
  payment_status text default 'paid' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_id text,
  order_status text default 'placed' check (order_status in ('placed', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')),
  tracking_number text,
  carrier text,
  estimated_delivery text,
  delivery_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Categories RLS: Everyone can read active categories; Admins can insert/update/delete
create policy "Allow public read access to categories" on public.categories
  for select using (true);

create policy "Allow admins full access to categories" on public.categories
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- Products RLS: Everyone can read active products; Admins can insert/update/delete
create policy "Allow public read access to products" on public.products
  for select using (true);

create policy "Allow admins full access to products" on public.products
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- Orders RLS: Customers can read their own orders; Admins can read and edit all orders
create policy "Customers can read own orders" on public.orders
  for select using (
    auth.uid()::text = user_id or
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

create policy "Customers can insert orders" on public.orders
  for insert with check (true);

create policy "Admins can update orders" on public.orders
  for update using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- Initial Categories Seed
insert into public.categories (id, name, slug, description, image_url, icon_name)
values
  ('cat_electronics', 'Electronics & Audio', 'electronics', 'High performance headphones and accessories', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Headphones'),
  ('cat_apparel', 'Apparel & Wear', 'apparel', 'Minimalist streetwear and premium jackets', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', 'Shirt'),
  ('cat_accessories', 'Accessories & Bags', 'accessories', 'Waterproof backpacks and tactical everyday carry gear', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 'ShoppingBag'),
  ('cat_home', 'Home & Workspace', 'home-workspace', 'Ergonomic desk lights and productivity goods', 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=80', 'Home')
on conflict (id) do nothing;
