(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* the name fills the width exactly: ink of R on the left edge, ink of A on the right edge */
  var nameEl = document.querySelector('.hero__name');
  var cv = document.createElement('canvas').getContext('2d');
  function fitName() {
    if (!nameEl) return;
    var hls = nameEl.querySelectorAll('.hl'), first = hls[0], last = hls[hls.length - 1];
    nameEl.style.fontSize = ''; first.style.marginLeft = ''; last.style.marginRight = '';
    var box = nameEl.clientWidth, cs = getComputedStyle(nameEl), fs = parseFloat(cs.fontSize);
    if (!box || !fs) return;
    var adv = 0; hls.forEach(function (l) { adv += l.firstElementChild.getBoundingClientRect().width; });
    fs = fs * (box * 0.94) / adv;
    cv.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
    var r = cv.measureText('R'), a = cv.measureText('A');
    var bl = -r.actualBoundingBoxLeft, br = a.width - a.actualBoundingBoxRight;
    var pad = parseFloat(getComputedStyle(first).paddingLeft) || 0;
    nameEl.style.fontSize = fs.toFixed(1) + 'px';
    first.style.marginLeft = (-(bl + pad)).toFixed(1) + 'px';
    last.style.marginRight = (-(br + pad)).toFixed(1) + 'px';
  }
  fitName();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(fitName, 150); });

  /* hero entrance on the first frame */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  /* hero strip drifts left with the scroll (transform only) */
  var track = document.querySelector('.hero__track');
  if (track && !reduce) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.4);
      track.style.transform = 'translate3d(' + (-y * 0.32).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
  }

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

  /* years since 1 Oct 1994, whole years; counts up once visible */
  var count = document.querySelector('.count'), years = 32;
  if (count) {
    var d0 = new Date(count.getAttribute('data-since') + 'T00:00:00'), now = new Date();
    years = now.getFullYear() - d0.getFullYear() - ((now.getMonth() < d0.getMonth() || (now.getMonth() === d0.getMonth() && now.getDate() < d0.getDate())) ? 1 : 0);
    count.textContent = years;
  }
  function countUp() {
    if (reduce || !count || count.dataset.done) return; count.dataset.done = '1';
    var t0 = performance.now(), dur = 1400;
    (function step(t) { var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3); count.textContent = Math.round(years * k); if (k < 1) requestAnimationFrame(step); })(t0);
  }

  /* reveals */
  var items = [].slice.call(document.querySelectorAll('.r')), groups = new Map();
  items.forEach(function (el) { var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1); el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's'); });
  function show(el) { el.classList.add('is-in'); if (el.querySelector && el.querySelector('.count')) countUp(); }
  if (reduce || !('IntersectionObserver' in window)) items.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el); });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px)'; });
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
    var steps = [].slice.call(document.querySelectorAll('.sc__steps li'));
    var NAMES = ['Fondazione', 'Armatura', 'Cassero', 'Tiranti', 'Getto', 'Disarmo'];
    var DESCS = [
      'Sulla fondazione restano i ferri d’attesa. Il muro parte da lì.',
      'Si posa la rete di ferri, legata e distanziata dal bordo.',
      'I pannelli del cassero si chiudono sui due lati del muro.',
      'I tiranti tengono insieme le due facce e fissano lo spessore.',
      'Il calcestruzzo entra dall’alto e viene vibrato, strato dopo strato.',
      'Tolti i pannelli resta il muro, con i fori dei tiranti al loro posto.'
    ];
    var num = document.querySelector('.sc__num'), nm = document.querySelector('.sc__name'), ds = document.querySelector('.sc__desc'), bar = document.querySelector('.sc__bar');
    var pct = document.querySelector('.s-pct');

    /* start state: everything out of sight */
    gsap.set('.sc .s-draw', { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(['.s-start', '.s-mesh'], { opacity: 1 });
    gsap.set('.s-foot', { opacity: 0 });
    gsap.set('.s-wall', { opacity: 0 });
    gsap.set('.s-pl', { x: -470, opacity: 0 });
    gsap.set('.s-pr', { x: 470, opacity: 0 });
    gsap.set('.s-ties', { opacity: 1 });
    gsap.set('.s-tie', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.s-pour', { opacity: 1 });
    gsap.set('.s-pourrect', { attr: { y: 733, height: 0 } });
    gsap.set('.s-level', { opacity: 0, y: 733 });
    gsap.set('.s-lab', { opacity: 0 });
    gsap.set('.c-bars', { opacity: 0 });
    gsap.set('.c-pl', { x: -46, opacity: 0 });
    gsap.set('.c-pr', { x: 46, opacity: 0 });
    gsap.set('.c-tie', { opacity: 0 });
    gsap.set('.c-hole', { opacity: 0 });
    gsap.set('.c-fill', { scaleY: 0, transformOrigin: '50% 100%' });

    if (mobile) {
      document.querySelector('.sc__svg').setAttribute('viewBox', '178 30 648 762');
      var pill = document.querySelector('.s-pill'); if (pill) pill.setAttribute('transform', 'translate(640 0)');
    }
    var level = { v: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    var marks = [0, 1.2, 2.6, 3.8, 4.9, 6.4];
    tl
      /* 1 footing and starter bars */
      .to('.s-foot', { opacity: 1, duration: 0.4 }, 0)
      .to('.s-start .s-draw', { strokeDashoffset: 0, duration: 0.8 }, 0.2)
      .to('.s-lab1', { opacity: 1, duration: 0.3 }, 0.75)
      /* 2 rebar mesh */
      .to('.s-lab1', { opacity: 0, duration: 0.25 }, 1.2)
      .to('.s-mesh .s-v', { strokeDashoffset: 0, duration: 0.7 }, 1.2)
      .to('.s-mesh .s-h', { strokeDashoffset: 0, duration: 0.7 }, 1.55)
      .to('.c-bars', { opacity: 1, duration: 0.4 }, 1.3)
      .to('.s-lab2', { opacity: 1, duration: 0.3 }, 2.0)
      /* 3 formwork panels close on the wall */
      .to('.s-lab2', { opacity: 0, duration: 0.25 }, 2.6)
      .to('.s-pl', { x: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }, 2.6)
      .to('.s-pr', { x: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }, 2.75)
      .to(['.c-pl', '.c-pr'], { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 2.65)
      .to('.s-lab3', { opacity: 1, duration: 0.3 }, 3.3)
      /* 4 tie rods */
      .to('.s-lab3', { opacity: 0, duration: 0.25 }, 3.8)
      .to('.s-tie', { scale: 1, duration: 0.35, stagger: 0.07, ease: 'back.out(2.2)' }, 3.8)
      .to('.c-tie', { opacity: 1, duration: 0.3 }, 3.9)
      .to('.s-lab4', { opacity: 1, duration: 0.3 }, 4.35)
      /* 5 pour: level rises, percentage follows */
      .to('.s-lab4', { opacity: 0, duration: 0.25 }, 4.9)
      .to('.s-level', { opacity: 1, duration: 0.2 }, 4.9)
      .to(level, { v: 1, duration: 1.2, ease: 'none', onUpdate: function () {
        var h = 693 * level.v;
        gsap.set('.s-pourrect', { attr: { y: 733 - h, height: h } });
        gsap.set('.s-level', { y: 733 - h });
        gsap.set('.c-fill', { scaleY: level.v });
        if (pct) pct.textContent = Math.round(level.v * 100);
      } }, 5.0)
      .set('.s-wall', { opacity: 1 }, 6.2)
      .set(['.s-mesh', '.s-start'], { opacity: 0 }, 6.2)
      /* 6 stripping: panels go, the wall stays with the tie holes */
      .to(['.s-level', '.s-pour'], { opacity: 0, duration: 0.25 }, 6.4)
      .to('.s-tie', { scale: 0, duration: 0.3, stagger: 0.03, ease: 'power2.in' }, 6.45)
      .to('.c-tie', { opacity: 0, duration: 0.3 }, 6.45)
      .to('.c-hole', { opacity: 1, duration: 0.3 }, 6.7)
      .to('.s-pl', { x: -470, opacity: 0, duration: 0.85, ease: 'power2.in' }, 6.6)
      .to('.s-pr', { x: 470, opacity: 0, duration: 0.85, ease: 'power2.in' }, 6.7)
      .to('.c-pl', { x: -46, opacity: 0, duration: 0.6 }, 6.6)
      .to('.c-pr', { x: 46, opacity: 0, duration: 0.6 }, 6.7)
      .to(['.s-lab6', '.s-lab6b'], { opacity: 1, duration: 0.35, stagger: 0.12 }, 7.3)
      .to({}, { duration: 0.7 });

    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      num.textContent = '0' + (i + 1); nm.textContent = NAMES[i]; ds.textContent = DESCS[i];
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.sc', pin: '.sc__pin', start: 'top top', end: mobile ? '+=200%' : '+=280%', scrub: 0.6, animation: tl,
      onUpdate: function (s) {
        var t = tl.time(), i = 0;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.02) i = k;
        setStep(i); bar.style.setProperty('--p', s.progress.toFixed(3));
      }
    });
    bar.style.setProperty('--p', 0);

    var line = document.querySelector('.steps__line');
    if (line) {
      line.style.setProperty('--p', 0);
      ScrollTrigger.create({ trigger: '.steps', start: 'top 80%', end: 'bottom 55%', onUpdate: function (s) { line.style.setProperty('--p', s.progress.toFixed(3)); } });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
