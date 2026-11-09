/* Senn pittura: hero entrance (line reveal, fan deck slides in), deck drifts left on scroll, header, menu, anchors,
   reveals, count-up, accordion, place parallax, magnetic buttons, form, and the GSAP signature scene: one room in
   perspective, painted the way a painter works: protection, repairs and skim coat, primer, then colour surface by
   surface (ceiling first) with the roller following the wet edge, then clean-up. Counter, swatch and phase list
   follow the same timeline. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
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

  /* hero deck drifts left as you scroll */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var rt = false;
    window.addEventListener('scroll', function () {
      if (rt) return; rt = true;
      requestAnimationFrame(function () {
        rt = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) reel.style.transform = 'translate3d(' + (-y * 0.4).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* count-up (sourced quantity only: years since 1998) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) return;
    el.textContent = '0';
    reveal([el], function () {
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* place band: slow parallax */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + ((p - 0.5) * -60).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(movePar); } }, { passive: true });
    movePar();
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
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

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    html.classList.add('st-on');
    roomScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function roomScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var one = function (s) { return sec.querySelector(s); };
    var order = ['C', 'B', 'L', 'R'];
    var cols = { C: '#f7f7f4', B: '#5b7d93', L: '#a9bca6', R: '#d9dbd6' };
    var names = { C: 'Soffitto · Bianco', B: 'Fondo · Blu lago', L: 'Sinistra · Salvia', R: 'Destra · Perla' };
    var rollerPath = { C: [40, 960, 66], B: [300, 700, 300], L: [20, 270, 330], R: [730, 980, 330] };
    var phNames = ['', 'Protezione', 'Riparazioni e rasatura', 'Fondo', 'Colore, superficie per superficie', 'Pulizia'];
    var wipes = {};
    q('.wipe').forEach(function (r) { wipes[r.getAttribute('data-w')] = r; });
    var full = {};
    Object.keys(wipes).forEach(function (k) { full[k] = +wipes[k].getAttribute('width'); gsap.set(wipes[k], { attr: { width: 0 } }); });
    var tape = one('[data-tape]'), cloth = one('[data-cloth]'), roller = one('[data-roller]');
    var tapes = q('[data-tape] path');
    tapes.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var phs = q('.phases li'), cnt = one('[data-surf]'), swc = one('[data-swatch-c]'), swn = one('[data-swatch-n]'), bar = one('[data-bar]'), now = one('[data-now]');
    gsap.set(tape, { opacity: 1 });
    gsap.set(cloth, { opacity: 0, y: 30 });
    gsap.set(roller, { opacity: 0, x: rollerPath.C[0], y: rollerPath.C[2] });
    gsap.set(q('.clab'), { autoAlpha: 0, y: 8 });
    gsap.set(q('.dmg'), { opacity: 1 });
    gsap.set(bar, { scaleX: 0 });
    if (small) gsap.set(q('.clab'), { display: 'none' });

    var tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    var phAt = [0, 0, 1.3, 2.9, 4.3, 9.0], surfAt = [];
    /* 1 protection */
    tl.to(cloth, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, .1)
      .to(tapes, { strokeDashoffset: 0, duration: .7, stagger: .12 }, .4);
    /* 2 repairs and skim coat */
    order.forEach(function (k, j) {
      tl.to(one('[data-dmg="' + k + '"]'), { opacity: 0, duration: .5 }, 1.3 + j * .12)
        .to(wipes['ra' + k], { attr: { width: full['ra' + k] }, duration: .8 }, 1.5 + j * .12);
    });
    /* 3 primer */
    order.forEach(function (k, j) {
      tl.to(wipes['fo' + k], { attr: { width: full['fo' + k] }, duration: .8 }, 2.9 + j * .12);
    });
    /* 4 colour, surface by surface, the roller rides the wet edge */
    order.forEach(function (k, j) {
      var t0 = 4.3 + j * 1.15, rp = rollerPath[k];
      surfAt[j] = t0;
      tl.set(roller, { x: rp[0], y: rp[2] }, t0)
        .to(roller, { opacity: 1, duration: .15 }, t0)
        .to(wipes['co' + k], { attr: { width: full['co' + k] }, duration: 1, ease: 'none' }, t0)
        .to(roller, { x: rp[1], duration: 1, ease: 'none' }, t0)
        .to(roller, { opacity: 0, duration: .12 }, t0 + .98)
        .to(one('[data-clab="' + k + '"]'), { autoAlpha: 1, y: 0, duration: .25 }, t0 + .9);
    });
    /* 5 clean-up */
    tl.to(tapes, { opacity: 0, duration: .4, stagger: .06 }, 9.0)
      .to(cloth, { opacity: 0, y: 20, duration: .5 }, 9.2)
      .to(bar, { scaleX: 1, duration: 9.8, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.8);

    var lastP = -1, lastS = -1;
    function sync() {
      var t = tl.time(), p = 1, s = 0;
      for (var i = 1; i < phAt.length; i++) if (t >= phAt[i]) p = i;
      for (var j = 0; j < surfAt.length; j++) if (t >= surfAt[j]) s = j + 1;
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.textContent = '0' + p + '  ' + phNames[p];
      }
      if (s !== lastS) {
        lastS = s;
        cnt.textContent = s;
        var k = order[Math.max(0, s - 1)];
        swc.style.backgroundColor = s ? cols[k] : '#c4c6c3';
        swn.textContent = s ? names[k] : 'Parete grezza';
      }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=200%' : '+=300%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
