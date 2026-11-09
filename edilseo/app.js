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

  /* hero reel drifts left with the scroll (transform only) */
  var reel = document.querySelector('.reel');
  if (reel && !reduce) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.4);
      reel.style.transform = 'translate3d(' + (-y * 0.38).toFixed(1) + 'px,0,0)';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* services: the photo beside the list swaps on hover or focus */
  var pic = document.querySelector('.what__img');
  document.querySelectorAll('.svc li').forEach(function (li) {
    var show = function () {
      document.querySelectorAll('.svc li').forEach(function (o) { o.classList.toggle('is-on', o === li); });
      var src = li.getAttribute('data-pic');
      if (!pic || !src || pic.getAttribute('src') === src) return;
      if (reduce) { pic.src = src; pic.alt = li.getAttribute('data-alt'); return; }
      pic.classList.add('is-swap');
      setTimeout(function () { pic.src = src; pic.alt = li.getAttribute('data-alt'); pic.onload = function () { pic.classList.remove('is-swap'); }; setTimeout(function () { pic.classList.remove('is-swap'); }, 400); }, 250);
    };
    li.addEventListener('mouseenter', show);
    li.tabIndex = 0;
    li.addEventListener('focus', show);
  });

  /* work strip: drag to scroll on desktop */
  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  }

  /* process line draws with the scroll */
  var flow = document.querySelector('.flow');
  if (flow && !reduce) {
    var drawFlow = function () {
      var r = flow.getBoundingClientRect(), vh = window.innerHeight;
      var k = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      flow.style.setProperty('--draw', Math.max(0, Math.min(1, k)).toFixed(3));
    };
    window.addEventListener('scroll', function () { requestAnimationFrame(drawFlow); }, { passive: true });
    drawFlow();
  }

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

  /* signature scene: an opening cut into a load-bearing wall */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.varco__steps li'));
    var count = document.querySelector('.varco__k');
    var bar = document.querySelector('.varco__bar');
    var tr = document.querySelector('.v-tr');
    var len = tr.getTotalLength();
    var outBricks = [].slice.call(document.querySelectorAll('.w-out rect')).sort(function (a, b) { return (+b.getAttribute('data-r')) - (+a.getAttribute('data-r')); });

    gsap.set(tr, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(['.v-dim', '.v-lab', '.v-jambs', '.v-room', '.v-hole'], { opacity: 0 });
    gsap.set('.v-prop', { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(['.v-props', '.v-trace', '.w-out', '.w-seat'], { opacity: 1 });
    gsap.set('.v-lintel', { x: 420, opacity: 0 });
    gsap.set('.v-roomimg', { scale: 1.12, transformOrigin: '50% 50%' });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to('.v-l1', { opacity: 1, duration: 0.3 }, 0.05)
      .to('.v-l0', { opacity: 1, duration: 0.3 }, 0.15)
      .to(tr, { strokeDashoffset: 0, duration: 0.9, ease: 'none' }, 0.2)
      .to('.v-dim', { opacity: 1, duration: 0.3 }, 0.8)
      .to('.v-prop', { scaleY: 1, duration: 0.5, stagger: 0.12, ease: 'power3.out' }, 1.2)
      .to('.v-l2', { opacity: 1, duration: 0.3 }, 1.6)
      .to('.v-l1', { opacity: 0, duration: 0.3 }, 1.9)
      .to('.v-hole--seat', { opacity: 1, duration: 0.1 }, 2.4)
      .to('.w-seat rect', { y: 18, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'power2.in' }, 2.4)
      .to('.v-lintel', { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 2.8)
      .to('.v-l3', { opacity: 1, duration: 0.3 }, 3.3)
      .to('.v-hole--open', { opacity: 1, duration: 0.1 }, 3.8)
      .to(outBricks, { y: 22, opacity: 0, duration: 0.28, stagger: 0.03, ease: 'power2.in' }, 3.8)
      .to(tr, { opacity: 0, duration: 0.3 }, 4.9)
      .to('.v-prop', { scaleY: 0, duration: 0.5, stagger: 0.08, ease: 'power2.in' }, 5.4)
      .to(['.v-l2', '.v-dim'], { opacity: 0, duration: 0.3 }, 5.4)
      .to('.v-jambs', { opacity: 1, duration: 0.4 }, 5.7)
      .to('.v-room', { opacity: 1, duration: 0.6 }, 5.8)
      .to('.v-roomimg', { scale: 1, duration: 0.9, ease: 'none' }, 5.8)
      .to({}, { duration: 0.5 });

    var marks = [0, 1.2, 2.4, 3.8, 5.4];
    var c = -1;
    function setStep(i) {
      if (i === c) return; c = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      count.textContent = '0' + (i + 1);
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.varco', pin: '.varco__pin', start: 'top top', end: mobile ? '+=190%' : '+=280%', scrub: 0.6, animation: tl,
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
