/* =====================================================
   THE AFFINEUR CELLAR — script.js  (Multi-Page v2)
   Shared across all pages
   ===================================================== */
(function () {
  'use strict';

  /* =================== THEME & DIRECTION INIT =================== */
  // Applied inline in <head> to prevent flash; ensure it's also safe here.
  (function initThemeDir() {
    var savedTheme = localStorage.getItem('acTheme') || 'light';
    var savedDir   = localStorage.getItem('acDir')   || 'ltr';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('dir', savedDir);
  })();


  /* =================== HELPERS =================== */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }
  function debounce(fn, ms) { let t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* =================== FOOTER YEAR =================== */
  var yearEl = qs('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =================== HEADER SCROLL =================== */
  var header = qs('#site-header');
  function onHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  /* =================== BACK TO TOP =================== */
  var btt = qs('#back-to-top');
  function onBttScroll() {
    if (!btt) return;
    if (window.scrollY > 400) btt.classList.add('visible');
    else btt.classList.remove('visible');
  }
  window.addEventListener('scroll', onBttScroll, { passive: true });
  if (btt) btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* =================== HAMBURGER / MOBILE NAV =================== */
  var hamburger   = qs('#hamburger');
  var mainNav     = qs('#main-nav');
  var mobileOverlay = qs('#mobile-overlay');

  // Mobile menu close button is handled by the hamburger icon transforming into an X, no need to inject a second close button.


  function openNav() {
    if (!mainNav) return;
    mainNav.classList.add('is-open');
    if (mobileOverlay) { mobileOverlay.classList.add('is-visible'); mobileOverlay.setAttribute('aria-hidden','false'); }
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove('is-open');
    if (mobileOverlay) { mobileOverlay.classList.remove('is-visible'); mobileOverlay.setAttribute('aria-hidden','true'); }
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Close any open dropdowns
    qsa('.nav-item.dropdown-open').forEach(function (el) {
      el.classList.remove('dropdown-open');
      var dropdownToggle = el.querySelector('[data-dropdown]');
      if (dropdownToggle) dropdownToggle.setAttribute('aria-expanded', 'false');
    });
  }
  if (hamburger) hamburger.addEventListener('click', function () {
    mainNav.classList.contains('is-open') ? closeNav() : openNav();
  });
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeNav(); if (hamburger) hamburger.focus(); }
  });

  /* Close nav when non-dropdown nav-link clicked */
  qsa('.nav-link:not([data-dropdown])').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* =================== DROPDOWN =================== */
  qsa('.nav-item[data-has-dropdown]').forEach(function (item) {
    var toggle = item.querySelector('[data-dropdown]');
    if (!toggle) return;

    // Toggle on compact layouts and touch-first devices, including iPad Pro landscape.
    toggle.addEventListener('click', function (e) {
      var compactLayout = window.innerWidth <= 1024;
      var touchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      if (compactLayout || touchDevice) {
        e.preventDefault();
        var open = item.classList.toggle('dropdown-open');
        toggle.setAttribute('aria-expanded', String(open));
      }
    });

    // Close dropdown when clicking outside (desktop)
    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) {
        item.classList.remove('dropdown-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* =================== ACTIVE NAV LINK =================== */
  (function markActiveLink() {
    var page = decodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
    var links = qsa('.nav-link, .dropdown-link');
    links.forEach(function (link) {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var linkPage = href.split('/').pop().split('#')[0].split('?')[0] || 'index.html';
      if (linkPage === page || (page === '' && linkPage === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        // Also mark parent nav item
        var parent = link.closest('.nav-item');
        if (parent) {
          var parentLink = parent.querySelector('.nav-link');
          if (parentLink) parentLink.classList.add('active');
        }
      }
    });
  })();

  /* =================== SCROLL REVEAL =================== */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    qsa('[data-animate]').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    qsa('[data-animate]').forEach(function (el) { el.classList.add('animated'); });
  }

  /* =================== HERO PARALLAX =================== */
  var bannerBg = qs('.banner-bg');
  var ticking = false;
  function doParallax() {
    if (bannerBg && window.scrollY < window.innerHeight) {
      bannerBg.style.transform = 'scale(1.05) translateY(' + (window.scrollY * 0.18) + 'px)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(doParallax); ticking = true; }
  }, { passive: true });

  /* =================== SMOOTH ANCHOR SCROLL =================== */
  qsa('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - hh, behavior: 'smooth' });
    });
  });

  /* =================== FAQ ACCORDION =================== */
  qsa('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-question');
    var a = item.querySelector('.faq-answer');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      // Close siblings
      qsa('.faq-item.is-open').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq-answer').style.maxHeight = '';
      });
      if (!isOpen) {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* =================== GALLERY FILTER =================== */
  var filterBtns = qsa('.filter-btn');
  if (filterBtns.length) {
    var galleryGrid = qs('.gallery-grid');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');
        if (galleryGrid) galleryGrid.classList.toggle('is-filtered', cat !== 'all');
        qsa('.gallery-item[data-cat]').forEach(function (item) {
          var show = cat === 'all' || item.getAttribute('data-cat') === cat;
          item.classList.toggle('hidden', !show);
          item.setAttribute('aria-hidden', String(!show));
        });
        alignLastGalleryItem();
      });
    });
  }

  /* =================== GALLERY LIGHTBOX =================== */
  function buildLightbox() {
    qsa('.gallery-item[data-lb]').forEach(function (item) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');

      function openLb() {
        var img = item.querySelector('.gallery-img');
        var cap = item.querySelector('.gallery-caption');
        if (!img) return;
        var lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.innerHTML = '<div class="lb-backdrop"></div><div class="lb-inner"><img src="' + img.src + '" alt="' + img.alt + '" class="lb-img" />' + (cap ? '<p class="lb-caption">' + cap.textContent + '</p>' : '') + '<button class="lb-close" aria-label="Close">&times;</button></div>';
        document.body.appendChild(lb);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () { lb.classList.add('lb-open'); });
        function close() {
          lb.classList.remove('lb-open');
          setTimeout(function () { lb.remove(); document.body.style.overflow = ''; item.focus(); }, 300);
        }
        lb.querySelector('.lb-backdrop').addEventListener('click', close);
        lb.querySelector('.lb-close').addEventListener('click', close);
        lb.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
        lb.querySelector('.lb-close').focus();
      }
      item.addEventListener('click', openLb);
      item.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
    });
  }
  buildLightbox();

  /* =================== EQUAL HEIGHT CARDS =================== */
  function equalizeCards(gridSel, descSel) {
    qsa(gridSel).forEach(function (grid) {
      var descs = qsa(descSel, grid);
      descs.forEach(function (el) { el.style.minHeight = ''; });
      var cs = getComputedStyle(grid);
      var colCount = cs.getPropertyValue('grid-template-columns').trim().split(/\s+/).length;
      if (colCount <= 1) return;
      var max = 0;
      descs.forEach(function (el) { max = Math.max(max, el.offsetHeight); });
      descs.forEach(function (el) { el.style.minHeight = max + 'px'; });
    });
  }
  /* =================== ALIGN LAST GALLERY ITEM =================== */
  function alignLastGalleryItem() {
    var grid = qs('.gallery-grid');
    if (!grid) return;
    qsa('.gallery-item', grid).forEach(function (el) {
      el.classList.remove('grid-last-centered');
    });
    var items = qsa('.gallery-item', grid);
    var visibleItems = [];
    items.forEach(function (el) {
      if (!el.classList.contains('hidden')) {
        visibleItems.push(el);
      }
    });
    if (!visibleItems.length) return;
    var width = window.innerWidth;
    var cols = 3;
    if (width <= 599) {
      cols = 1;
    } else if (width <= 1024) {
      cols = 2;
    }
    var totalSpan = 0;
    var isFiltered = grid.classList.contains('is-filtered');
    visibleItems.forEach(function (el) {
      var isWide = el.classList.contains('gallery-item--wide') && !isFiltered;
      totalSpan += isWide ? 2 : 1;
    });
    var lastItem = visibleItems[visibleItems.length - 1];
    var lastItemIsWide = lastItem.classList.contains('gallery-item--wide') && !isFiltered;
    var lastItemSpan = lastItemIsWide ? 2 : 1;
    var spanBeforeLast = totalSpan - lastItemSpan;
    if (spanBeforeLast % cols === 0) {
      lastItem.classList.add('grid-last-centered');
    }
  }

  function runEqualHeight() {
    equalizeCards('.product-grid', '.product-desc');
    equalizeCards('.cards-3', '.feat-body');
    equalizeCards('.cards-4', '.feat-body');
    equalizeCards('.cards-3', '.note-text');
    equalizeCards('.testimonial-grid', '.testimonial-quote');
    alignLastGalleryItem();
  }
  document.addEventListener('DOMContentLoaded', runEqualHeight);
  window.addEventListener('load', runEqualHeight);
  window.addEventListener('resize', debounce(runEqualHeight, 200));

  /* =================== CONTACT FORM =================== */
  var contactForm = qs('#contact-form');
  var formSuccess = qs('#form-success');
  if (contactForm) {
    var fields = contactForm.querySelectorAll('[required]');
    function validateField(field) {
      var errEl = document.getElementById((field.id || '') + '-err');
      var ok = true;
      var msg = '';
      if (!field.value.trim()) { ok = false; msg = 'This field is required.'; }
      else if (field.type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) { ok = false; msg = 'Please enter a valid email.'; }
      } else if (field.tagName === 'TEXTAREA' && field.value.trim().length < 20) { ok = false; msg = 'Please write at least 20 characters.'; }
      else if (field.tagName === 'SELECT' && !field.value) { ok = false; msg = 'Please select an option.'; }
      if (errEl) errEl.textContent = msg;
      field.classList.toggle('invalid', !ok);
      return ok;
    }
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f); });
      f.addEventListener('input', function () { if (f.classList.contains('invalid')) validateField(f); });
    });
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var allOk = true;
      fields.forEach(function (f) { if (!validateField(f)) allOk = false; });
      if (allOk) {
        var btn = qs('#form-submit-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        setTimeout(function () {
          contactForm.style.display = 'none';
          if (formSuccess) { formSuccess.hidden = false; formSuccess.style.display = 'flex'; }
        }, 1200);
      }
    });
  }

  /* =================== NEWSLETTER FORMS =================== */
  qsa('.nl-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('.nl-input');
      var msg   = form.querySelector('.nl-msg') || form.nextElementSibling;
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!input || !emailRe.test(input.value.trim())) {
        if (msg) { msg.textContent = 'Please enter a valid email.'; msg.style.color = '#d4a0a0'; }
      } else {
        if (msg) { msg.textContent = "You're subscribed to Cellar Notes!"; msg.style.color = 'var(--cream-400)'; }
        input.value = '';
      }
    });
  });

  /* =================== THEME TOGGLE =================== */
  var SVG_SUN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5zm0-5a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm8.49-16.07a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM5.64 16.95a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zm14.26 0a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM5.64 5.64a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM21 11a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2h1zM4 11a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2h1z"/></svg>';
  var SVG_MOON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10C2.2 6.8 6.4 2.5 11.7 2c.6-.1 1.2.4 1.2 1 0 .5-.3.9-.8 1-3.6.9-6.1 4.1-6.1 7.9 0 4.4 3.6 8 8 8 2.7 0 5.2-1.4 6.6-3.7.3-.5.9-.7 1.4-.4.5.3.7.9.4 1.4-2.1 3.5-5.9 5.8-10.1 5.8z"/></svg>';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('acTheme', theme);
    qsa('[data-theme-toggle]').forEach(function(btn) {
      btn.innerHTML = theme === 'dark' ? SVG_SUN : SVG_MOON;
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.title = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  }

  // Init toggle icons
  var currentTheme = localStorage.getItem('acTheme') || 'light';
  applyTheme(currentTheme);

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* =================== DIRECTION TOGGLE =================== */
  function applyDir(dir) {
    // 1. Temporarily disable transitions on main-nav and mobile-overlay to prevent sliding glitches
    if (mainNav) mainNav.style.transition = 'none';
    if (mobileOverlay) mobileOverlay.style.transition = 'none';

    // 2. Set direction attribute on <html>
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('acDir', dir);

    // 3. Update all direction toggle button icons/labels
    qsa('[data-dir-toggle]').forEach(function(btn) {
      btn.innerHTML = dir === 'rtl' ? '<span style="font-family:var(--font-sans);font-weight:700;font-size:0.75rem;letter-spacing:0.02em">LTR</span>' : '<span style="font-family:var(--font-sans);font-weight:700;font-size:0.75rem;letter-spacing:0.02em">RTL</span>';
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
      btn.title = dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL';
    });

    // 4. Close mobile navigation instantly if it was open
    if (mainNav && mainNav.classList.contains('is-open')) {
      closeNav();
    }

    // 5. Force DOM repaint to apply layout and transform changes instantly
    if (mainNav) mainNav.offsetHeight;
    if (mobileOverlay) mobileOverlay.offsetHeight;

    // 6. Restore CSS transitions after layout updates are completed
    setTimeout(function() {
      if (mainNav) mainNav.style.transition = '';
      if (mobileOverlay) mobileOverlay.style.transition = '';
    }, 50);
  }

  var currentDir = localStorage.getItem('acDir') || 'ltr';
  applyDir(currentDir);

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-dir-toggle]');
    if (!btn) return;
    var cur = document.documentElement.getAttribute('dir') || 'ltr';
    applyDir(cur === 'rtl' ? 'ltr' : 'rtl');
  });

  /* =================== WINDOW RESIZE =================== */
  window.addEventListener('resize', debounce(function () {
    if (window.innerWidth > 1024 && mainNav && mainNav.classList.contains('is-open')) closeNav();
  }, 150));

})();
