/* MOREDIL Sagl: fanned photo cards that settle into a collage, header, menu, anchors, reveals, count-up of the years,
   parallax, magnetic buttons, form, and the GSAP signature scene: a new window opening cut into an existing block
   wall. The opening is marked out, props go under the wall, the lintel slides in, the blocks inside the line are cut
   and taken out one by one, then the frame, glass and sill. The counter and the phase list read the same timeline. */
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

  /* count-up (years in business only) */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* firm photo: slow parallax inside its mask */
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
    wallScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function wallScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return sec.querySelectorAll(s); };
    var cnt = one('[data-cnt]'), lbl = one('[data-cnt-lbl]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', "Si traccia l'apertura", 'Puntelli sotto il muro', 'Architrave in posa', 'Taglio dei blocchi', 'Telaio, vetri e davanzale'];
    var cuts = q('[data-cutblocks] rect'), N = cuts.length;
    var mark = one('[data-mark]'), markRect = mark.querySelector('rect'), dims = mark.querySelectorAll('.w-dim'), pills = mark.querySelectorAll('.w-pill');
    var props = q('[data-prop]'), lintel = one('[data-lintel]'), win = one('[data-win]');

    gsap.set(one('[data-cutblocks]'), { opacity: 1 });
    gsap.set(one('.w-view'), { opacity: 0 });
    gsap.set(mark, { opacity: 1 });
    var per = 2 * (+markRect.getAttribute('width') + +markRect.getAttribute('height'));
    gsap.set(markRect, { strokeDasharray: '10 7', strokeDashoffset: 0, opacity: 0 });
    gsap.set(dims, { opacity: 0 }); gsap.set(pills, { opacity: 0, y: 6 });
    gsap.set(one('[data-props]'), { opacity: 1 });
    gsap.set(props, { y: 380, opacity: 0 });
    gsap.set(lintel, { x: -460, opacity: 0 });
    gsap.set(win, { opacity: 0, scale: 1.04, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });
    if (small) one('.wall').setAttribute('viewBox', '150 100 500 430');

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    /* 1 mark out (0 to 1.8) */
    tl.to(markRect, { opacity: 1, duration: .3 }, .1)
      .fromTo(markRect, { strokeDashoffset: per }, { strokeDashoffset: 0, duration: 1.2, ease: 'none' }, .1)
      .to(dims, { opacity: 1, duration: .4, stagger: .15 }, .8)
      .to(pills, { opacity: 1, y: 0, duration: .4, stagger: .15 }, 1.0);
    /* 2 props (2.0 to 3.4) */
    tl.to(props, { y: 0, opacity: 1, duration: .8, stagger: .3, ease: 'power3.out' }, 2.0)
      .to(pills, { opacity: 0, duration: .3 }, 3.2);
    /* 3 lintel slides in (3.6 to 4.8) */
    tl.to(lintel, { x: 0, opacity: 1, duration: 1.0, ease: 'power2.inOut' }, 3.6);
    /* 4 cut blocks out (5.0 to 7.8) */
    tl.to(one('.w-view'), { opacity: 1, duration: .3 }, 4.95);
    var outAt = [];
    cuts.forEach(function (c, i) {
      var at = 5.0 + i * (2.6 / Math.max(1, N - 1));
      outAt.push(at + .15);
      tl.to(c, { opacity: 0, y: 26, rotation: (i % 2 ? 8 : -8), transformOrigin: '50% 50%', duration: .35, ease: 'power1.in' }, at);
    });
    tl.to(dims, { opacity: 0, duration: .3 }, 7.6);
    /* 5 frame and glass, props out, marking off (8.0 to 9.8) */
    tl.to(win, { opacity: 1, scale: 1, duration: .6 }, 8.0)
      .to(markRect, { opacity: 0, duration: .3 }, 8.0)
      .to(props, { y: 380, opacity: 0, duration: .7, stagger: .2, ease: 'power2.in' }, 8.7)
      .to(bar, { scaleX: 1, duration: 9.8, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.8);

    var phAt = [0, 0, 1.9, 3.5, 4.9, 7.9], lastP = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, c = 0;
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      for (var i = 0; i < outAt.length; i++) if (t >= outAt[i]) c++;
      if (c !== lastC) { lastC = c; cnt.textContent = c; lbl.textContent = 'blocchi tagliati e tolti su ' + N; }
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
