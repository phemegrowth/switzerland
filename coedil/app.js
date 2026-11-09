(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');

  /* hero: cards start stacked in the middle, fan out, then settle into the collage */
  if (!reduce && window.gsap) {
    var cards = gsap.utils.toArray('.card');
    var stack = document.querySelector('.stack');
    var sr = stack.getBoundingClientRect();
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var dx = (sr.left + sr.width / 2) - (r.left + r.width / 2), dy = (sr.top + sr.height / 2) - (r.top + r.height / 2);
      gsap.set(c, { x: dx, y: dy, rotation: (i - 1.5) * 4, scale: 0.86, opacity: 0, zIndex: 10 - i });
    });
    var htl = gsap.timeline({ delay: 0.05 });
    htl.to(cards, { opacity: 1, duration: 0.25, stagger: 0.04 })
       .to(cards, { rotation: function (i) { return (i - 1.5) * 12; }, x: function (i, el) { return gsap.getProperty(el, 'x') + (i - 1.5) * 30; }, duration: 0.45, ease: 'power2.out' }, 0.15)
       .to(cards, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.06 }, 0.55)
       .set(cards, { zIndex: 'auto' });
  }
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

  /* services counter follows the item in the middle of the screen */
  var cur = document.querySelector('.svc__cur');
  if (cur && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) cur.textContent = e.target.getAttribute('data-k'); }); }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.svc__i').forEach(function (li) { so.observe(li); });
  }

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.26) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l’indirizzo email.', type: 'Scegliete una voce.', message: 'Scrivete due righe sul progetto.' };
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

  /* crane geometry (same isometric projection as the drawing) */
  var S = 13, OX = 500, OY = 120;
  function P(X, Y, Z) { return [OX + (X - Y) * 0.866 * S, OY + (X + Y) * 0.5 * S - Z * S]; }
  var crane = document.querySelector('.i-crane');
  var C = crane ? [parseFloat(crane.getAttribute('data-cx')), parseFloat(crane.getAttribute('data-cy')), parseFloat(crane.getAttribute('data-cz'))] : null;
  var jib = { a: -30, len: 1 };
  function drawCrane() {
    if (!C) return;
    var rad = jib.a * Math.PI / 180, R = 21 * jib.len, Rc = 6 * jib.len;
    var top = P(C[0], C[1], C[2]);
    var end = P(C[0] + R * Math.cos(rad), C[1] + R * Math.sin(rad), C[2]);
    var cend = P(C[0] - Rc * Math.cos(rad), C[1] - Rc * Math.sin(rad), C[2]);
    var hk = P(C[0] + 0.72 * R * Math.cos(rad), C[1] + 0.72 * R * Math.sin(rad), C[2]);
    var hb = P(C[0] + 0.72 * R * Math.cos(rad), C[1] + 0.72 * R * Math.sin(rad), C[2] - 5 * jib.len);
    var j = crane.querySelector('.i-jib'), cj = crane.querySelector('.i-cjib'), cw = crane.querySelector('.i-cw'), h = crane.querySelector('.i-hook');
    j.setAttribute('x1', top[0]); j.setAttribute('y1', top[1]); j.setAttribute('x2', end[0]); j.setAttribute('y2', end[1]);
    cj.setAttribute('x1', top[0]); cj.setAttribute('y1', top[1]); cj.setAttribute('x2', cend[0]); cj.setAttribute('y2', cend[1]);
    cw.setAttribute('transform', 'translate(' + cend[0] + ' ' + cend[1] + ')');
    h.setAttribute('x1', hk[0]); h.setAttribute('y1', hk[1]); h.setAttribute('x2', hb[0]); h.setAttribute('y2', hb[1]);
  }
  drawCrane();

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.site__steps li'));
    var desc = document.querySelector('.site__desc');

    gsap.set('.site .i-draw', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(['.i-posts', '.i-lab1', '.i-lab2', '.i-lab3', '.i-lab4', '.i-arrow', '.i-crane'], { opacity: 0 });
    gsap.set('.i-box', { y: -70, opacity: 0 });
    gsap.set('.i-mat', { y: -50, opacity: 0 });
    gsap.set('.i-mast', { scaleY: 0, transformOrigin: '50% 100%' });
    jib.len = 0; jib.a = 135; drawCrane();

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to('.i-posts', { opacity: 1, duration: 0.3 }, 0)
      .to('.i-fence .i-draw', { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
      .to('.i-lab1', { opacity: 1, duration: 0.3 }, 0.8)
      .to('.i-box', { y: 0, opacity: 1, duration: 0.5, stagger: 0.25, ease: 'back.out(1.4)' }, 1.3)
      .to('.i-lab2', { opacity: 1, duration: 0.3 }, 2)
      .to('.i-mast', { scaleY: 1, duration: 0.7 }, 2.6)
      .to('.i-crane', { opacity: 1, duration: 0.1 }, 3.2)
      .to(jib, { len: 1, duration: 0.5, onUpdate: drawCrane }, 3.25)
      .to('.i-radius', { strokeDashoffset: 0, duration: 0.8, ease: 'none' }, 3.4)
      .to('.i-lab3', { opacity: 1, duration: 0.3 }, 3.8)
      .to('.i-mat', { y: 0, opacity: 1, duration: 0.45, stagger: 0.2, ease: 'back.out(1.4)' }, 4.2)
      .to('.i-path', { strokeDashoffset: 0, duration: 0.6, ease: 'none' }, 4.5)
      .to('.i-arrow', { opacity: 1, duration: 0.2 }, 5)
      .to('.i-lab4', { opacity: 1, duration: 0.3 }, 4.8)
      .to(jib, { a: -30, duration: 1.6, ease: 'power1.inOut', onUpdate: drawCrane }, 5.5)
      .to({}, { duration: 0.5 });
    var marks = [0, 1.3, 2.6, 4.2, 5.5];
    var c = -1;
    function setStep(i) {
      if (i === c) return; c = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      desc.textContent = steps[i].getAttribute('data-d');
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.site', pin: '.site__pin', start: 'top top', end: mobile ? '+=180%' : '+=260%', scrub: 0.6, animation: tl,
      onUpdate: function () { var t = tl.time(), i = 0; for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.05) i = k; setStep(i); }
    });

    var rl = document.querySelector('.relay__line');
    if (rl) { rl.style.setProperty('--p', 0); ScrollTrigger.create({ trigger: '.relay', start: 'top 80%', end: 'bottom 55%', onUpdate: function (s) { rl.style.setProperty('--p', s.progress.toFixed(3)); } }); }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
