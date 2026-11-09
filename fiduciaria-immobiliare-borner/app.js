/* Börner-Albertini: hero entrance (gold curtain lifts, arch mark draws, line reveal), header, menu, anchors, reveals,
   expanding panels, method line, magnetic buttons, form, and the GSAP signature scene: a building whose units and
   ledger fill in, from valuation to lettings, sale and the notary. */
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

  /* expanding panels: hover, focus or tap opens one */
  var panels = d.querySelectorAll('.panel');
  panels.forEach(function (p) {
    var open = function () { panels.forEach(function (o) { o.classList.toggle('is-open', o === p); }); };
    p.addEventListener('mouseenter', open);
    p.addEventListener('focus', open);
    p.addEventListener('click', open);
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.15)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
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
    ledgerScene(window.innerWidth < 860);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ledgerScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var stages = q('.stages li');
    var ui = { n: q1('[data-s-n]'), t: q1('[data-s-t]'), d: q1('[data-s-d]') }, occ = q1('[data-occ]');
    var dims = q('.dims path'), outline = q1('.outline'), roof = q1('.roof'), tag = q1('[data-tag]');
    var units = Array.prototype.slice.call(q('.units rect[data-u]')).filter(function (u) { return u.getAttribute('data-u') !== '9'; });
    var topRow = q('.units rect[data-u="9"]'), pent = q1('[data-pent]'), sold = q1('[data-sold]'), seal = q1('[data-seal]');
    var rows = q('.ledger__rows li'), arcade = q('.arcade path');
    units.sort(function (a, b) { return a.getAttribute('data-u') - b.getAttribute('data-u'); });

    gsap.set(dims, { strokeDashoffset: 1 });
    gsap.set(outline, { strokeDashoffset: 1, fillOpacity: 0 });
    gsap.set([roof, topRow, arcade, units], { autoAlpha: 0 });
    gsap.set(tag, { autoAlpha: 0, y: 10 });
    gsap.set(pent, { autoAlpha: 0, scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(sold, { autoAlpha: 0, scale: .6, transformOrigin: '50% 50%' });
    gsap.set(seal, { autoAlpha: 0, scale: 1.8, rotation: -20, transformOrigin: '50% 50%' });
    gsap.set(rows, { autoAlpha: 0, x: -12 });
    var counter = { n: 0 };
    occ.textContent = '0 / 9';

    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      ui.n.textContent = '0' + (i + 1);
      ui.t.textContent = stages[i].getAttribute('data-t');
      ui.d.textContent = stages[i].getAttribute('data-d');
    }
    var cuts = [1.1, 1.9, 3.6, 4.4];
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { var t = tl.time(), i = 0; while (i < cuts.length && t >= cuts[i]) i++; show(i); },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(q('.scene__text > .eyebrow, .scene__text > .h2, .stage, .ledger'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0)
      /* 1. valuation: the building is measured */
      .to(outline, { strokeDashoffset: 0, duration: 0.5 }, 0.3)
      .to(dims, { strokeDashoffset: 0, duration: 0.4, stagger: 0.08 }, 0.4)
      .to(tag, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.6)
      /* 2. dossier: the building is drawn in full, the ledger rows appear empty */
      .to(tag, { autoAlpha: 0, duration: 0.15 }, 1.1)
      .to(outline, { fillOpacity: 1, duration: 0.3 }, 1.1)
      .to([roof, arcade], { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, 1.15)
      .to(topRow, { autoAlpha: 1, duration: 0.2 }, 1.3)
      .to(units, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, 1.35)
      .to(rows, { autoAlpha: 0.35, x: 0, duration: 0.2, stagger: 0.03 }, 1.4)
      /* 3. lettings: units fill one by one, the rows confirm */
      .to(counter, { n: 9, duration: 1.6, onUpdate: function () { occ.textContent = Math.round(counter.n) + ' / 9'; } }, 1.95);
    units.forEach(function (u, i) {
      tl.to(u, { fill: '#A88848', duration: 0.12 }, 1.95 + i * 0.17)
        .to(rows[i], { autoAlpha: 1, duration: 0.12 }, 1.95 + i * 0.17);
    });
    /* 4. sale: the top floor becomes one penthouse, sold */
    tl.to(topRow, { autoAlpha: 0, duration: 0.2 }, 3.65)
      .to(pent, { autoAlpha: 1, scaleX: 1, duration: 0.35, ease: 'power2.out' }, 3.65)
      .to(sold, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, 3.95)
      .to(rows[9], { autoAlpha: 1, duration: 0.15 }, 3.95)
      /* 5. notary seal */
      .to(seal, { autoAlpha: 1, scale: 1, rotation: -8, duration: 0.3, ease: 'back.out(1.6)' }, 4.45)
      .to({}, { duration: 0.6 });
    show(0);
  }
})();
