/* ===================================================================
   ADA LAW CHAMBER — main.js
   Shared behaviour for every public page: disclaimer gate, mobile
   nav, dropdown handling, active-link marking.
=================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------
     0. FLOATING CONTACT BUTTONS (WhatsApp + Email)
     Edit these two values to change the number/address site-wide —
     nothing else needs to change on any page.
  ------------------------------------------------------------- */
  var CONTACT = {
    whatsappNumber: "918796630295", // digits only, country code first, no + or spaces
    whatsappMessage: "Hello ADA Law Chambers, I would like to know more about your services.",
    email: "hello@adalawchambers.com",
  };

  function initFloatingContact() {
    if (document.querySelector(".floating-contact")) return; // don't double-inject

    var wrap = document.createElement("div");
    wrap.className = "floating-contact";
    wrap.innerHTML =
      '<a class="floating-btn floating-btn--whatsapp" data-label="Chat on WhatsApp" ' +
        'href="https://wa.me/' + CONTACT.whatsappNumber + '?text=' + encodeURIComponent(CONTACT.whatsappMessage) + '" ' +
        'target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">' +
        '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.23.6 4.32 1.65 6.12L4 29l8.06-1.6a12.9 12.9 0 0 0 3.96.62h.01c6.62 0 12.02-5.4 12.02-12.02C28.05 8.4 22.65 3 16.02 3zm7.03 17c-.3.83-1.6 1.55-2.5 1.7-.64.1-1.47.14-2.37-.15-.55-.17-1.25-.4-2.15-.8-3.78-1.63-6.25-5.4-6.44-5.65-.19-.25-1.53-2.04-1.53-3.9 0-1.85 1-2.76 1.34-3.13.34-.37.75-.47 1-.47.25 0 .5 0 .72.01.23.01.54-.09.85.65.3.74 1.03 2.56 1.13 2.75.1.19.16.4.03.65-.13.25-.19.4-.38.62-.19.22-.4.5-.57.67-.19.19-.39.4-.17.78.22.37 1 1.63 2.13 2.64 1.47 1.3 2.7 1.71 3.08 1.9.38.19.6.16.83-.1.22-.25.94-1.1 1.19-1.47.25-.37.5-.31.83-.19.34.12 2.15 1.01 2.52 1.2.37.19.62.28.7.44.09.16.09.9-.21 1.73z"/></svg>' +
      '</a>' +
      '<a class="floating-btn floating-btn--email" data-label="Email us" ' +
        'href="mailto:' + CONTACT.email + '" aria-label="Email ADA Law Chamber">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4z" opacity="0"/><path d="M4 6h16v12H4z"/><path d="M4 6l8 7 8-7"/></svg>' +
      '</a>';

    document.body.appendChild(wrap);
  }

  /* -------------------------------------------------------------
     1. DISCLAIMER GATE
     Shown once per browser tab (sessionStorage). Blurs + locks the
     page until "I Agree" is clicked.
  ------------------------------------------------------------- */
  function initDisclaimer() {
    var overlay = document.getElementById("disclaimer-overlay");
    if (!overlay) return;

    var alreadyAgreed = sessionStorage.getItem("ada_disclaimer_agreed") === "true";
    if (alreadyAgreed) {
      overlay.hidden = true;
      document.body.classList.remove("disclaimer-active");
      return;
    }

    document.body.classList.add("disclaimer-active");
    overlay.hidden = false;

    var agreeBtn = document.getElementById("disclaimer-agree");
    if (agreeBtn) {
      agreeBtn.addEventListener("click", function () {
        sessionStorage.setItem("ada_disclaimer_agreed", "true");
        overlay.hidden = true;
        document.body.classList.remove("disclaimer-active");
      });
    }
  }

  /* -------------------------------------------------------------
     2. MOBILE NAV
  ------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Mobile dropdown (Insights > Rules/Thoughts) taps to expand instead of hover
    document.querySelectorAll(".has-dropdown > a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (window.innerWidth <= 760) {
          var parent = link.parentElement;
          var hasChildren = parent.querySelector(".dropdown");
          if (hasChildren) {
            e.preventDefault();
            parent.classList.toggle("open");
          }
        }
      });
    });

    // Close mobile nav when a real link (not a dropdown toggle) is tapped
    nav.querySelectorAll("a:not(.has-dropdown > a)").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
      });
    });
  }

  /* -------------------------------------------------------------
     3. ACTIVE LINK HIGHLIGHTING
     Compares each nav link's pathname against the current page.
  ------------------------------------------------------------- */
  function markActiveLink() {
    var current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var page = href.split("/").pop();
      if (page === current) {
        link.classList.add("active");
      }
    });
  }

  /* -------------------------------------------------------------
     4. FOOTER YEAR
  ------------------------------------------------------------- */
  function setYear() {
    var el = document.getElementById("current-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFloatingContact();
    initDisclaimer();
    initNav();
    markActiveLink();
    setYear();
  });
})();
