/* ===================================================================
   ADA LAW CHAMBER — partials.js
   Loads the shared header and footer from /partials/ so every page
   stays in sync automatically. To change the header or footer on
   every page at once, edit ONLY these two files:
     partials/header.html
     partials/footer.html
   Nothing else needs to change — every public page pulls from them.
=================================================================== */
(function () {
  "use strict";

  function inject(placeholderId, url) {
    var el = document.getElementById(placeholderId);
    if (!el) return Promise.resolve(); // page doesn't use this slot — skip quietly

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
      })
      .catch(function (err) {
        console.error("[partials.js] could not load " + url + ": " + err.message);
        // Leave the empty slot in place rather than breaking the page.
      });
  }

  Promise.all([
    inject("site-header-slot", "partials/header.html"),
    inject("site-footer-slot", "partials/footer.html"),
  ]).then(function () {
    // main.js listens for this to run nav toggling, active-link
    // highlighting, and the footer year — all of which need the
    // real header/footer markup to exist in the page first.
    document.dispatchEvent(new Event("ada:partials-loaded"));
  });
})();
