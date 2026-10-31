/* LeaderFlow — site behaviour. No dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.remove('no-js');

  /* ---------- Header: scrolled state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var mq = window.matchMedia('(max-width: 1040px)');
  function closeNav() {
    document.body.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    mq.addEventListener('change', function (e) { if (!e.matches) closeNav(); });
  }

  /* ---------- Dropdowns: caret buttons toggle submenus (touch + keyboard) ---------- */
  document.querySelectorAll('.nav__item--has-sub').forEach(function (item) {
    var btn = item.querySelector('.nav__expand');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !item.classList.contains('is-open');
      document.querySelectorAll('.nav__item.is-open').forEach(function (o) {
        if (o !== item) { o.classList.remove('is-open'); o.querySelector('.nav__expand').setAttribute('aria-expanded', 'false'); }
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) {
    if (mq.matches) return;
    document.querySelectorAll('.nav__item.is-open').forEach(function (o) {
      if (!o.contains(e.target)) { o.classList.remove('is-open'); o.querySelector('.nav__expand').setAttribute('aria-expanded', 'false'); }
    });
  });

  /* ---------- Video facade: load the player only when asked ---------- */
  document.querySelectorAll('[data-video]').forEach(function (wrap) {
    var btn = wrap.querySelector('.video__play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var type = wrap.getAttribute('data-video');
      var src = wrap.getAttribute('data-src');
      var el;
      if (type === 'vimeo') {
        el = document.createElement('iframe');
        el.src = 'https://player.vimeo.com/video/' + src + '?autoplay=1&title=0&byline=0&portrait=0&dnt=1';
        el.allow = 'autoplay; fullscreen; picture-in-picture';
        el.allowFullscreen = true;
        el.title = btn.getAttribute('aria-label') || 'Video';
      } else {
        el = document.createElement('video');
        el.src = src;
        el.controls = true;
        el.autoplay = true;
        el.playsInline = true;
        el.setAttribute('controlsList', 'nodownload');
        var poster = wrap.querySelector('img');
        if (poster) el.poster = poster.currentSrc || poster.src;
      }
      wrap.innerHTML = '';
      wrap.appendChild(el);
      if (el.focus) el.focus();
    });
  });

  /* ---------- Graduates: cohort tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    var buttons = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
    function select(btn, focus) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) btn.focus();
    }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!n) return;
        e.preventDefault();
        select(buttons[(i + n + buttons.length) % buttons.length], true);
      });
    });
  });

  /* ---------- Forms: post to a configured endpoint (see README) ---------- */
  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var endpoint = form.getAttribute('data-endpoint');
      var status = form.querySelector('.form__status');
      if (!endpoint) {
        e.preventDefault();
        if (status) status.textContent = 'Demo site: form submissions are not connected yet.';
        return;
      }
      e.preventDefault();
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          if (status) status.textContent = 'Thank you — your message has been sent.';
        })
        .catch(function () { if (status) status.textContent = 'Sorry, something went wrong. Please email us directly.'; });
    });
  });

  /* ---------- Reveal on scroll (+ flow lines drawing in) ---------- */
  var reveals = document.querySelectorAll('.reveal, .draw');
  // Stagger siblings that reveal together (grids, timelines): each gets its index as --i.
  document.querySelectorAll('.bento, .people, .logos, .timeline, .values, .support-grid, .facts').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal'), function (el, i) {
      el.style.setProperty('--i', Math.min(i, 6));
    });
  });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
