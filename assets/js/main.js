/* BEN LARIBI DATTES — shared behaviour */
(function () {
  "use strict";

  /* ---------- language switch (FR default) ---------- */
  var LANG_KEY = "bld-lang";
  function applyLang(lang) {
    document.documentElement.setAttribute("data-lang", lang);
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    document.title = lang === "en" && document.body.dataset.titleEn
      ? document.body.dataset.titleEn
      : document.body.dataset.titleFr || document.title;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }
  function initLang() {
    var saved = "fr";
    try { saved = localStorage.getItem(LANG_KEY) || "fr"; } catch (e) {}
    applyLang(saved);
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.dataset.lang); });
    });
  }

  /* ---------- header solid-on-scroll ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("solid", window.scrollY > 40 || !document.querySelector(".ufuk-connect"));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav ---------- */
  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    // quote button + contact details at the bottom of the mobile menu (hidden on desktop)
    var extra = document.createElement("div");
    extra.className = "nav-extra";
    extra.innerHTML =
      '<a href="contact.html" class="btn btn-primary"><span data-fr-only>Demander un devis</span><span data-en-only>Request a quote</span></a>' +
      '<a class="nav-extra-line" href="tel:+21695542200"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>+216 95 542 200</a>' +
      '<a class="nav-extra-line" href="mailto:contact@benlaribidattes.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>contact@benlaribidattes.com</a>';
    nav.appendChild(extra);

    toggle.setAttribute("aria-expanded", "false");
    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920) setOpen(false);
    });
  }

  /* ---------- image fallback: adds has-img class when a real photo loads ---------- */
  function initMedia() {
    document.querySelectorAll(".media img, .brand-mark img, .ufuk-connect-photo img, .ufuk-connect-slide img").forEach(function (img) {
      var wrap = img.closest(".media, .brand-mark, .ufuk-connect-photo, .ufuk-connect-slide");
      var mark = function () { wrap && wrap.classList.add("has-img"); };
      if (img.complete && img.naturalWidth > 0) mark();
      img.addEventListener("load", mark);
      img.addEventListener("error", function () { img.style.display = "none"; });
    });
  }

  /* ---------- animated hero slider (homepage) ---------- */
  function initHeroSlider() {
    var slider = document.querySelector(".ufuk-connect-slider");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".ufuk-connect-slide"));
    var dotsWrap = document.querySelector(".ufuk-connect-dots");
    if (!slides.length) return;
    var idx = 0, timer;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i) {
      idx = i;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === i); });
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (b, n) { b.classList.toggle("is-active", n === i); });
      }
    }
    function next() { show((idx + 1) % slides.length); }
    function prev() { show((idx - 1 + slides.length) % slides.length); }
    function start() { if (reduced || slides.length < 2) return; stop(); timer = setInterval(next, 5500); }
    function stop() { clearInterval(timer); }

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, n) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Slide " + (n + 1));
        b.addEventListener("click", function () { show(n); start(); });
        dotsWrap.appendChild(b);
      });
    }
    var wrap = slider.closest(".ufuk-connect");
    if (wrap && slides.length > 1) {
      var prevBtn = wrap.querySelector(".ufuk-connect-arrow-prev");
      var nextBtn = wrap.querySelector(".ufuk-connect-arrow-next");
      if (prevBtn) prevBtn.addEventListener("click", function () { prev(); start(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { next(); start(); });
    }
    show(0);
    start();
    if (wrap) {
      wrap.addEventListener("mouseenter", stop);
      wrap.addEventListener("mouseleave", start);
      // horizontal swipe on touch screens
      var x0 = null, y0 = null;
      wrap.addEventListener("touchstart", function (e) {
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
      }, { passive: true });
      wrap.addEventListener("touchend", function (e) {
        if (x0 === null || slides.length < 2) return;
        var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) next(); else prev();
        start();
      }, { passive: true });
    }
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- products page: highlight current category chip ---------- */
  function initCatNav() {
    var links = document.querySelectorAll(".cat-nav a");
    if (!links.length) return;

    // scroll a category to just below the fixed header + sticky category bar
    var catNav = document.querySelector(".cat-nav");
    function goTo(id, smooth) {
      var el = id && document.getElementById(id);
      if (!el) return;
      var headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      var top = el.getBoundingClientRect().top + window.pageYOffset - headerH - catNav.offsetHeight - 16;
      var root = document.documentElement;
      if (!smooth) root.style.scrollBehavior = "auto"; // bypass the CSS smooth scrolling for the initial jump
      window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
      if (!smooth) root.style.scrollBehavior = "";
    }
    links.forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var id = a.getAttribute("href").slice(1);
        history.replaceState(null, "", "#" + id);
        goTo(id, true);
      });
    });
    // arriving from another page with #category: re-apply once layout and images are ready
    if (location.hash) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      var id = location.hash.slice(1);
      goTo(id, false);
      window.addEventListener("load", function () { goTo(id, false); });
    }

    if (!("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-current"); });
        var a = map[e.target.id];
        if (a) {
          a.classList.add("is-current");
          var bar = a.parentNode;
          bar.scrollTo({ left: a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2, behavior: "smooth" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- active nav link ---------- */
  function initActiveNav() {
    var here = (location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".main-nav a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === here || (here === "" && href === "index.html")) a.classList.add("active");
    });
  }

  /* ---------- back to top ---------- */
  function initToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- footer year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- contact form -> mailto ---------- */
  function initContactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString();
      var email = (data.get("email") || "").toString();
      var phone = (data.get("phone") || "").toString();
      var message = (data.get("message") || "").toString();
      var subject = "Demande de devis — Site web Ben Laribi Dattes";
      var body =
        "Nom: " + name + "\n" +
        "Email: " + email + "\n" +
        "Telephone: " + phone + "\n\n" +
        message;
      window.location.href =
        "mailto:contact@benlaribidattes.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initCatNav();
    initHeader();
    initMenu();
    initMedia();
    initHeroSlider();
    initReveal();
    initActiveNav();
    initToTop();
    initYear();
    initContactForm();
  });
})();
