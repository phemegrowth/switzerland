/* Cittadini Reto Lavori Edili: hero entrance (line reveal, reel slides in), reel drifts left on scroll, header, menu,
   anchors, reveals, service photo swap, process line, magnetic buttons, form, and the GSAP signature scene:
   a piode roof in section, built with scroll: stone walls, rafters, battens, then the slabs course by course
   from the eaves to the ridge, then the ridge cap. Counter and step list follow the same timeline. */
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

  /* hero reel drifts left as you scroll */
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

  /* services: hover (or the item nearest the middle of the screen) swaps the photo */
  var pics = d.querySelectorAll('[data-pic]'), items = d.querySelectorAll('.list__it');
  function showPic(k, item) {
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === k); });
    items.forEach(function (it) { it.classList.toggle('is-act', it === item); });
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { showPic(it.getAttribute('data-for'), it); });
  });
  if (!reduce) {
    var lt = false;
    window.addEventListener('scroll', function () {
      if (lt || window.innerWidth < 961) return; lt = true;
      requestAnimationFrame(function () {
        lt = false;
        var mid = window.innerHeight * 0.5, best = null, bd = 1e9;
        items.forEach(function (it) { var r = it.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - mid); if (c < bd) { bd = c; best = it; } });
        if (best && bd < window.innerHeight * 0.3) showPic(best.getAttribute('data-for'), best);
      });
    }, { passive: true });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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
    roofScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function roofScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); };
    var stones = q('.st'), wallLines = q('.r-wall-line');
    var beams = q('.r-beam'), ridge = q('.r-ridge'), bats = q('[data-r="bat"]'), colmo = q('[data-r="colmo"]');
    var labs = q('.r-lab'), quote = sec.querySelector('[data-quote]');
    var stepsEl = q('.steps2 li'), cnt = sec.querySelector('[data-course]'), bar = sec.querySelector('[data-bar]'), now = sec.querySelector('[data-now]');
        var NC = 0;
    q('.r-slab').forEach(function (s) { NC = Math.max(NC, +s.getAttribute('data-c') + 1); });
    var names = ['', 'Muri e appoggi', 'Travi', 'Listelli', 'Piode, corso dopo corso', 'Colmo'];

    /* hidden start */
    if (small) sec.querySelector('.roof').setAttribute('viewBox', '110 50 780 640');
    gsap.set(stones, { autoAlpha: 0 });
    gsap.set(wallLines, { autoAlpha: 0 });
    gsap.set(beams, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(ridge, { autoAlpha: 0, scale: .4, transformOrigin: '50% 50%' });
    gsap.set(bats, { autoAlpha: 0, y: -14 });
    gsap.set(q('.r-slab'), { autoAlpha: 0, y: -70 });
    gsap.set(colmo, { autoAlpha: 0, y: -50 });
    gsap.set(labs, { autoAlpha: 0 });
    gsap.set(quote, { autoAlpha: 0, y: 16 });
    gsap.set(bar, { scaleX: 0 });
    cnt.textContent = '00';

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var stepAt = [], courseAt = [];
    stepAt[1] = .5;
    tl.to(stones, { autoAlpha: 1, duration: .25, stagger: { each: 1.1 / stones.length, from: 'end' } }, .5)
      .to(wallLines, { autoAlpha: 1, duration: .3 }, 1.2);
    if (!small) tl.to(sec.querySelector('.r-lab--1'), { autoAlpha: 1, duration: .3 }, 1.3);
    stepAt[2] = 1.8;
    tl.to(beams, { scaleX: 1, duration: .8, ease: 'power1.inOut' }, 1.8)
      .to(ridge, { autoAlpha: 1, scale: 1, duration: .3 }, 2.4);
    if (!small) tl.to(sec.querySelector('.r-lab--2'), { autoAlpha: 1, duration: .3 }, 2.4);
    stepAt[3] = 2.9;
    tl.to(bats, { autoAlpha: 1, y: 0, duration: .25, stagger: { each: .7 / bats.length } }, 2.9);
    if (!small) tl.to(sec.querySelector('.r-lab--3'), { autoAlpha: 1, duration: .3 }, 3.5);
    stepAt[4] = 3.9;
    var per = 4.4 / NC;
    for (var i = 0; i < NC; i++) {
      var t0 = 3.9 + i * per;
      courseAt[i] = t0 + per * .6;
      tl.to(q('.r-slab[data-c="' + i + '"]'), { autoAlpha: 1, y: 0, duration: per * 1.1, ease: 'power3.out' }, t0);
    }
    if (!small) tl.to(sec.querySelector('.r-lab--4'), { autoAlpha: 1, duration: .3 }, 4.6);
    stepAt[5] = 8.5;
    tl.to(colmo, { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out' }, 8.5);
    if (!small) tl.to(sec.querySelector('.r-lab--5'), { autoAlpha: 1, duration: .3 }, 8.8);
    tl.to(quote, { autoAlpha: 1, y: 0, duration: .4 }, 9.1)
      .to(bar, { scaleX: 1, duration: 9.4, ease: 'none' }, 0)
      .to({}, { duration: .6 }, 9.5);

    var lastC = -1, lastS = -1;
    function sync() {
      var t = tl.time(), c = 0, s = 0;
      for (var k = 0; k < courseAt.length; k++) if (t >= courseAt[k]) c = k + 1;
      for (var j = 1; j < stepAt.length; j++) if (t >= stepAt[j]) s = j;
      if (c !== lastC) { lastC = c; cnt.textContent = (c < 10 ? '0' : '') + c; }
      if (s !== lastS) {
        lastS = s;
        stepsEl.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-step') === s); });
        if (now) now.textContent = s ? '0' + s + '  ' + names[s] : '';
      }
    }
    tl.eventCallback('onUpdate', sync);

    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: small ? '+=190%' : '+=280%',
      pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true
    });
    sync();
  }
})();
