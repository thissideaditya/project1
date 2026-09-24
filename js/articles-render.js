/* ===================================================================
   ADA LAW CHAMBER — articles-render.js
   Renders the public Articles listing (downloadable PPT/PDF/Doc
   files) on articles.html. Mirrors links-render.js's pattern.
=================================================================== */
(function () {
  "use strict";

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function fileTypeLabel(type) {
    var t = (type || "").toLowerCase();
    if (t === "ppt" || t === "pptx") return "Presentation";
    if (t === "doc" || t === "docx") return "Document";
    if (t === "pdf") return "PDF";
    return t.toUpperCase();
  }

  function articleCard(article) {
    var fileName = (article.file_url || "").split("/").pop() || "download";
    return (
      '<article class="post-card">' +
        '<div class="body">' +
          '<span class="meta">' + escapeHtml(fileTypeLabel(article.file_type)) + " &middot; " + formatDate(article.created_at) + "</span>" +
          "<h3>" + escapeHtml(article.title) + "</h3>" +
          (article.description ? "<p>" + escapeHtml(article.description) + "</p>" : "") +
          '<a class="btn btn--sm btn--gold" href="' + escapeHtml(article.file_url) + '" download="' + escapeHtml(fileName) + '" style="margin-top:.75rem;align-self:flex-start;">Download &darr;</a>' +
        "</div>" +
      "</article>"
    );
  }

  async function renderArticles() {
    var mount = document.getElementById("articles-listing");
    if (!mount) return;

    try {
      var articles = await window.ADA.data.fetchArticles();
      if (!articles || articles.length === 0) {
        mount.innerHTML = '<div class="empty-state">No articles published yet. Please check back soon.</div>';
        return;
      }
      mount.className = "grid post-grid";
      mount.innerHTML = articles.map(articleCard).join("");
    } catch (err) {
      mount.innerHTML = '<div class="empty-state">Unable to load articles right now.</div>';
      console.error(err);
    }
  }

  document.addEventListener("DOMContentLoaded", renderArticles);
})();
