/* Maggetti homepage: hero (gable photo opens, line reveal, count-up of a sourced figure), header, menu, anchors, reveals,
   process line, magnetic buttons, form, and the GSAP signature scene: a weathered palazzina is surveyed, scaffolded,
   renewed from the bottom up, clad, and handed back (vector before/after scrub). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero figure: 0 to 15 (years active since March 2011), starts at once */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    el.textContent = '0';
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    setTimeout(function () { requestAnimationFrame(step); }, 200);
  });

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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var st = list.querySelectorAll('.step');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.78 - r.top) / (r.height + vh * 0.2)));
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
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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
    facadeScene(window.innerWidth < 860);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function facadeScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var stages = q('.stages li');
    var ui = { n: q1('[data-s-n]'), t: q1('[data-s-t]'), d: q1('[data-s-d]') }, meter = q1('[data-meter]');
    var rev = q1('[data-reveal]'), edge = q1('[data-edge]');
    var marks = q('.mk'), pills = q('.mk .pill'), circles = q('.mk circle');
    var poles = q('.scaf__poles rect'), decks = q('.scaf__deck rect, .scaf__toe rect'), brace = q1('.scaf__brace');
    var plinth = q1('.clad__plinth'), sills = q('.clad__sill rect');
    var bl = 900; try { bl = Math.ceil(brace.getTotalLength()) + 2; } catch (e) {}

    gsap.set([q1('.scaf'), q1('.diag')], { opacity: 1 });
    gsap.set(circles, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(pills, { autoAlpha: 0, y: 6 });
    gsap.set(poles, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(decks, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(brace, { strokeDasharray: bl, strokeDashoffset: bl });
    gsap.set(rev, { attr: { y: 600, height: 40 } });
    gsap.set(plinth, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(sills, { autoAlpha: 0 });
    gsap.set(meter, { scaleX: 0 });

    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      ui.n.textContent = '0' + (i + 1);
      ui.t.textContent = stages[i].getAttribute('data-t');
      ui.d.textContent = stages[i].getAttribute('data-d');
    }
    var cuts = [1.3, 2.3, 3.9, 4.6];
    var rv = { y: 600 };
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { var t = tl.time(), i = 0; while (i < cuts.length && t >= cuts[i]) i++; show(i); },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=200%' : '+=280%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(q('.scene__text > .eyebrow, .scene__text > .h2, .stage, .meter'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0)
      /* 1. survey */
      .to(circles, { scale: 1, duration: 0.35, stagger: 0.18, ease: 'back.out(2)' }, 0.35)
      .to(pills, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.18 }, 0.5)
      /* 2. scaffold */
      .to(marks, { autoAlpha: 0, duration: 0.25 }, 1.3)
      .to(poles, { scaleY: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, 1.35)
      .to(decks, { scaleX: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }, 1.6)
      .to(brace, { strokeDashoffset: 0, duration: 0.5 }, 1.75)
      /* 3. renewal, bottom to top */
      .to(edge, { opacity: 1, duration: 0.1 }, 2.3)
      .to(rv, { y: 88, duration: 1.5, ease: 'power1.inOut', onUpdate: function () {
        rev.setAttribute('y', rv.y.toFixed(1)); rev.setAttribute('height', (640 - rv.y).toFixed(1));
        edge.setAttribute('y1', rv.y.toFixed(1)); edge.setAttribute('y2', rv.y.toFixed(1));
      } }, 2.35)
      .to(meter, { scaleX: 0.8, duration: 1.5, ease: 'power1.inOut' }, 2.35)
      .to(edge, { opacity: 0, duration: 0.15 }, 3.85)
      /* 4. cladding and sills */
      .to(plinth, { scaleX: 1, duration: 0.4, ease: 'power2.out' }, 3.95)
      .to(sills, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, 4.05)
      .to(meter, { scaleX: 0.92, duration: 0.5 }, 3.95)
      /* 5. scaffold comes down */
      .to(q1('.scaf'), { y: 40, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 4.65)
      .to(meter, { scaleX: 1, duration: 0.5 }, 4.7)
      .to({}, { duration: 0.45 });
    show(0);
  }
})();
