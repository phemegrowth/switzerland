/* Indro Moretti homepage: Ken Burns hero (CSS), header, menu, anchors, reveals, count-up (number of works), register filter,
   magnetic buttons, form validation, and the GSAP signature scene: the Isone house carved out of a concrete block. */
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

  /* count-up: number of works in the register */
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1200;
    el.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* register: first 14 rows, then a button opens the rest */
  var rgw = d.querySelector('.rg__wrap'), more = d.querySelector('[data-more]');
  function markLate() {
    var k = 0;
    d.querySelectorAll('[data-reg] li').forEach(function (r) { r.classList.remove('is-late'); if (!r.classList.contains('is-off')) { if (k >= 14) r.classList.add('is-late'); k++; } });
    if (more) more.hidden = k <= 14 || !rgw.classList.contains('is-short');
  }
  if (rgw && more) {
    rgw.classList.add('is-short'); markLate();
    more.addEventListener('click', function () { rgw.classList.remove('is-short'); more.hidden = true; more.setAttribute('aria-expanded', 'true'); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  }

  /* register filter */
  var chips = d.querySelectorAll('.chips button'), rows = d.querySelectorAll('[data-reg] li');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (o) { var on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var k = 0;
      rows.forEach(function (r) {
        var show = f === 'all' || (r.getAttribute('data-k') || '').indexOf(f) > -1;
        r.classList.toggle('is-off', !show);
        if (show && !reduce) { r.style.opacity = 0; r.style.transform = 'translateY(8px)'; (function (row, i) { setTimeout(function () { row.style.opacity = ''; row.style.transform = ''; }, 20 + Math.min(i, 14) * 25); })(r, k++); }
      });
      markLate();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
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
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il progetto.' };
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

  /* signature scene: carving the monolith */
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
    if (small) sec.querySelector('.axo').setAttribute('viewBox', '-14 120 794 430');
    var front = sec.querySelector('.f-front'), side = sec.querySelector('.f-side'), top = sec.querySelector('.f-top');
    var edges = sec.querySelectorAll('[data-edge]');
    var earth = sec.querySelectorAll('[data-earth]');
    var holes = sec.querySelectorAll('[data-hole]');
    var forms = sec.querySelectorAll('[data-form] line'), ties = sec.querySelectorAll('[data-ties] circle');
    var d1 = sec.querySelector('[data-dim="1"]'), d2 = sec.querySelector('[data-dim="2"]'), d3 = sec.querySelector('[data-dim="3"]');
    var label = sec.querySelector('[data-label]');
    var vol = sec.querySelector('[data-vol]');
    var txt = sec.querySelectorAll('.carve__text > *');
    cur = -1; setStep(0);
    gsap.set(vol, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(edges, { strokeDasharray: '1 1', strokeDashoffset: 1 });
    gsap.set(earth, { y: 140, opacity: 0 });
    gsap.set(holes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(forms, { strokeDasharray: '1 1', strokeDashoffset: 1 });
    gsap.set(ties, { opacity: 0 });
    gsap.set([d1, d2, d3, label], { opacity: 0 });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=180%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { setStep(Math.min(3, Math.floor(s.progress * 4 * 0.9999))); } } });
    tl.fromTo(txt, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25, ease: 'power2.out' }, 0)
      /* 01 the volume rises, 15 x 9 x 6 */
      .to(vol, { scaleY: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
      .to(edges, { strokeDashoffset: 0, duration: 0.5 }, 0.25)
      .to(d1, { opacity: 1, duration: 0.25 }, 0.55)
      /* 02 the slope comes up, 3.00 uphill */
      .to(earth, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.1)
      .to(d2, { opacity: 1, duration: 0.25 }, 1.5)
      /* 03 openings carved, 1.00 deep */
      .to(holes, { scale: 1, duration: 0.35, stagger: 0.15, ease: 'power3.out' }, 2.05)
      .to(d3, { opacity: 1, duration: 0.2 }, 2.6)
      /* 04 formwork marks and tie holes, then the name */
      .to(forms, { strokeDashoffset: 0, duration: 0.45, stagger: 0.015 }, 3.0)
      .to(ties, { opacity: 1, duration: 0.2, stagger: 0.01 }, 3.35)
      .to(label, { opacity: 1, duration: 0.2 }, 3.55)
      .to({}, { duration: 0.2 }, 3.8);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
