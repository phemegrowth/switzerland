/* Nembrini & Co SA: type-first hero (name reveal, photo strip slides in and drifts), header, menu, anchors, reveals,
   count-up, magnetic buttons, form, and the GSAP signature scene: an example construction schedule whose "today"
   line sweeps 40 weeks; each phase bar fills and the matching part of the house is built in the same moment
   (foundations, frame, masonry, roof, services, finishes, outdoor works). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* hero strip drifts left as you scroll */
  var reel = d.querySelector('[data-strip]');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* count-up (sourced quantity only: years since 1988) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) return;
    el.textContent = '0';
    reveal([el], function () {
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    html.classList.add('st-on');
    ganttScene(window.innerWidth < 700);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ganttScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var svg = sec.querySelector('[data-gantt]');
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return sec.querySelectorAll(s); };
    var rows = [['Scavo e fondazioni', 0, 6, 'fond'], ['Struttura in calcestruzzo', 5, 16, 'strut'], ['Murature', 13, 22, 'mur'], ['Tetto', 18, 24, 'tetto'], ['Impianti', 20, 32, 'imp'], ['Finiture', 28, 38, 'fin'], ['Sistemazione esterna', 34, 40, 'est']];
    var X0 = 230, X1 = 600, WK = 40;
    if (small) {
      svg.setAttribute('viewBox', '0 0 620 950');
      one('[data-g="bld"]').setAttribute('transform', 'translate(-505 -150)');
      one('[data-g="gnt"]').setAttribute('transform', 'translate(8 430)');
    }
    var week = one('[data-week]'), phase = one('[data-phase]'), line = one('[data-now-line]');
    gsap.set(q('.g-bar'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(line, { x: 0 });
    var parts = {};
    rows.forEach(function (r) { parts[r[3]] = one('[data-part="' + r[3] + '"]'); });
    gsap.set(parts.fond.children, { autoAlpha: 0, y: 14 });
    gsap.set(parts.strut.children, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(parts.mur.children, { autoAlpha: 0 });
    gsap.set(parts.tetto, { autoAlpha: 0, y: -24 });
    gsap.set(parts.imp.children, { autoAlpha: 0 });
    gsap.set(parts.fin.children, { autoAlpha: 0 });
    gsap.set(parts.est.children, { autoAlpha: 0, scale: .2, transformOrigin: '50% 100%' });
    week.textContent = '00';

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(line, { x: X1 - X0, duration: WK }, 0);
    rows.forEach(function (r, i) {
      var a = r[1], len = r[2] - r[1];
      tl.to(one('[data-bar="' + i + '"]'), { scaleX: 1, duration: len }, a);
    });
    var ease = 'power2.out';
    tl.to(parts.fond.children, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 1.1, ease: ease }, 0.2)
      .to(parts.strut.children, { scaleY: 1, duration: 2, stagger: 1.7, ease: ease }, 5.2)
      .to(parts.mur.children, { autoAlpha: 1, duration: 1.4, stagger: 2, ease: ease }, 13.3)
      .to(parts.tetto, { autoAlpha: 1, y: 0, duration: 4, ease: ease }, 18.5)
      .to(parts.imp.children, { autoAlpha: 1, duration: 2, stagger: 3.5, ease: ease }, 20.5)
      .to(parts.fin.children, { autoAlpha: 1, duration: 1.4, stagger: .9, ease: ease }, 28.3)
      .to(parts.est.children, { autoAlpha: 1, scale: 1, duration: 1.4, stagger: .7, ease: 'back.out(1.6)' }, 34.3)
      .to({}, { duration: 2.5 }, 40);

    var lastW = -1, lastP = '';
    function sync() {
      var t = Math.min(WK, tl.time()), w = Math.round(t), p = rows[0][0];
      rows.forEach(function (r) { if (t >= r[1]) p = r[0]; });
      if (w !== lastW) { lastW = w; week.textContent = (w < 10 ? '0' : '') + w; }
      if (p !== lastP) { lastP = p; phase.textContent = p; }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
