/* Barra homepage: number-led hero (count-up of years in business), header, menu, anchors, reveals, accordion,
   magnetic buttons, form validation, and the GSAP signature scene: a folding ruler that unfolds one Barra at a time. */
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

  /* count-up: years in business only (1918 to 2026) */
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

  /* accordion: one open at a time, height animated in CSS */
  var items = d.querySelectorAll('[data-acc] .acc__i');
  items.forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

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
    var msgs = { name: 'Indicate un nome o un ente.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe l’opera.' };
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

  /* signature scene: folding ruler */
  var sec = d.querySelector('[data-scene]');
  var segs = sec ? sec.querySelectorAll('.seg--n') : [], gens = sec ? sec.querySelectorAll('[data-gens] li') : [];
  var yN = sec && sec.querySelector('[data-year-n]'), yL = sec && sec.querySelector('[data-year-l]');
  var labels = sec ? Array.prototype.slice.call(sec.querySelectorAll('.seg__y')).reverse() : [];
  var STOPS = [1918, 1948, 1978, 2026], NAMES = ['Federico Barra', 'Pierino Barra', 'Michele Barra', 'oggi, Kevin Barra'];
  var cur = -1;
  function setYear(y) {
    y = Math.round(y);
    yN.textContent = y;
    var g = y >= 2026 ? 3 : y >= 1978 ? 2 : y >= 1948 ? 1 : 0;
    if (g !== cur) {
      cur = g;
      gens.forEach(function (li, j) { li.classList.toggle('is-act', j === g); });
      yL.textContent = NAMES[g];
    }
  }
  if (sec) setYear(2026);

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !sec) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 800;
    var st = { y: 1918 };
    cur = -1; setYear(1918);
    gsap.set(segs, { rotation: 180 });
    gsap.set(labels.slice(1), { opacity: 0 });
    var head = sec.querySelectorAll('.ruler-sec__head > *, .ruler-sec__year');
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1 } });
    tl.fromTo(head, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, 0)
      .fromTo(sec.querySelector('.ruler-wrap'), { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power2.out' }, 0.1)
      .fromTo(sec.querySelector('.gens'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.2);
    /* each joint opens over one unit; the year runs to the next generation in the same unit */
    segs.forEach(function (s, i) {
      var t0 = 0.5 + i;
      tl.to(s, { rotation: 0, duration: 0.85, ease: 'power2.inOut' }, t0)
        .to(st, { y: STOPS[i + 1], duration: 0.85, ease: 'power2.inOut', onUpdate: function () { setYear(st.y); } }, t0)
        .to(labels[i + 1], { opacity: 1, duration: 0.2 }, t0 + 0.65);
    });
    tl.to({}, { duration: 0.3 }, 3.35);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
