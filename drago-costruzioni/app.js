/* Drago Costruzioni homepage: header, menu, anchors, hero entrance and count-up, reveals, service rows that swap the photo,
   drag strip, magnetic buttons, form, and the GSAP signature scene: a 12-week renovation schedule that fills as you scroll,
   with a "today" cursor, the week counter, the current phase and the site manager's line running the whole way. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm');

  /* hero: start on the first frame, never wait for fonts or images */
  var heroN = d.querySelector('[data-hero-count]');
  if (reduce) html.classList.add('is-ready');
  else {
    if (heroN) heroN.textContent = '0';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        html.classList.add('is-ready');
        if (!heroN) return;
        var to = +heroN.getAttribute('data-hero-count'), t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1100);
          heroN.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        setTimeout(function () { requestAnimationFrame(step); }, 250);
      });
    });
  }

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* services: the active row (hover, or the row in the middle of the screen) swaps the photo */
  var rows = d.querySelectorAll('[data-rows] .row'), rimg = d.querySelector('[data-rows-img]'), curSrc = rimg ? rimg.getAttribute('src') : '';
  function activate(row) {
    rows.forEach(function (r) { r.classList.toggle('is-on', r === row); });
    var src = row.getAttribute('data-img');
    if (!rimg || src === curSrc) return;
    curSrc = src;
    if (reduce) { rimg.src = src; return; }
    rimg.classList.add('is-out');
    setTimeout(function () { var im = new Image(); im.onload = im.onerror = function () { rimg.src = src; rimg.classList.remove('is-out'); }; im.src = src; }, 220);
  }
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { activate(r); }); });
  if ('IntersectionObserver' in window && rows.length) {
    var rio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) activate(e.target); }); }, { rootMargin: '-46% 0px -46% 0px' });
    rows.forEach(function (r) { rio.observe(r); });
  }

  /* drag strip with a progress bar */
  var strip = d.querySelector('[data-drag]'), bar = d.querySelector('[data-drag-bar]');
  if (strip) {
    var sync = function () {
      var max = strip.scrollWidth - strip.clientWidth, w = strip.clientWidth / strip.scrollWidth;
      bar.style.width = (w * 100).toFixed(1) + '%';
      bar.style.transform = 'translateX(' + (max > 0 ? (strip.scrollLeft / max) * ((1 - w) / w) * 100 : 0).toFixed(1) + '%)';
    };
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    if (window.matchMedia('(pointer: fine)').matches) {
      var down = false, sx = 0, sl = 0, moved = false;
      strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
      window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
      window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
      strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    }
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 340, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -340, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Scrivi nome e cognome.', phone: 'Scrivi un numero per richiamarti.', email: 'Scrivi un indirizzo email valido.', message: 'Descrivi il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    schedule(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: the schedule. One value (the week, 0 to 12) drives the cursor, the bars, the counter, the phase and the photo,
     so the side text is always in step with the chart. */
  function schedule(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var gantt = sec.querySelector('.gantt'), statusBar = sec.querySelector('.status__bar');
    var gs = Array.prototype.slice.call(sec.querySelectorAll('.g')).map(function (li) {
      return { el: li, s: +li.getAttribute('data-s'), e: +li.getAttribute('data-e'), t: li.getAttribute('data-t'), dl: li.classList.contains('g--dl') };
    });
    var wkEl = sec.querySelector('[data-wk]'), phEl = sec.querySelector('[data-ph]'), done = sec.querySelector('[data-done]');
    var imgs = sec.querySelectorAll('[data-ph-img]');
    var lastWk = -1, lastPh = '', lastImg = -1;
    function render(w) {
      var x = Math.max(0, Math.min(1, w / 12));
      gantt.style.setProperty('--x', x.toFixed(4));
      statusBar.style.setProperty('--x', x.toFixed(4));
      var ph = '', lastDone = '';
      gs.forEach(function (g) {
        var f = Math.max(0, Math.min(1, (w - g.s) / (g.e - g.s)));
        g.el.style.setProperty('--f', f.toFixed(4));
        var now = w > g.s && w < g.e, isDone = w >= g.e;
        g.el.classList.toggle('is-now', now);
        g.el.classList.toggle('is-done', isDone);
        if (!g.dl && now) ph = g.t; // the latest phase under the cursor wins
        if (!g.dl && isDone) lastDone = g.t;
      });
      var ms = sec.querySelector('.g--ms');
      if (ms) ms.style.setProperty('--m', w >= 11.95 ? 1 : 0);
      var wk = Math.max(1, Math.min(12, Math.ceil(w)));
      if (wk !== lastWk) { lastWk = wk; wkEl.textContent = (wk < 10 ? '0' : '') + wk; }
      if (w >= 11.95) ph = 'Consegna';
      if (!ph) ph = lastDone || gs[0].t;
      if (ph !== lastPh) { lastPh = ph; phEl.textContent = ph; }
      var ii = w < 4.5 ? 0 : (w < 9 ? 1 : 2);
      if (ii !== lastImg) { lastImg = ii; imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === ii); }); }
    }
    var state = { w: 0 };
    var txt = sec.querySelectorAll('.regia__text > .eyebrow, .regia__text > .h2, .regia__lead, .status, .regia__photo');
    gsap.set(txt, { autoAlpha: 0, y: 24 });
    gsap.set(gantt, { autoAlpha: 0, y: 40 });
    gsap.set(done, { autoAlpha: 0, y: 12, scale: 0.96 });
    render(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: true, scrub: 0.5, anticipatePin: 1 }
    });
    tl.to(txt, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, 0)
      .to(gantt, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.15)
      .to(state, { w: 12, duration: 6, onUpdate: function () { render(state.w); } }, 0.8)
      .to(done, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }, 6.85)
      .to({}, { duration: 0.6 });
  }
})();
