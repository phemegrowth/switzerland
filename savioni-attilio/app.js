/* Savioni homepage: hero reel that drifts left with scroll, header, menu, anchors, reveals, services photo that follows
   the pointer, chain line, magnetic buttons, form, and the GSAP signature scene (valley map, route joining their three bases). */
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

  /* hero reel drifts left as the page scrolls (transform only, no scroll-jacking) */
  var reel = d.querySelector('[data-reel]');
  if (reel && !reduce) {
    var tk = false;
    function drift() { tk = false; var y = Math.min(window.scrollY, window.innerHeight * 1.5); reel.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)'; }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(drift); } }, { passive: true });
  }

  /* services: photo follows the pointer (fine pointers only) */
  var fl = d.querySelector('.follow');
  if (fl && !reduce && window.matchMedia('(pointer: fine)').matches) {
    var fimg = fl.querySelector('img'), tx = 0, ty = 0, x = 0, y = 0, raf = null;
    function loop() { x += (tx - x) * 0.2; y += (ty - y) * 0.2; fl.style.transform = 'translate(' + (x + 28).toFixed(1) + 'px,' + (y - 90).toFixed(1) + 'px)'; raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(loop) : null; }
    d.querySelectorAll('.tbl__r').forEach(function (r) {
      r.addEventListener('mouseenter', function (e) { fimg.src = r.getAttribute('data-img'); x = tx = e.clientX; y = ty = e.clientY; fl.classList.add('is-on'); if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('mouseleave', function () { fl.classList.remove('is-on'); });
      r.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
  }

  /* chain line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var st = list.querySelectorAll('.ch__i');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      list.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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
    var msgs = { name: 'Indicate un nome o un ente.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe l’opera.' };
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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    mapScene(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: rivers draw, then a green route runs from Castaneda down the Moesa to San Vittore and Castione */
  function mapScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var rivers = sec.querySelectorAll('[data-r]'), route = sec.querySelector('[data-route]');
    var pins = sec.querySelectorAll('.pin'), lbls = sec.querySelectorAll('.m-lbl'), stops = sec.querySelectorAll('.stops li');
    var ui = { n: sec.querySelector('[data-s-n]'), town: sec.querySelector('[data-s-town]'), what: sec.querySelector('[data-s-what]'), addr: sec.querySelector('[data-s-addr]') };
    function prep(p) { var L = 2000; try { L = Math.ceil(p.getTotalLength()) + 2; } catch (e) {} p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return L; }
    rivers.forEach(prep);
    var rL = prep(route);
    gsap.set(pins, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(lbls, { autoAlpha: 0, y: 8 });
    var at = [0, 0.55, 1, 1];
    var cur = -2;
    function show(i) {
      if (i === cur) return; cur = i;
      pins.forEach(function (p, j) { gsap.to(p, { scale: j <= i ? 1 : 0, duration: 0.35, ease: j <= i ? 'back.out(2.2)' : 'power1.in', overwrite: true }); });
      lbls.forEach(function (l, j) { gsap.to(l, { autoAlpha: j <= Math.min(i, 2) ? 1 : 0, y: 0, duration: 0.3, overwrite: true }); });
      var s = stops[Math.max(0, i)];
      ui.n.textContent = '0' + (Math.max(0, i) + 1);
      ui.town.textContent = s.getAttribute('data-town');
      ui.what.textContent = s.getAttribute('data-what');
      ui.addr.textContent = s.getAttribute('data-addr');
    }
    var st = { k: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=200%' : '+=280%', pin: true, scrub: 0.6, anticipatePin: 1 } });
    tl.fromTo(sec.querySelectorAll('.map__text > *'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4, ease: 'power2.out' }, 0)
      .to(rivers, { strokeDashoffset: 0, duration: 1.2, stagger: 0.15 }, 0.1)
      .to(st, { k: 3.2, duration: 4.2, onUpdate: function () {
        var k = st.k, f = Math.min(1, k / 2);
        route.style.strokeDashoffset = (rL * (1 - f)).toFixed(1);
        show(Math.min(3, Math.floor(k + 0.02)));
      } }, 1.2)
      .to({}, { duration: 0.5 });
    show(0);
  }
})();
