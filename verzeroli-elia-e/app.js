/* Verzeroli homepage: curtain hero (CSS), header, menu, anchors, reveals, service list with photo swap,
   magnetic buttons, form validation, and the GSAP signature scene: a sopraelevazione drawn as an elevation. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1, behavior: reduce ? 'auto' : 'smooth' });
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

  /* services: hover, focus or scroll position picks the photo */
  var svc = d.querySelectorAll('[data-svc] .svc__i'), pics = d.querySelectorAll('.work__frame img');
  function pick(i) {
    svc.forEach(function (s, j) { s.classList.toggle('is-act', j === i); });
    pics.forEach(function (p, j) { p.classList.toggle('is-on', j === i); });
  }
  svc.forEach(function (s, i) {
    s.addEventListener('mouseenter', function () { pick(i); });
    s.addEventListener('focus', function () { pick(i); });
  });
  if (!reduce) {
    window.addEventListener('scroll', function () {
      if (!svc.length || window.matchMedia('(hover: hover)').matches && d.querySelector('.svc:hover')) return;
      var mid = window.innerHeight * 0.5, best = -1;
      svc.forEach(function (s, i) { if (s.getBoundingClientRect().top < mid) best = i; });
      if (best > -1) pick(best);
    }, { passive: true });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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

  /* signature scene */
  var sec = d.querySelector('[data-scene]');
  var steps = sec ? sec.querySelectorAll('[data-steps] li') : [], cnt = sec && sec.querySelector('[data-count]');
  var cur = -1;
  function setStep(i) {
    if (i === cur || !steps.length) return; cur = i;
    steps.forEach(function (li, j) { li.classList.toggle('is-act', j === i); });
    cnt.textContent = '0' + (i + 1);
  }
  setStep(steps.length - 1);

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    if (small) { sec.querySelector('.elev').setAttribute('viewBox', '150 84 590 560'); sec.querySelector('.elev .note').setAttribute('x', '222'); }
    var draw = sec.querySelectorAll('[data-draw]');
    var courses = sec.querySelectorAll('[data-course]');
    var winLines = sec.querySelectorAll('[data-newwin] .ln');
    var roof = sec.querySelector('[data-roof]'), plaster = sec.querySelector('[data-plaster]');
    var dim = sec.querySelector('[data-dim]'), trowel = sec.querySelector('[data-trowel]');
    var grid = sec.querySelector('[data-grid]'), ground = sec.querySelector('[data-ground]');

    cur = -1; setStep(0);
    gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(winLines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set([grid, ground], { opacity: 0 });
    gsap.set(roof, { y: 0 });
    gsap.set(courses, { y: 26, opacity: 0 });
    gsap.set(plaster, { opacity: 0 });
    gsap.set(dim, { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(trowel, { opacity: 0, x: 230, y: 284 });
    var roofFill = sec.querySelectorAll('[data-roof] .roof__fill, [data-roof] .roof__slab');
    var winFill = sec.querySelectorAll('[data-newwin] rect');
    gsap.set(roofFill, { opacity: 0 });
    gsap.set(winFill, { fillOpacity: 0 });
    var txt = sec.querySelectorAll('.lift__text > *');

    /* timeline in 4 units, one per step; the step list and counter follow the same units */
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { setStep(Math.min(3, Math.floor(s.progress * 4 * 0.9999))); } } });
    tl.fromTo(txt, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.3, ease: 'power2.out' }, 0)
      .to([grid, ground], { opacity: 1, duration: 0.3 }, 0.05)
      .to(draw, { strokeDashoffset: 0, duration: 0.75, stagger: 0.04, ease: 'power1.inOut' }, 0.1)
      .to(roofFill, { opacity: 1, duration: 0.3 }, 0.6)
      /* step 2: the roof lifts well above the house */
      .to(roof, { y: -170, duration: 0.8, ease: 'power2.inOut' }, 1.0)
      /* step 3: courses rise one by one, the dimension grows */
      .to(courses, { y: 0, opacity: 1, duration: 0.3, stagger: 0.12, ease: 'power2.out' }, 2.0)
      .to(dim, { opacity: 1, scaleY: 1, duration: 0.7, ease: 'power2.out' }, 2.05)
      /* step 4: roof down onto the new storey, openings drawn, trowel plasters */
      .to(roof, { y: -120, duration: 0.45, ease: 'power2.in' }, 3.0)
      .to(winLines, { strokeDashoffset: 0, duration: 0.4, stagger: 0.05 }, 3.1)
      .to(winFill, { fillOpacity: 1, duration: 0.3 }, 3.5)
      .to(trowel, { opacity: 1, duration: 0.08 }, 3.3)
      .to(trowel, { x: 500, duration: 0.6, ease: 'power1.inOut' }, 3.3)
      .to(plaster, { opacity: 0.9, duration: 0.5 }, 3.4)
      .to(trowel, { opacity: 0, duration: 0.1 }, 3.9)
      .to({}, { duration: 0.1 }, 3.9);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
