-- ============================================================
-- KING WARRIORS COMMUNITY — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor on a fresh project.
-- Table shapes mirror lib/types.ts so the app can be pointed
-- straight at these tables once NEXT_PUBLIC_SUPABASE_URL and
-- NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- daily_updates ----------
create table if not exists daily_updates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('announcement','news','event-recap','achievement','general')),
  image_url text,
  video_url text,
  author text not null,
  author_avatar_url text,
  pinned boolean default false,
  created_at timestamptz default now()
);

-- ---------- winners ----------
create table if not exists winners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  photo_url text not null,
  tier text not null check (tier in ('weekly','monthly','hall-of-fame')),
  reward text not null,
  achievement text not null,
  badge text not null,
  period_label text not null,
  date timestamptz default now()
);

-- ---------- events ----------
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  image_url text,
  location text not null,
  is_online boolean default false,
  start_at timestamptz not null,
  end_at timestamptz,
  register_url text,
  status text not null check (status in ('upcoming','past')) default 'upcoming',
  attendees_count int default 0
);

-- ---------- meetings ----------
create table if not exists meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  agenda text[] not null default '{}',
  scheduled_at timestamptz not null,
  summary text,
  attachment_url text,
  attachment_label text,
  register_url text
);

-- ---------- gallery_items ----------
create table if not exists gallery_items (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('photo','video')),
  url text not null,
  thumbnail_url text,
  caption text not null,
  category text not null,
  width int not null,
  height int not null,
  created_at timestamptz default now()
);

-- ---------- team_members ----------
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null check (role in ('Founder','Admin','Moderator')),
  title text not null,
  photo_url text not null,
  bio text not null,
  socials jsonb default '[]'
);

-- ---------- community_rules ----------
create table if not exists community_rules (
  id uuid primary key default uuid_generate_v4(),
  "order" int not null,
  title text not null,
  description text not null
);

-- ---------- faqs ----------
create table if not exists faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null
);

-- ---------- contact_messages ----------
create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now(),
  handled boolean default false
);

-- ---------- members ----------
-- Public signups from the /join page. Anyone can insert (no login
-- required to sign up); only authenticated admins can read or delete.
create table if not exists members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  phone text,
  why_join text,
  joined_at timestamptz default now()
);

-- ---------- site_settings ----------
-- Single-row table (id is always 1) holding site-wide toggles, currently
-- just maintenance mode. Read by middleware.ts on every request.
create table if not exists site_settings (
  id int primary key default 1,
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'We''ll be back shortly. King Warriors Community is undergoing scheduled maintenance — thank you for your patience.',
  total_members int not null default 10248,
  active_members int not null default 6890,
  chapters int not null default 12,
  updated_at timestamptz default now()
);
insert into site_settings (id, maintenance_mode) values (1, false) on conflict (id) do nothing;

-- ---------- Row Level Security ----------
-- Public read access for content tables; writes restricted to authenticated
-- admins. Adjust the admin check to your own role/claims setup.
alter table daily_updates enable row level security;
alter table winners enable row level security;
alter table events enable row level security;
alter table meetings enable row level security;
alter table gallery_items enable row level security;
alter table team_members enable row level security;
alter table community_rules enable row level security;
alter table faqs enable row level security;
alter table contact_messages enable row level security;
alter table members enable row level security;
alter table site_settings enable row level security;

create policy "Public read" on daily_updates for select using (true);
create policy "Public read" on winners for select using (true);
create policy "Public read" on events for select using (true);
create policy "Public read" on meetings for select using (true);
create policy "Public read" on gallery_items for select using (true);
create policy "Public read" on team_members for select using (true);
create policy "Public read" on community_rules for select using (true);
create policy "Public read" on faqs for select using (true);

create policy "Authenticated write" on daily_updates for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on winners for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on events for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on meetings for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on gallery_items for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on team_members for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on community_rules for all using (auth.role() = 'authenticated');
create policy "Authenticated write" on faqs for all using (auth.role() = 'authenticated');

-- Anyone can submit a contact message; only authenticated admins can read them.
create policy "Anyone can submit" on contact_messages for insert with check (true);
create policy "Admins can read" on contact_messages for select using (auth.role() = 'authenticated');

-- Anyone can sign up as a member; only authenticated admins can read/delete the list.
-- Signups go through app/api/join/route.ts (service role key, after OTP
-- verification) — NOT directly from the browser — so there is deliberately
-- no public insert policy here.
create policy "Admins can manage members" on members for select using (auth.role() = 'authenticated');
create policy "Admins can delete members" on members for delete using (auth.role() = 'authenticated');

-- ---------- otp_codes ----------
-- Email verification codes for /join signups. Deliberately has NO RLS
-- policies at all — only app/api/*/route.ts, using the SECRET service role
-- key (supabaseAdmin), can read or write it. This is what keeps codes from
-- being readable via the public anon key.
create table if not exists otp_codes (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code text not null,
  consumed boolean not null default false,
  verified_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists otp_codes_email_idx on otp_codes(email);
alter table otp_codes enable row level security;
-- No policies added on purpose — see comment above.

-- ============================================================
-- STORAGE — gallery photo uploads
-- Creates a public "gallery" bucket for admin-uploaded photos
-- (see app/admin/dashboard/gallery/page.tsx).
-- ============================================================
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Public read access to gallery bucket"
on storage.objects for select
using (bucket_id = 'gallery');

create policy "Authenticated upload to gallery bucket"
on storage.objects for insert
with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

create policy "Authenticated delete from gallery bucket"
on storage.objects for delete
using (bucket_id = 'gallery' and auth.role() = 'authenticated');

-- middleware.ts (unauthenticated, edge runtime) needs to read this on every
-- request; only logged-in admins can flip the toggle.
create policy "Public read" on site_settings for select using (true);
create policy "Authenticated write" on site_settings for all using (auth.role() = 'authenticated');
