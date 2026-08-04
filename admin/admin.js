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

    var fileInput = document.getElementById("cover_image_file");
    var preview = document.getElementById("cover_image_preview");
    if (fileInput && preview) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) { preview.hidden = true; return; }
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
      });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var saveBtn = document.getElementById("save-btn");
      saveBtn.disabled = true;

      var coverImage = document.getElementById("cover_image").value.trim();
      var selectedFile = fileInput && fileInput.files && fileInput.files[0];

      try {
        if (selectedFile) {
          saveBtn.textContent = "Uploading image…";
          coverImage = await window.ADA.data.uploadImage(selectedFile);
        }

        var payload = {
          title: document.getElementById("title").value.trim(),
          category: document.getElementById("category").value,
          excerpt: document.getElementById("excerpt").value.trim(),
          content: document.getElementById("content").value.trim(),
          cover_image: coverImage || "https://picsum.photos/seed/" + Date.now() + "/800/500",
          status: document.getElementById("status").value,
        };

        saveBtn.textContent = "Saving…";
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

  /* -------------------------------------------------------------
     MESSAGES (admin/messages.html) — read-only list
  ------------------------------------------------------------- */
  function initMessages() {
    var table = document.getElementById("messages-table-body");
    if (!table) return;

    requireAuth().then(async function (session) {
      if (!session) return;
      try {
        var messages = await window.ADA.data.fetchMessages();
        if (!messages.length) {
          table.innerHTML = '<tr><td colspan="4">No messages yet.</td></tr>';
          return;
        }
        table.innerHTML = messages.map(function (m) {
          return (
            "<tr>" +
              "<td><strong>" + escapeHtml(m.name) + "</strong><br><span style=\"color:var(--ink-500);font-size:.82rem;\">" + escapeHtml(m.email) + (m.phone ? " &middot; " + escapeHtml(m.phone) : "") + "</span></td>" +
              "<td>" + escapeHtml(m.subject || "&mdash;") + "</td>" +
              "<td style=\"max-width:340px;white-space:pre-wrap;\">" + escapeHtml(m.message) + "</td>" +
              "<td style=\"white-space:nowrap;\">" + new Date(m.created_at).toLocaleString("en-IN") + "</td>" +
            "</tr>"
          );
        }).join("");
      } catch (err) {
        table.innerHTML = '<tr><td colspan="4">Could not load messages.</td></tr>';
        console.error(err);
      }
    });
  }

  /* -------------------------------------------------------------
     APPLICATIONS (admin/applications.html) — read-only list + resume download
  ------------------------------------------------------------- */
  function initApplications() {
    var table = document.getElementById("applications-table-body");
    if (!table) return;

    var allApplications = [];
    var activeFilter = "";

    requireAuth().then(async function (session) {
      if (!session) return;
      try {
        allApplications = await window.ADA.data.fetchApplications();
        render();
      } catch (err) {
        table.innerHTML = '<tr><td colspan="5">Could not load applications.</td></tr>';
        console.error(err);
      }
    });

    document.querySelectorAll("[data-filter]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll("[data-filter]").forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        activeFilter = tab.getAttribute("data-filter");
        render();
      });
    });

    function render() {
      var list = activeFilter
        ? allApplications.filter(function (a) { return a.application_type === activeFilter; })
        : allApplications;

      if (!list.length) {
        table.innerHTML = '<tr><td colspan="5">No applications yet.</td></tr>';
        return;
      }

      table.innerHTML = list.map(function (a) {
        var typeLabel = a.application_type === "internship" ? "Internship" : "Associate";
        var details = a.application_type === "internship"
          ? [a.college, a.study_year, a.duration].filter(Boolean).join(" &middot; ")
          : [a.bar_enrolment_no, a.years_experience, a.practice_area].filter(Boolean).join(" &middot; ");

        var resumeCell = a.resume_path
          ? '<a class="btn btn--sm btn--outline-dark" href="' + window.ADA.data.resumeDownloadUrl(a.id) + '" target="_blank" rel="noopener">Download</a>'
          : '<span style="color:var(--ink-500);font-size:.82rem;">Not attached</span>';

        return (
          "<tr>" +
            "<td>" + typeLabel + "</td>" +
            "<td><strong>" + escapeHtml(a.full_name) + "</strong><br><span style=\"color:var(--ink-500);font-size:.82rem;\">" + escapeHtml(a.email) + (a.phone ? " &middot; " + escapeHtml(a.phone) : "") + "</span></td>" +
            "<td style=\"max-width:280px;\">" + (details || "&mdash;") + (a.message ? "<br><span style=\"color:var(--ink-500);font-size:.82rem;\">" + escapeHtml(a.message) + "</span>" : "") + "</td>" +
            "<td>" + resumeCell + "</td>" +
            "<td style=\"white-space:nowrap;\">" + new Date(a.created_at).toLocaleString("en-IN") + "</td>" +
          "</tr>"
        );
      }).join("");
    }
  }

  /* -------------------------------------------------------------
     IMPORTANT LINKS (admin/links.html) — add / edit / delete
  ------------------------------------------------------------- */
  function initLinks() {
    var form = document.getElementById("link-form");
    if (!form) return;

    var table = document.getElementById("links-table-body");
    var saveBtn = document.getElementById("link-save-btn");
    var cancelBtn = document.getElementById("link-cancel-btn");
    var editingId = null;

    requireAuth().then(function (session) {
      if (session) loadLinks();
    });

    async function loadLinks() {
      table.innerHTML = '<tr><td colspan="4">Loading&hellip;</td></tr>';
      try {
        var links = await window.ADA.data.fetchLinks();
        if (!links.length) {
          table.innerHTML = '<tr><td colspan="4">No links yet. Add one above.</td></tr>';
          return;
        }
        table.innerHTML = links.map(function (l) {
          return (
            "<tr>" +
              "<td>" + l.display_order + "</td>" +
              "<td>" + escapeHtml(l.title) + "</td>" +
              "<td style=\"max-width:260px;overflow-wrap:anywhere;\"><a href=\"" + escapeHtml(l.url) + "\" target=\"_blank\" rel=\"noopener\">" + escapeHtml(l.url) + "</a></td>" +
              "<td style=\"white-space:nowrap;\">" +
                "<button class=\"btn btn--sm btn--outline-dark\" data-edit=\"" + l.id + "\">Edit</button> " +
                "<button class=\"btn btn--sm btn--danger\" data-delete=\"" + l.id + "\">Delete</button>" +
              "</td>" +
            "</tr>"
          );
        }).join("");

        table.querySelectorAll("[data-edit]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var link = links.find(function (l) { return String(l.id) === btn.getAttribute("data-edit"); });
            if (!link) return;
            editingId = link.id;
            document.getElementById("link-title").value = link.title || "";
            document.getElementById("link-url").value = link.url || "";
            document.getElementById("link-description").value = link.description || "";
            document.getElementById("link-order").value = link.display_order || 0;
            saveBtn.textContent = "Update Link";
            cancelBtn.hidden = false;
            form.scrollIntoView({ behavior: "smooth" });
          });
        });

        table.querySelectorAll("[data-delete]").forEach(function (btn) {
          btn.addEventListener("click", async function () {
            if (!confirm("Delete this link?")) return;
            await window.ADA.data.deleteLink(btn.getAttribute("data-delete"));
            loadLinks();
          });
        });
      } catch (err) {
        table.innerHTML = '<tr><td colspan="4">Could not load links.</td></tr>';
        console.error(err);
      }
    }

    function resetForm() {
      editingId = null;
      form.reset();
      document.getElementById("link-order").value = 0;
      saveBtn.textContent = "Add Link";
      cancelBtn.hidden = true;
    }

    cancelBtn.addEventListener("click", resetForm);

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var payload = {
        title: document.getElementById("link-title").value.trim(),
        url: document.getElementById("link-url").value.trim(),
        description: document.getElementById("link-description").value.trim(),
        display_order: parseInt(document.getElementById("link-order").value, 10) || 0,
      };

      saveBtn.disabled = true;
      try {
        if (editingId) {
          await window.ADA.data.updateLink(editingId, payload);
        } else {
          await window.ADA.data.createLink(payload);
        }
        resetForm();
        loadLinks();
      } catch (err) {
        alert("Could not save link: " + err.message);
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initDashboard();
    initEditor();
    initMessages();
    initApplications();
    initLinks();
    initLogout();
  });
})();
