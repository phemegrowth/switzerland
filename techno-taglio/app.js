/* Techno Taglio: curtain hero (red panel lifts, blade turns), header, menu, anchors, reveals, count-up, drag strip
   with progress bar, magnetic buttons, form validation, and the GSAP signature scene: a reinforced concrete wall
   where the opening is marked, the four corners are core-drilled (the first core comes out as a test sample),
   the diamond wire runs round the four holes, and the cut block is lifted out to leave a clean opening.
   Counters (holes, % cut), the progress bar and the phase list all read the same timeline. */
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

  /* count-up: years in the register (since 1998) */
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

  /* drag strip with progress bar */
  var strip = d.querySelector('[data-strip]'), sbar = d.querySelector('[data-stripbar]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    var setBar = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      sbar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', setBar, { passive: true });
    setBar();
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.1).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.18).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate un nome o la ditta.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
  if (reduce || !window.gsap || !window.ScrollTrigger) html.classList.add('st-off');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    html.classList.add('st-on');
    wallScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); };
    var all = function (s) { return sec.querySelectorAll(s); };
    var mark = one('[data-mark]'), dims = one('[data-dims]'), drill = one('[data-drill]'), spin = one('[data-spin]');
    var holes = all('.hole'), core = one('[data-core]'), clab = one('[data-clab]');
    var wire = one('[data-wire]'), run = one('[data-wirerun]'), feed = one('[data-feed]'), pulley = one('[data-pulley]'), spray = one('[data-spray]');
    var kerf = one('[data-kerf]'), block = one('[data-block]'), shadow = one('[data-shadow]');
    var cH = one('[data-holes]'), cC = one('[data-cut]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = all('.phases li');
    var corners = [[330, 220], [670, 220], [670, 520], [330, 520]];
    var per = 2 * (340 + 300);
    var phNames = ['', 'Tracciamento', 'Carotaggio', 'Filo diamantato', 'Estrazione', 'Apertura'];
    var phDesc = [''];
    phs.forEach(function (li) { var sm = li.querySelector('small'); phDesc.push(sm ? sm.textContent : ''); });
    var coreTo = small ? [400, 612] : [110, 610];
    if (small) {
      one('svg.wall').setAttribute('viewBox', '210 140 700 540');
      var cr = clab.querySelector('rect'), ct = clab.querySelector('text');
      cr.setAttribute('x', 580); cr.setAttribute('y', 612); cr.setAttribute('width', 150); cr.setAttribute('height', 40); cr.setAttribute('rx', 20);
      ct.setAttribute('x', 655); ct.setAttribute('y', 640);
    }

    function dash(el, L) { el.style.strokeDasharray = L + ' ' + L; el.style.strokeDashoffset = L; }
    dash(mark, per); dash(wire, per); dash(kerf, per);
    var feedL = feed.getTotalLength(); dash(feed, feedL);
    gsap.set(dims, { autoAlpha: 0 });
    gsap.set(holes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(drill, { autoAlpha: 0 });
    gsap.set(core, { autoAlpha: 0 });
    gsap.set(clab, { autoAlpha: 0, y: 8 });
    gsap.set(run, { autoAlpha: 0, strokeDashoffset: 0 });
    gsap.set(pulley, { autoAlpha: 0 });
    gsap.set(spray, { autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });
    gsap.set(block, { transformOrigin: '50% 50%' });
    holes.forEach(function (h, i) { h.setAttribute('transform', 'translate(' + corners[i][0] + ' ' + corners[i][1] + ')'); });

    var tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    var phAt = [0, 0, 1.3, 4.5, 7.6, 9.0], holeAt = [];
    /* 1 marking */
    tl.to(mark, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0.05)
      .to(dims, { autoAlpha: 1, duration: .35 }, .8);
    /* 2 four corner cores; the first comes out as a test sample */
    tl.to(drill, { autoAlpha: 1, duration: .15 }, 1.3);
    corners.forEach(function (c, i) {
      var t0 = 1.3 + i * .72;
      holeAt[i] = t0 + .5;
      tl.to(drill, { x: c[0], y: c[1], duration: .2, ease: 'power2.inOut' }, t0)
        .to(spin, { rotation: '+=540', duration: .5, ease: 'none', svgOrigin: '0 0' }, t0 + .15)
        .to(holes[i], { scale: 1, duration: .3, ease: 'back.out(2)' }, t0 + .45);
    });
    tl.to(drill, { autoAlpha: 0, duration: .2 }, 4.2)
      .to(core, { autoAlpha: 1, duration: .1 }, 1.95)
      .fromTo(core, { x: 330, y: 220 }, { x: coreTo[0], y: coreTo[1], duration: .7, ease: 'power2.inOut' }, 1.95)
      .to(clab, { autoAlpha: 1, y: 0, duration: .3 }, 2.6)
      .to(dims, { autoAlpha: small ? 0 : .35, duration: .3 }, 4.3);
    /* 3 diamond wire: threaded, then running, the cut grows behind it */
    tl.to(pulley, { autoAlpha: 1, duration: .3 }, 4.5)
      .to(feed, { strokeDashoffset: 0, duration: .4, ease: 'none' }, 4.55)
      .to(wire, { strokeDashoffset: 0, duration: .6, ease: 'none' }, 4.8)
      .to(run, { autoAlpha: 1, duration: .1 }, 5.35)
      .to(run, { strokeDashoffset: -per * 1.5, duration: 2.2, ease: 'none' }, 5.4)
      .to(pulley, { rotation: 900, svgOrigin: '860 630', duration: 2.2, ease: 'none' }, 5.4)
      .to(spray, { autoAlpha: 1, duration: .2 }, 5.4)
      .to(kerf, { strokeDashoffset: 0, duration: 2.2, ease: 'none' }, 5.4)
      .to([spray, run, wire, feed, pulley], { autoAlpha: 0, duration: .3 }, 7.65)
      .to(clab, { autoAlpha: 0, duration: .3 }, 7.65);
    /* 4 extraction: the block comes forward and out */
    tl.to(shadow, { opacity: 1, duration: .3 }, 7.7)
      .to(block, { scale: 1.05, duration: .5, ease: 'power2.out' }, 7.75)
      .to([kerf, mark], { autoAlpha: 0, duration: .3 }, 7.9)
      .to(holes, { autoAlpha: 0, duration: .4 }, 8.0)
      .to(block, { x: small ? 320 : 420, y: -40, rotation: 4, duration: .9, ease: 'power2.in' }, 8.2)
      .to(block, { autoAlpha: 0, duration: .3 }, 8.8);
    /* 5 the opening */
    tl.to(dims, { autoAlpha: small ? 0 : 1, duration: .4 }, 9.1)
      .to(core, { autoAlpha: .9, duration: .2 }, 9.1)
      .to(bar, { scaleX: 1, duration: 9.8, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.8);

    var lastP = -1, lastH = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, h = 0, c;
      for (var i = 1; i < phAt.length; i++) if (t >= phAt[i]) p = i;
      for (var j = 0; j < holeAt.length; j++) if (t >= holeAt[j]) h = j + 1;
      c = Math.round(Math.max(0, Math.min(1, (t - 5.4) / 2.2)) * 100);
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.innerHTML = '<b>0' + p + '</b> ' + phNames[p] + '<small>' + phDesc[p] + '</small>';
      }
      if (h !== lastH) { lastH = h; cH.textContent = h; }
      if (c !== lastC) { lastC = c; cC.textContent = c; }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=200%' : '+=300%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
