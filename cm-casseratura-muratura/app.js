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

  /* two-way switch: casseratura / muratura */
  var sw = document.querySelector('.sw');
  if (sw) {
    var btns = [].slice.call(sw.querySelectorAll('.sw__b'));
    var pick = function (b) {
      btns.forEach(function (o) {
        var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-selected', String(on));
        document.getElementById(o.getAttribute('aria-controls')).classList.toggle('is-on', on);
      });
      sw.classList.toggle('is-m', b === btns[1]);
    };
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(b); });
      b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = btns[(i + 1) % 2]; n.focus(); pick(n); } });
    });
  }

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

  /* signature scene: a wall cast in board formwork, from panels to fair-faced concrete */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.getto__steps li'));
    var count = document.querySelector('.getto__k');
    var bar = document.querySelector('.getto__bar');
    if (mobile) document.querySelector('.getto__svg').setAttribute('viewBox', '30 40 600 490');

    gsap.set(['.m-panels', '.m-walers', '.m-plates', '.m-secform', '.m-secwal', '.m-secties', '.m-props', '.m-level'], { opacity: 1 });
    gsap.set(['.m-lab', '.m-holes', '.m-secholes', '.m-conc'], { opacity: 0 });
    gsap.set('.m-panel', { y: 60, opacity: 0 });
    gsap.set('.m-secform rect', { y: 40, opacity: 0 });
    gsap.set(['.m-waler', '.m-secwal rect'], { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(['.m-plate', '.m-secties path', '.m-secties rect'], { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.m-props path', { scale: 0, transformOrigin: '100% 0%' });
    gsap.set('.m-secconc', { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set('.m-level', { y: 470, opacity: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(['.m-l0', '.m-l1'], { opacity: 1, duration: 0.3 }, 0)
      .to('.m-secform rect', { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 }, 0.1)
      .to('.m-panel', { y: 0, opacity: 1, duration: 0.5, stagger: 0.14, ease: 'power3.out' }, 0.2)
      .to('.m-secties path, .m-secties rect', { scale: 1, duration: 0.25, stagger: 0.03 }, 1.2)
      .to('.m-l2', { opacity: 1, duration: 0.3 }, 1.25)
      .to(['.m-waler', '.m-secwal rect'], { scaleX: 1, duration: 0.5, stagger: 0.06 }, 1.4)
      .to('.m-plate', { scale: 1, duration: 0.2, stagger: 0.02, ease: 'back.out(2)' }, 1.7)
      .to('.m-props path', { scale: 1, duration: 0.4, stagger: 0.08 }, 1.9)
      .to('.m-l3', { opacity: 1, duration: 0.3 }, 2.1)
      .to('.m-level', { opacity: 1, duration: 0.15 }, 2.4)
      .to('.m-level', { y: 120, duration: 1.2, ease: 'none' }, 2.4)
      .to('.m-secconc', { scaleY: 1, duration: 1.2, ease: 'none' }, 2.4)
      .to('.m-l4', { opacity: 1, duration: 0.3 }, 2.9)
      .to('.m-conc', { opacity: 1, duration: 0.2 }, 3.5)
      .to('.m-level', { opacity: 0, duration: 0.2 }, 3.6)
      .to(['.m-l2', '.m-l3'], { opacity: 0, duration: 0.25 }, 3.8)
      .to('.m-props path', { scale: 0, duration: 0.35, stagger: 0.05, ease: 'power2.in' }, 3.8)
      .to(['.m-plate', '.m-secties'], { opacity: 0, duration: 0.25 }, 4.0)
      .to(['.m-waler', '.m-secwal rect'], { scaleX: 0, transformOrigin: '100% 50%', duration: 0.4, stagger: 0.05, ease: 'power2.in' }, 4.05)
      .to('.m-holes', { opacity: 1, duration: 0.2 }, 4.3)
      .to('.m-secholes', { opacity: 1, duration: 0.2 }, 4.3)
      .to('.m-panel', { y: -50, opacity: 0, duration: 0.45, stagger: 0.12, ease: 'power2.in' }, 4.3)
      .to('.m-secform rect', { x: function (i) { return i ? 40 : -40; }, opacity: 0, duration: 0.45 }, 4.3)
      .to('.m-l1', { opacity: 0, duration: 0.25 }, 4.4)
      .to(['.m-l5', '.m-l6'], { opacity: 1, duration: 0.35, stagger: 0.15 }, 5.0)
      .to({}, { duration: 0.6 });

    var marks = [0, 1.2, 2.4, 3.8, 5.0];
    var c = -1;
    function setStep(i) {
      if (i === c) return; c = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      count.textContent = '0' + (i + 1);
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.getto', pin: '.getto__pin', start: 'top top', end: mobile ? '+=190%' : '+=280%', scrub: 0.6, animation: tl,
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
