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
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
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
