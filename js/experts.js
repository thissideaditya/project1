/* ===================================================================
   ADA LAW CHAMBER — experts.js
   Placeholder roster for the "Meet Our Experts" section. Swap the
   name/role/img fields below to update the section site-wide —
   nothing else in the codebase needs to change.
=================================================================== */
(function () {
  "use strict";

  var EXPERTS = [
    { name: "Ashu Dalmia", role: "FOUNDER · CHARTERED ACCOUNTANT & ADVOCATE", img: "/assets/images/ashuImage.png" },
    { name: "Smita Raj", role: "Tax PROFESSIONAL", img: "/assets/images/smitaImage.png" },
    { name: "Adv. Ankita Jha", role: "LEGAL PRACTITIONER", img: "/assets/images/ankitaImage.png" },
    { name: "CA. CMA. Avanit Chaturvedi", role: "FINANCE & LEGAL PROFESSIONAL", img: "/assets/images/avanitImage.png" },
    { name: "Neelam ", role: "Advocate", img: "/assets/images/neelamImage.png" },
    { name: "Ishu Bharti Jha", role: "MANAGER · ASSOCIATE", img: "/assets/images/ishuImage.png" },
    { name: "CA (Dr.) Sunil Goel", role: "CONSULTANT · CONTRACTS, COMPLIANCE & INVESTIGATIONS", img: "/assets/images/sunilImage.png" },
    { name: "Saurabh Sharma", role: "CONSULTANT · BANKING & FINANCIAL SERVICES", img: "/assets/images/saurabhImage.png" },
    { name: "Anuj Dalmia", role: "CONSULTANT · START-UP & TRANSACTION ADVISORY", img: "/assets/images/anujImage.png" },
    { name: "CA Ravish Barahia", role: "CONSULTANT", img: "/assets/images/ravishImage.png" },
  ];

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function render() {
    var mount = document.getElementById("experts-grid");
    if (!mount) return;
    mount.innerHTML = EXPERTS.map(function (e) {
      return (
        '<div class="team-card">' +
          '<div class="team-photo"><img src="' + e.img + '" alt="' + escapeHtml(e.name) + '" loading="lazy"></div>' +
          '<div class="team-info"><h3>' + escapeHtml(e.name) + '</h3><span class="role">' + escapeHtml(e.role) + '</span></div>' +
        '</div>'
      );
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", render);
})();
