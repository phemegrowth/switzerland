/* Beloedil homepage: horizontal reel hero, header, menu, anchors, reveals, accordion, count-up (years in business),
   magnetic buttons, form, and the GSAP signature scene (an axonometric house assembles from the excavation to the garden). */
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

  /* count-up: years in business only (1981 to 2026) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
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

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__i').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (x) { x.classList.remove('is-open'); x.querySelector('button').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* hero reel drifts left with scroll (transform only, no scroll-jacking) */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var ticking = false;
    function drift() {
      var y = Math.min(window.scrollY, window.innerHeight * 1.2);
      var max = Math.max(0, reel.scrollWidth - reel.parentNode.clientWidth);
      reel.style.transform = 'translateX(' + (-Math.min(max, y * 0.45)).toFixed(1) + 'px)';
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
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

  /* ---------- signature scene: axonometric assembly ---------- */
  var sec = d.querySelector('[data-scene]');
  if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
  var names = ['Scavo e tracciamento', 'Platea di fondazione', 'Muri portanti', 'Solaio e terrazza', 'Primo piano', 'Tetto piano', 'Esterni e giardino'];
  var parts = sec.querySelectorAll('[data-part]'), tags = sec.querySelectorAll('[data-tag]');
  var stepN = sec.querySelector('[data-step-n]'), stepT = sec.querySelector('[data-step-t]'), bar = sec.querySelector('[data-bar]');
  var cur = -1;
  function setStep(i) {
    if (i === cur) return; cur = i;
    stepN.textContent = '0' + (i + 1);
    stepT.textContent = names[i];
  }

  function start() {
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    var n = parts.length;
    gsap.set(parts, { autoAlpha: 0, y: -90 });
    gsap.set(tags, { autoAlpha: 0 });
    var garden = parts[n - 1].querySelectorAll('.tree');
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=200%' : '+=280%', pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { setStep(Math.min(n - 1, Math.floor(s.progress * n * 0.999))); bar.style.transform = 'scaleX(' + s.progress.toFixed(3) + ')'; } } });
    tl.fromTo(sec.querySelectorAll('.axo__text > *'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25, ease: 'power2.out' }, 0);
    parts.forEach(function (p, i) {
      var at = i * 1;
      tl.to(p, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, at + 0.1);
      tl.to(tags[i], { autoAlpha: 1, duration: 0.15 }, at + 0.35);
      if (i < n - 1) tl.to(tags[i], { autoAlpha: 0, duration: 0.15 }, at + 1.0);
    });
    if (garden.length) tl.fromTo(garden, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, stagger: 0.12, duration: 0.4, ease: 'back.out(1.6)' }, (n - 1) + 0.35);
    tl.to({}, { duration: 0.4 }, n);
    setStep(0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
