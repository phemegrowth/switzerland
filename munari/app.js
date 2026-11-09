/* Officine Munari homepage: header, menu, anchors, hero entrance and photo parallax, reveals, count-up, product index with a photo
   that follows the cursor, magnetic buttons, form, and the GSAP signature scene: a spiral staircase built tread by tread
   while the side list walks through the workshop steps (one value drives the stair, the counter, the step and the photo). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm');

  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  var par = d.querySelector('[data-parallax] img');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    if (par && !reduce && y < window.innerHeight * 1.2) par.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
  }
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

  /* count-up: years in business and generations (quantities only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  });

  /* product index: on desktop a photo follows the cursor over the list */
  var index = d.querySelector('[data-index]'), flt = d.querySelector('.float'), fimg = d.querySelector('[data-float-img]');
  if (index && flt && fine) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    var loop = function () {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      flt.style.transform = 'translate(' + (cx + 28).toFixed(1) + 'px,' + (cy - 150).toFixed(1) + 'px)' + (flt.classList.contains('is-on') ? '' : ' scale(.85)');
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    index.querySelectorAll('.ix').forEach(function (li) {
      li.addEventListener('mouseenter', function () {
        var src = li.getAttribute('data-img');
        if (fimg.getAttribute('src') !== src) fimg.setAttribute('src', src);
        flt.classList.add('is-on');
      });
    });
    index.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (reduce) { cx = tx; cy = ty; }
      if (!raf) raf = requestAnimationFrame(loop);
    });
    index.addEventListener('mouseleave', function () { flt.classList.remove('is-on'); if (!raf) raf = requestAnimationFrame(loop); });
  }

  if (!reduce && fine) {
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
    var msgs = { name: 'Indicate un nome o la ditta.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
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

  /* reduced motion / no GSAP: the finished stair and the last step are shown statically */
  function finalSteps() {
    var lis = d.querySelectorAll('.steps li');
    lis.forEach(function (li, k) { li.classList.toggle('is-done', k < lis.length - 1); li.classList.toggle('is-on', k === lis.length - 1); });
  }
  finalSteps();

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    spiral(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: one value k (0 to 14 treads) builds the stair, turns it, and drives the counter, the step list and the photo */
  function spiral(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var stair = sec.querySelector('[data-stair]');
    var treads = sec.querySelectorAll('.tread'), posts = sec.querySelectorAll('.post'), rails = sec.querySelectorAll('.rail'), col = sec.querySelector('.col');
    var nEl = sec.querySelector('[data-n]'), steps = Array.prototype.slice.call(sec.querySelectorAll('.steps li'));
    var imgs = sec.querySelectorAll('[data-step-img]'), end = sec.querySelector('[data-end]');
    var N = treads.length, lastN = -1, lastS = -1;
    function render(k) {
      for (var i = 0; i < N; i++) {
        var o = Math.max(0, Math.min(1, k - i));
        treads[i].style.setProperty('--o', o.toFixed(3));
        var po = Math.max(0, Math.min(1, (k - i - 0.5) * 2));
        posts[i].style.setProperty('--o', po.toFixed(3));
        if (rails[i]) rails[i].style.setProperty('--r', Math.max(0, Math.min(1, (k - i - 1.2) * 1.6)).toFixed(3));
      }
      col.style.setProperty('--c', Math.max(0.04, Math.min(1, k / N + 0.12)).toFixed(3));
      stair.style.setProperty('--rot', (40 + k * 9).toFixed(2) + 'deg');
      var n = Math.max(1, Math.min(N, Math.ceil(k - 0.5)));
      if (k < 0.5) n = 0;
      if (n !== lastN) { lastN = n; nEl.textContent = (n < 10 ? '0' : '') + n; }
      var s = 0;
      steps.forEach(function (li, j) { if (n >= +li.getAttribute('data-from')) s = j; });
      if (s !== lastS) {
        lastS = s;
        steps.forEach(function (li, j) { li.classList.toggle('is-on', j === s); li.classList.toggle('is-done', j < s); });
        imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === s); });
      }
    }
    var state = { k: 0 };
    var txt = sec.querySelectorAll('.spiral__text > .eyebrow, .spiral__text > .h2, .spiral__count, .steps, .spiral__photo');
    gsap.set(txt, { autoAlpha: 0, y: 24 });
    gsap.set(sec.querySelector('.floor'), { autoAlpha: 0 });
    gsap.set(end, { autoAlpha: 0, y: 14 });
    render(0);
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=190%' : '+=280%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.to(txt, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, 0)
      .to(sec.querySelector('.floor'), { autoAlpha: 1, duration: 0.4 }, 0.2)
      .to(state, { k: N + 0.6, duration: 7, onUpdate: function () { render(state.k); } }, 0.6)
      .to(end, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 7.4)
      .to({}, { duration: 0.6 });
  }
})();
