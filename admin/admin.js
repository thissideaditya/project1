/* ===================================================================
   ADA LAW CHAMBER — admin.js
   Handles login, route-guarding, and the create/edit/delete flows
   for Rules & Thoughts posts. Talks only to window.ADA.data, so it
   works identically against the local mock store or real Supabase.
=================================================================== */
(function () {
  "use strict";

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  /* -------------------------------------------------------------
     LOGIN PAGE (admin/index.html)
  ------------------------------------------------------------- */
  function initLoginPage() {
    var form = document.getElementById("login-form");
    if (!form) return;

    // If already signed in, skip straight to dashboard.
    window.ADA.data.getSession().then(function (session) {
      if (session) window.location.href = "dashboard.html";
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("email").value.trim();
      var password = document.getElementById("password").value;
      var errorBox = document.getElementById("login-error");
      errorBox.hidden = true;

      try {
        await window.ADA.data.signIn(email, password);
        window.location.href = "dashboard.html";
      } catch (err) {
        errorBox.textContent = err.message || "Unable to sign in.";
        errorBox.hidden = false;
      }
    });
  }

  /* -------------------------------------------------------------
     ROUTE GUARD — used by dashboard.html and editor.html
  ------------------------------------------------------------- */
  async function requireAuth() {
    var session = await window.ADA.data.getSession();
    if (!session) {
      window.location.href = "index.html";
      return null;
    }
    var who = document.getElementById("admin-user-label");
    if (who) who.textContent = session.email || "Admin";
    return session;
  }

  function initLogout() {
    document.querySelectorAll("[data-logout]").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        await window.ADA.data.signOut();
        window.location.href = "index.html";
      });
    });
  }

  /* -------------------------------------------------------------
     DASHBOARD (admin/dashboard.html) — list, filter, delete
  ------------------------------------------------------------- */
  function initDashboard() {
    var table = document.getElementById("posts-table-body");
    if (!table) return;

    requireAuth().then(function (session) {
      if (session) loadPosts();
    });

    var filterTabs = document.querySelectorAll("[data-filter]");
    var activeFilter = "";
    filterTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        filterTabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        activeFilter = tab.getAttribute("data-filter");
        loadPosts();
      });
    });

    async function loadPosts() {
      table.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
      try {
        var posts = await window.ADA.data.fetchAllPosts(activeFilter || undefined);
        if (!posts.length) {
          table.innerHTML = '<tr><td colspan="5">No posts yet. Click "New Post" to add one.</td></tr>';
          return;
        }
        table.innerHTML = posts
          .map(function (p) {
            return (
              "<tr>" +
                "<td>" + escapeHtml(p.title) + "</td>" +
                "<td>" + (p.category === "rule" ? "Rules" : "Thoughts") + "</td>" +
                '<td><span class="status-pill ' + p.status + '">' + p.status + "</span></td>" +
                "<td>" + new Date(p.created_at).toLocaleDateString("en-IN") + "</td>" +
                '<td style="white-space:nowrap;">' +
                  '<a class="btn btn--sm btn--outline-dark" href="editor.html?id=' + encodeURIComponent(p.id) + '">Edit</a> ' +
                  '<button class="btn btn--sm btn--danger" data-delete="' + p.id + '">Delete</button>' +
                "</td>" +
              "</tr>"
            );
          })
          .join("");

        table.querySelectorAll("[data-delete]").forEach(function (btn) {
          btn.addEventListener("click", async function () {
            if (!confirm("Delete this post permanently?")) return;
            await window.ADA.data.deletePost(btn.getAttribute("data-delete"));
            loadPosts();
          });
        });
      } catch (err) {
        table.innerHTML = '<tr><td colspan="5">Could not load posts.</td></tr>';
        console.error(err);
      }
    }
  }

  /* -------------------------------------------------------------
     EDITOR (admin/editor.html) — create or update a post
  ------------------------------------------------------------- */
  function initEditor() {
    var form = document.getElementById("post-form");
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var editId = params.get("id");
    var heading = document.getElementById("editor-heading");

    requireAuth().then(async function (session) {
      if (!session) return;
      if (editId) {
        heading.textContent = "Edit Post";
        var post = await window.ADA.data.fetchPostById(editId);
        if (post) {
          document.getElementById("title").value = post.title || "";
          document.getElementById("category").value = post.category || "rule";
          document.getElementById("excerpt").value = post.excerpt || "";
          document.getElementById("content").value = post.content || "";
          document.getElementById("cover_image").value = post.cover_image || "";
          document.getElementById("status").value = post.status || "draft";
        }
      } else {
        heading.textContent = "New Post";
      }
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var payload = {
        title: document.getElementById("title").value.trim(),
        category: document.getElementById("category").value,
        excerpt: document.getElementById("excerpt").value.trim(),
        content: document.getElementById("content").value.trim(),
        cover_image: document.getElementById("cover_image").value.trim() || "https://picsum.photos/seed/" + Date.now() + "/800/500",
        status: document.getElementById("status").value,
      };

      var saveBtn = document.getElementById("save-btn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving…";

      try {
        if (editId) {
          await window.ADA.data.updatePost(editId, payload);
        } else {
          await window.ADA.data.createPost(payload);
        }
        window.location.href = "dashboard.html";
      } catch (err) {
        alert("Could not save post: " + err.message);
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Post";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initDashboard();
    initEditor();
    initLogout();
  });
})();
