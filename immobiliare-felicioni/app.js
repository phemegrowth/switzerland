/* Immobiliare Felicioni homepage: arched hero entrance, header, menu, anchors, reveals, count-up, accordion with photo swap,
   listing carousel, owners' steps line, magnetic buttons, form validation, and the GSAP signature scene
   "La porta" (their coral office, zoom to the door, the door opens, fly through into a home). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', w.scrollY > 40); }
  w.addEventListener('scroll', onScroll, { passive: true });
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
      w.scrollTo({ top: t.getBoundingClientRect().top + w.scrollY - header.offsetHeight + 1, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals, with the above-the-fold guard */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in w) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up of the Google rating (4,8) */
  function fmt(n) { return (n / 10).toFixed(1).replace('.', ','); }
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1300;
    el.textContent = '0,0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });


  /* accordion: one open at a time, the photo follows */
  var acc = d.querySelector('[data-acc]');
  if (acc) {
    var its = acc.querySelectorAll('.acc__i'), pics = d.querySelectorAll('.svc-img');
    its.forEach(function (it, k) {
      var b = it.querySelector('button');
      b.addEventListener('click', function () {
        var open = !it.classList.contains('is-open');
        its.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
        if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
        var on = open ? k : 0;
        pics.forEach(function (p, j) { p.classList.toggle('is-on', j === on); });
      });
    });
  }

  /* listing carousel: buttons, dots, swipe */
  var car = d.querySelector('[data-car]');
  if (car) {
    var track = car.querySelector('.car__track'), n = track.children.length, idx = 0, dots = car.querySelectorAll('.car__dots i');
    function go(i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(' + (-100 * idx) + '%)';
      dots.forEach(function (dt, k) { dt.classList.toggle('is-on', k === idx); });
    }
    car.querySelector('.car__btn--prev').addEventListener('click', function () { go(idx - 1); });
    car.querySelector('.car__btn--next').addEventListener('click', function () { go(idx + 1); });
    var sx = null;
    car.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* owners' steps: the line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    var sl = steps.querySelector('.steps__line i');
    var ss = function () {
      var r = steps.getBoundingClientRect();
      var p = reduce ? 1 : Math.min(1, Math.max(0, (w.innerHeight * 0.85 - r.top) / (r.height + w.innerHeight * 0.25)));
      sl.style.setProperty('--p', p.toFixed(3));
    };
    w.addEventListener('scroll', ss, { passive: true });
    w.addEventListener('resize', ss);
    ss();
  }

  /* magnetic buttons */
  if (!reduce && w.matchMedia('(hover: hover)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.26).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('.form');
  if (form) {
    var checks = {
      'request-type': function (v) { return v !== ''; },
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 4; }
    };
    function check(el) {
      var fn = checks[el.name]; if (!fn) return true;
      var ok = fn(el.value);
      el.closest('.f').classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { var f = el.closest('.f'); if (f && f.classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      Object.keys(checks).forEach(function (nm) { var el = form.elements[nm]; if (el && !check(el) && !bad) bad = el; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  var yr = d.querySelector('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- signature scene: La porta ---------- */
  var stage = d.querySelector('.door__stage'), svg = d.querySelector('.door__svg');
  if (!stage || !svg || !w.gsap || reduce) return;
  var gsap = w.gsap, ST = w.ScrollTrigger;
  if (!ST) return;
  gsap.registerPlugin(ST);
  var leaf = svg.querySelector('.d-leaf'), hole = svg.querySelector('.d-hole'), addr = svg.querySelector('.d-addr');
  var interior = stage.querySelector('.door__interior'), card = stage.querySelector('.door__card'), cards = card.querySelectorAll('li'), bar = stage.querySelector('.door__bar');

  /* door centre in the svg element's own box, and the scale at which the doorway covers the stage */
  function geo() {
    gsap.set(svg, { scale: 1, transformOrigin: '50% 50%' });
    var s = svg.getBoundingClientRect(), h = hole.getBoundingClientRect();
    var ox = h.left + h.width / 2, oy = h.top + h.height / 2;
    var need = Math.max((ox - s.left) / (h.width / 2), (s.right - ox) / (h.width / 2), (oy - s.top) / (h.height / 2), (s.bottom - oy) / (h.height / 2));
    return { origin: (ox - s.left) + 'px ' + (oy - s.top) + 'px', max: need * 1.08 };
  }
  var G = geo();

  function start() {
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.set(svg, { transformOrigin: function () { return G.origin; } }, 0)
      .fromTo(svg, { scale: 1 }, { scale: 2.1, duration: 2.6, ease: 'power1.inOut' }, 0.5)
      .to(addr, { opacity: 0, duration: 0.6 }, 1.8)
      .fromTo(leaf, { scaleX: 1, skewY: 0 }, { scaleX: 0.12, skewY: -9, svgOrigin: '1010 775', duration: 1.5, ease: 'power2.inOut' }, 3.2)
      .fromTo(interior, { scale: 1.3 }, { scale: 1.04, duration: 4.8, ease: 'power1.out' }, 3.4)
      .to(svg, { scale: function () { return G.max; }, duration: 2.8, ease: 'power3.in' }, 4.8)
      .to(svg, { opacity: 0, duration: 0.25 }, 7.4)
      .fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 7.7)
      .fromTo(cards, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.25 }, 8.0)
      .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 10 }, 0)
      .to({}, { duration: 0.6 }, 9.4);
    ST.create({
      trigger: '.door', start: 'top top', end: w.innerWidth <= 760 ? '+=190%' : '+=260%',
      pin: '.door__pin', scrub: 0.6, animation: tl, anticipatePin: 1, invalidateOnRefresh: true,
      onRefreshInit: function () { tl.progress(0); G = geo(); }
    });
  }
  function boot() { G = geo(); start(); }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(boot); else boot();
  w.addEventListener('load', function () { ST.refresh(); });
})();
