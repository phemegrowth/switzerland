(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  /* header shrink */
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  var burger = document.querySelector('.burger'), nav = document.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* reveals, with the above-the-fold guard */
  var items = [].slice.call(document.querySelectorAll('.r')), groups = new Map();
  items.forEach(function (el) { var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1); el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's'); });
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* accordion with height animation (grid rows) */
  document.querySelectorAll('.acc__b').forEach(function (b, i) {
    var panel = document.getElementById(b.getAttribute('aria-controls'));
    if (b.getAttribute('aria-expanded') === 'true') panel.classList.add('is-open');
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      document.querySelectorAll('.acc__b').forEach(function (o) {
        if (o !== b) { o.setAttribute('aria-expanded', 'false'); document.getElementById(o.getAttribute('aria-controls')).classList.remove('is-open'); }
      });
      b.setAttribute('aria-expanded', String(open)); panel.classList.toggle('is-open', open);
    });
  });

  /* count-up: years since a sourced founding year */
  document.querySelectorAll('[data-since]').forEach(function (el) {
    var target = new Date().getFullYear() - parseInt(el.getAttribute('data-since'), 10);
    el.textContent = target;
    if (reduce || !('IntersectionObserver' in window)) return;
    var o = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 1300); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * k); if (k < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l’indirizzo email.', type: 'Scegliete il tipo di lavoro.', message: 'Scrivete due righe sul lavoro.' };
    var check = function (el) {
      var f = el.closest('.f'), v = el.value.trim(), ok = v.length > 0;
      if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (ok && el.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      f.classList.toggle('is-bad', !ok); f.querySelector('.f__err').textContent = ok ? '' : (msgs[el.name] || 'Campo obbligatorio.');
      el.setAttribute('aria-invalid', String(!ok)); return ok;
    };
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (el) { el.addEventListener('blur', function () { check(el); }); el.addEventListener('input', function () { if (el.closest('.f').classList.contains('is-bad')) check(el); }); });
    form.addEventListener('submit', function (e) { var first = null; fields.forEach(function (el) { if (!check(el) && !first) first = el; }); if (first) { e.preventDefault(); first.focus(); } });
  }
  document.querySelectorAll('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene: a plaster cornice run in place with a profiled template */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.cor__steps li'));
    if (mobile) document.querySelector('.cor__svg').setAttribute('viewBox', '110 20 600 330');
    var count = document.querySelector('.cor__k');
    var bar = document.querySelector('.cor__bar');
    var prof = document.querySelector('.c-prof');
    var len = prof.getTotalLength();

    gsap.set(prof, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(['.c-fill', '.c-lab', '.c-shadow'], { opacity: 0 });
    gsap.set('.c-proj', { opacity: 1 });
    gsap.set('.c-proj path', { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set('.c-plate', { opacity: 0, x: -70 });
    gsap.set('.c-tpl', { opacity: 0, y: -24 });
    gsap.set('.c-rail', { opacity: 1, scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set('.c-runrect', { attr: { width: 0 } });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to('.c-l0', { opacity: 1, duration: 0.3 }, 0.05)
      .to(prof, { strokeDashoffset: 0, duration: 0.9, ease: 'none' }, 0.15)
      .to('.c-fill', { opacity: 1, duration: 0.3 }, 0.9)
      .to('.c-proj path', { scaleX: 1, duration: 0.35, stagger: 0.05 }, 0.85)
      .to('.c-plate', { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 1.2)
      .to('.c-l1', { opacity: 1, duration: 0.3 }, 1.55)
      .to('.c-tpl', { opacity: 1, y: 0, duration: 0.5 }, 1.75)
      .to('.c-rail', { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 2.4)
      .to('.c-l2', { opacity: 1, duration: 0.3 }, 2.9)
      .to('.c-tpl', { x: 540, duration: 1.9, ease: 'none' }, 3.4)
      .to('.c-runrect', { attr: { width: 548 }, duration: 1.9, ease: 'none' }, 3.4)
      .to('.c-l3', { opacity: 1, duration: 0.3 }, 4.4)
      .to(['.c-rail', '.c-tpl', '.c-plate', '.c-l1', '.c-l2', '.c-proj'], { opacity: 0, duration: 0.45 }, 5.4)
      .to('.c-shadow', { opacity: 1, duration: 0.5 }, 5.6)
      .to({}, { duration: 0.5 });

    var marks = [0, 1.2, 2.4, 3.4, 5.4];
    var c = -1;
    function setStep(i) {
      if (i === c) return; c = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      count.textContent = '0' + (i + 1);
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.cor', pin: '.cor__pin', start: 'top top', end: mobile ? '+=190%' : '+=280%', scrub: 0.6, animation: tl,
      onUpdate: function (s) {
        var t = tl.time(), i = 0;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.02) i = k;
        setStep(i); bar.style.setProperty('--p', s.progress.toFixed(3));
      }
    });
    bar.style.setProperty('--p', 0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
