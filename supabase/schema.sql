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
  attachment_label text
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
