/* F.lli Somaini SA: hero entrance (grid, frame, photo), header, menu, anchors, reveals, count-up, accordion,
   process line, magnetic buttons, form, and the GSAP signature scene: a section through the ground where the scroll
   digs the pit, casts the slab, raises basement walls and pipes, backfills with inert material and stacks precast elements. */
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

  /* count-up of a sourced quantity (years of activity) when the proof band comes into view */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* accordion (one open at a time) */
  var acc = d.querySelector('[data-acc]');
  if (acc) {
    var its = acc.querySelectorAll('.acc__it');
    its.forEach(function (it) {
      var b = it.querySelector('button');
      b.addEventListener('click', function () {
        var open = !it.classList.contains('is-open');
        its.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
        if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (l) {
    var st = l.querySelectorAll('.step');
    function draw() {
      var r = l.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.15)));
      l.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
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
    sectionScene(window.innerWidth < 860);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function sectionScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var stages = q('.stages li');
    var ui = { n: q1('[data-s-n]'), t: q1('[data-s-t]'), d: q1('[data-s-d]'), q: q1('[data-q]') };
    var pit = q1('[data-pit]'), slab = q1('[data-slab]'), rebar = q1('[data-rebar]');
    var walls = q('[data-wall]'), s0 = q1('[data-s0]'), pipe = q1('[data-pipe]'), fills = q('[data-fill]');
    var pre = q('[data-pre]'), mark = q1('[data-mark]'), lbl = q('.lbl');
    function L(i) { return sec.querySelector('.lbl[data-l="' + i + '"]'); }

    gsap.set(pit, { attr: { height: 0 } });
    gsap.set(slab, { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(rebar, { strokeDashoffset: 1 });
    gsap.set(walls, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(s0, { scaleX: 0, transformOrigin: '50% 50%' });
    gsap.set(pipe, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(fills, { attr: { y: 480, height: 0 } });
    gsap.set(pre, { autoAlpha: 0, y: -90 });
    gsap.set(lbl, { autoAlpha: 0 });
    gsap.set(mark, { y: 246 });

    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      ui.n.textContent = '0' + (i + 1);
      ui.t.textContent = stages[i].getAttribute('data-t');
      ui.d.textContent = stages[i].getAttribute('data-d');
      ui.q.textContent = stages[i].getAttribute('data-q');
    }
    var cuts = [1.25, 2.1, 3.2, 4.0];
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { var t = tl.time(), i = 0; while (i < cuts.length && t >= cuts[i]) i++; show(i); },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(q('.scene__text > .eyebrow, .scene__text > .h2, .stage, .gauge'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0)
      /* 1. dig */
      .to(L(0), { autoAlpha: 1, duration: 0.15 }, 0.3)
      .to(pit, { attr: { height: 170 }, duration: 0.85, ease: 'power1.inOut' }, 0.35)
      .to(mark, { y: 416, duration: 0.85, ease: 'power1.inOut' }, 0.35)
      /* 2. foundations */
      .to(L(0), { autoAlpha: 0, duration: 0.15 }, 1.25)
      .to(L(1), { autoAlpha: 1, duration: 0.15 }, 1.3)
      .to(rebar, { strokeDashoffset: 0, duration: 0.35 }, 1.3)
      .to(slab, { scaleX: 1, duration: 0.45, ease: 'power2.out' }, 1.55)
      /* 3. basement walls, ground slab, pipe */
      .to(L(1), { autoAlpha: 0, duration: 0.15 }, 2.1)
      .to(walls, { scaleY: 1, duration: 0.55, stagger: 0.08, ease: 'power2.out' }, 2.15)
      .to(mark, { y: 246, duration: 0.6, ease: 'power1.inOut' }, 2.15)
      .to(s0, { scaleX: 1, duration: 0.3 }, 2.7)
      .to(L(2), { autoAlpha: 1, duration: 0.15 }, 2.75)
      .to(pipe, { strokeDashoffset: 0, duration: 0.4 }, 2.75)
      /* 4. backfill */
      .to(L(2), { autoAlpha: 0, duration: 0.15 }, 3.2)
      .to(L(3), { autoAlpha: 1, duration: 0.15 }, 3.25)
      .to(fills, { attr: { y: 330, height: 150 }, duration: 0.6, ease: 'power1.out' }, 3.3)
      /* 5. precast elements above ground */
      .to(L(3), { autoAlpha: 0, duration: 0.15 }, 4.0)
      .to(pre, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.14, ease: 'power3.out' }, 4.05)
      .to(mark, { y: 0, duration: 1.2, ease: 'power1.inOut' }, 4.05)
      .to(L(4), { autoAlpha: 1, duration: 0.2 }, 4.6)
      .to({}, { duration: 0.6 });
    show(0);
  }
})();
