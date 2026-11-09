/* Vitali Gestioni Immobiliari: hero (number-led, hexagon reveal), header, menu, anchors, reveals, count-up,
   tabs, request rows that prefill the form, magnetic buttons, form validation,
   and the GSAP signature scene: one year of a building on a twelve-month dial. */
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

  /* mobile menu */
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals, with the above-the-fold guard */
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

  /* count-up: "oltre 17 anni" from their own former site */
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1300;
    el.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* tabs: PPP / stabili da reddito */
  var tabs = Array.prototype.slice.call(d.querySelectorAll('[role="tab"]')), bar = d.querySelector('.tabs__bar');
  function placeBar(t) {
    if (!bar || !t) return;
    bar.style.width = (t.offsetWidth - 24 > 40 ? t.offsetWidth - 24 : t.offsetWidth) + 'px';
    bar.style.transform = 'translateX(' + t.offsetLeft + 'px)';
  }
  function select(t, focus) {
    tabs.forEach(function (o) {
      var on = o === t, p = d.getElementById(o.getAttribute('aria-controls'));
      o.setAttribute('aria-selected', on ? 'true' : 'false');
      o.tabIndex = on ? 0 : -1;
      p.hidden = !on;
      p.classList.toggle('is-on', on);
    });
    placeBar(t);
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });
  placeBar(tabs[0]);
  window.addEventListener('resize', function () { placeBar(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0]); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { placeBar(tabs[0]); });

  /* request rows prefill the form */
  var sel = d.getElementById('f-req');
  d.querySelectorAll('[data-req]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (sel) sel.value = a.getAttribute('data-req');
      setTimeout(function () { var n = d.getElementById('f-name'); if (n) n.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete in due righe che cosa vi serve.' };
    var req = form.querySelectorAll('[required]');
    function check(f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- signature scene ---------- */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    yearScene(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function yearScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var NS = 'http://www.w3.org/2000/svg';
    var MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    var prog = sec.querySelector('[data-prog]'), marker = sec.querySelector('[data-marker]');
    var labels = sec.querySelectorAll('[data-mi]'), phases = sec.querySelectorAll('.ph');
    var mnum = sec.querySelector('[data-mnum]'), mname = sec.querySelector('[data-mname]');
    var chk = sec.querySelectorAll('[data-chk] path'), chkG = sec.querySelector('[data-chk]');
    var envG = sec.querySelector('[data-envs]'), pill = sec.querySelector('[data-pill]');
    var insp = sec.querySelector('[data-insp]'), lens = sec.querySelector('[data-lens]');
    var door = sec.querySelector('[data-door]'), plant = sec.querySelector('[data-plant]'), gear = sec.querySelector('[data-gear]');
    var lits = sec.querySelectorAll('[data-lits] rect');
    var wins = Array.prototype.map.call(sec.querySelectorAll('[data-wins] rect'), function (r) {
      return { x: +r.getAttribute('x') + 17, y: +r.getAttribute('y') + 20 };
    });

    /* twelve envelopes, one per unit, built here so the static page stays clean */
    var envs = wins.map(function () {
      var g = d.createElementNS(NS, 'g'), r = d.createElementNS(NS, 'rect'), p = d.createElementNS(NS, 'path');
      r.setAttribute('x', -9); r.setAttribute('y', -6); r.setAttribute('width', 18); r.setAttribute('height', 12);
      p.setAttribute('d', 'M-9 -6L0 1L9 -6');
      g.appendChild(r); g.appendChild(p); envG.appendChild(g);
      return g;
    });

    sec.classList.add('is-live');
    gsap.set(prog, { strokeDashoffset: 100 });
    gsap.set(marker, { rotation: 0, svgOrigin: '300 300' });
    gsap.set(lits, { opacity: 0 });
    gsap.set(insp, { strokeDashoffset: 100 });
    gsap.set([chkG, envG, pill, lens], { opacity: 1 });
    gsap.set(chk, { opacity: 0, scale: .4, transformOrigin: '50% 50%' });
    gsap.set(envs, { x: 300, y: 404, opacity: 0, scale: .6 });
    gsap.set(pill, { opacity: 0, y: 12 });
    gsap.set(lens, { x: 186, y: 430, opacity: 0 });
    gsap.set(sec.querySelectorAll('.year__text > .eyebrow, .year__text > .h2'), { autoAlpha: 0, y: 18 });

    var lastM = -1;
    function sync(p) {
      var m = Math.min(11, Math.floor(p * 12 + 0.0001));
      if (m === lastM) return;
      lastM = m;
      mnum.textContent = (m + 1 < 10 ? '0' : '') + (m + 1);
      mname.textContent = MONTHS[m];
      labels.forEach(function (l, i) { l.classList.toggle('is-on', i <= m); });
      var ph = Math.floor(m / 2);
      phases.forEach(function (li, i) { li.classList.toggle('is-on', i === ph); li.classList.toggle('is-done', i < ph); });
    }
    sync(0);

    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=210%' : '+=280%',
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (s) { sync(Math.max(0, (s.progress * 12.6 - 0.3) / 12)); } } });

    /* 0.3 lead-in, then 12 "months", then 0.3 hold: total 12.6 */
    tl.to(sec.querySelectorAll('.year__text > .eyebrow, .year__text > .h2'), { autoAlpha: 1, y: 0, duration: .3, stagger: .08, ease: 'power2.out' }, 0);
    var T = function (m) { return 0.3 + m; };
    tl.to(prog, { strokeDashoffset: 0, duration: 12 }, T(0))
      .to(marker, { rotation: 360, svgOrigin: '300 300', duration: 12 }, T(0));

    /* Jan-Feb: a closing statement for every unit */
    tl.to(chk, { opacity: 1, scale: 1, duration: .25, stagger: .11, ease: 'back.out(2)' }, T(0.15))
      .to(chk, { opacity: 0, duration: .3 }, T(1.8));
    /* Mar-Apr: budget and convocation leave the entrance for every owner */
    tl.to(door, { fill: '#E0062A', duration: .2 }, T(2))
      .to(envs, { opacity: 1, scale: 1, duration: .15, stagger: .1 }, T(2.15));
    envs.forEach(function (g, i) { tl.to(g, { x: wins[i].x, y: wins[i].y, duration: .55, ease: 'power2.inOut' }, T(2.2 + i * 0.1)); });
    tl.to(envs, { opacity: 0, duration: .25 }, T(3.75))
      .to(door, { fill: '#55595F', duration: .2 }, T(3.8));
    /* May-Jun: the assembly, minutes in Italian and German */
    tl.to(pill, { opacity: 1, y: 0, duration: .35, ease: 'back.out(2)' }, T(4.1))
      .to(door, { fill: '#E0062A', duration: .2 }, T(4.1))
      .to(pill, { opacity: 0, y: -8, duration: .3 }, T(5.75))
      .to(door, { fill: '#55595F', duration: .2 }, T(5.8));
    /* Jul-Aug: inspection walks around the building */
    tl.to(insp, { strokeDashoffset: 0, duration: 1.6 }, T(6.05))
      .to(lens, { opacity: 1, duration: .15 }, T(6.05))
      .to(lens, { x: 186, y: 158, duration: .5 }, T(6.1))
      .to(lens, { x: 300, y: 112, duration: .4 }, T(6.6))
      .to(lens, { x: 414, y: 158, duration: .4 }, T(7.0))
      .to(lens, { x: 414, y: 430, duration: .5 }, T(7.4))
      .to(lens, { opacity: 0, duration: .2 }, T(7.85))
      .to(insp, { opacity: .3, duration: .3 }, T(8.6));
    /* Sep-Oct: plant room and maintenance */
    tl.to(plant, { fill: '#FDECEF', stroke: '#E0062A', duration: .2 }, T(8.05))
      .to(gear, { rotation: 360, svgOrigin: '342 477', duration: 1.8 }, T(8.1))
      .to(plant, { fill: '#FEFEFE', stroke: '#55595F', duration: .2 }, T(9.85));
    /* Nov-Dec: every unit followed, the windows light one by one */
    var order = [8, 3, 5, 10, 0, 6, 11, 2, 9, 4, 1, 7];
    order.forEach(function (k, i) { tl.to(lits[k], { opacity: 1, duration: .2 }, T(10.05 + i * 0.15)); });
    tl.to(insp, { opacity: 1, duration: .3 }, T(11.6));
    tl.to({}, { duration: .3 }, T(12));
  }
})();
