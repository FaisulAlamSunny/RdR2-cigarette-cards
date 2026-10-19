/* ======================================================================
   RDR2 Cigarette Cards — rendering + behaviour (vanilla JS, no libraries)
   Data lives in cards-data.js (window.RDR2_DATA). Asset paths and the
   Google Form link are configured there (CONFIG).
   ====================================================================== */
(function () {
  "use strict";

  var D = window.RDR2_DATA;
  var CFG = D.config, SETS = D.sets, CARDS = D.cards;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var byId = {}, bySet = {};
  CARDS.forEach(function (c) { byId[c.id] = c; (bySet[c.setSlug] = bySet[c.setSlug] || []).push(c); });

  /* Safe text: all card/location text is escaped before it touches innerHTML
     (the viewer/location panel use textContent only). */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------------------------------------------------------------
     1. GALLERY RENDERER (one function renders every set + card)
     --------------------------------------------------------------- */
  function cardHTML(c, eager) {
    var d = CFG.dims[c.orientation];
    var alt = c.name + " Cigarette Card – " + c.setName;
    var srcset = c.thumbSrcset
      ? ' srcset="' + esc(c.thumbSrcset) + '" sizes="(max-width: 640px) 92vw, (max-width: 999px) 46vw, 300px"' : "";
    return '<li><button type="button" class="card" data-id="' + esc(c.id) + '" aria-haspopup="dialog">' +
      '<span class="card-art"><img src="' + esc(c.thumb) + '"' + srcset +
      ' width="' + d.w + '" height="' + d.h + '" alt="' + esc(alt) + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"></span>' +
      '<span class="card-cap"><span class="card-no">No. ' + pad(c.cardNumber) + '</span>' +
      '<span class="card-name">' + esc(c.name) + '</span></span></button></li>';
  }

  function renderGallery() {
    var main = $("#collection"), nav = $("#catnav-list");
    var html = "", navHtml = '<li><a href="#top" data-nav="all">All</a></li>';
    SETS.forEach(function (set) {
      var list = bySet[set.slug];
      var kind = set.orientation === "vertical" ? "Portrait Collection" : "Landscape Collection";
      var id = "set-" + set.slug;
      navHtml += '<li><a href="#' + id + '" data-nav="' + id + '">' + esc(set.name) + "</a></li>";
      html += '<section class="set" id="' + id + '" aria-labelledby="' + id + '-h">' +
        '<header class="set-head"><p class="set-seq">' + pad(set.number) + " / " + pad(SETS.length) + "</p>" +
        '<h2 id="' + id + '-h">' + esc(set.name) + "</h2>" +
        '<p class="set-meta">12 Card Set &bull; ' + kind + "</p>" +
        '<div class="rule" aria-hidden="true"><span>&#9670;</span></div></header>' +
        '<ul class="grid is-' + set.orientation + '">' +
        list.map(function (c, i) { return cardHTML(c, set.number === 1 && i < 4); }).join("") +
        "</ul></section>";
    });
    main.innerHTML = html;
    nav.innerHTML = navHtml;
  }

  /* Highlight the set in view (cheap, no scroll handlers) */
  function watchSections() {
    var links = {};
    document.querySelectorAll("[data-nav]").forEach(function (a) { links[a.dataset.nav] = a; });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        var a = links[e.target.id];
        if (a) {
          a.setAttribute("aria-current", "true");
          var bar = $("#catnav-list");
          bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2, behavior: reduceMotion.matches ? "auto" : "smooth" });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".set").forEach(function (s) { io.observe(s); });
  }

  /* Enquiry section: wire configured Google Form URLs */
  function setupEnquiry() {
    var link = $("#enquiry-link"), note = $("#enquiry-note"), frame = $("#enquiry-frame");
    var url = CFG.googleFormUrl || "";
    if (!url || url.indexOf("YOUR_FORM_ID") !== -1) {
      link.setAttribute("aria-disabled", "true");
      link.removeAttribute("target");
      link.addEventListener("click", function (e) { e.preventDefault(); });
      note.hidden = false;
    } else {
      link.href = url;
    }
    if (CFG.googleFormEmbedUrl) {
      var f = document.createElement("iframe");
      f.src = CFG.googleFormEmbedUrl;
      f.title = "Printed card set enquiry form";
      f.loading = "lazy";
      frame.appendChild(f);
      frame.hidden = false;
    }
  }

  /* ---------------------------------------------------------------
     2. REUSABLE VIEWER (single DOM instance)
     --------------------------------------------------------------- */
  var viewer = $("#viewer"), stage = $("#v-stage"), flipEl = $("#flip");
  var front = $("#v-front"), back = $("#v-back"), faceBack = $("#face-back");
  var loc = $("#loc"), btnFlip = $("#v-flip"), btnLoc = $("#v-loc"), live = $("#v-live");
  var page = $("#page");

  var S = { card: null, list: [], index: 0, flipped: false, locOpen: false, scrollY: 0, token: 0, busy: false };
  var loadedFronts = {};   // ids whose HD front is already in the browser cache
  var fetchedBacks = {};   // ids whose HD back has been requested (only after Flip)

  function currentButton() {
    return document.querySelector('.card[data-id="' + S.card.id + '"]');
  }

  function openViewer(id) {
    var c = byId[id]; if (!c) return;
    S.list = bySet[c.setSlug];                    // Previous/Next never leave this set
    S.index = S.list.indexOf(c);
    S.scrollY = window.pageYOffset;
    // lock background scroll without losing position
    document.body.style.top = -S.scrollY + "px";
    document.body.classList.add("is-locked");
    page.setAttribute("inert", "");
    viewer.hidden = false;
    render(c);
    $("#v-close").focus();
  }

  function closeViewer() {
    var btn = currentButton();
    viewer.hidden = true;
    viewer.classList.remove("loc-open");
    page.removeAttribute("inert");
    document.body.classList.remove("is-locked");
    document.body.style.top = "";
    window.scrollTo({ top: S.scrollY, left: 0, behavior: "instant" });   // restore gallery position
    if (btn) btn.focus({ preventScroll: true });
    S.card = null; S.flipped = false; S.locOpen = false;
    back.removeAttribute("src");
    front.removeAttribute("src");
    S.token++;
  }

  function setFlipped(on) {
    S.flipped = on;
    flipEl.classList.toggle("is-flipped", on);
    btnFlip.setAttribute("aria-pressed", String(on));
    btnFlip.textContent = on ? "Show Front" : "Flip";
    faceBack.setAttribute("aria-hidden", String(!on));
    $("#face-front").setAttribute("aria-hidden", String(on));
  }

  function setLocation(on) {
    S.locOpen = on;
    loc.hidden = !on;
    viewer.classList.toggle("loc-open", on);
    btnLoc.setAttribute("aria-expanded", String(on));
    btnLoc.textContent = on ? "Hide Location" : "Location";
  }

  /* Populate the one viewer from a card record */
  function render(c) {
    S.card = c;
    var token = ++S.token;
    var d = CFG.dims[c.orientation];
    var ratio = d.w / d.h;
    viewer.dataset.orientation = c.orientation;
    viewer.style.setProperty("--arn", ratio.toFixed(4));
    viewer.style.setProperty("--ar", d.w + " / " + d.h);

    // reset to front; back image is NOT requested until Flip is used
    setFlipped(false);
    back.removeAttribute("src");
    back.alt = c.name + " Cigarette Card back – " + c.setName;

    var alt = c.name + " Cigarette Card – " + c.setName;
    front.alt = alt;
    if (loadedFronts[c.id]) {
      front.classList.remove("is-preview");
      front.src = c.front;
    } else {
      // show the already-cached gallery thumbnail instantly, swap to HD when ready
      front.classList.add("is-preview");
      front.src = c.thumb;
      var im = new Image();
      im.decoding = "async";
      im.onload = function () {
        loadedFronts[c.id] = true;
        if (token === S.token) { front.src = c.front; front.classList.remove("is-preview"); }
      };
      im.src = c.front;   // HD front: fetched only when this card is opened
    }

    $("#v-set").textContent = c.setName;
    $("#v-title").textContent = c.name;
    $("#v-num").textContent = "Card " + c.cardNumber + " of " + S.list.length + " • Set " + pad(c.setNumber) + " / " + pad(SETS.length);
    $("#loc-title").textContent = c.name;
    $("#loc-set").textContent = c.setName;
    $("#loc-num").textContent = "Card " + c.cardNumber + " of " + S.list.length;
    $("#loc-region").textContent = c.region;
    $("#loc-pickup").textContent = c.pickup;
    live.textContent = c.name + ", " + c.setName + ", card " + c.cardNumber + " of " + S.list.length;
  }

  function step(dir) {
    if (S.busy) return;
    var n = S.list.length;
    S.index = (S.index + dir + n) % n;           // wraps inside the active set only
    var next = S.list[S.index];
    if (reduceMotion.matches) { render(next); return; }
    S.busy = true;
    stage.classList.add("is-swapping");
    setTimeout(function () {
      render(next);
      stage.classList.remove("is-swapping");
      S.busy = false;
    }, 120);
  }

  function flip() {
    var c = S.card; if (!c) return;
    var on = !S.flipped;
    if (on && !fetchedBacks[c.id]) {              // first Flip for this card: load its HD back now
      fetchedBacks[c.id] = true;
      back.src = c.back;
    } else if (on && !back.getAttribute("src")) {
      back.src = c.back;                          // re-attach (browser cache) after navigating
    }
    setFlipped(on);
  }

  function download() {
    var c = S.card; if (!c) return;
    // Always the ORIGINAL front JPG (same-origin files honour the download attribute)
    var a = document.createElement("a");
    a.href = c.original;
    a.download = c.slug + ".jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------------------------------------------------------------
     3. EVENTS (delegation)
     --------------------------------------------------------------- */
  $("#collection").addEventListener("click", function (e) {
    var b = e.target.closest(".card");
    if (b) openViewer(b.dataset.id);
  });

  viewer.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) { closeViewer(); return; }
    var t = e.target.closest("button"); if (!t) return;
    switch (t.id) {
      case "v-close": closeViewer(); break;
      case "v-prev": step(-1); break;
      case "v-next": step(1); break;
      case "v-flip": flip(); break;
      case "v-loc": setLocation(!S.locOpen); break;
      case "loc-close": setLocation(false); btnLoc.focus(); break;
      case "v-dl": download(); break;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (S.locOpen) { setLocation(false); btnLoc.focus(); } else closeViewer();   // location first, then modal
    } else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "Tab") {
      // focus trap
      var f = Array.prototype.filter.call(
        viewer.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])"),
        function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!viewer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // touch swipe for Previous / Next
  var tx = 0, ty = 0;
  stage.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------------------------------------------------------------
     4. INIT
     --------------------------------------------------------------- */
  renderGallery();
  watchSections();
  setupEnquiry();
})();
