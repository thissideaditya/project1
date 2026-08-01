/* ===================================================================
   ADA LAW CHAMBER — supabase-client.js
   ---------------------------------------------------------------
   Single place to plug in Supabase. Until real credentials are set
   below, every function transparently falls back to a localStorage
   "mock" store so Rules / Thoughts / Admin work out of the box.

   HOW TO CONNECT SUPABASE
   1. Create a project at https://supabase.com
   2. Run the SQL in /admin/schema.sql (included in this project)
      to create the `posts` table, `admins` policy and sample rows.
   3. In Supabase > Settings > API, copy the Project URL and anon
      public key into SUPABASE_CONFIG below.
   4. Enable Email/Password auth under Authentication > Providers,
      and create your admin user under Authentication > Users.
   5. Add the Supabase JS CDN script tag to every page that loads
      this file (already included in index.html, admin pages, etc.):
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
   6. Reload — ADA.data will automatically use Supabase instead of
      the local mock store.
=================================================================== */

var SUPABASE_CONFIG = {
  url: "YOUR_SUPABASE_PROJECT_URL", // e.g. https://xxxxxxxx.supabase.co
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};

(function (global) {
  "use strict";

  var isConfigured =
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url.indexOf("YOUR_SUPABASE") === -1 &&
    typeof global.supabase !== "undefined";

  var client = isConfigured
    ? global.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
    : null;

  /* -------------------------------------------------------------
     LOCAL MOCK STORE (used until Supabase is configured)
  ------------------------------------------------------------- */
  var LOCAL_KEY = "ada_posts_v1";
  var LOCAL_ADMIN_KEY = "ada_admin_session_v1";

  function seedIfEmpty() {
    var existing = localStorage.getItem(LOCAL_KEY);
    if (existing) return;

    var now = new Date().toISOString();
    var seed = [
      {
        id: "seed-1",
        category: "rule",
        title: "Understanding Place of Supply Under GST",
        slug: "understanding-place-of-supply-under-gst",
        excerpt:
          "A plain-language walkthrough of how place-of-supply rules decide whether a transaction attracts CGST/SGST or IGST.",
        content:
          "Place of supply determines which government — Central, State, or both — has the right to tax a transaction under GST. Getting this wrong is one of the most common (and costly) errors businesses make in return filing.\n\nFor goods, the place of supply is generally the location where movement of goods terminates for delivery to the recipient. For services, the default rule looks to the location of the recipient, with several category-specific exceptions such as services related to immovable property, restaurants, and admission to events.\n\nBusinesses operating across state lines should map every recurring transaction type against these rules before filing, rather than relying on invoicing habits carried over from the pre-GST regime.",
        cover_image: "https://picsum.photos/seed/rule-gst-1/800/500",
        status: "published",
        created_at: now,
      },
      {
        id: "seed-2",
        category: "rule",
        title: "Input Tax Credit: What Gets Blocked Under Section 17(5)",
        slug: "input-tax-credit-blocked-section-17-5",
        excerpt:
          "A quick-reference note on the categories of expenditure where ITC cannot be claimed, and why.",
        content:
          "Section 17(5) of the CGST Act lists categories of goods and services on which input tax credit is specifically restricted, even where GST has genuinely been paid. Common examples include motor vehicles used for personal transport, food and beverages (unless the output supply is of the same category), membership of clubs, and works contract services for construction of immovable property.\n\nThe restriction exists to prevent tax cascading from being used as a route to subsidise personal or non-business consumption. Businesses should build a standing checklist of blocked credits into their monthly reconciliation process rather than discovering the disallowance at the time of assessment.",
        cover_image: "https://picsum.photos/seed/rule-gst-2/800/500",
        status: "published",
        created_at: now,
      },
      {
        id: "seed-3",
        category: "thought",
        title: "Why GST Litigation Is Entering a New Phase",
        slug: "why-gst-litigation-entering-new-phase",
        excerpt:
          "With GSTAT benches becoming operational, disputes that once sat in limbo finally have a forum. Here is what businesses should prepare for.",
        content:
          "For years, taxpayers with GST disputes had no dedicated appellate tribunal to turn to, leaving High Courts to absorb writ petitions that should ordinarily have gone to a specialised forum. As GST Appellate Tribunal benches become operational across states, we expect a meaningful shift in how disputes are argued and resolved.\n\nTaxpayers who have been sitting on show-cause notices or first-appeal orders should use this window to get their factual record in order — reconciliations, correspondence, and contemporaneous documentation carry disproportionate weight once a matter reaches tribunal stage.",
        cover_image: "https://picsum.photos/seed/thought-1/800/500",
        status: "published",
        created_at: now,
      },
      {
        id: "seed-4",
        category: "thought",
        title: "Notes from the Field: Advising Founders on Early Compliance",
        slug: "notes-advising-founders-early-compliance",
        excerpt:
          "The cheapest compliance a start-up will ever buy is the compliance it builds in from day one.",
        content:
          "Founders tend to treat regulatory structuring as something to revisit once the business has 'proven itself'. In practice, the cost of retrofitting GST registration structures, cap tables, and founder agreements after the fact is almost always higher than the cost of doing it right at incorporation.\n\nOur advice to early-stage teams is simple: treat your first thirty days of operation as a compliance sprint, not an afterthought. A short structuring conversation before the first invoice is raised routinely saves months of remediation later.",
        cover_image: "https://picsum.photos/seed/thought-2/800/500",
        status: "published",
        created_at: now,
      },
    ];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(seed));
  }

  function localGetAll() {
    seedIfEmpty();
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  }

  function localSaveAll(posts) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /* -------------------------------------------------------------
     PUBLIC DATA API — used identically by public pages & admin,
     regardless of whether Supabase is wired up.
  ------------------------------------------------------------- */
  var ADA = {
    isSupabaseConfigured: isConfigured,

    /** Fetch published posts for a given category ('rule' | 'thought') */
    async fetchPosts(category) {
      if (client) {
        var { data, error } = await client
          .from("posts")
          .select("*")
          .eq("category", category)
          .eq("status", "published")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      return localGetAll()
        .filter(function (p) { return p.category === category && p.status === "published"; })
        .sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
    },

    /** Fetch a single post by slug (published only, for public pages) */
    async fetchPostBySlug(slug) {
      if (client) {
        var { data, error } = await client
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single();
        if (error) return null;
        return data;
      }
      return localGetAll().find(function (p) { return p.slug === slug && p.status === "published"; }) || null;
    },

    /** Admin: fetch ALL posts (draft + published), optionally filtered by category */
    async fetchAllPosts(category) {
      if (client) {
        var query = client.from("posts").select("*").order("created_at", { ascending: false });
        if (category) query = query.eq("category", category);
        var { data, error } = await query;
        if (error) throw error;
        return data;
      }
      var all = localGetAll().sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      return category ? all.filter(function (p) { return p.category === category; }) : all;
    },

    /** Admin: fetch a single post by id, any status */
    async fetchPostById(id) {
      if (client) {
        var { data, error } = await client.from("posts").select("*").eq("id", id).single();
        if (error) return null;
        return data;
      }
      return localGetAll().find(function (p) { return String(p.id) === String(id); }) || null;
    },

    /** Admin: create a post */
    async createPost(post) {
      post.slug = post.slug ? slugify(post.slug) : slugify(post.title);
      post.created_at = new Date().toISOString();

      if (client) {
        var { data, error } = await client.from("posts").insert([post]).select().single();
        if (error) throw error;
        return data;
      }
      var posts = localGetAll();
      post.id = "local-" + Date.now();
      posts.unshift(post);
      localSaveAll(posts);
      return post;
    },

    /** Admin: update a post */
    async updatePost(id, updates) {
      if (updates.title && !updates.slug) updates.slug = slugify(updates.title);
      if (client) {
        var { data, error } = await client.from("posts").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      var posts = localGetAll();
      var idx = posts.findIndex(function (p) { return String(p.id) === String(id); });
      if (idx === -1) throw new Error("Post not found");
      posts[idx] = Object.assign({}, posts[idx], updates);
      localSaveAll(posts);
      return posts[idx];
    },

    /** Admin: delete a post */
    async deletePost(id) {
      if (client) {
        var { error } = await client.from("posts").delete().eq("id", id);
        if (error) throw error;
        return true;
      }
      var posts = localGetAll().filter(function (p) { return String(p.id) !== String(id); });
      localSaveAll(posts);
      return true;
    },

    /* -------------------------------------------------------------
       AUTH — Supabase email/password auth when configured, else a
       simple local demo login (admin@adalawchamber.com / adalaw2024)
       so the panel is explorable before Supabase is connected.
       IMPORTANT: replace the demo credentials before real use, and
       remove the local-auth fallback entirely once Supabase is live.
    ------------------------------------------------------------- */
    async signIn(email, password) {
      if (client) {
        var { data, error } = await client.auth.signInWithPassword({ email: email, password: password });
        if (error) throw error;
        return data.user;
      }
      var DEMO_EMAIL = "admin@adalawchamber.com";
      var DEMO_PASSWORD = "adalaw2024";
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        var session = { email: email, signedInAt: new Date().toISOString() };
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(session));
        return session;
      }
      throw new Error("Invalid email or password.");
    },

    async signOut() {
      if (client) {
        await client.auth.signOut();
        return;
      }
      localStorage.removeItem(LOCAL_ADMIN_KEY);
    },

    async getSession() {
      if (client) {
        var { data } = await client.auth.getSession();
        return data.session ? data.session.user : null;
      }
      var raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    },
  };

  global.ADA = global.ADA || {};
  global.ADA.data = ADA;
})(window);
