-- =====================================================================
-- ADA LAW CHAMBER — Supabase schema for the Rules & Thoughts sections
-- Paste this into Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('rule', 'thought')),
  title       text not null,
  slug        text not null unique,
  excerpt     text,
  content     text,
  cover_image text,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now()
);

-- Keep listings fast
create index if not exists posts_category_status_idx
  on public.posts (category, status, created_at desc);

-- Row Level Security: public visitors may only read published posts;
-- authenticated users (i.e. your logged-in admin) can do everything.
alter table public.posts enable row level security;

create policy "Public can read published posts"
  on public.posts for select
  using (status = 'published');

create policy "Authenticated users can read all posts"
  on public.posts for select
  to authenticated
  using (true);

create policy "Authenticated users can insert posts"
  on public.posts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update posts"
  on public.posts for update
  to authenticated
  using (true);

create policy "Authenticated users can delete posts"
  on public.posts for delete
  to authenticated
  using (true);

-- Optional: seed a couple of starter rows (safe to skip/edit)
insert into public.posts (category, title, slug, excerpt, content, cover_image, status)
values
  (
    'rule',
    'Understanding Place of Supply Under GST',
    'understanding-place-of-supply-under-gst',
    'A plain-language walkthrough of how place-of-supply rules decide whether a transaction attracts CGST/SGST or IGST.',
    'Place of supply determines which government has the right to tax a transaction under GST...',
    'https://picsum.photos/seed/rule-gst-1/800/500',
    'published'
  ),
  (
    'thought',
    'Why GST Litigation Is Entering a New Phase',
    'why-gst-litigation-entering-new-phase',
    'With GSTAT benches becoming operational, disputes that once sat in limbo finally have a forum.',
    'For years, taxpayers with GST disputes had no dedicated appellate tribunal to turn to...',
    'https://picsum.photos/seed/thought-1/800/500',
    'published'
  )
on conflict (slug) do nothing;

-- =====================================================================
-- NEXT STEPS
-- 1. Authentication > Providers: enable Email.
-- 2. Authentication > Users: add your admin user(s) by email/password.
-- 3. Settings > API: copy the Project URL + anon public key into
--    /js/supabase-client.js (SUPABASE_CONFIG).
-- 4. Add the Supabase JS CDN tag to every HTML page that loads
--    supabase-client.js (see comment at top of that file).
-- =====================================================================
