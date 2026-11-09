/* Ticino Controsoffitti: boards that fan out and click into a grid (hero), header, menu, anchors, reveals,
   count-up of the years in the register, sticky photo for the services, drag strip, parallax, magnetic buttons,
   form, and the GSAP signature scene: a suspended ceiling assembled and seen from below. Hangers drop from the slab,
   the main runners and cross tees run out, the mineral wool is laid, the 20 panels go in one by one, then the
   4 light panels go in and switch on. The counter, the bar and the phase list read the same timeline. */
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

  /* count-up (years in the register only) */
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

  /* services: the item nearest the middle of the screen is active and swaps the sticky photo; hover too */
  var items = d.querySelectorAll('.trade__list li'), pics = d.querySelectorAll('[data-swap]');
  function setItem(n) {
    items.forEach(function (li) { li.classList.toggle('is-act', li.getAttribute('data-item') === n); });
    pics.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap') === n); });
  }
  if (items.length) {
    setItem('1');
    items.forEach(function (li) { li.addEventListener('mouseenter', function () { setItem(li.getAttribute('data-item')); }); });
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) setItem(e.target.getAttribute('data-item')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(function (li) { io2.observe(li); });
    }
  }

  /* drag strip */
  var track = d.querySelector('[data-drag]');
  if (track && window.matchMedia('(pointer: fine)').matches) {
    var down = false, sx = 0, sl = 0, moved = false;
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

  /* who photo: slow parallax inside its mask */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + ((p - 0.5) * -50).toFixed(1) + 'px,0)';
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

  /* fit the ceiling to its stage: the 3D geometry is measured once in its final pose (the CSS state), then the
     stage is scaled and centred on it, at any width */
  var fit = d.querySelector('[data-fit]'), bounds = null;
  function measure() {
    if (!fit) return;
    fit.style.setProperty('--k', 1); fit.style.setProperty('--tx', '0px'); fit.style.setProperty('--ty', '0px');
    var f = fit.getBoundingClientRect(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    fit.querySelectorAll('.tl, .rn').forEach(function (el) {
      var r = el.getBoundingClientRect();
      x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
    });
    bounds = { x: x0 - f.left, y: y0 - f.top, w: x1 - x0, h: y1 - y0 };
  }
  function fitStage() {
    if (!fit || !bounds) return;
    var box = fit.parentNode.getBoundingClientRect();
    var k = Math.min(1.15, box.width * .96 / bounds.w, box.height * .86 / bounds.h);
    var tx = box.width / 2 - (bounds.x + bounds.w / 2) * k, ty = box.height * .5 - (bounds.y + bounds.h / 2) * k;
    fit.style.setProperty('--k', k.toFixed(3));
    fit.style.setProperty('--tx', tx.toFixed(1) + 'px');
    fit.style.setProperty('--ty', ty.toFixed(1) + 'px');
  }
  measure();
  fitStage();
  window.addEventListener('resize', fitStage);

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ceilingScene(window.innerWidth < 961);
    var rf = function () { fitStage(); ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function ceilingScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return Array.prototype.slice.call(sec.querySelectorAll(s)); };
    var cnt = one('[data-cnt]'), lbl = one('[data-cnt-lbl]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', 'Pendini fissati alla soletta', 'Profili portanti e traversi', 'Strato acustico in lana minerale', 'Pannelli, uno alla volta', 'Luci accese'];
    var world = one('[data-world]');
    var hangers = q('.hg i'), clips = q('.hg b'), wool = q('.wl');
    var rx = q('.rn.x'), ry = q('.rn.y');
    var tiles = q('.tl:not(.lt)'), lights = q('.tl.lt'), N = tiles.length + lights.length;

    /* start: only the bare slab */
    gsap.set(world, { rotationX: -64, rotationZ: -22, z: -40 });
    gsap.set(hangers, { scaleY: 0 });
    gsap.set(clips, { opacity: 0 });
    gsap.set(rx, { scaleX: 0 });
    gsap.set(ry, { scaleY: 0 });
    gsap.set(wool, { z: -150, opacity: 0 });
    gsap.set(tiles.concat(lights), { z: 90, rotationX: 38, opacity: 0 });
    gsap.set(lights, { boxShadow: 'inset 0 0 0 1px #cdd6d6, 0 0 0 0 rgba(255,249,224,0)', backgroundColor: '#dfe5e5' });
    gsap.set(bar, { scaleX: 0 });

    /* tiles go in from the near corner outwards */
    tiles.sort(function (a, b) {
      var ax = parseFloat(a.style.left), ay = parseFloat(a.style.top), bx = parseFloat(b.style.left), by = parseFloat(b.style.top);
      return (ax + ay * 1.4) - (bx + by * 1.4);
    });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var T = { p2: 1.9, p3: 3.9, p4: 5.3, p5: 9.0, end: 10.6 };
    /* camera eases round the whole time */
    tl.to(world, { rotationX: -54, rotationZ: -10, z: 30, duration: T.end, ease: 'none' }, 0);
    /* 1 hangers drop from the slab */
    tl.to(hangers, { scaleY: 1, duration: .7, stagger: { each: .06, from: 'start' } }, .1)
      .to(clips, { opacity: 1, duration: .3, stagger: .05 }, .4);
    /* 2 main runners, then cross tees */
    tl.to(rx, { scaleX: 1, duration: .8, stagger: .14, ease: 'power2.inOut' }, T.p2)
      .to(ry, { scaleY: 1, duration: .7, stagger: .1, ease: 'power2.inOut' }, T.p2 + .8);
    /* 3 mineral wool laid on the grid */
    tl.to(wool, { z: -6, opacity: 1, duration: .7, stagger: .14, ease: 'power3.out' }, T.p3);
    /* 4 panels clicked in one by one */
    var inAt = [];
    var span = (T.p5 - .3) - T.p4;
    tiles.forEach(function (t, i) {
      var at = T.p4 + i * (span / tiles.length);
      inAt.push(at + .25);
      tl.to(t, { z: 0, rotationX: 0, opacity: 1, duration: .45, ease: 'back.out(1.4)' }, at);
    });
    /* 5 light panels go in, then switch on */
    lights.forEach(function (t, i) {
      var at = T.p5 + i * .12;
      inAt.push(at + .25);
      tl.to(t, { z: 0, rotationX: 0, opacity: 1, duration: .45, ease: 'back.out(1.4)' }, at);
    });
    tl.to(lights, { backgroundColor: '#f9fbf6', boxShadow: 'inset 0 0 0 1px #cdd6d6, 0 0 38px 10px rgba(255,249,224,.55)', duration: .5, stagger: .08 }, T.p5 + .8)
      .to(bar, { scaleX: 1, duration: T.end, ease: 'none' }, 0)
      .to({}, { duration: .4 }, T.end);

    var phAt = [0, 0, T.p2 - .1, T.p3 - .1, T.p4 - .1, T.p5 - .05], lastP = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, c = 0;
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      for (var i = 0; i < inAt.length; i++) if (t >= inAt[i]) c++;
      if (c !== lastC) { lastC = c; cnt.textContent = c; lbl.textContent = 'pannelli posati su ' + N; }
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.textContent = '0' + p + '  ' + names[p];
      }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=200%' : '+=280%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
