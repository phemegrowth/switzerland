/* Capifid Immobiliare homepage script: hero wheel and count-up, header, menu, anchors, reveals, accordion with photo swap, reasons line, magnetic buttons, form, and the GSAP signature scene (a ring of real listings turned by scroll). */
(function () {
  'use strict';
  var d = document;
  var html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');

  /* Wheel ticks: 60 marks, every fifth longer, a crimson arc for the "rotella" */
  var g = d.querySelector('[data-ticks]');
  if (g) {
    var ns = 'http://www.w3.org/2000/svg', out = '';
    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, long = i % 5 === 0;
      var r1 = 99, r2 = long ? 92 : 95.5;
      out += '<line x1="' + (100 + r1 * Math.sin(a)).toFixed(2) + '" y1="' + (100 - r1 * Math.cos(a)).toFixed(2) + '" x2="' + (100 + r2 * Math.sin(a)).toFixed(2) + '" y2="' + (100 - r2 * Math.cos(a)).toFixed(2) + '" stroke="currentColor" stroke-width="' + (long ? 1.4 : .7) + '" opacity="' + (long ? 1 : .55) + '"/>';
    }
    out += '<path d="M100 3.5 A96.5 96.5 0 0 1 183.6 51.8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>';
    g.innerHTML = out;
    void ns;
  }

  /* Hero entrance and count-up start on the first frames */
  var heroN = d.querySelector('[data-hero-count]');
  function countHero() {
    if (!heroN) return;
    var to = parseInt(heroN.getAttribute('data-to'), 10), t0 = null, dur = 1200;
    heroN.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      heroN.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); setTimeout(countHero, 300); }); });

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

  /* Accordion with height animation; the open item picks the photo */
  var pics = d.querySelectorAll('.svc__pic img');
  var accBtns = d.querySelectorAll('[data-acc] .acc__btn');
  function openPanel(btn, open) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (reduce) { panel.style.height = open ? 'auto' : '0px'; return; }
    if (open) {
      panel.style.height = panel.scrollHeight + 'px';
      var done = function () { if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto'; panel.removeEventListener('transitionend', done); };
      panel.addEventListener('transitionend', done);
    } else {
      panel.style.height = panel.scrollHeight + 'px';
      void panel.offsetHeight;
      panel.style.height = '0px';
    }
  }
  accBtns.forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    if (btn.getAttribute('aria-expanded') !== 'true') panel.style.height = '0px';
    btn.addEventListener('click', function () {
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      accBtns.forEach(function (o) { if (o !== btn && o.getAttribute('aria-expanded') === 'true') openPanel(o, false); });
      openPanel(btn, willOpen);
      if (willOpen) {
        var n = btn.getAttribute('data-pic-show');
        pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === n); });
      }
    });
  });

  /* Reasons: line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var items = list.querySelectorAll('.reasons__item');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      list.style.setProperty('--p', p.toFixed(3));
      items.forEach(function (it, i) { it.classList.toggle('is-lit', p * items.length >= i + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scriveteci due righe.' };
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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ringScene(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: six real listings on a ring, the scroll turns it one card at a time */
  function ringScene(small) {
    var sec = d.querySelector('[data-scene]');
    var ring = sec && sec.querySelector('[data-ring]');
    if (!ring) return;
    var cards = ring.querySelectorAll('.card');
    var n = cards.length, step = 360 / n;
    var info = {
      n: sec.querySelector('[data-r-n]'), place: sec.querySelector('[data-r-place]'), title: sec.querySelector('[data-r-title]'),
      meta: sec.querySelector('[data-r-meta]'), price: sec.querySelector('[data-r-price]'), bar: sec.querySelector('[data-r-bar]')
    };
    cards.forEach(function (c) { var im = c.querySelector('img'); if (im) im.loading = 'eager'; });
    ring.classList.add('is-3d');
    sec.classList.add('is-armed');
    var cw, R;
    function layout() {
      cw = small ? Math.min(310, window.innerWidth * 0.76) : Math.min(460, window.innerWidth * 0.32);
      R = cw * (small ? 0.98 : 1.02);
      ring.style.setProperty('--cw', cw + 'px');
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)'; });
    }
    layout();
    var st = { a: 0 }, cur = -1;
    function paint() {
      ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-st.a) + 'deg)';
      cards.forEach(function (c, i) {
        var rel = ((i * step - st.a) % 360 + 540) % 360 - 180; /* -180..180, 0 = front */
        var k = Math.cos(rel * Math.PI / 180);
        c.style.opacity = (0.18 + 0.82 * Math.max(0, k)).toFixed(3);
        c.style.filter = 'saturate(' + (0.4 + 0.6 * Math.max(0, k)).toFixed(2) + ')';
      });
      var f = Math.round(st.a / step) % n;
      if (f !== cur) {
        cur = f;
        cards.forEach(function (c, i) { c.classList.toggle('is-front', i === f); });
        var c = cards[f];
        info.n.textContent = '0' + (f + 1);
        info.place.textContent = c.getAttribute('data-place');
        info.title.textContent = c.getAttribute('data-title');
        info.meta.textContent = c.getAttribute('data-meta');
        info.price.textContent = c.getAttribute('data-price');
      }
      info.bar.style.transform = 'scaleX(' + ((st.a / (step * (n - 1))) * (5 / 6) + 1 / 6).toFixed(3) + ')';
    }
    paint();
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: sec, start: 'top top', end: small ? '+=200%' : '+=300%', pin: true, scrub: 0.7, anticipatePin: 1,
      snap: { snapTo: function (v) { var lead = 0.85 / 6.85; if (v < lead) return v < lead / 2 ? 0 : lead; var s = (1 - lead) / (n - 1); return lead + Math.round((v - lead) / s) * s; }, duration: { min: 0.15, max: 0.5 }, delay: 0.05, ease: 'power1.inOut', inertia: false }
    } });
    tl.fromTo(sec.querySelectorAll('.ringsec__head > *'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5 }, 0)
      .fromTo(sec.querySelector('.ring__stage'), { autoAlpha: 0, y: 60, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, 0.1)
      .fromTo(sec.querySelectorAll('.ring__info, .ring__note'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.4)
      .to(st, { a: step * (n - 1), duration: 6, ease: 'none', onUpdate: paint }, 0.85);
    window.addEventListener('resize', function () { layout(); paint(); });
  }
})();
