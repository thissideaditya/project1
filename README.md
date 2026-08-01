# ADA Law Chamber — Website

A fully responsive, static HTML/CSS/JS website for ADA Law Chamber, with an
admin panel for managing the **Rules** and **Thoughts** sections (ready to
connect to Supabase).

## Structure

```
ada-law-chamber/
├── index.html            Home
├── about.html            About Us
├── practice-areas.html   Practice Areas
├── team.html             Our Team (bios, associated firms, consultants)
├── pro-bono.html         Pro Bono
├── insights.html         Insights landing (links to Rules / Thoughts)
├── rules.html            Rules listing (pulls from Supabase / local store)
├── thoughts.html         Thoughts listing (pulls from Supabase / local store)
├── post.html             Single article template (?slug=...)
├── careers.html          Internship + Associate application forms
├── contact.html          Contact form + chamber details
├── css/style.css         Single shared stylesheet (design tokens at top)
├── js/main.js            Disclaimer gate, mobile nav, active-link logic
├── js/experts.js         "Meet Our Experts" data + renderer (Home page)
├── js/supabase-client.js Data layer — Supabase when configured, else
│                         a localStorage mock store (works out of the box)
├── js/posts-render.js    Renders Rules/Thoughts listings & single articles
├── assets/images/logo.svg  Brand crest (green/gold)
└── admin/
    ├── index.html         Login
    ├── dashboard.html     List / filter / delete posts
    ├── editor.html        Create / edit a post
    ├── admin.js            Login, route guard, CRUD wiring
    └── schema.sql          Supabase table + RLS policies to run once
```

## Running locally

No build step is required. Just serve the folder:

```
cd ada-law-chamber
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Connecting Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor** in Supabase and run `admin/schema.sql`.
3. Under **Authentication > Providers**, enable Email.
4. Under **Authentication > Users**, create your admin login (email + password).
5. Under **Settings > API**, copy the **Project URL** and **anon public key**.
6. Paste them into `js/supabase-client.js` → `SUPABASE_CONFIG`.
7. Reload the site. Rules/Thoughts and the admin panel now read/write
   directly to Supabase — no other code changes needed.

Until step 6 is done, the whole site (including the admin panel) runs on a
localStorage-based mock store, seeded with sample Rules/Thoughts posts, so
you can explore everything immediately.

**Demo admin login (mock mode only):** `admin@adalawchamber.com` / `adalaw2024`
— replace this before going live; it has no effect once Supabase auth is wired up.

## Editing content

- **Team bios / logo / colours / experts:** edit directly in `team.html`,
  `assets/images/logo.svg`, the `:root` tokens in `css/style.css`, and
  `js/experts.js`.
- **Rules & Thoughts posts:** use the admin panel at `/admin/` — no code
  edits required.

## Notes

- The disclaimer overlay (Bar Council of India compliant) shows once per
  browser tab via `sessionStorage` and blurs the page until "I Agree" is
  clicked.
- All images are placeholders (Unsplash / Pravatar / Picsum) — swap the
  `src` attributes with real photography before launch.
