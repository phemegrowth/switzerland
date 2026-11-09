/* Lefor homepage: fan-of-cards hero (CSS), header, menu, anchors, reveals, service tabs, magnetic buttons,
   form validation, and the GSAP signature scene: one apartment building, four trades. */
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

  /* tabs: click, arrow keys; the bar slides under the active tab */
  var tl = d.querySelector('[data-tabs] .tabs__list');
  if (tl) {
    var tbs = tl.querySelectorAll('[role="tab"]'), bar = tl.querySelector('.tabs__bar');
    function moveBar(b) { bar.style.width = b.offsetWidth - 22 + 'px'; bar.style.transform = 'translateX(' + (b.offsetLeft) + 'px)'; }
    function sel(i, focus) {
      tbs.forEach(function (b, j) {
        var on = i === j, p = d.getElementById(b.getAttribute('aria-controls'));
        b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        p.hidden = !on; p.classList.toggle('is-on', on);
      });
      moveBar(tbs[i]); if (focus) tbs[i].focus();
    }
    tbs.forEach(function (b, i) {
      b.addEventListener('click', function () { sel(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); sel((i + 1) % tbs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); sel((i - 1 + tbs.length) % tbs.length, true); }
      });
    });
    moveBar(tbs[0]);
    window.addEventListener('resize', function () { var a = tl.querySelector('.is-on'); if (a) moveBar(a); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { var a = tl.querySelector('.is-on'); if (a) moveBar(a); });
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
    var msgs = { name: 'Indichi nome e cognome.', phone: 'Indichi un numero per richiamarla.', email: 'Indichi un indirizzo email valido.', message: 'Ci descriva in due righe l’immobile.' };
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

  /* signature scene: one building, four trades */
  var sec = d.querySelector('[data-scene]');
  var steps = sec ? sec.querySelectorAll('[data-steps] li') : [], cnt = sec && sec.querySelector('[data-count]');
  var cur = -1;
  function setStep(i) {
    if (i === cur || !steps.length) return; cur = i;
    steps.forEach(function (li, j) { li.classList.toggle('is-act', j === i); });
    cnt.textContent = '0' + (i + 1);
  }
  if (sec) setStep(steps.length - 1);

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    if (small) sec.querySelector('.pal').setAttribute('viewBox', '160 36 480 512');
    var draw = sec.querySelectorAll('[data-draw]');
    var rent = sec.querySelectorAll('.win[data-rent]'), wins = sec.querySelectorAll('.win');
    var ppp = sec.querySelectorAll('[data-ppp] rect');
    var sale = sec.querySelectorAll('[data-sale] .win');
    var feas = sec.querySelector('[data-feas]'), feasR = sec.querySelector('.feas__r');
    var tags = sec.querySelectorAll('[data-tag]');
    var txt = sec.querySelectorAll('.bldg__text > *');
    var DARK = '#222926', SAGE = '#8db89f', PAPER = '#fcfdfc';
    cur = -1; setStep(0);
    gsap.set(draw, { strokeDasharray: '1 1', strokeDashoffset: 1 });
    gsap.set(wins, { opacity: 0, fill: DARK });
    gsap.set(ppp, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' });
    gsap.set(tags, { opacity: 0, y: 10 });
    gsap.set(feas, { opacity: 0 });
    gsap.set(feasR, { scaleY: 0, transformOrigin: '50% 100%' });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { setStep(Math.min(3, Math.floor(s.progress * 4 * 0.9999))); } } });
    tl.fromTo(txt, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25, ease: 'power2.out' }, 0)
      .to(draw, { strokeDashoffset: 0, duration: 0.5, stagger: 0.03, ease: 'power1.inOut' }, 0.05)
      .to(wins, { opacity: 1, duration: 0.25, stagger: 0.01 }, 0.35)
      /* 01 rented units and shops light up */
      .to(rent, { fill: SAGE, duration: 0.3, stagger: 0.03 }, 0.55)
      .to(tags[0], { opacity: 1, y: 0, duration: 0.2 }, 0.75)
      /* 02 every PPP unit gets its owner's outline */
      .to(tags[0], { opacity: 0, duration: 0.15 }, 1.05)
      .to(ppp, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(2)' }, 1.1)
      .to(tags[1], { opacity: 1, y: 0, duration: 0.2 }, 1.5)
      /* 03 one unit goes on sale */
      .to(tags[1], { opacity: 0, duration: 0.15 }, 2.05)
      .to(sale, { fill: PAPER, duration: 0.25 }, 2.15)
      .to(tags[2], { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(2)' }, 2.3)
      /* 04 a feasibility volume is drawn on the roof */
      .to(feas, { opacity: 1, duration: 0.1 }, 3.05)
      .to(feasR, { scaleY: 1, duration: 0.5, ease: 'power2.out' }, 3.1)
      .to({}, { duration: 0.3 }, 3.7);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
