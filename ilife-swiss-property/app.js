/* iLife Swiss Property homepage: hero entrance, header, menu, anchors, reveals, magnetic buttons, form,
   and the GSAP signature scene (equity grows from the 5% advance to 20%, the house of their logo assembles block by block). */
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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#rent-to-buy' ? 0 : header.offsetHeight - 1);
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
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Scrivete due righe sulla casa che cercate.' };
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

  function scene() {
    var sec = d.querySelector('.own');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 920px)').matches;
    var q = function (s) { return sec.querySelector(s); };
    var C = q('.h-c'), B = q('.h-b'), A = q('.h-a'), D = q('.h-d'), line = q('.h-line'), tag = q('.h-tag'), ghost = q('.h-ghost');
    var fill = q('.gauge__fill'), num = q('.gauge__n'), m20 = q('.gauge__mark--20'), steps = sec.querySelectorAll('.own__steps li');
    var L = line.getTotalLength();
    line.style.strokeDasharray = L + ' ' + L; line.style.strokeDashoffset = L;
    gsap.set(line, { autoAlpha: 0 });
    gsap.set(C, { y: 60, autoAlpha: 0 });
    gsap.set(B, { x: 90, y: -40, autoAlpha: 0 });
    gsap.set(A, { x: -90, y: -60, autoAlpha: 0 });
    gsap.set(D, { x: 90, y: 30, autoAlpha: 0 });
    gsap.set(tag, { autoAlpha: 0, y: 10 });
    gsap.set(fill, { scaleY: 0 });
    gsap.set(m20, { opacity: .45 });
    num.textContent = '0';
    var st = { v: 0 }, marks = [0, 1.2, 2.3, 3.6, 4.8];

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=190%' : '+=260%', pin: q('.own__pin'), scrub: 0.6,
        onUpdate: function (s) {
          var t = s.progress * tl.duration(), k = 0;
          for (var i = 0; i < marks.length; i++) if (t >= marks[i]) k = i;
          steps.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        }
      }
    });
    function to(v, at, dur) {
      tl.to(st, { v: v, duration: dur, onUpdate: function () { num.textContent = Math.round(st.v); } }, at);
      tl.to(fill, { scaleY: v / 20, duration: dur }, at);
    }
    // 1 advance: the base block, 5%
    tl.to(C, { y: 0, autoAlpha: 1, duration: .8, ease: 'power2.out' }, .2);
    to(5, .2, .8);
    // 2 live there now: rent starts, the grey block comes in
    tl.to(B, { x: 0, y: 0, autoAlpha: 1, duration: .9, ease: 'power2.out' }, 1.3);
    to(9, 1.3, .9);
    // 3 each rent builds capital: the red block
    tl.to(A, { x: 0, y: 0, autoAlpha: 1, duration: 1, ease: 'power2.out' }, 2.4);
    to(15, 2.4, 1);
    // 4 equity reached: the last block, the 20% mark lights up
    tl.to(D, { x: 0, y: 0, autoAlpha: 1, duration: .8, ease: 'power2.out' }, 3.7);
    to(20, 3.7, .8);
    tl.to(m20, { opacity: 1, duration: .3 }, 4.4);
    // 5 owners: the red line under the house, the tag
    tl.to(line, { autoAlpha: 1, duration: .05 }, 4.9);
    tl.to(line, { strokeDashoffset: 0, duration: .8 }, 4.9);
    tl.to(ghost, { autoAlpha: 0, duration: .5 }, 4.9);
    tl.to(tag, { autoAlpha: 1, y: 0, duration: .4, ease: 'back.out(2)' }, 5.5);
    tl.to({}, { duration: .7 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
