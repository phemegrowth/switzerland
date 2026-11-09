/* Ugo Bassi homepage: curtain hero, header, menu, anchors, reveals, count-up, accordion with photo swap,
   magnetic buttons, form, and the GSAP signature scene (history strip pinned and driven sideways on a measuring rule). */
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

  /* count-up: years in business, staff, sites a year (all from their own site) */
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    el.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* accordion, one open at a time, photo follows */
  var acc = d.querySelector('[data-acc]'), accImg = d.querySelector('[data-acc-img]');
  if (acc) {
    var its = acc.querySelectorAll('.acc__i');
    its.forEach(function (it) {
      var b = it.querySelector('button');
      b.addEventListener('click', function () {
        var open = !it.classList.contains('is-open');
        its.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
        if (open) {
          it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true');
          if (accImg) {
            accImg.classList.add('is-fade');
            setTimeout(function () { accImg.src = it.getAttribute('data-img'); accImg.classList.remove('is-fade'); }, reduce ? 0 : 220);
          }
        }
      });
    });
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

  /* static fallback for the history strip: without GSAP it scrolls sideways by touch or trackpad */
  var view = d.querySelector('.hist__view');
  if (view) view.style.overflowX = 'auto';

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    histScene(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function histScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var track = sec.querySelector('[data-track]'), cards = track.querySelectorAll('.hc');
    var rule = sec.querySelector('[data-rule]'), hc = sec.querySelector('[data-hc]');
    view.style.overflowX = 'visible';
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    gsap.set(rule, { scaleX: 0 });
    gsap.set(cards, { clipPath: 'inset(0 0 0 100%)' });
    gsap.set(cards[0], { clipPath: 'inset(0 0 0 0%)' });
    var last = -1;
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(dist() * (small ? 1.2 : 1.5) + window.innerHeight * 0.6); },
      pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (s) {
        var i = Math.min(cards.length - 1, Math.round(s.progress * (cards.length - 1)));
        if (i !== last) { last = i; hc.textContent = '0' + (i + 1); }
      } } });
    tl.fromTo(sec.querySelectorAll('.hist__top > *'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' }, 0)
      .to(track, { x: function () { return -dist(); }, duration: 4 }, 0.2)
      .to(rule, { scaleX: 1, duration: 4.2 }, 0);
    cards.forEach(function (c, i) {
      if (i === 0) return;
      var D = dist() || 1;
      var at = 0.2 + 4 * Math.min(1, Math.max(0, (c.offsetLeft - window.innerWidth * 0.92) / D));
      tl.to(c, { clipPath: 'inset(0 0 0 0%)', duration: 0.55, ease: 'power2.out' }, Math.max(0.05, at));
      var im = c.querySelector('img');
      if (im) tl.fromTo(im, { scale: 1.18 }, { scale: 1, duration: 1.2, ease: 'power1.out' }, Math.max(0.05, at));
    });
    tl.to({}, { duration: 0.3 });
  }
})();
