/* GTL SA homepage script: hero entrance, header, menu, anchors, reveals, count-up, service photo swap, project filter, drag strip, steps line, magnetic buttons, form, and the GSAP signature scene (blueprint to building). */
(function () {
  'use strict';
  var d = document;
  var html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');

  /* Hero entrance starts on the first frames, never waits for fonts or images */
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu: closes on link click and on Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off + 1, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Reveal: in view at load shows at once, the rest on arrival, 80 ms stagger */
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
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) cb(el);
      else io.observe(el);
    });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* Count-up: years in business only */
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1500;
    el.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* Services: hovering or focusing a line swaps the photo */
  var pics = d.querySelectorAll('.what__pic img');
  d.querySelectorAll('.svc__item').forEach(function (it) {
    function show() {
      var n = it.getAttribute('data-show');
      pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pic') === n); });
      d.querySelectorAll('.svc__item').forEach(function (o) { o.classList.toggle('is-hot', o === it); });
    }
    it.addEventListener('mouseenter', show);
    it.addEventListener('focusin', show);
  });

  /* Project index filter chips */
  var chips = d.querySelectorAll('.chip');
  var rows = d.querySelectorAll('[data-idx] li');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (o) { var on = o === c; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      rows.forEach(function (r) { r.classList.toggle('is-out', f !== 'all' && r.getAttribute('data-t') !== f); });
    });
  });

  /* Drag strip: mouse drag, touch keeps native scroll, arrow keys */
  d.querySelectorAll('[data-drag]').forEach(function (track) {
    var down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') return; down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', function () { if (down) { down = false; track.classList.remove('is-drag'); } });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') track.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') track.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Steps: the line draws with scroll, numbers light up as it reaches them */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var items = list.querySelectorAll('.steps__item');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.2)));
      list.style.setProperty('--p', p.toFixed(3));
      items.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.4) / items.length || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* Magnetic buttons, fine pointers only */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation with inline Italian messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il progetto.' };
    var req = form.querySelectorAll('[required]');
    function check(f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      if (w) w.classList.toggle('has-err', !ok);
      if (err) err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
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

  /* GSAP: built after fonts, in page order. Reduced motion or no GSAP keeps the final, static state. */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;

    /* Hero photo drifts slower than the page */
    var par = d.querySelector('[data-par]');
    if (par) gsap.to(par, { yPercent: small ? 6 : 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });

    scene(small);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: the elevation draws itself, then the building fills in floor by floor from the ground up */
  function scene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var img = sec.querySelector('.scene__img');
    var svg = sec.querySelector('.scene__svg');
    var lines = sec.querySelectorAll('.ln-draw > *');
    var pctEl = sec.querySelector('[data-pct]');
    var nEl = sec.querySelector('[data-ph-n]');
    var nameEl = sec.querySelector('[data-ph-name]');
    var bar = sec.querySelector('[data-bar]');
    var phases = sec.querySelectorAll('.scene__phases li');
    var lvls = sec.querySelectorAll('.scene__lvl');
    var names = ['Progetto e disegno', 'Scavo e fondazioni', 'Struttura in calcestruzzo', 'Solai e balconi', 'Facciate e serramenti', 'Copertura'];
    var tops = [100, 92.6, 76, 59, 42.5, 25.5, 0]; /* floor lines in % of the photo height, ground floor first */

    lines.forEach(function (l) {
      var len = 4000;
      try { len = Math.ceil(l.getTotalLength()); } catch (e) {}
      l.style.strokeDasharray = len;
      l.style.strokeDashoffset = len;
      l.setAttribute('data-len', len);
    });

    var st = { pct: 0, ph: 1, top: 100 };
    function paint() {
      pctEl.textContent = Math.round(st.pct);
      var k = Math.max(1, Math.min(6, Math.round(st.ph)));
      nEl.textContent = '0' + k;
      nameEl.textContent = names[k - 1];
      phases.forEach(function (li, i) { li.classList.toggle('is-on', i < k); });
      bar.style.transform = 'scaleX(' + (st.pct / 100).toFixed(3) + ')';
      img.style.clipPath = 'inset(' + st.top.toFixed(2) + '% 0 0 0)';
    }
    paint();

    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=170%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1 } });
    tl.fromTo(sec.querySelectorAll('.scene__text > *, .scene__note'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 }, 0)
      .fromTo(svg, { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0)
      .fromTo(lvls, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.3 }, 0.4);
    lines.forEach(function (l, i) {
      tl.to(l, { strokeDashoffset: 0, duration: 0.7 }, 0.3 + i * 0.07);
    });
    tl.to(st, { pct: 15, duration: 1.6, onUpdate: paint }, 0.3);
    for (var f = 1; f <= 6; f++) {
      var at = 2.1 + (f - 1) * 0.9;
      tl.to(st, { top: tops[f], pct: 15 + f * (85 / 6), ph: f === 6 ? 6 : f + 1, duration: 0.8, ease: 'power1.inOut', onUpdate: paint }, at);
    }
    tl.to(svg, { opacity: 0.38, duration: 0.8 }, 6.6)
      .to({}, { duration: 0.6 }, 7.4);
  }
})();
