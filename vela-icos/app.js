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
      (function step(t) { var k = Math.min(1, (t - t0) / 1400); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * k); if (k < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.16) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.26) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l’indirizzo email.', type: 'Scegliete un argomento.', message: 'Scrivete due righe.' };
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

    /* hero reel drifts left as the page scrolls */
    gsap.to('.reel__track', { xPercent: mobile ? -38 : -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 } });

    /* borehole scene */
    var T = 6, MAX = 14;
    var steps = [].slice.call(document.querySelectorAll('.bh__steps li'));
    var names = steps.map(function (l) { return l.querySelector('span').textContent; });
    var descs = steps.map(function (l) { return l.querySelector('i').textContent; });
    var num = document.querySelector('.bh__num'), nm = document.querySelector('.bh__name'), ds = document.querySelector('.bh__desc'), dp = document.querySelector('.bh__depth'), bar = document.querySelector('.bh__bar');
    function tAt(d) { return d * T / MAX; }

    gsap.set('.s-rod', { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set('.c-seg', { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set('.s-name', { opacity: 0 });
    gsap.set('.s-pile', { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(['.s-foot', '.s-pilelab'], { opacity: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to('.s-rod', { scaleY: 1, duration: T }, 0)
      .to('.s-bit', { y: 470, duration: T }, 0);
    document.querySelectorAll('.c-seg').forEach(function (s) {
      var a = parseFloat(s.getAttribute('data-d0')), b = parseFloat(s.getAttribute('data-d1'));
      tl.to(s, { scaleX: 1, duration: Math.max(0.05, tAt(b) - tAt(a)) }, tAt(a));
    });
    document.querySelectorAll('.s-name').forEach(function (n) { tl.to(n, { opacity: 1, duration: 0.2 }, tAt(parseFloat(n.getAttribute('data-d'))) + 0.05); });
    tl.to(['.s-rod'], { scaleY: 0, duration: 0.6, ease: 'power2.in' }, T + 0.4)
      .to('.s-bit', { y: 0, duration: 0.6, ease: 'power2.in' }, T + 0.4)
      .to('.s-pile', { scaleY: 1, duration: 0.9, stagger: 0.2, ease: 'power2.out' }, T + 0.8)
      .to('.s-foot', { opacity: 1, duration: 0.3 }, T + 1.8)
      .to('.s-pilelab', { opacity: 1, duration: 0.3 }, T + 2)
      .to({}, { duration: 0.6 });
    var marks = [0, tAt(0.9), tAt(4.8), tAt(10.2), T + 0.4];

    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      num.textContent = '0' + (i + 1); nm.textContent = names[i]; ds.textContent = descs[i];
    }
    setStep(0); dp.textContent = '0,0';
    ScrollTrigger.create({
      trigger: '.bh', pin: '.bh__pin', start: 'top top', end: mobile ? '+=190%' : '+=280%', scrub: 0.6, animation: tl,
      onUpdate: function (s) {
        var t = tl.time(), i = 0;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.02) i = k;
        setStep(i);
        dp.textContent = Math.min(MAX, t * MAX / T).toFixed(1).replace('.', ',');
        bar.style.setProperty('--p', s.progress.toFixed(3));
      }
    });
    bar.style.setProperty('--p', 0);

    var pl = document.querySelector('.proc__list');
    if (pl) { pl.style.setProperty('--p', 0); ScrollTrigger.create({ trigger: pl, start: 'top 75%', end: 'bottom 60%', onUpdate: function (s) { pl.style.setProperty('--p', s.progress.toFixed(3)); } }); }

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
