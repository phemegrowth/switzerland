/* Costa Impresa di pittura: hero entrance, header, menu, anchors, reveals, services list that drives the photo,
   drag strip, process line, magnetic buttons, form, colour swatches, and the GSAP signature scene:
   a Ticino house facade is taped, prepared, primed and painted lane by lane by a roller driven by the scroll. */
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

  /* services: active item swaps the photo (hover, focus, click, and the item nearest the middle on scroll) */
  var list = d.querySelector('[data-svc]');
  if (list) {
    var items = list.querySelectorAll('.sv'), pics = d.querySelectorAll('.svc__pics .pic'), cur = 0;
    var setSvc = function (i) {
      if (i === cur) return; cur = i;
      items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
      pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    };
    items.forEach(function (it, i) {
      it.addEventListener('mouseenter', function () { setSvc(i); });
      it.querySelector('button').addEventListener('focus', function () { setSvc(i); });
      it.querySelector('button').addEventListener('click', function () { setSvc(i); });
    });
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking || window.innerWidth < 860) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var mid = window.innerHeight * 0.5, best = -1, bd = 1e9;
        items.forEach(function (it, k) { var r = it.getBoundingClientRect(); var c = r.top + r.height / 2; var dd = Math.abs(c - mid); if (r.bottom > 0 && r.top < window.innerHeight && dd < bd) { bd = dd; best = k; } });
        if (best > -1 && bd < window.innerHeight * 0.3) setSvc(best);
      });
    }, { passive: true });
  }

  /* drag strip with progress bar */
  d.querySelectorAll('[data-drag]').forEach(function (s) {
    var bar = d.querySelector('[data-strip-bar]'), down = false, sx = 0, sl = 0, moved = false;
    function upd() {
      var max = s.scrollWidth - s.clientWidth;
      var vis = s.clientWidth / s.scrollWidth;
      if (bar) { bar.style.width = (vis * 100).toFixed(1) + '%'; bar.style.transform = 'translateX(' + (max > 0 ? (s.scrollLeft / max) * ((1 - vis) / vis) * 100 : 0).toFixed(1) + '%)'; }
    }
    s.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { s.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { s.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.15)));
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* colour swatches: repaint the facade (works with or without the scene) */
  var scene = d.querySelector('[data-scene]');
  d.querySelectorAll('.sw').forEach(function (b, i, all) {
    b.addEventListener('click', function () {
      all.forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
      scene.style.setProperty('--facade', b.getAttribute('data-c'));
    });
    b.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!k) return;
      e.preventDefault();
      var n = all[(i + k + all.length) % all.length]; n.focus(); n.click();
    });
  });

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indica nome e cognome.', phone: 'Indica un numero per richiamarti.', email: 'Indica un indirizzo email valido.', message: 'Descrivi in due righe il lavoro.' };
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
    paintScene(window.innerWidth < 860);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function paintScene(small) {
    var sec = scene;
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var stages = q('.stages li');
    var ui = { n: q1('[data-s-n]'), t: q1('[data-s-t]'), d: q1('[data-s-d]') }, pct = q1('[data-pct]');
    var tape = q('.tape rect, .tape path'), cloth = q1('.cloth');
    var circles = q('.mk circle'), pills = q('.mk .pill'), marks = q1('.marks');
    var stain = q1('.stain'), crack = q1('.crack'), patch = q('.patch path');
    var prime = q1('[data-prime]'), cols = q('[data-col]'), roller = q1('[data-roller]');
    var oldSh = q1('.shut--old'), newSh = q1('.shut--new'), sws = q('.swatches, .scene__note');

    /* start state: everything of the final picture out of sight */
    gsap.set([q1('.tape'), marks, stain, crack, oldSh], { opacity: 1 });
    gsap.set(tape, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(cloth, { opacity: 1, scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(circles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(pills, { autoAlpha: 0, y: 6 });
    gsap.set(patch, { opacity: 0 });
    gsap.set(prime, { attr: { width: 0 } });
    gsap.set(cols, { attr: { height: 0 } });
    gsap.set(newSh, { opacity: 0 });
    gsap.set(roller, { opacity: 0, x: 157, y: 150 });
    gsap.set(sws, { autoAlpha: 0, y: 12 });

    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      ui.n.textContent = '0' + (i + 1);
      ui.t.textContent = stages[i].getAttribute('data-t');
      ui.d.textContent = stages[i].getAttribute('data-d');
    }
    var cuts = [1.3, 2.4, 3.15, 5.35];
    var paint = { p: 0 };
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { var t = tl.time(), i = 0; while (i < cuts.length && t >= cuts[i]) i++; show(i); },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=210%' : '+=300%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(q('.scene__text > .eyebrow, .scene__text > .h2, .stage, .meter'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0)
      /* 1. protection: tape around windows and door, cloth on the ground */
      .to(tape, { strokeDashoffset: 0, duration: 0.5, stagger: 0.08 }, 0.35)
      .to(cloth, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0.5)
      /* 2. preparation: mark the damage, then fill and clean */
      .to(circles, { scale: 1, duration: 0.3, stagger: 0.15, ease: 'back.out(2)' }, 1.35)
      .to(pills, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.15 }, 1.45)
      .to(patch, { opacity: 1, duration: 0.35, stagger: 0.1 }, 1.95)
      .to([crack, stain], { opacity: 0, duration: 0.35 }, 1.95)
      .to(marks, { opacity: 0, duration: 0.2 }, 2.3)
      /* 3. primer, left to right */
      .to(prime, { attr: { width: 380 }, duration: 0.7, ease: 'power1.inOut' }, 2.45)
      /* 4. colour: the roller runs down four lanes */
      .to(roller, { opacity: 1, y: 200, duration: 0.15 }, 3.15);
    var lane = 0.5, t0 = 3.3;
    for (var i = 0; i < 4; i++) {
      var x = 157 + 95 * i, at = t0 + i * lane;
      if (i > 0) tl.to(roller, { x: x, y: 200, duration: 0.08, ease: 'power1.inOut' }, at - 0.08);
      tl.to(roller, { y: 560, duration: lane - 0.1, ease: 'power1.inOut' }, at)
        .to(cols[i], { attr: { height: 370 }, duration: lane - 0.1, ease: 'power1.inOut' }, at);
    }
    tl.to(paint, { p: 100, duration: 4 * lane - 0.1, onUpdate: function () { pct.textContent = Math.round(paint.p) + '%'; } }, t0)
      /* 5. finishing: roller away, shutters painted, tape and cloth removed, colours to try */
      .to(roller, { opacity: 0, y: 620, duration: 0.25 }, 5.3)
      .to(oldSh, { opacity: 0, duration: 0.3 }, 5.4)
      .to(newSh, { opacity: 1, duration: 0.3 }, 5.4)
      .to(q1('.tape'), { opacity: 0, duration: 0.3 }, 5.55)
      .to(cloth, { scaleX: 0, duration: 0.3 }, 5.6)
      .to(sws, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08 }, 5.6)
      .to({}, { duration: 0.5 });
    pct.textContent = '0%';
    show(0);
  }
})();
