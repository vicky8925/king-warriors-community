# King Warriors Community

A premium, black-and-gold, glassmorphism community website built with Next.js (App Router), TypeScript, Tailwind CSS v4, and Framer Motion.

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (design tokens in `app/globals.css`)
- **Animation:** Framer Motion
- **Icons:** lucide-react
- **Backend:** Supabase (auth + database) — optional, app runs on mock data out of the box
- **State:** Zustand (admin auth session)

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The entire public site and admin dashboard work immediately with **mock data** — no backend setup required.

### Admin dashboard (demo mode)

Go to `/admin/login`:

- **Email:** `admin@kingwarriors.community`
- **Password:** `warriors2026`

## Connecting a real backend (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` to create all tables and row-level security policies.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   ```
4. Restart the dev server. `lib/supabase.ts` will detect the credentials and `lib/auth.ts` automatically switches from mock login to real `supabase.auth.signInWithPassword`.
5. Create an admin user under Authentication → Users in the Supabase dashboard, or via `supabase.auth.signUp`.
6. Each `lib/data/*.ts` mock file has a matching table in `supabase/schema.sql` — swap the static arrays for `supabase.from(...).select()` calls as you migrate each section (the component code and types don't need to change).

## Project structure

```
app/
  page.tsx                  Home
  daily-updates/             Daily Updates
  winners/                   Reward Winners
  events/                    Upcoming Events
  meetings/                  Meetings
  gallery/                   Gallery
  team/                      Community Team
  rules/                     Rules & FAQ
  contact/                   Contact
  admin/
    login/                   Admin login
    dashboard/               Auth-guarded dashboard + CRUD screens
  sitemap.ts / robots.ts     SEO
components/
  layout/                    Navbar, Footer, BackToTop
  ui/                        Button, GlassCard, Crest, StatCard, etc.
  sections/                  Homepage sections
  admin/                     Sidebar, DashboardWidget, Modal, forms
lib/
  types.ts                   Shared TypeScript types
  data/                      Mock data (swap for Supabase queries)
  supabase.ts                Supabase client + config check
  auth.ts                    Admin auth store (mock <-> Supabase)
  utils.ts                   cn(), date formatters
supabase/
  schema.sql                 Full database schema + RLS policies
```

## Notes

- Admin CRUD screens currently persist changes in React state for the demo session (resets on refresh). Each page has a `NOTE:` comment marking exactly where to swap in Supabase calls.
- Image URLs use `picsum.photos` / `i.pravatar.cc` placeholders — swap for your own media or Supabase Storage URLs.
- Update the WhatsApp number in `app/contact/page.tsx` and `app/page.tsx` before launch.
- Update `SITE_URL` in `app/layout.tsx` and `app/sitemap.ts` to your real domain, and add a real `/public/og-image.png` (1200x630) for social sharing previews.

## Build

```bash
npm run build
npm start
```
