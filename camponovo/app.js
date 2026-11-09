/* Camponovo homepage: number-led hero with slatted photo, header, menu, anchors, reveals, count-up (years in business),
   history line, magnetic buttons, form, and the GSAP signature scene (reference list drives their own photos on a 1934 to today rule). */
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

  /* count-up: years in business only (1934 to 2026) */
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    el.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* history line draws with scroll */
  d.querySelectorAll('[data-tl]').forEach(function (list) {
    var st = list.querySelectorAll('.tl__i');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.65 - r.top) / r.height));
      list.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it) { it.classList.toggle('is-lit', reduce || it.getBoundingClientRect().top < vh * 0.65); });
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

  /* scene static state: last reference shown */
  var sec = d.querySelector('[data-scene]');
  var lis = sec ? sec.querySelectorAll('[data-list] li') : [], imgs = sec ? sec.querySelectorAll('[data-frame] img') : [];
  var capT = sec && sec.querySelector('[data-cap-t]'), capS = sec && sec.querySelector('[data-cap-s]');
  var mark = sec && sec.querySelector('[data-mark]'), markY = sec && sec.querySelector('[data-mark-y]');
  var cur = -1;
  function setRef(i) {
    if (i === cur || !lis.length) return; cur = i;
    lis.forEach(function (li, j) { li.classList.toggle('is-act', j === i); li.classList.toggle('is-done', j < i); });
    imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
    var li = lis[i];
    capT.textContent = li.getAttribute('data-t');
    capS.textContent = li.getAttribute('data-s');
    var n = lis.length, x = n > 1 ? i / (n - 1) : 1;
    mark.style.setProperty('--x', (x * (mark.parentNode.clientWidth - 2)).toFixed(0) + 'px');
    markY.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + (n < 10 ? '0' : '') + n;
    markY.style.transform = 'translateX(' + (-x * 100).toFixed(0) + '%)';
  }
  if (lis.length) setRef(lis.length - 1);

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger || !lis.length) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    cur = -1; setRef(0);
    gsap.set(imgs, { opacity: 0, scale: 1.08 });
    gsap.set(imgs[0], { opacity: 1 });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=' + (lis.length * 45) + '%' : '+=' + (lis.length * 60) + '%', pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { setRef(Math.min(lis.length - 1, Math.floor(s.progress * lis.length * 0.999))); } } });
    tl.fromTo(sec.querySelectorAll('.refs__text > *'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0);
    imgs.forEach(function (im, i) {
      tl.to(im, { scale: 1, duration: 1 }, i);
      if (i > 0) tl.to(im, { opacity: 1, duration: 0.25 }, i - 0.1).to(imgs[i - 1], { opacity: 0, duration: 0.25 }, i);
    });
    tl.to({}, { duration: 0.2 }, lis.length);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    window.addEventListener('resize', function () { var c = cur; cur = -1; setRef(c < 0 ? 0 : c); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
