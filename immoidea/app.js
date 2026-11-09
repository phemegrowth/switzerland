/* Immoidea homepage: number-led hero with the photo in the logo's round dot, header, menu, anchors, reveals, count-up
   (years in the register), listing filter chips, "ask about this" links that prefill the form, magnetic buttons, form,
   and the GSAP signature scene (text-mask fly-through: the word TICINO opens onto the lake). */
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

  /* count-up: years in the commercial register only (1995 to 2026) */
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

  /* listing filter chips */
  var chips = d.querySelectorAll('[data-chips] button'), cards = d.querySelectorAll('[data-cards] .card');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      cards.forEach(function (card) {
        var show = f === 'tutti' || card.getAttribute('data-k') === f;
        card.classList.remove('is-in-f');
        card.classList.toggle('is-out', !show);
        if (show && !reduce) { void card.offsetWidth; card.classList.add('is-in-f'); }
        if (show) card.classList.add('is-in');
      });
    });
  });

  /* "ask about this" links prefill the form */
  var msg = d.getElementById('f-msg');
  d.querySelectorAll('[data-ask]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (msg && !msg.value.trim()) msg.value = 'Vorrei informazioni su: ' + a.getAttribute('data-ask') + '.';
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete in due righe cosa cercate.' };
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

  /* ---------- signature scene: text-mask fly-through ---------- */
  var sec = d.querySelector('[data-scene]');
  if (!sec) return;
  if (reduce || !window.gsap || !window.ScrollTrigger) { sec.classList.add('is-static'); return; }
  var wrap = sec.querySelector('[data-maskwrap]'), svg = sec.querySelector('[data-mask]'), word = sec.querySelector('[data-word]');
  var ghost = word.cloneNode(true);
  ghost.removeAttribute('data-word'); ghost.setAttribute('opacity', '0'); ghost.setAttribute('aria-hidden', 'true');
  svg.appendChild(ghost);
  function layout() {
    var small = window.innerWidth < 700;
    svg.setAttribute('viewBox', small ? '0 0 740 1600' : '0 0 1600 900');
    [word, ghost].forEach(function (t) {
      t.setAttribute('x', small ? 370 : 800);
      t.setAttribute('y', small ? 880 : 560);
      t.style.fontSize = small ? '190px' : '360px';
      t.style.letterSpacing = small ? '-6px' : '-10px';
    });
    /* zoom origin: the middle of the stem of the first I */
    gsap.set(wrap, { scale: 1 });
    var ext = ghost.getExtentOfChar(1), m = svg.getScreenCTM(), r = wrap.getBoundingClientRect();
    var px = (ext.x + ext.width / 2) * m.a + m.e - r.left, py = (ext.y + ext.height * 0.55) * m.d + m.f - r.top;
    wrap.style.transformOrigin = px.toFixed(1) + 'px ' + py.toFixed(1) + 'px';
  }
  function start() {
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    layout();
    var a = sec.querySelector('[data-fly-a]'), b = sec.querySelector('[data-fly-b]'), photo = sec.querySelector('.fly__photo img');
    gsap.set(b, { autoAlpha: 0, y: 30 });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=200%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: layout } });
    tl.fromTo(a, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0)
      .fromTo(photo, { scale: 1.18 }, { scale: 1, duration: 1 }, 0)
      .fromTo(wrap, { scale: 1 }, { scale: small ? 44 : 40, duration: 0.56, ease: 'power2.in' }, 0.14)
      .to(a, { autoAlpha: 0, duration: 0.08 }, 0.3)
      .to(wrap, { autoAlpha: 0, duration: 0.1 }, 0.56)
      .to(b, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.78)
      .fromTo(b.querySelectorAll('.fly__places li'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.08 }, 0.84)
      .to({}, { duration: 0.06 }, 0.94);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
