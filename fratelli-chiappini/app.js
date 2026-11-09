(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* hero entrance on the first frame */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero && hero.classList.add('is-in'); });

  /* header shrink */
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu */
  var burger = document.querySelector('.burger'), nav = document.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* reveals */
  var items = [].slice.call(document.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement; var i = groups.get(p) || 0; groups.set(p, i + 1);
    el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
  });
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  }

  /* count-up (quantities only) */
  var nums = document.querySelectorAll('[data-count]');
  nums.forEach(function (el) {
    var since = el.getAttribute('data-since');
    var target = since ? new Date().getFullYear() - parseInt(since, 10) : parseInt(el.getAttribute('data-count'), 10);
    el.textContent = target;
    if (reduce) return;
    var done = false;
    function run() {
      if (done) return; done = true;
      var t0 = performance.now(), d = 1400;
      (function step(t) {
        var k = Math.min(1, (t - t0) / d); k = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * k);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    var o = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.6 });
    o.observe(el);
  });

  /* services: active item swaps the photo (hover, focus, tap, and scroll on phones) */
  var svcItems = [].slice.call(document.querySelectorAll('.svc__i'));
  var figs = [].slice.call(document.querySelectorAll('.svc__fig'));
  function setSvc(k) {
    svcItems.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-k') === k); });
    figs.forEach(function (f) { f.classList.toggle('is-on', f.getAttribute('data-k') === k); });
  }
  svcItems.forEach(function (li) {
    var k = li.getAttribute('data-k');
    li.addEventListener('mouseenter', function () { setSvc(k); });
    li.addEventListener('focus', function () { setSvc(k); });
    li.addEventListener('click', function () { setSvc(k); });
  });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) setSvc(en.target.getAttribute('data-k')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    svcItems.forEach(function (li) { so.observe(li); });
  }

  /* magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l’indirizzo email.', type: 'Scegliete il tipo di lavoro.', message: 'Scrivete due righe sul lavoro.' };
    function check(el) {
      var f = el.closest('.f'); if (!f) return true;
      var v = el.value.trim(), ok = v.length > 0;
      if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (ok && el.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      f.classList.toggle('is-bad', !ok);
      f.querySelector('.f__err').textContent = ok ? '' : (msgs[el.name] || 'Campo obbligatorio.');
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    }
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.f').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (el) { if (!check(el) && !first) first = el; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* year */
  document.querySelectorAll('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP: signature wall scene + timeline line */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.wall__steps li'));
    var num = document.querySelector('.wall__num'), now = document.querySelector('.wall__now');
    var names = steps.map(function (li) { return li.querySelector('h3').textContent; });
    var descs = steps.map(function (li) { return li.querySelector('p').textContent; });
    var desc = document.querySelector('.wall__desc');
    var courses = [].slice.call(document.querySelectorAll('.w-stones .crs'));

    gsap.set(['.w-trench', '.w-gravel', '.w-lab0', '.w-plumb', '.w-lead'], { opacity: 0 });
    courses.forEach(function (c) {
      gsap.set(c.querySelector('.bk'), { opacity: 0 });
      c.querySelectorAll('.sw').forEach(function (s) {
        gsap.set(s, { y: -160 - Math.random() * 80, opacity: 0, rotation: parseFloat(s.getAttribute('data-r')) || 0 });
      });
    });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var marks = [];
    function course(i, at) {
      var c = courses[i];
      var st = c.querySelectorAll('.sw');
      tl.to(c.querySelector('.bk'), { opacity: 1, duration: 0.3 }, at);
      tl.to(st, { y: 0, opacity: 1, rotation: 0, duration: 0.55, stagger: { each: 0.9 / st.length, from: i % 2 ? 'end' : 'start' }, ease: 'back.out(1.1)' }, at);
    }
    marks.push(0);
    tl.to('.w-trench', { opacity: 1, duration: 0.3 }, 0).to('.w-gravel', { opacity: 1, duration: 0.3 }, 0.15).to('.w-lab0', { opacity: 1, duration: 0.3 }, 0.2);
    course(0, 0.35);
    marks.push(1.6); course(1, 1.6);
    marks.push(2.9); course(2, 2.9);
    marks.push(4.2); course(3, 4.2); tl.to('.w-lead', { opacity: 1, duration: 0.3 }, 5.1); course(4, 5.2);
    marks.push(6.5); course(5, 6.5); tl.to('.w-lab0', { opacity: 0, duration: 0.2 }, 6.5); tl.to('.w-plumb', { opacity: 1, duration: 0.4 }, 7.5);
    tl.to({}, { duration: 0.6 });

    var cur = -1;
    function setStep(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
      if (num) num.textContent = '0' + (i + 1);
      if (now) now.textContent = names[i];
      if (desc) desc.textContent = descs[i];
    }
    setStep(0);

    ScrollTrigger.create({
      trigger: '.wall',
      pin: '.wall__pin',
      start: 'top top',
      end: mobile ? '+=170%' : '+=260%',
      scrub: 0.6,
      animation: tl,
      onUpdate: function () {
        var t = tl.time(), i = 0;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - 0.05) i = k;
        setStep(i);
      }
    });

    /* timeline line draws with scroll */
    var tlEl = document.querySelector('.tl');
    if (tlEl) {
      tlEl.style.setProperty('--p', 0);
      ScrollTrigger.create({
        trigger: tlEl, start: 'top 70%', end: 'bottom 70%',
        onUpdate: function (s) { tlEl.style.setProperty('--p', s.progress.toFixed(3)); }
      });
    }

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
