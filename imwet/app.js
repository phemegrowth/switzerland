/* Imwet SA homepage: curtain hero, header, menu, anchors, reveals, accordion with photo swap, timeline line,
   magnetic buttons, form, and the GSAP signature scene (fly through the I of the IMWET letters into Ticino). */
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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#ticino' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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

  /* accordion, one open at a time; the photo beside it swaps */
  var acc = d.querySelector('[data-acc]'), pic = d.querySelector('[data-swap]');
  if (acc) {
    var items = acc.querySelectorAll('.acc__i');
    var open = function (it) {
      items.forEach(function (x) {
        var on = x === it;
        x.classList.toggle('is-open', on);
        x.querySelector('.acc__b').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      var src = it.getAttribute('data-img');
      if (pic && src && pic.getAttribute('src') !== src) {
        pic.classList.add('is-fade');
        setTimeout(function () { pic.src = src; pic.classList.remove('is-fade'); }, reduce ? 0 : 280);
      }
    };
    items.forEach(function (it) { it.querySelector('.acc__b').addEventListener('click', function () { open(it); }); });
  }

  /* timeline line draws with scroll */
  var tl = d.querySelector('.tl'), fill = d.querySelector('.tl__fill');
  if (tl && fill && !reduce) {
    var tk = false;
    var sp = function () {
      tk = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      fill.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(sp); } }, { passive: true });
    sp();
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
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sul vostro immobile.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = v !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene: the camera flies through the stem of the I on their facade lettering */
  function scene() {
    var sec = d.querySelector('.fly');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 920px)').matches;
    var q = function (s) { return sec.querySelector(s); };
    var svg = q('.fly__mask'), target = q('.fly__target'), img = q('.fly__img');
    var capT = q('.fly__cap--top'), capB = q('.fly__cap--bot'), card = q('.fly__card'), regions = sec.querySelectorAll('.fly__regions li');
    function origin() {
      gsap.set(svg, { scale: 1 });
      var tr = target.getBoundingClientRect(), sr = svg.getBoundingClientRect();
      gsap.set(svg, { transformOrigin: (tr.left + tr.width / 2 - sr.left) + 'px ' + (tr.top + tr.height * 0.5 - sr.top) + 'px' });
    }
    origin();
    gsap.set(img, { scale: 1.3 });
    gsap.set(card, { autoAlpha: 0, y: 60 });
    gsap.set(regions, { autoAlpha: 0, y: 12 });

    var t = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=170%' : '+=230%', pin: q('.fly__pin'), scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: origin }
    });
    t.to([capT, capB], { autoAlpha: 0, duration: .5 }, .3);
    t.to(svg, { scale: small ? 60 : 48, duration: 3, ease: 'power3.in' }, .2);
    t.to(img, { scale: 1, duration: 3.4, ease: 'power1.out' }, .2);
    t.to(svg, { autoAlpha: 0, duration: .3 }, 2.9);
    t.to(card, { autoAlpha: 1, y: 0, duration: .8, ease: 'power2.out' }, 3.3);
    t.to(regions, { autoAlpha: 1, y: 0, duration: .4, stagger: .22, ease: 'power2.out' }, 3.9);
    t.to({}, { duration: .8 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
