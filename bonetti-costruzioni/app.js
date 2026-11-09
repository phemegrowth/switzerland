(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* years since the commercial register entry (23.12.1993), whole years only */
  var numEl = document.querySelector('.hero__num');
  var years = 32;
  if (numEl) {
    var d0 = new Date(numEl.getAttribute('data-since-date') + 'T00:00:00'), now = new Date();
    years = now.getFullYear() - d0.getFullYear() - ((now.getMonth() < d0.getMonth() || (now.getMonth() === d0.getMonth() && now.getDate() < d0.getDate())) ? 1 : 0);
    numEl.textContent = years;
  }

  /* hero entrance on the first frame, number counts up */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () {
    hero.classList.add('is-in');
    if (reduce || !numEl) return;
    var t0 = performance.now(), dur = 1300;
    numEl.style.setProperty('--k', 0);
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3);
      numEl.textContent = Math.round(years * k);
      numEl.style.setProperty('--k', k.toFixed(3));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  });

  /* header */
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* menu */
  var burger = document.querySelector('.burger'), nav = document.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* reveals */
  var items = [].slice.call(document.querySelectorAll('.r')), groups = new Map();
  items.forEach(function (el) { var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1); el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's'); });
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* accordion */
  document.querySelectorAll('.acc__b').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc__i'), open = !item.classList.contains('is-open');
      document.querySelectorAll('.acc__i').forEach(function (i) { i.classList.remove('is-open'); i.querySelector('.acc__b').setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
    });
  });

  /* drag strip */
  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.abs(dx); strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: 'smooth' }); if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: 'smooth' }); });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.26) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form */
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

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.tr__steps li'));
    var names = steps.map(function (l) { return l.querySelector('span').textContent; });
    var descs = steps.map(function (l) { return l.querySelector('i').textContent; });
    var num = document.querySelector('.tr__num'), nm = document.querySelector('.tr__name'), ds = document.querySelector('.tr__desc'), bar = document.querySelector('.tr__bar');

    gsap.set('.tr .t-draw', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(['.t-north', '.t-scale', '.t-plot text', '.t-boards', '.t-strlab', '.t-345 text', '.t-345 path:not(.t-draw)', '.t-diglab', '.t-foundlab'], { opacity: 0 });
    gsap.set('.t-stake', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.t-digrect', { attr: { width: 0 } });

    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    var marks = [0, 1.3, 2.6, 4.3, 5.7];
    tl.to('.t-plot .t-draw', { strokeDashoffset: 0, duration: 1 }, 0)
      .to(['.t-north', '.t-scale', '.t-plot text'], { opacity: 1, duration: 0.4 }, 0.6)
      .to('.t-stake', { scale: 1, duration: 0.45, stagger: 0.18, ease: 'back.out(2)' }, 1.3)
      .to('.t-boards', { opacity: 1, duration: 0.3 }, 2.6)
      .to('.t-strings .t-draw', { strokeDashoffset: 0, duration: 0.6, stagger: 0.15 }, 2.75)
      .to('.t-strlab', { opacity: 1, duration: 0.3 }, 3.1)
      .to('.t-345 .t-draw', { strokeDashoffset: 0, duration: 0.35, stagger: 0.25 }, 3.4)
      .to(['.t-345 text', '.t-345 path:not(.t-draw)'], { opacity: 1, duration: 0.3, stagger: 0.1 }, 3.7)
      .to('.t-digrect', { attr: { width: 460 }, duration: 1, ease: 'none' }, 4.3)
      .to('.t-diglab', { opacity: 1, duration: 0.3 }, 5)
      .to('.t-345', { opacity: 0.35, duration: 0.3 }, 5.7)
      .to('.t-found .t-draw', { strokeDashoffset: 0, duration: 0.9, stagger: 0.3 }, 5.7)
      .to('.t-foundlab', { opacity: 1, duration: 0.3 }, 6.5)
      .to({}, { duration: 0.6 });

    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      num.textContent = '0' + (i + 1); nm.textContent = names[i]; ds.textContent = descs[i];
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.tr', pin: '.tr__pin', start: 'top top', end: mobile ? '+=180%' : '+=260%', scrub: 0.6, animation: tl,
      onUpdate: function (s) {
        var t = tl.time(), i = 0;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.05) i = k;
        setStep(i); bar.style.setProperty('--p', s.progress.toFixed(3));
      }
    });
    bar.style.setProperty('--p', 0);

    var line = document.querySelector('.steps__line');
    if (line) {
      line.style.setProperty('--p', 0);
      ScrollTrigger.create({ trigger: '.steps', start: 'top 80%', end: 'bottom 50%', onUpdate: function (s) { line.style.setProperty('--p', s.progress.toFixed(3)); } });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
