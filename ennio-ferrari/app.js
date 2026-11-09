/* Ennio Ferrari homepage script: hero deck, header, menu, anchors, reveals, count-up, sector photo that follows the pointer, philosophy line, magnetic buttons, form, and the GSAP signature scene (a route across the map of Ticino, stop by stop). */
(function () {
  'use strict';
  var d = document;
  var html = d.documentElement;
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

  /* Sectors: a photo of the trade follows the pointer (fine pointers only) */
  var fl = d.querySelector('.sx__float');
  if (fl && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var fimg = fl.querySelector('img'), tx = 0, ty = 0, x = 0, y = 0, raf = null;
    function loop() { x += (tx - x) * 0.18; y += (ty - y) * 0.18; fl.style.transform = 'translate(' + (x + 24).toFixed(1) + 'px,' + (y - 80).toFixed(1) + 'px) scale(1)'; raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(loop) : null; }
    d.querySelectorAll('.sx__i').forEach(function (it) {
      it.addEventListener('mouseenter', function () { fimg.src = it.getAttribute('data-img'); fl.classList.add('is-on'); });
      it.addEventListener('mouseleave', function () { fl.classList.remove('is-on'); });
      it.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  /* Philosophy: line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var items = list.querySelectorAll('.philo__i');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      list.style.setProperty('--p', p.toFixed(3));
      items.forEach(function (it, i) { it.classList.toggle('is-lit', p * items.length >= i + 0.05 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate un nome o un ente.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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

  /* Static state for no GSAP or reduced motion: every pin and label on, last stop shown */
  var pins = d.querySelectorAll('.pin'), lbls = d.querySelectorAll('.pin__lbl');
  lbls.forEach(function (l) { l.classList.remove('is-act'); });
  if (lbls.length) lbls[lbls.length - 1].classList.add('is-act');
  if (pins.length) pins[pins.length - 1].classList.add('is-act');

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    mapScene(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: the canton outline draws, then an orange line runs from Airolo down to Mendrisio, a pin drops at each real work, the panel shows it */
  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var edge = sec.querySelector('.map__edge'), land = sec.querySelector('.map__land');
    var route = sec.querySelector('[data-route]'), branch = sec.querySelector('[data-branch]');
    var stops = sec.querySelectorAll('.stops li');
    var ui = { n: sec.querySelector('[data-s-n]'), town: sec.querySelector('[data-s-town]'), work: sec.querySelector('[data-s-work]'), img: sec.querySelector('[data-s-img]') };
    function pts(el) { return el.getAttribute('points').trim().split(/\s+/).map(function (p) { var a = p.split(','); return [+a[0], +a[1]]; }); }
    function cum(p) { var c = [0]; for (var i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; }
    var rp = pts(route), rc = cum(rp), rLen = rc[rc.length - 1];
    var bp = pts(branch), bLen = cum(bp)[bp.length - 1];
    /* vertex on the main route for each stop; Locarno (8) is the branch */
    var vtx = [0, 1, 3, 4, 6, 7, 8, 9, -1, 11, 12];
    var at = vtx.map(function (v, i) { return v < 0 ? rc[9] : rc[v]; });
    var eLen = 6000;
    try { eLen = Math.ceil(edge.getTotalLength()); } catch (e) {}
    edge.style.strokeDasharray = eLen; edge.style.strokeDashoffset = eLen;
    route.style.strokeDasharray = rLen; route.style.strokeDashoffset = rLen;
    branch.style.strokeDasharray = bLen; branch.style.strokeDashoffset = bLen;
    pins.forEach(function (p) { p.classList.remove('is-act'); });
    lbls.forEach(function (l) { l.classList.remove('is-act'); });
    gsap.set(pins, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(lbls, { autoAlpha: 0 });
    stops.forEach(function (s) { var im = new Image(); im.src = s.getAttribute('data-img'); });

    var st = { k: -1 }, cur = -2;
    function paint() {
      var k = st.k, i = Math.floor(k), f = k - i;
      var main;
      if (k <= 0) main = 0;
      else if (k >= 10) main = rLen;
      else if (i === 7) main = at[7];
      else if (i === 8) main = at[7] + (at[9] - at[7]) * f;
      else main = at[i] + (at[i + 1] - at[i]) * f;
      route.style.strokeDashoffset = (rLen - main).toFixed(1);
      route.style.opacity = main > 0.5 ? 1 : 0;
      var b = k <= 7 ? 0 : Math.min(1, k - 7);
      branch.style.strokeDashoffset = (bLen * (1 - b)).toFixed(1);
      branch.style.opacity = b > 0.002 ? 1 : 0;
      var active = k < -0.5 ? -1 : Math.min(10, Math.round(k));
      if (active !== cur) {
        cur = active;
        pins.forEach(function (p, j) {
          var on = j <= active;
          gsap.to(p, { scale: on ? 1 : 0, duration: 0.35, ease: on ? 'back.out(2.4)' : 'power1.in', overwrite: true });
          p.classList.toggle('is-act', j === active);
        });
        lbls.forEach(function (l, j) {
          gsap.to(l, { autoAlpha: (small ? j === active : j <= active) ? 1 : 0, duration: 0.3, overwrite: true });
          l.classList.toggle('is-act', j === active);
        });
        var s = stops[Math.max(0, active)];
        var nn = Math.max(0, active) + 1;
        ui.n.textContent = (nn < 10 ? '0' : '') + nn;
        ui.town.textContent = s.getAttribute('data-town');
        ui.work.textContent = s.getAttribute('data-work');
        ui.img.src = s.getAttribute('data-img');
        ui.img.alt = s.getAttribute('data-work') + ', ' + s.getAttribute('data-town') + ', opera Ennio Ferrari';
      }
    }

    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=220%' : '+=320%', pin: true, scrub: 0.6, anticipatePin: 1 } });
    tl.fromTo(sec.querySelectorAll('.map__text > *'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.5 }, 0)
      .fromTo(land, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2)
      .to(edge, { strokeDashoffset: 0, duration: 1.2 }, 0.1)
      .to(st, { k: 10, duration: 7.6, onUpdate: paint }, 0.9)
      .to({}, { duration: 0.6 }, 8.5);
    paint();
  }
})();
