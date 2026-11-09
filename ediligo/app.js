/* Ediligo SA: drawn grid and frame with their own site photo (hero), header, menu, anchors, reveals, count-up of
   the years since 2014, accordion, hotspots and drag on their panorama, magnetic buttons, form, and the GSAP
   signature scene: Villa Pico 32 phase by phase (survey lines, site opened with excavator and crane, new roof and
   frames, facades painted with their friezes, machines leave and the villa is handed over) while the site board
   fills in. The % counter, the bar, the phase list and the board read the same timeline. */
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
  reveal(d.querySelectorAll('[data-steps]'), function (el) { el.classList.add('is-in'); });

  /* count-up (years since 2014 only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* accordion: one open at a time, height animates through grid rows */
  var accs = d.querySelectorAll('.acc__it');
  accs.forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      accs.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* hotspots on the panorama: hover on desktop, tap toggles on phones */
  var spots = d.querySelectorAll('.spot');
  spots.forEach(function (s) {
    s.addEventListener('click', function () {
      var on = !s.classList.contains('is-on');
      spots.forEach(function (o) { o.classList.remove('is-on'); });
      if (on) s.classList.add('is-on');
    });
  });

  /* drag strip */
  var track = d.querySelector('[data-drag]');
  if (track && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0, moved = false;
    if (track.scrollWidth <= track.clientWidth + 4) track.style.cursor = 'default';
    track.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('is-drag'); });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = sl - dx;
    });
    track.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
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
    villaScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function villaScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var cnt = one('[data-cnt]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', 'Rilievo della villa', 'Cantiere aperto', 'Tetto e serramenti', 'Facciate e decori', 'Consegna'];
    var lines = q('[data-line] path'), roofOld = one('[data-roofold]'), roofNew = one('[data-roofnew]'), wins = q('[data-wins] path');
    var wipe = one('.v-wipe'), garden = one('[data-garden]'), fence = one('[data-fence]'), exc = one('[data-exc]'), crane = one('[data-crane]'), boom = one('[data-boom]'), hook = one('[data-hook]');
    var bl = q('[data-bl]');

    lines.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(roofOld, { opacity: 0 });
    gsap.set(roofNew, { opacity: 0, y: -40 });
    gsap.set(wins, { opacity: 0 });
    gsap.set(wipe, { attr: { y: 474, height: 0 } });
    gsap.set(garden, { opacity: 0, scale: .6, transformOrigin: '50% 100%' });
    gsap.set(fence, { opacity: 0 });
    gsap.set(exc, { opacity: 1, x: -320 });
    gsap.set(crane, { opacity: 1, x: 340 });
    gsap.set(boom, { rotation: 104, svgOrigin: '720 438' });
    gsap.set(hook, { opacity: 0 });
    gsap.set(bl, { opacity: 0, x: -10 });
    gsap.set(bar, { scaleX: 0 });

    var T = { p2: 2.2, p3: 4.4, p4: 6.4, p5: 8.4, end: 10.4 };
    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    /* 1 survey: the villa draws itself */
    tl.to(lines, { strokeDashoffset: 0, duration: 1.1, stagger: .08, ease: 'none' }, .05)
      .to(roofOld, { opacity: 1, duration: .5 }, .9)
      .to(bl[0], { opacity: 1, x: 0, duration: .4 }, .6);
    /* 2 site opened: fence, excavator, crane raises its boom */
    tl.to(fence, { opacity: 1, duration: .5 }, T.p2)
      .to(exc, { x: 0, duration: 1.0, ease: 'power3.out' }, T.p2 + .1)
      .to(crane, { x: 0, duration: 1.0, ease: 'power3.out' }, T.p2 + .3)
      .to(boom, { rotation: 0, duration: .9, ease: 'power2.inOut' }, T.p2 + 1.2)
      .to(hook, { opacity: 1, duration: .3 }, T.p2 + 2.0)
      .to(bl[1], { opacity: 1, x: 0, duration: .4 }, T.p2 + .4);
    /* 3 new roof and frames */
    tl.to(roofOld, { opacity: 0, duration: .4 }, T.p3)
      .to(roofNew, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, T.p3 + .2)
      .to(wins, { opacity: 1, duration: .3, stagger: .14 }, T.p3 + .7);
    /* 4 facades and friezes: the colour rises from the ground */
    tl.to(wipe, { attr: { y: 96, height: 378 }, duration: 1.7, ease: 'power1.inOut' }, T.p4);
    /* 5 handover: machines leave, fence comes down, garden, delivery line */
    tl.to(hook, { opacity: 0, duration: .2 }, T.p5)
      .to(boom, { rotation: 104, duration: .7, ease: 'power2.in' }, T.p5)
      .to(crane, { x: 360, duration: .9, ease: 'power2.in' }, T.p5 + .6)
      .to(exc, { x: -340, duration: .9, ease: 'power2.in' }, T.p5 + .3)
      .to(fence, { opacity: 0, duration: .4 }, T.p5 + 1.1)
      .to(garden, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.6)' }, T.p5 + 1.2)
      .to(bl[2], { opacity: 1, x: 0, duration: .4 }, T.p5 + 1.4)
      .to(bar, { scaleX: 1, duration: T.end, ease: 'none' }, 0)
      .to({}, { duration: .4 }, T.end);

    var phAt = [0, 0, T.p2 - .1, T.p3 - .1, T.p4 - .1, T.p5 - .1], lastP = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, c = Math.round(Math.min(1, t / T.end) * 100);
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      if (c !== lastC) { lastC = c; cnt.textContent = c; }
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.textContent = '0' + p + '  ' + names[p];
      }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=210%' : '+=280%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
