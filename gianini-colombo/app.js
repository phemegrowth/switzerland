/* Gianini & Colombo homepage: type-first hero with a sliding photo strip, header, menu, anchors, reveals,
   photo swap on the services list, drag gallery, history ledger, magnetic buttons, form,
   and the GSAP signature scene (a mobile crane sets up, picks a beam and sets it on the top floor). */
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

  function reveal(els, cb, margin) {
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
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });
  reveal(d.querySelectorAll('.ledger__i'), function (el) { el.classList.add('is-lit'); }, '0px 0px -25% 0px');

  /* services list swaps the sticky photo */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var sImgs = swap.querySelectorAll('img'), items = d.querySelectorAll('.list__i');
    function show(i, li) {
      sImgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
      items.forEach(function (x) { x.classList.toggle('is-act', x === li); });
    }
    items.forEach(function (li) {
      var i = parseInt(li.getAttribute('data-img'), 10) || 0;
      li.addEventListener('mouseenter', function () { show(i, li); });
    });
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) show(parseInt(e.target.getAttribute('data-img'), 10) || 0, e.target); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(function (li) { io2.observe(li); });
    }
  }

  /* drag gallery with progress bar */
  var drag = d.querySelector('[data-drag]'), bar = d.querySelector('[data-drag-bar]');
  if (drag) {
    var down = false, sx = 0, sl = 0, moved = false;
    drag.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; drag.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { drag.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    function prog() {
      var m = drag.scrollWidth - drag.clientWidth;
      var vis = drag.clientWidth / drag.scrollWidth;
      var p = m > 0 ? drag.scrollLeft / m : 1;
      bar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(1) + '%) scaleX(1)';
      bar.style.width = (vis * 100).toFixed(1) + '%';
    }
    drag.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
  }

  /* hero strip drifts left a little as the page scrolls */
  var strip = d.querySelector('[data-strip]');
  if (strip && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        strip.style.transform = 'translateX(' + (-y * 0.08).toFixed(1) + 'px)';
        ticking = false;
      });
    }, { passive: true });
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
    var msgs = { name: 'Indicate un nome o una ditta.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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

  /* ---------- signature scene: the lift ---------- */
  var sec = d.querySelector('[data-scene]');
  if (!sec) return;
  var steps = sec.querySelectorAll('[data-steps] li');
  var boom = sec.querySelector('[data-boom]'), secs = [1, 2, 3].map(function (k) { return sec.querySelector('[data-sec="' + k + '"]'); });
  var cable = sec.querySelector('[data-cable]'), hook = sec.querySelector('[data-hook]'), load = sec.querySelector('[data-load]');
  var outr = sec.querySelector('[data-outr]'), ram = sec.querySelector('[data-ram]'), top = sec.querySelector('[data-top]');
  var read = sec.querySelector('[data-read]');
  var PX = 300, PY = 510, L0 = 330, EXT = 439, HOOK = 36, SLING = 70;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var curStep = -1;
  function setStep(i) {
    if (i === curStep) return; curStep = i;
    steps.forEach(function (li, j) { li.classList.toggle('is-act', j === i); li.classList.toggle('is-done', j < i); });
  }
  /* progress 0..1 to crane state */
  function render(p) {
    var o = ease(seg(p, .08, .24));
    var t2 = ease(seg(p, .24, .40)), t3 = ease(seg(p, .40, .62)), t4 = ease(seg(p, .62, .84)), t5 = ease(seg(p, .84, .96));
    var th, L, c, attached = p >= .40;
    if (p < .40) { th = lerp(0, 18.2, t2); L = lerp(L0, 400, t2); c = lerp(24, 109, t2); }
    else if (p < .62) { th = lerp(18.2, 48, t3); L = lerp(400, 600, t3); c = lerp(109, 25, t3); }
    else if (p < .84) { th = lerp(48, 35, t4); L = lerp(600, 769, t4); c = lerp(25, 10, t4); }
    else { th = 35; L = 769; c = lerp(10, 25, t5); }
    var r = th * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r);
    var tx = PX + L * cs, ty = PY - L * sn, e = (L - L0) / EXT;
    boom.setAttribute('transform', 'translate(' + PX + ' ' + PY + ') rotate(' + (-th).toFixed(2) + ')');
    secs.forEach(function (g, k) { g.setAttribute('transform', 'translate(' + (e * (k + 1) / 3 * EXT).toFixed(1) + ' 0)'); });
    cable.setAttribute('x1', tx.toFixed(1)); cable.setAttribute('y1', ty.toFixed(1));
    cable.setAttribute('x2', tx.toFixed(1)); cable.setAttribute('y2', (ty + c).toFixed(1));
    hook.setAttribute('transform', 'translate(' + tx.toFixed(1) + ' ' + (ty + c).toFixed(1) + ')');
    if (attached) load.setAttribute('transform', 'translate(' + tx.toFixed(1) + ' ' + (ty + c + HOOK + SLING).toFixed(1) + ')');
    else load.setAttribute('transform', 'translate(680 600)');
    outr.setAttribute('transform', 'translate(0 ' + (-36 * (1 - o)).toFixed(1) + ')');
    ram.setAttribute('d', 'M330 528L' + (PX + 120 * cs).toFixed(1) + ' ' + (PY - 120 * sn).toFixed(1));
    top.classList.toggle('is-set', p >= .955);
    read.textContent = 'Inclinazione braccio ' + Math.round(th) + '°';
    setStep(p < .24 ? 0 : p < .40 ? 1 : p < .84 ? 2 : 3);
  }
  if (reduce || !window.gsap || !window.ScrollTrigger) { render(1); return; }

  function start() {
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    render(0);
    var state = { p: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=190%' : '+=260%', pin: true, scrub: 0.5, anticipatePin: 1 } });
    tl.fromTo(sec.querySelectorAll('.lift__text > *'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.08, ease: 'power2.out' }, 0);
    tl.fromTo(sec.querySelector('.crane'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.02);
    tl.to(state, { p: 1, duration: 1, onUpdate: function () { render(state.p); } }, 0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
