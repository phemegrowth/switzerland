/* Edil B&I Sagl: type-first hero (letters rise, their photo strip slides in from the right and drifts), header,
   menu, anchors, reveals, service list that swaps the photo, drag gallery, parallax, steps line, magnetic buttons,
   form, and the GSAP signature scene: a bathroom seen from above. Old tiles are lifted one by one, the old fixtures
   go, new pipes are drawn, the screed covers them, large tiles are laid row by row, then the new fixtures and the
   dimensions. The counter and the phase list read the same timeline. */
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

  /* hero strip: drifts left with scroll and breathes slowly */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var t0 = performance.now(), ticking = false;
    var moveStrip = function (now) {
      var room = Math.max(0, strip.scrollWidth - strip.parentNode.clientWidth + 24);
      var s = Math.min(room, window.scrollY * 0.45);
      var breathe = (Math.sin(((now || performance.now()) - t0) / 4200) * 0.5 + 0.5) * Math.min(60, room - s);
      strip.style.transform = 'translate3d(' + (-(s + breathe)).toFixed(1) + 'px,0,0)';
    };
    var loop = function (now) { if (window.scrollY < window.innerHeight * 1.5) moveStrip(now); requestAnimationFrame(loop); };
    setTimeout(function () { requestAnimationFrame(loop); }, 1500);
  }

  /* services: hover or focus swaps the photo */
  var pics = d.querySelectorAll('[data-sw]');
  d.querySelectorAll('[data-sw-on]').forEach(function (it) {
    var on = function () {
      var k = it.getAttribute('data-sw-on');
      pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-sw') === k); });
      d.querySelectorAll('[data-sw-on]').forEach(function (x) { x.classList.toggle('is-act', x === it); });
    };
    it.addEventListener('mouseenter', on);
    it.addEventListener('focusin', on);
  });

  /* drag gallery */
  var drag = d.querySelector('[data-drag]');
  if (drag) {
    var down = false, sx = 0, sl = 0, moved = 0;
    drag.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; moved = Math.abs(e.clientX - sx); drag.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { drag.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* stone photo: slow parallax inside its mask */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + ((p - 0.5) * -46).toFixed(1) + 'px,0)';
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
    bathScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function bathScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var NS = 'http://www.w3.org/2000/svg';
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return sec.querySelectorAll(s); };
    var cnt = one('[data-cnt]'), lbl = one('[data-cnt-lbl]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', 'Via le vecchie piastrelle e i sanitari', 'Nuovi tubi dove servono', 'Massetto e posa, fila per fila', 'Sanitari, doccia a filo e misure finali'];

    /* old 20 x 20 cm tiles: 13 x 10 on the 260 x 200 cm floor */
    var oldG = one('[data-old]'), olds = [];
    for (var r = 0; r < 10; r++) for (var c = 0; c < 13; c++) {
      var t = d.createElementNS(NS, 'rect');
      t.setAttribute('x', 60 + c * 40); t.setAttribute('y', 60 + r * 40);
      t.setAttribute('width', 40); t.setAttribute('height', 40);
      t.setAttribute('class', 'old-t' + ((r + c) % 2 ? ' old-t--b' : ''));
      oldG.appendChild(t); olds.push(t);
    }
    var N = olds.length;
    /* lifting order: from the door corner outwards, with a little noise, the way a floor is broken up */
    var order = olds.map(function (el, i) {
      var cx = i % 13, cy = Math.floor(i / 13);
      return { el: el, k: Math.hypot(cx - 3, cy - 10) + ((i * 37) % 11) / 6 };
    }).sort(function (a, b) { return a.k - b.k; });

    var oldfx = one('[data-oldfx]'), pipes = q('[data-pipe]'), tags = q('.pl-tag'), screed = one('[data-screed]');
    var news = q('[data-new] rect'), fx = q('[data-fx]'), dim = one('[data-dim]');
    var NN = news.length, NP = pipes.length;

    oldfx.style.display = 'block';
    gsap.set(one('.pipes'), { opacity: 1 });
    pipes.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(news, { opacity: 0, scale: .9, transformOrigin: '50% 50%' });
    gsap.set(fx, { opacity: 0, scale: 1.12, transformOrigin: '50% 50%' });
    gsap.set(dim, { opacity: 0 });
    gsap.set(bar, { scaleX: 0 });
    if (small) {
      one('.plan').setAttribute('viewBox', '44 6 596 470');
      /* larger dimension pills on phones */
      var dr = dim.querySelectorAll('rect'), dt = dim.querySelectorAll('text');
      dr[0].setAttribute('x', 262); dr[0].setAttribute('y', 12); dr[0].setAttribute('width', 116); dr[0].setAttribute('height', 36); dr[0].setAttribute('rx', 18);
      dt[0].setAttribute('y', 37); dt[0].style.fontSize = '21px';
      dr[1].setAttribute('x', 552); dr[1].setAttribute('y', 242); dr[1].setAttribute('width', 116); dr[1].setAttribute('height', 36); dr[1].setAttribute('rx', 18);
      dt[1].setAttribute('y', 267); dt[1].style.fontSize = '21px';
    }

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    /* 1 old tiles lifted (0.1 to 2.5), old fixtures out */
    var liftAt = [], STEP = 2.0 / N;
    order.forEach(function (o, i) {
      var at = 0.1 + i * STEP;
      liftAt.push(at + 0.15);
      tl.to(o.el, { opacity: 0, scale: .35, rotation: ((i * 53) % 50) - 25, y: -14, transformOrigin: '50% 50%', duration: .4, ease: 'power1.in' }, at);
    });
    tl.to(oldfx, { opacity: 0, y: -18, duration: .6, ease: 'power1.in' }, 1.7);
    /* 2 pipes drawn (2.7 to 5.0) with labels */
    var pipeAt = [];
    pipes.forEach(function (p, i) {
      var at = 2.7 + i * .36;
      pipeAt.push(at + .3);
      tl.to(p, { strokeDashoffset: 0, duration: .6, ease: 'power1.inOut' }, at);
    });
    tl.to(tags[0], { opacity: 1, duration: .25 }, 3.4)
      .to(tags[1], { opacity: 1, duration: .25 }, 4.0)
      .to(tags[2], { opacity: 1, duration: .25 }, 4.6)
      .to(tags, { opacity: 0, duration: .3 }, 5.25);
    /* 3 screed, then large tiles row by row (5.9 to 7.8) */
    tl.to(screed, { opacity: 1, duration: .5, ease: 'none' }, 5.35);
    var layAt = [];
    news.forEach(function (n, i) {
      var at = 5.95 + i * .11;
      layAt.push(at + .12);
      tl.to(n, { opacity: 1, scale: 1, duration: .35 }, at);
    });
    /* 4 new fixtures and dimensions */
    fx.forEach(function (f, i) { tl.to(f, { opacity: 1, scale: 1, duration: .45 }, 8.1 + i * .3); });
    tl.to(dim, { opacity: 1, duration: .4 }, 9.4)
      .to(bar, { scaleX: 1, duration: 9.9, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.9);

    var phAt = [0, 0, 2.6, 5.2, 8.0], lastP = -1, lastC = -1;
    function count(arr, t) { var n = 0; for (var i = 0; i < arr.length; i++) if (t >= arr[i]) n++; return n; }
    function sync() {
      var t = tl.time(), p = 1;
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      var c, label;
      if (p === 1) { c = count(liftAt, t); label = 'piastrelle vecchie tolte su ' + N; }
      else if (p === 2) { c = count(pipeAt, t); label = 'tubi nuovi posati su ' + NP; }
      else { c = count(layAt, t); label = 'piastrelle nuove posate su ' + NN; }
      if (c !== lastC || p !== lastP) { lastC = c; cnt.textContent = c; lbl.textContent = label; }
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
