(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var burger = document.querySelector('.burger'), nav = document.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  var items = [].slice.call(document.querySelectorAll('.r')), groups = new Map();
  items.forEach(function (el) { var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1); el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's'); });
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  document.querySelectorAll('[data-count]').forEach(function (el) {
    var since = el.getAttribute('data-since');
    var target = since ? new Date().getFullYear() - parseInt(since, 10) : parseInt(el.getAttribute('data-count'), 10);
    el.textContent = target;
    if (reduce) return;
    var o = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 1300); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * k); if (k < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* gallery: thumbnails swap the big photo */
  var big = document.querySelector('.gal__img'), cap = document.querySelector('.gal__cap');
  document.querySelectorAll('.gal__t').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('.gal__t').forEach(function (o) { o.classList.remove('is-on'); o.setAttribute('aria-selected', 'false'); });
      t.classList.add('is-on'); t.setAttribute('aria-selected', 'true');
      var swap = function () { big.src = t.getAttribute('data-src'); big.width = +t.getAttribute('data-w'); big.height = +t.getAttribute('data-h'); big.alt = t.getAttribute('data-alt'); cap.textContent = t.getAttribute('data-cap'); big.classList.remove('is-swap'); };
      if (reduce) { swap(); return; }
      big.classList.add('is-swap'); setTimeout(swap, 300);
    });
  });

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.26) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

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
    var steps = [].slice.call(document.querySelectorAll('.beam__steps li'));
    var bar = document.querySelector('.beam__bar');

    gsap.set('.b-bar', { x: -720, opacity: 0 });
    gsap.set('.b-st', { scaleY: 0, transformOrigin: '50% 50%' });
    gsap.set('.b-sp', { y: 14, opacity: 0 });
    gsap.set(['.b-form', '.b-secform'], { y: 30, opacity: 0 });
    gsap.set('.b-cliprect', { attr: { y: 340, height: 0 } });
    gsap.set(['.b-secconc', '.b-cover', '.b-lab'], { opacity: 0 });
    gsap.set('.b-secbar', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.b-secst', { strokeDasharray: 520, strokeDashoffset: 520 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to('.b-bar', { x: 0, opacity: 1, duration: 0.9, stagger: 0.2 }, 0)
      .to('.b-secbar', { scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' }, 0.5)
      .to('.b-l1', { opacity: 1, duration: 0.3 }, 0.6)
      .to('.b-st', { scaleY: 1, duration: 0.25, stagger: 0.045, ease: 'back.out(2)' }, 1.2)
      .to('.b-secst', { strokeDashoffset: 0, duration: 0.6 }, 1.3)
      .to('.b-l2', { opacity: 1, duration: 0.3 }, 1.6)
      .to('.b-sp', { y: 0, opacity: 1, duration: 0.3, stagger: 0.1 }, 2.6)
      .to('.b-cover', { opacity: 1, duration: 0.3 }, 2.9)
      .to('.b-l3', { opacity: 1, duration: 0.3 }, 2.8)
      .to(['.b-form', '.b-secform'], { y: 0, opacity: 1, duration: 0.7 }, 3.6)
      .to('.b-l4', { opacity: 1, duration: 0.3 }, 4)
      .to('.b-cliprect', { attr: { y: 200, height: 140 }, duration: 1, ease: 'none' }, 4.8)
      .to('.b-secconc', { opacity: 1, duration: 1, ease: 'none' }, 4.8)
      .to(['.b-bars', '.b-sts', '.b-sps'], { opacity: 0.32, duration: 0.4 }, 5.6)
      .to(['.b-l1', '.b-l2', '.b-l3'], { opacity: 0, duration: 0.3 }, 5.6)
      .to('.b-l5', { opacity: 1, duration: 0.3 }, 5.8)
      .to(['.b-form', '.b-secform', '.b-l4'], { y: 40, opacity: 0, duration: 0.6, ease: 'power2.in' }, 6.1)
      .to({}, { duration: 0.6 });
    var marks = [0, 1.2, 2.6, 3.6, 4.8];
    var c = -1;
    function setStep(i) { if (i === c) return; c = i; steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.beam', pin: '.beam__pin', start: 'top top', end: mobile ? '+=180%' : '+=260%', scrub: 0.6, animation: tl,
      onUpdate: function (s) { var t = tl.time(), i = 0; for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.05) i = k; setStep(i); bar.style.setProperty('--p', s.progress.toFixed(3)); }
    });
    bar.style.setProperty('--p', 0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
