/* LeaderFlow — site behaviour. No dependencies. */
(function () {
  'use strict';
  var doc = document.documentElement;
  // "no-js" is removed in the reveal section at the bottom, after content that is already
  // on screen has been marked visible (otherwise it would blink out and fade back in).

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
  // On phones the header toggle is hidden and the tab bar's Menu button opens the same sheet.
  var tabMenu = document.querySelector('.tabbar__menu');
  function setExpanded(open) {
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (tabMenu) tabMenu.setAttribute('aria-expanded', String(open));
  }
  function closeNav(returnFocus) {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    setExpanded(false);
    if (returnFocus) {
      var target = toggle && toggle.offsetParent ? toggle : tabMenu;
      if (target) target.focus();
    }
  }
  if (toggle && tabMenu) tabMenu.addEventListener('click', function () { toggle.click(); });
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      setExpanded(open);
      // Show where you are: the current section starts expanded.
      var cur = document.querySelector('.nav__item--has-sub.is-current:not(.is-open) .nav__expand');
      if (open && cur) cur.click();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(true); });
    // Close the sheet when a link inside it is followed (matters for same-page/hash links and bfcache).
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { if (mq.matches) closeNav(); });
    });
    window.addEventListener('pageshow', function () { closeNav(); });
    mq.addEventListener('change', function (e) { if (!e.matches) closeNav(); });
  }

  /* ---------- Tab bar: adapt the glass to what's behind it ----------
     Find the first opaque background under the pill's centre; if it's dark (or a photo), use the dark glass. */
  var tabbar = document.querySelector('.tabbar');
  if (tabbar && document.elementsFromPoint) {
    var isDarkAt = function (x, y) {
      var els = document.elementsFromPoint(x, y);
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (tabbar.contains(el)) continue;
        if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'IFRAME') return true;
        for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
          var c = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
          if (c && (c[3] === undefined || +c[3] > 0.5)) {
            return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) < 140;
          }
        }
        return false;
      }
      return false;
    };
    var tabTick = false;
    var updateTabbar = function () {
      tabTick = false;
      var r = tabbar.getBoundingClientRect();
      if (!r.width) return; // hidden above the phone breakpoint
      var y = r.top + r.height / 2;
      // Sample three points so a pill straddling a light/dark edge follows the majority.
      var dark = [0.2, 0.5, 0.8].filter(function (f) { return isDarkAt(r.left + r.width * f, y); }).length >= 2;
      tabbar.classList.toggle('tabbar--dark', dark);
    };
    var queueTabbar = function () { if (!tabTick) { tabTick = true; requestAnimationFrame(updateTabbar); } };
    window.addEventListener('scroll', queueTabbar, { passive: true });
    window.addEventListener('resize', queueTabbar);
    window.addEventListener('load', queueTabbar);
    updateTabbar();
  }

  /* ---------- Dropdowns: caret buttons toggle submenus (touch + keyboard) ---------- */
  document.querySelectorAll('.nav__item--has-sub').forEach(function (item) {
    var btn = item.querySelector('.nav__expand');
    var sub = item.querySelector('.nav__sub');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = !item.classList.contains('is-open');
      // Mobile accordion animates max-height to the submenu's real height.
      if (sub) sub.style.setProperty('--sub-h', sub.scrollHeight + 'px');
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
        // TODO(M7, D6): the promo MP4 still streams from the old WordPress host. Move it to
        // LeaderFlow's Vimeo and switch the facade to data-video="vimeo" (this branch can then go).
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

  /* ---------- Graduates: cities open as you scroll to them ----------
     A city opens just before it scrolls into view; the one before it closes once it is fully out of sight,
     and the scroll position is corrected in the same frame so nothing on screen moves. Works in both
     directions. A city the visitor opens or closes by hand is left alone until it leaves the screen. */
  if (document.querySelector('details.city')) {
    document.documentElement.classList.add('auto-cities'); // turns off browser scroll anchoring; we correct it ourselves
    var header = document.querySelector('.site-header');
    var autoToggling = false;
    var lastY = window.scrollY;
    var setOpen = function (city, open, anchor) {
      var before = anchor ? anchor.getBoundingClientRect().top : 0;
      autoToggling = true;
      city.open = open;
      autoToggling = false;
      if (anchor) {
        var shift = anchor.getBoundingClientRect().top - before;
        if (shift) window.scrollTo({ top: window.scrollY + shift, behavior: 'instant' });
      }
      lastY = window.scrollY; // our own correction is not the visitor changing direction
    };
    document.querySelectorAll('details.city').forEach(function (city) {
      city.addEventListener('toggle', function () { if (!autoToggling) city.dataset.manual = '1'; });
    });
    var check = function () {
      var y = window.scrollY;
      if (y === lastY) return;
      var down = y > lastY; lastY = y;
      var panel = document.querySelector('.cohort:not([hidden])');
      if (!panel) return;
      var cities = Array.prototype.slice.call(panel.querySelectorAll('details.city'));
      var top = header ? header.getBoundingClientRect().bottom : 0;
      var vh = window.innerHeight;
      var rects = cities.map(function (c) { return c.getBoundingClientRect(); });
      // Forget a hand-made choice once that city is off screen.
      cities.forEach(function (c, i) { if (c.dataset.manual && (rects[i].bottom < top || rects[i].top > vh)) delete c.dataset.manual; });
      var anyOpen = function (from, to) { for (var k = from; k < to; k++) if (cities[k].open) return true; return false; };
      for (var i = 0; i < cities.length; i++) {
        var c = cities[i], r = rects[i];
        if (c.dataset.manual) continue;
        if (down) {
          // Open the next city as it approaches the bottom of the screen (its list grows below, out of view).
          if (!c.open && r.top < vh + 200 && r.bottom > top && (i === 0 || cities[i - 1].open)) { setOpen(c, true); return; }
          // Close a city scrolled fully past, keeping what is on screen where it is.
          if (c.open && r.bottom < top - 40 && anyOpen(i + 1, cities.length)) { setOpen(c, false, cities[i + 1]); return; }
        } else {
          // Scrolling up: open the city above just before it comes into view, keeping the screen still.
          if (!c.open && r.top < top && r.bottom > top - 400 && i + 1 < cities.length && cities[i + 1].open) { setOpen(c, true, cities[i + 1]); return; }
          // Close a city now fully below the screen.
          if (c.open && r.top > vh + 40 && anyOpen(0, i)) { setOpen(c, false); return; }
        }
      }
    };
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; check(); });
    }, { passive: true });
  }

  /* ---------- Quote that writes itself in, word by word, when it scrolls into view ----------
     Screen readers get the plain sentence; the animated words are hidden from them. Without JS the quote is
     plain text. The animation itself is CSS (.qw), started by the reveal code adding .is-visible. */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var text = el.textContent.trim();
    var plain = document.createElement('span');
    plain.className = 'visually-hidden';
    plain.textContent = text;
    var anim = document.createElement('span');
    anim.setAttribute('aria-hidden', 'true');
    text.split(/\s+/).forEach(function (word, i) {
      var w = document.createElement('span');
      w.className = 'qw';
      w.style.setProperty('--w', i);
      w.textContent = word;
      anim.appendChild(w);
      anim.appendChild(document.createTextNode(' '));
    });
    el.textContent = '';
    el.appendChild(plain);
    el.appendChild(anim);
    el.classList.add('is-split');
  });

  /* ---------- FAQ search ----------
     Scores each question by the keywords it shares with the search (question text counts more than the answer),
     using simple word stems and a few synonyms so "price" finds "cost" and "virtual" finds "online". Questions with
     no shared keyword are hidden. If none match, a link offers to send the question through the contact form. */
  var faqSearch = document.querySelector('[data-faq-search]');
  if (faqSearch) {
    var STOP = 'a an the and or of to in on for is are am be do does did i im my me we our you your it its this that what when where who whom why how can could will would should there their they with at by from as if any about into get have has much many'.split(' ');
    var SYN = [
      ['cost', 'price', 'fee', 'pay', 'paid', 'free', 'money', 'charge', 'tuition', 'expens', 'afford'],
      ['time', 'hour', 'commit', 'commitment', 'schedul', 'long', 'duration', 'month', 'week', 'day', 'friday'],
      ['online', 'virtual', 'remote', 'zoom', 'person', 'location', 'locat', 'where', 'place', 'city'],
      ['apply', 'applic', 'applicat', 'appli', 'deadline', 'select', 'accept', 'admiss', 'enrol', 'regist', 'sign'],
      ['eligib', 'qualif', 'requir', 'prerequisit', 'experi', 'year', 'who'],
      ['certif', 'credenti', 'credit', 'ceu', 'aia', 'continu'],
      ['mentor', 'coach', 'network', 'connect', 'relationship'],
      ['sponsor', 'employ', 'compani', 'firm', 'fund', 'support']
    ];
    var stem = function (w) {
      w = w.replace(/[’']s$/, '');
      if (w.length > 5) w = w.replace(/(ations?|ing|ed|ies|es|s|ly|ment)$/, '');
      return w.length > 7 ? w.slice(0, 7) : w;
    };
    var words = function (text) {
      return (text.toLowerCase().match(/[a-z0-9’']+/g) || []).filter(function (w) { return STOP.indexOf(w) < 0 && w.length > 1; }).map(stem);
    };
    var expand = function (w) {
      var out = [w];
      SYN.forEach(function (g) { if (g.some(function (s) { return w.indexOf(s) === 0 || s.indexOf(w) === 0; })) out = out.concat(g); });
      return out;
    };
    var faqItems = Array.prototype.map.call(document.querySelectorAll('.faq-group details'), function (d) {
      return { el: d, group: d.closest('.faq-group'), q: words(d.querySelector('summary').textContent), a: words(d.querySelector('.accordion__body').textContent + ' ' + d.closest('.faq-group').querySelector('h2').textContent) };
    });
    var groups = Array.prototype.slice.call(document.querySelectorAll('.faq-group'));
    var input = faqSearch.querySelector('input');
    var status = faqSearch.querySelector('.faq-search__status');
    var empty = faqSearch.querySelector('.faq-search__empty');
    var ask = faqSearch.querySelector('[data-faq-ask]');
    var askBase = ask.getAttribute('href');
    var has = function (list, term) { return list.some(function (w) { return w === term || (term.length >= 4 && (w.indexOf(term) === 0 || term.indexOf(w) === 0) && w.length >= 4); }); };
    var run = function () {
      var raw = input.value.trim();
      var terms = words(raw);
      if (!terms.length) {
        faqItems.forEach(function (it) { it.el.hidden = false; });
        groups.forEach(function (g) { g.hidden = false; });
        status.textContent = ''; empty.hidden = true;
        return;
      }
      var shown = 0, best = 0;
      faqItems.forEach(function (it) {
        var score = 0;
        terms.forEach(function (t) {
          if (has(it.q, t)) score += 3; else if (has(it.a, t)) score += 2;
          else if (expand(t).some(function (s) { return has(it.q, s); })) score += 1.5;
          else if (expand(t).some(function (s) { return has(it.a, s); })) score += .5;
        });
        it.score = score;
        best = Math.max(best, score);
      });
      // Show every reasonable match, but when some questions match strongly, drop the ones that only brush past.
      var cut = Math.max(1, best * 0.5);
      faqItems.forEach(function (it) {
        it.el.hidden = it.score < cut;
        if (!it.el.hidden) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('details:not([hidden])'); g.classList.add('is-visible'); });
      status.textContent = shown ? shown + (shown === 1 ? ' question matches.' : ' questions match.') : '';
      empty.hidden = shown > 0;
      ask.setAttribute('href', askBase.replace('#', '?question=' + encodeURIComponent(raw.slice(0, 500)) + '#'));
    };
    faqSearch.hidden = false;
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var first = document.querySelector('.faq-group details:not([hidden])');
      if (first) { first.open = true; first.querySelector('summary').focus(); }
    });
  }

  /* Contact form: a question sent from the FAQ search arrives as ?question=… and fills in the message. */
  var askedQuestion = new URLSearchParams(location.search).get('question');
  var contactMessage = document.getElementById('contact-message');
  if (askedQuestion && contactMessage && !contactMessage.value) contactMessage.value = askedQuestion.slice(0, 500);

  /* ---------- Forms: validate, then post to data-endpoint (see README) ----------
     Without JS the browser validates (required/type/maxlength) and posts to the form's action.
     With JS we validate ourselves so errors are shown inline and announced. */
  var MESSAGES = {
    required: 'This field is required.',
    email: 'Enter an email address, like name@example.com.',
    phone: 'Enter a phone number with at least 7 digits.',
    tooLong: 'This is too long. Please shorten it.',
    choose: 'Please choose one.',
    tick: 'Please tick this box to continue.',
    zip: 'Enter a 5-digit ZIP code.',
    number: 'Enter a whole number, like 7.',
    url: 'Enter a web address, like https://www.linkedin.com/in/your-name.',
    file: 'Please attach your résumé as a PDF.',
    pdf: 'Please choose a PDF file.',
    big: function (mb) { return 'This file is larger than ' + mb + ' MB. Please attach a smaller PDF.'; },
    words: function (max, n) { return 'Please keep this to ' + max + ' words or fewer (it is ' + n + ' now).'; }
  };
  var countWords = function (v) { var m = v.trim().match(/\S+/g); return m ? m.length : 0; };
  function fieldError(el) {
    if (el.type === 'checkbox') return el.required && !el.checked ? MESSAGES.tick : '';
    if (el.type === 'radio') {
      if (!el.required) return '';
      return el.form.querySelector('input[name="' + el.name + '"]:checked') ? '' : MESSAGES.choose;
    }
    if (el.type === 'file') {
      var f = el.files && el.files[0];
      if (!f) return el.required ? MESSAGES.file : '';
      if (el.accept.indexOf('pdf') > -1 && !/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') return MESSAGES.pdf;
      var mb = parseFloat(el.getAttribute('data-max-mb'));
      if (mb && f.size > mb * 1048576) return MESSAGES.big(mb);
      return '';
    }
    var v = el.value.trim();
    if (el.required && !v) return MESSAGES.required;
    if (!v) return '';
    if (el.maxLength > 0 && el.value.length > el.maxLength) return MESSAGES.tooLong;
    if (el.type === 'email' && (el.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) return MESSAGES.email;
    if (el.type === 'tel' && (v.replace(/\D/g, '').length < 7 || /[^0-9+().\s\-x]/i.test(v))) return MESSAGES.phone;
    if (el.type === 'url' && (el.validity.typeMismatch || !/^https?:\/\/[^\s.]+\.\S+$/i.test(v))) return MESSAGES.url;
    if (el.hasAttribute('data-zip') && !/^\d{5}(-\d{4})?$/.test(v)) return MESSAGES.zip;
    if (el.hasAttribute('data-whole-number') && !/^\d{1,2}$/.test(v)) return MESSAGES.number;
    var maxWords = +el.getAttribute('data-max-words');
    if (maxWords && countWords(v) > maxWords) return MESSAGES.words(maxWords, countWords(v));
    return '';
  }
  // Radios share one message per group; checkboxes and file inputs show theirs below their visible box.
  function errorAnchor(el) {
    return (el.type === 'radio' && el.closest('.choices')) || (el.type === 'checkbox' && el.closest('.check')) ||
      (el.type === 'file' && el.closest('.upload')) || el;
  }
  function showError(el, msg) {
    var id = (el.type === 'radio' ? el.name + '-group' : el.id || el.name) + '-error';
    var box = document.getElementById(id);
    var described = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
    if (!msg) {
      if (box) box.remove();
      el.removeAttribute('aria-invalid');
      if (described.length) el.setAttribute('aria-describedby', described.join(' ')); else el.removeAttribute('aria-describedby');
      return;
    }
    if (!box) {
      box = document.createElement('p');
      box.className = 'field__error';
      box.id = id;
      errorAnchor(el).insertAdjacentElement('afterend', box);
    }
    box.textContent = msg;
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('aria-describedby', described.concat(id).join(' '));
  }
  function setStatus(status, text, isError) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', !!isError);
  }

  // Preview: ?preview=open shows the "applications open" content on any page, with a small flag.
  if (/[?&]preview=open\b/.test(location.search)) {
    document.documentElement.classList.add('preview-open');
    var flag = document.createElement('p');
    flag.className = 'preview-flag';
    flag.textContent = 'Preview: applications shown as open';
    document.body.appendChild(flag);
  }

  // TURNSTILE (M9, not connected yet): when the Pages Function exists, give the
  // [data-turnstile-slot] element a data-sitekey, and on the form's first focus load
  // https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit, then call
  // turnstile.render(slot, { sitekey: slot.dataset.sitekey, action: form.dataset.form }).
  // The widget adds a "cf-turnstile-response" field that the Function must verify.

  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
    form.noValidate = true; // our own validation below replaces the browser bubbles
    var all = Array.prototype.filter.call(form.elements, function (el) {
      return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && el.type !== 'hidden' && !el.closest('.form__hp');
    });
    // one entry per radio group (its first radio stands for the group)
    var lead = function (el) { return el.type === 'radio' ? form.querySelector('input[name="' + el.name + '"]') : el; };
    var controls = all.filter(function (el) { return lead(el) === el; });
    var status = form.querySelector('.form__status');
    var button = form.querySelector('[type="submit"]');
    var okText = form.getAttribute('data-success') || 'Thank you — your message has been sent.';
    if (status) status.tabIndex = -1;

    // Once a field has been flagged, re-check it as the visitor fixes it.
    all.forEach(function (el) {
      var recheck = function () { var t = lead(el); if (t.getAttribute('aria-invalid')) showError(t, fieldError(t)); };
      el.addEventListener('input', recheck);
      el.addEventListener('change', recheck);
      el.addEventListener('blur', recheck);
    });
    // Web addresses: add https:// if someone types "linkedin.com/in/..."
    form.querySelectorAll('input[type="url"]').forEach(function (el) {
      el.addEventListener('blur', function () {
        var v = el.value.trim();
        if (v && !/^https?:\/\//i.test(v) && /\./.test(v)) el.value = 'https://' + v;
      });
    });
    // Word counters
    form.querySelectorAll('textarea[data-max-words]').forEach(function (el) {
      var max = +el.getAttribute('data-max-words');
      var out = document.getElementById(el.id + '-count');
      var update = function () {
        if (!out) return;
        var n = countWords(el.value);
        out.textContent = n ? n + ' / ' + max + ' words' : 'Up to ' + max + ' words';
        out.classList.toggle('is-over', n > max);
      };
      el.addEventListener('input', update);
      el.addEventListener('lf:restored', update);
      form.addEventListener('reset', function () { setTimeout(update, 0); });
      update();
    });
    // File box: show the chosen file, and highlight while a file is dragged over it
    form.querySelectorAll('[data-upload]').forEach(function (box) {
      var input = box.querySelector('input[type="file"]');
      var label = box.querySelector('[data-upload-text]');
      var blank = label.innerHTML;
      var update = function () {
        var f = input.files && input.files[0];
        box.classList.toggle('has-file', !!f);
        if (!f) { label.innerHTML = blank; return; }
        label.textContent = '';
        var strong = document.createElement('strong');
        strong.textContent = f.name;
        label.appendChild(strong);
        label.appendChild(document.createTextNode(' · ' + (f.size / 1048576).toFixed(1) + ' MB · choose again to replace'));
      };
      input.addEventListener('change', update);
      ['dragenter', 'dragover'].forEach(function (t) { input.addEventListener(t, function () { box.classList.add('is-dragover'); }); });
      ['dragleave', 'drop'].forEach(function (t) { input.addEventListener(t, function () { box.classList.remove('is-dragover'); }); });
      form.addEventListener('reset', function () { setTimeout(update, 0); });
    });

    // Draft saving (data-autosave): everything except files stays in this browser until the form is sent or cleared.
    var draftKey = form.getAttribute('data-autosave');
    var note = draftKey && document.querySelector('[data-draft-note]');
    var store = null;
    try { store = window.localStorage; } catch (err) { store = null; }
    var saveDraft = function () {
      if (!store) return;
      var data = {};
      all.forEach(function (el) {
        if (el.type === 'file' || !el.name) return;
        if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
        else if (el.type === 'checkbox') { if (el.checked) data[el.name] = true; }
        else if (el.value) data[el.name] = el.value;
      });
      try {
        if (Object.keys(data).length) store.setItem(draftKey, JSON.stringify(data)); else store.removeItem(draftKey);
        if (note) note.hidden = !Object.keys(data).length;
      } catch (err) { /* storage full or blocked: the form still works */ }
    };
    var clearDraft = function () {
      try { if (store) store.removeItem(draftKey); } catch (err) { /* ignore */ }
      if (note) note.hidden = true;
    };
    if (draftKey && store) {
      var saved = null;
      try { saved = JSON.parse(store.getItem(draftKey) || 'null'); } catch (err) { saved = null; }
      if (saved) {
        all.forEach(function (el) {
          if (!(el.name in saved)) return;
          if (el.type === 'radio') el.checked = el.value === saved[el.name];
          else if (el.type === 'checkbox') el.checked = !!saved[el.name];
          else if (el.type !== 'file') el.value = saved[el.name];
          el.dispatchEvent(new Event('lf:restored'));
        });
        if (note) note.hidden = false;
      }
      var timer;
      form.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(saveDraft, 400); });
      form.addEventListener('change', saveDraft);
      var clearBtn = document.querySelector('[data-draft-clear]');
      if (clearBtn) clearBtn.addEventListener('click', function () {
        if (!window.confirm('Clear everything you have entered in this application?')) return;
        form.reset();
        controls.forEach(function (el) { showError(el, ''); });
        clearDraft();
        setTimeout(function () { form.dispatchEvent(new Event('lf:progress')); }, 0);
      });
    }

    // Section progress (forms with [data-step] sections): tick off completed sections, flag ones with errors.
    var steps = form.querySelectorAll('[data-step]');
    var wizard = steps.length && form.hasAttribute('data-wizard');
    var links = {};
    var setCurrent = function (id) {
      Object.keys(links).forEach(function (k) {
        links[k].classList.toggle('is-current', k === id);
        if (k === id) links[k].setAttribute('aria-current', 'step'); else links[k].removeAttribute('aria-current');
      });
    };
    if (steps.length) {
      document.querySelectorAll('[data-step-link]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
      var progress = function () {
        Array.prototype.forEach.call(steps, function (stepEl) {
          var a = links[stepEl.id];
          if (!a) return;
          var mine = controls.filter(function (el) { return stepEl.contains(el); });
          var done = mine.some(function (el) { return el.required; }) && mine.every(function (el) { return !fieldError(el); });
          a.classList.toggle('is-done', done);
          a.classList.toggle('has-error', !done && !!stepEl.querySelector('[aria-invalid="true"]'));
        });
      };
      form.addEventListener('input', progress);
      form.addEventListener('change', progress);
      form.addEventListener('lf:progress', progress);
      progress();
      // Long one-page forms: mark the section in view
      if (!wizard && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) setCurrent(en.target.id); });
        }, { rootMargin: '-40% 0px -55% 0px' });
        Array.prototype.forEach.call(steps, function (stepEl) { io.observe(stepEl); });
      }
    }

    /* Step-by-step forms (data-wizard): one section at a time. Each section has its own address (#step-...), so the
       browser's Back button and the section list both move between sections, and any section can be opened at any
       time. "Next" checks the current section first; Submit (on the review section) checks everything and opens the
       first section that still needs attention. Without JavaScript every section shows on one page. */
    if (wizard) {
      var order = Array.prototype.slice.call(steps);
      var bar = document.querySelector('[data-wizard-bar]');
      var progressText = document.querySelector('[data-wizard-progress]');
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      var current = null;
      var stepTitle = function (st) {
        var t = st.querySelector('.apply-step__title').cloneNode(true);
        var n = t.querySelector('.apply-step__num');
        if (n) n.remove();
        return t.textContent.trim();
      };
      var labelFor = function (el) {
        var src = el.type === 'radio' ? el.closest('fieldset').querySelector('legend')
          : el.type === 'checkbox' ? el.closest('.check')
          : form.querySelector('label[for="' + el.id + '"]');
        if (!src) return el.name;
        var c = src.cloneNode(true);
        c.querySelectorAll('.opt, .q-num').forEach(function (x) { x.remove(); });
        return c.textContent.replace(/\s+/g, ' ').trim();
      };
      var valueFor = function (el) {
        if (el.type === 'radio') { var on = form.querySelector('input[name="' + el.name + '"]:checked'); return on ? on.value : ''; }
        if (el.type === 'checkbox') return el.checked ? 'Confirmed' : '';
        if (el.type === 'file') return el.files && el.files[0] ? el.files[0].name : '';
        var v = el.value.trim();
        if (el.hasAttribute('data-max-words') && v) {
          var short = v.length > 180 ? v.slice(0, 180).replace(/\s+\S*$/, '') + '…' : v;
          return short + ' (' + countWords(v) + ' words)';
        }
        return v;
      };
      var make = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
      // The review section: every answer, grouped by section, with an Edit link and a status for each section.
      var buildReview = function () {
        var list = form.querySelector('[data-review-list]');
        if (!list) return;
        list.textContent = '';
        order.forEach(function (st) {
          if (st.hasAttribute('data-review')) return;
          var mine = controls.filter(function (el) { return st.contains(el); });
          var missing = mine.filter(function (el) { return fieldError(el); }).length;
          var sec = make('section', 'review__section' + (missing ? ' is-incomplete' : ''));
          var head = make('div', 'review__head');
          head.appendChild(make('h3', 'review__title', stepTitle(st)));
          head.appendChild(make('span', 'review__status', missing ? (missing === 1 ? '1 item needs attention' : missing + ' items need attention') : 'Complete'));
          var edit = make('a', 'review__edit', 'Edit');
          edit.href = '#' + st.id;
          edit.setAttribute('aria-label', 'Edit ' + stepTitle(st));
          head.appendChild(edit);
          sec.appendChild(head);
          var dl = make('dl', 'review__list');
          var acks = mine.filter(function (el) { return el.type === 'checkbox'; });
          if (acks.length === mine.length && acks.length) { // a list of commitments: summarise
            var ok = acks.filter(function (el) { return el.checked; }).length;
            dl.appendChild(make('dt', '', 'Commitments confirmed'));
            dl.appendChild(make('dd', ok < acks.length ? 'is-missing' : '', ok + ' of ' + acks.length));
          } else {
            mine.forEach(function (el) {
              var v = valueFor(el);
              dl.appendChild(make('dt', '', labelFor(el)));
              dl.appendChild(make('dd', v ? '' : (el.required ? 'is-missing' : 'is-empty'), v || (el.required ? 'Missing' : 'Not answered')));
            });
          }
          sec.appendChild(dl);
          list.appendChild(sec);
        });
      };
      var show = function (st, focus) {
        current = st;
        order.forEach(function (x) { x.classList.toggle('is-active', x === st); });
        var i = order.indexOf(st);
        if (progressText) progressText.textContent = 'Step ' + (i + 1) + ' of ' + order.length + ': ' + stepTitle(st);
        if (bar) bar.style.width = ((i + 1) / order.length * 100) + '%';
        setCurrent(st.id);
        if (st.hasAttribute('data-review')) buildReview();
        if (focus) {
          toTop(!reduceMotion.matches);
          st.focus({ preventScroll: true });
        }
      };
      // Scroll to the top of the application (just under the sticky header), so the progress bar is in view.
      var toTop = function (smooth) {
        var header = document.querySelector('.site-header');
        var top = form.closest('section').getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
        window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
      };
      var fromHash = function () {
        var el = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
        return order.indexOf(el) > -1 ? el : null;
      };
      form.classList.add('is-wizard');
      show(fromHash() || order[0], false);
      // Opened at a section's address (#step-...): the browser jumps to that section; show the progress bar too.
      if (fromHash()) window.addEventListener('load', function () { setTimeout(function () { toTop(false); }, 60); });
      window.addEventListener('hashchange', function () { var st = fromHash(); if (st && st !== current) show(st, true); });
      // "Next": check this section first; stay on it if anything is wrong.
      form.addEventListener('click', function (e) {
        var next = e.target.closest('[data-next]');
        if (!next) return;
        var bad = controls.filter(function (el) { return current.contains(el) && fieldError(el); });
        if (!bad.length) return;
        e.preventDefault();
        bad.forEach(function (el) { showError(el, fieldError(el)); });
        progress();
        bad[0].focus();
      });
      // Submit found a problem in another section: open that section (and give it an address) before focusing.
      form.addEventListener('lf:reveal', function (e) {
        var st = order.filter(function (x) { return x.contains(e.detail); })[0];
        if (!st || st === current) return;
        if (window.history && history.pushState) history.pushState(null, '', '#' + st.id);
        show(st, false);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null, count = 0;
      controls.forEach(function (el) {
        var msg = fieldError(el);
        showError(el, msg);
        if (msg) { count++; if (!first) first = el; }
      });
      if (first) {
        setStatus(status, count > 1 ? 'Please correct the ' + count + ' highlighted fields.' : 'Please correct the highlighted field.', true);
        form.dispatchEvent(new Event('lf:progress'));
        form.dispatchEvent(new CustomEvent('lf:reveal', { detail: first })); // step-by-step forms open the right section
        first.focus();
        return;
      }
      var hp = form.querySelector('.form__hp input');
      if (hp && hp.value) { // a bot filled the honeypot: pretend it worked, send nothing
        form.reset();
        setStatus(status, okText);
        return;
      }
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        setStatus(status, 'Demo site: form submissions are not connected yet.');
        return;
      }
      if (button) { button.disabled = true; }
      form.setAttribute('aria-busy', 'true');
      setStatus(status, 'Sending…');
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          if (draftKey) clearDraft();
          setStatus(status, okText);
        })
        .catch(function () { setStatus(status, 'Sorry, something went wrong and your message was not sent. Please try again, or email janiece@leaderflow.org.', true); })
        .then(function () {
          if (button) button.disabled = false;
          form.removeAttribute('aria-busy');
          if (status) status.focus();
        });
    });
  });

  /* ---------- Program cards: a soft light follows the pointer (hover devices only) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-spotlight] .tile').forEach(function (tile) {
      tile.addEventListener('pointermove', function (e) {
        var r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Multi-select dropdowns (details + checkboxes) ----------
     The summary shows what is picked; Escape or a click outside closes the list. */
  document.querySelectorAll('[data-multi]').forEach(function (box) {
    var text = box.querySelector('[data-multi-text]');
    var empty = text.textContent;
    var boxes = box.querySelectorAll('input[type="checkbox"]');
    var update = function () {
      var picked = Array.prototype.filter.call(boxes, function (c) { return c.checked; })
        .map(function (c) { return c.parentNode.textContent.trim(); });
      text.textContent = picked.length === 0 ? empty : picked.length === 1 ? picked[0] : picked.length + ' sessions selected';
      box.classList.toggle('has-value', picked.length > 0);
    };
    box.addEventListener('change', update);
    var form = box.closest('form');
    if (form) form.addEventListener('reset', function () { setTimeout(update, 0); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.open) { box.open = false; box.querySelector('summary').focus(); }
    });
    document.addEventListener('click', function (e) { if (box.open && !box.contains(e.target)) box.open = false; });
    box.addEventListener('focusout', function (e) { if (box.open && e.relatedTarget && !box.contains(e.relatedTarget)) box.open = false; });
  });

  /* ---------- Home hero: rotating headline ----------
     ONE clock drives everything, so the line and the headline can never drift apart:
     t runs from 0 to CYCLE (3 x DWELL). The thick gold line's tip moves at a constant speed and touches
     each crest/trough of the wave (viewBox x 240 / 720 / 1200) at exactly t = 0, DWELL and 2 x DWELL, which is exactly
     when that headline is shown. The line is shown through a gradient mask, so its tip feathers out softly.
     End of the loop: the tip runs off the right edge, the full line rests a moment, then it dissolves from left to right
     (a long soft edge sweeping along the line, in the direction of flow), while the next line draws in from the
     left, easing into the steady pace exactly as it reaches the first crest, where the loop (and headline 1) restarts.
     The clock only advances while the hero is on screen and the tab is visible.
     With reduced motion there is no auto-advance and no growing line: the first headline stays. */
  /* Graduate wall (home hero): the columns drift in CSS; this lights one graduate at a time, taking the columns in turn
     and picking a card that is fully in the clear part of the wall (not under the fades). The drift pauses
     while the hero is off screen. With reduced motion nothing drifts or lights up. */
  var wallBox = document.querySelector('[data-wall]');
  if (wallBox && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var wall = wallBox.querySelector('.wall');
    var lit = null, wallOn = true;
    var cols = wall.querySelectorAll('.wall__col');
    var lastCol = null, queue = [];
    // Each graduate appears twice in a column (for the seamless loop), so cooldowns are keyed by photo, not by card:
    // nobody is lit again until COOLDOWN has passed since their last turn.
    var COOLDOWN = 30000, litAt = {};
    var who = function (el) { return el.querySelector('img').getAttribute('src'); };
    // Columns take turns (see below), and each turn lights a random card
    // in that column that sits fully in the clear middle of the wall (phones: away from the side fades).
    // Add the card's full-colour copy (same file as its tinted photo, so it's already loaded) the first time it is
    // picked, and fade it in once it's decoded.
    var lightUp = function (card) {
      var layer = card.querySelector('.wall__lit');
      if (!layer) {
        var base = card.querySelector('img');
        layer = document.createElement('span');
        layer.className = 'wall__lit';
        var img = document.createElement('img');
        img.alt = '';
        img.decoding = 'async';
        img.src = base.currentSrc || base.src;
        layer.appendChild(img);
        card.insertBefore(layer, card.querySelector('figcaption'));
      }
      var img2 = layer.querySelector('img');
      var go = function () { window.requestAnimationFrame(function () { if (lit === card) card.classList.add('is-lit'); }); };
      if (img2.decode) img2.decode().then(go, go); else go();
    };
    var pick = function () {
      if (!wallOn || document.hidden) return;
      var box = wall.getBoundingClientRect();
      var phone = box.height < 200;
      var clear = function (el) {
        if (el === lit || Date.now() - (litAt[who(el)] || -Infinity) < COOLDOWN) return false;
        var r = el.getBoundingClientRect();
        return phone
          ? r.left > box.left + box.width * .12 && r.right < box.right - box.width * .12
          : r.top > box.top + box.height * .08 && r.bottom < box.top + box.height * .72 && r.right < box.right - 2;
      };
      // Rounds: every visible column once, in shuffled order (never the same column twice in a row).
      if (!queue.length) {
        queue = Array.prototype.filter.call(cols, function (c) { return c.offsetParent; });
        for (var j = queue.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)), tmp = queue[j]; queue[j] = queue[k]; queue[k] = tmp; }
        if (queue.length > 1 && queue[0] === lastCol) queue.push(queue.shift());
      }
      for (var i = 0; i < queue.length; i++) {
        var ok = Array.prototype.filter.call(queue[i].querySelectorAll('.wall__card'), clear);
        if (!ok.length) continue;        // nothing clear (or everyone clear is cooling down): try this column next turn
        if (lit) lit.classList.remove('is-lit');
        lit = ok[Math.floor(Math.random() * ok.length)];
        lightUp(lit);
        litAt[who(lit)] = Date.now();
        lastCol = queue.splice(i, 1)[0];
        return;
      }
    };
    setTimeout(pick, 900);
    setInterval(pick, 3600);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        wallOn = entries[0].isIntersecting;
        wall.classList.toggle('is-paused', !wallOn);
      }).observe(wallBox);
    }
  }

  var rot = document.querySelector('[data-rotator]');
  if (rot) {
    var items = rot.querySelectorAll('h1 .rotator__item');
    var ledes = rot.querySelectorAll('.rotator--lede .rotator__item');
    var journey = rot.querySelector('.journey');
    var wins = Array.prototype.map.call(rot.querySelectorAll('[data-journey-window]'), function (w) {
      return { win: w, pane: w.querySelector('.journey__pane') };
    });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var DWELL = 6500, CYCLE = DWELL * items.length;
    var DOT0 = 240, GAP = 480;          // first crest and the spacing between crest/trough points (viewBox is 1440 wide)
    var V = GAP / DWELL;                // steady tip speed, viewBox units per ms
    var G0 = -300;                      // "off screen to the left" for the line's ends
    var HEAD = [80, 25, -20];           // tip feather: full at tip-80, .55 at tip-25, clear at tip+20
    var TAIL = 520;                     // length of the soft trailing edge when the line dissolves
    var OUT0 = CYCLE - 2600, OUT1 = CYCLE - 250;   // the dissolve sweeps across in 2.35 s
    var IN0 = CYCLE - 1250, IN_FROM = -140;        // the next line draws in over the last 1.25 s
    var cur = 0, t = 0, last = null, onScreen = true;

    var show = function (n) {
      if (n === cur) return;
      [items, ledes].forEach(function (list) {
        var prev = list[cur];
        if (!prev) return;
        prev.classList.add('is-leaving');
        setTimeout(function () { prev.classList.remove('is-leaving'); }, 750);
        Array.prototype.forEach.call(list, function (el, i) {
          el.classList.toggle('is-active', i === n);
          if (i === n) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
        });
      });
      cur = n;
    };

    var ease = function (p) { return p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p); }; // smoothstep
    // Each window is WIN viewBox units long: soft tail (TAIL) on its left, soft tip on its right (full at tip-80,
    // .55 at tip-25, clear at tip+20). WIN is chosen so that, at the moment the dissolve starts, the window's tail
    // edge is exactly where the old trailing edge was; before that the tail edge is always off screen.
    var tipAt = function (time) { return Math.min(1700, DOT0 + time / DWELL * GAP); };
    var WIN = tipAt(OUT0) - HEAD[2] - (G0 + 40 - TAIL);
    var u = 1; // px per viewBox unit (the SVG stretches 1440 units across the line's width)
    var layout = function () {
      var w = journey.clientWidth;
      u = w / 1440;
      var px = function (n) { return (n * u).toFixed(1) + 'px'; };
      var mask = 'linear-gradient(90deg, transparent 0, #000 ' + px(TAIL) + ', #000 calc(100% - ' + px(HEAD[0] - HEAD[2]) + '), ' +
        'rgb(0 0 0 / .55) calc(100% - ' + px(HEAD[1] - HEAD[2]) + '), transparent 100%)';
      wins.forEach(function (o) {
        o.win.style.width = px(WIN);
        o.win.style.webkitMaskImage = mask;
        o.win.style.maskImage = mask;
        o.pane.style.width = w + 'px';
      });
    };
    // Put a window's left edge at viewBox x, and hold its pane (the painted line) still.
    var place = function (o, x) {
      var p = (x * u).toFixed(2);
      o.win.style.transform = 'translate3d(' + p + 'px, 0, 0)';
      o.pane.style.transform = 'translate3d(' + (-p) + 'px, 0, 0)';
    };

    // Draw the current moment: the mask (line) and the headline both come from t.
    var render = function () {
      var steps = t / DWELL;                                 // 0 .. 3
      var tip = Math.min(1700, DOT0 + steps * GAP);          // tip reaches point i exactly at steps = i
      show(Math.min(items.length - 1, Math.floor(steps)));   // ...which is exactly when headline i shows
      // Trailing edge: off screen to the left until the dissolve, then eased across to beyond the right edge.
      var tail = G0 + 40 + ease((t - OUT0) / (OUT1 - OUT0)) * (1480 + TAIL - G0 - 40);
      // The next line: a cubic that leaves IN_FROM at rest and reaches the first crest at the steady speed V.
      var s = (t - IN0) / (CYCLE - IN0), nxt = G0;
      if (s > 0) nxt = IN_FROM + (DOT0 - IN_FROM) * (3 * s * s - 2 * s * s * s) + V * (CYCLE - IN0) * (s * s * s - s * s);
      if (!wins.length) return;
      // Current line: its tip leads until the dissolve; then its soft tail sweeps off to the right.
      var left = tip - HEAD[2] - WIN;
      if (t >= OUT0) left = Math.max(left, tail - TAIL);
      place(wins[0], left);
      // Next line: only its tip matters (its tail is far off screen).
      place(wins[1], nxt - HEAD[2] - WIN);
    };

    var frame = function (now) {
      if (last !== null && onScreen && !document.hidden) {
        t += Math.min(now - last, 100); // cap the step so a slow frame never skips ahead
        if (t >= CYCLE) t -= CYCLE;
        render();
      }
      last = now;
      window.requestAnimationFrame(frame);
    };

    if (reduce.matches || !journey) {
      if (journey) journey.classList.add('is-static');
    } else {
      layout();
      window.addEventListener('resize', function () { layout(); render(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; }).observe(rot);
      }
      render();
      window.requestAnimationFrame(frame);
    }
  }

  /* ---------- Reveal on scroll (+ flow lines drawing in) ---------- */
  var reveals = document.querySelectorAll('.reveal, .draw');
  // Stagger siblings that reveal together (grids, timelines): each gets its index as --i.
  document.querySelectorAll('.bento, .people, .logos, .timeline, .values, .support-grid, .facts').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal'), function (el, i) {
      el.style.setProperty('--i', Math.min(i, 6));
    });
  });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Anything already on screen stays as painted: mark it visible *before* removing "no-js",
    // so it is never hidden and faded back in (the old flicker). Only content below the fold animates.
    var vh = window.innerHeight || doc.clientHeight;
    var pending = [];
    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-visible'); else pending.push(el);
    });
    doc.classList.remove('no-js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    pending.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    doc.classList.remove('no-js');
  }
})();
