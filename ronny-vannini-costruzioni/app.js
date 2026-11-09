/* Ronny Vannini Costruzioni e Riattazioni: survey-frame hero (lines draw, photo opens inside the frame, headline
   lines rise), header, menu, anchors, reveals, parallax, magnetic buttons, form, and the GSAP signature scene:
   a rustico restored stone by stone. A dashed ghost shows how the old house sagged; the missing stones come back
   from the bottom course up while the cracks close, then the new roof, lintels, shutters and door, and the windows
   light up. The counter and the phase list read the same timeline. */
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

  /* place photo: slow parallax inside its mask */
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

  /* stones of the rustico: generated once (seeded, the same every time) */
  var NS = 'http://www.w3.org/2000/svg';
  var stonesG = d.querySelector('[data-stones]'), missing = [], total = 0;
  if (stonesG) {
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var holes = [[266, 298, 68, 84], [466, 298, 68, 84], [368, 428, 64, 136], [380, 198, 40, 44]];
    var inHole = function (x, y, w, h) {
      return holes.some(function (o) { return x < o[0] + o[2] && x + w > o[0] && y < o[1] + o[3] && y + h > o[1]; });
    };
    var inFacade = function (cx, cy) {
      if (cy > 560) return false;
      if (cy >= 250) return cx > 196 && cx < 604;
      var hw = (cy - 128) / 122 * 200; return Math.abs(cx - 400) < hw + 10;
    };
    /* "missing" patches: where the old wall had opened up */
    var patches = [[250, 476, 74], [548, 352, 60], [424, 212, 50], [322, 262, 40]];
    var y = 560;
    var place = function (sx, sy, sw, sh) {
      var r = d.createElementNS(NS, 'rect');
      var jh = sh - rnd() * 4, jy = sy + rnd() * (sh - jh);
      r.setAttribute('x', sx.toFixed(1)); r.setAttribute('y', jy.toFixed(1));
      r.setAttribute('width', sw.toFixed(1)); r.setAttribute('height', jh.toFixed(1));
      r.setAttribute('rx', (4 + rnd() * 6).toFixed(1));
      r.setAttribute('class', 'st st--' + (1 + Math.floor(rnd() * 4)));
      stonesG.appendChild(r); total++;
      var cx = sx + sw / 2, cy = sy + sh / 2;
      var near = patches.some(function (p) { return Math.hypot(cx - p[0], (cy - p[1]) * 1.2) < p[2]; });
      if (near || rnd() < 0.2) missing.push({ el: r, y: cy, x: cx });
    };
    while (y > 120) {
      var h = 17 + Math.round(rnd() * 8), x = 190 - rnd() * 24;
      var sy = y - h + 1.5, sh = h - 3;
      /* holes crossing this course, left to right */
      var row = holes.filter(function (o) { return sy < o[1] + o[3] && sy + sh > o[1]; }).sort(function (a, b) { return a[0] - b[0]; });
      while (x < 610) {
        var w = 26 + Math.round(rnd() * 36);
        var sx = x + 1.5, sw = w - 3;
        var hit = null;
        for (var k = 0; k < row.length; k++) if (sx < row[k][0] + row[k][2] && sx + sw > row[k][0]) { hit = row[k]; break; }
        if (hit) {
          var room = hit[0] - sx - 1.5;
          if (room >= 12 && inFacade(sx + room / 2, sy + sh / 2)) place(sx, sy, room, sh);
          x = hit[0] + hit[2] + 1;
          continue;
        }
        if (inFacade(sx + sw / 2, sy + sh / 2)) place(sx, sy, sw, sh);
        x += w;
      }
      y -= h;
    }
    missing.sort(function (a, b) { return b.y - a.y || a.x - b.x; });
    /* final state for reduced motion: every stone back */
    var c0 = d.querySelector('[data-cnt]'), l0 = d.querySelector('[data-cnt-lbl]');
    if (c0) { c0.textContent = missing.length; l0.textContent = 'pietre rimesse su ' + missing.length; }
  }

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    rusScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function rusScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return sec.querySelectorAll(s); };
    var cnt = one('[data-cnt]'), lbl = one('[data-cnt-lbl]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', "Com'era: muri aperti, tetto ceduto", 'Pietra su pietra, i muri si richiudono', 'Tetto nuovo, finestre e porta', 'Di nuovo abitabile'];
    var M = missing.length;
    lbl.textContent = 'pietre rimesse su ' + M;
    var ghost = one('[data-ghost]'), ghostPaths = ghost.querySelectorAll('path');
    var rows = q('.rf-row');

    gsap.set(ghost, { opacity: 1 });
    ghostPaths.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: '8 7', strokeDashoffset: 0 }); p.dataset.len = L; });
    gsap.set(one('[data-cracks]'), { opacity: 1 });
    gsap.set(one('[data-roofold]'), { opacity: 1 });
    missing.forEach(function (m, i) { gsap.set(m.el, { opacity: 0, x: (i % 2 ? 1 : -1) * (20 + (i * 13) % 40), y: 70, rotation: ((i * 47) % 40) - 20, transformOrigin: '50% 50%' }); });
    gsap.set(one('.rf-beam'), { opacity: 0, y: -30 });
    rows.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(q('.rf-ch, .rf-chc'), { opacity: 0, y: 30 });
    gsap.set(q('[data-lintel] rect'), { opacity: 0, y: -14 });
    gsap.set(q('[data-win] > g'), { opacity: 0 });
    gsap.set(q('.w-sh'), { scaleX: 0, transformOrigin: '50% 50%' });
    var path = one('[data-path]'), PL = path.getTotalLength();
    gsap.set(path, { strokeDasharray: PL, strokeDashoffset: PL });
    gsap.set(bar, { scaleX: 0 });
    if (small) one('.rus').setAttribute('viewBox', '140 86 520 514');

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    /* 1 how it was: the ghost outline marches, the cracks pulse */
    tl.fromTo(ghostPaths, { strokeDashoffset: 0 }, { strokeDashoffset: -60, duration: 1.4, ease: 'none' }, 0)
      .fromTo(one('[data-cracks]'), { opacity: .4 }, { opacity: 1, duration: .6, yoyo: true, repeat: 1 }, .1);
    /* 2 stones back, bottom course first (1.6 to 5.8) */
    var placeAt = [], SPAN = 4.0;
    missing.forEach(function (m, i) {
      var at = 1.6 + (M > 1 ? i / (M - 1) : 0) * SPAN;
      placeAt.push(at + .2);
      tl.to(m.el, { opacity: 1, x: 0, y: 0, rotation: 0, duration: .45, ease: 'back.out(1.4)' }, at);
    });
    tl.to(one('[data-cracks]'), { opacity: 0, duration: 1.4 }, 3.2);
    /* 3 roof, lintels, openings (6.0 to 8.6) */
    tl.to(one('[data-roofold]'), { opacity: 0, duration: .5 }, 6.0)
      .to(one('.rf-beam'), { opacity: 1, y: 0, duration: .6 }, 6.2)
      .to(rows, { strokeDashoffset: 0, duration: .7, stagger: .25, ease: 'power1.inOut' }, 6.6)
      .to(q('.rf-ch, .rf-chc'), { opacity: 1, y: 0, duration: .5, stagger: .1 }, 7.3)
      .to(q('[data-lintel] rect'), { opacity: 1, y: 0, duration: .4, stagger: .12 }, 7.1)
      .to(q('[data-win] > g'), { opacity: 1, duration: .4, stagger: .15 }, 7.6)
      .to(q('.w-sh'), { scaleX: 1, duration: .45, stagger: .08 }, 7.9);
    /* 4 lived in again */
    tl.to(ghost, { opacity: 0, duration: .8 }, 8.7)
      .to(q('[data-glow] rect'), { opacity: .55, duration: .6, stagger: .15 }, 8.9)
      .to(path, { strokeDashoffset: 0, duration: .7 }, 9.1)
      .to(bar, { scaleX: 1, duration: 9.9, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.9);

    var phAt = [0, 0, 1.5, 6.0, 8.6], lastP = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, c = 0;
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      for (var i = 0; i < placeAt.length; i++) if (t >= placeAt[i]) c++;
      if (c !== lastC) { lastC = c; cnt.textContent = c; }
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.textContent = '0' + p + '  ' + names[p];
      }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=210%' : '+=290%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
