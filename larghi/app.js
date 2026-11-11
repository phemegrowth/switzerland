(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  /* header shrink + phone contact bar after the hero */
  var header = document.querySelector('.header');
  var bar = document.querySelector('.bar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    bar.classList.toggle('is-on', y > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* hero strip: drifts left as the page scrolls (transform only) */
  var track = document.querySelector('.strip__track');
  if (!reduce && track) {
    var ticking = false;
    setTimeout(function () { track.classList.add('is-drift'); }, 1700);
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, hero.offsetHeight);
        track.style.setProperty('--drift', (-y * 0.35).toFixed(1) + 'px');
        ticking = false;
      });
    }, { passive: true });
  }

  /* phone menu */
  var burger = document.querySelector('.burger'), nav = document.getElementById('menu');
  function closeMenu() { nav.classList.remove('is-open'); document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Apri il menu'); }
  burger.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open); document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* reveals with the above-the-fold guard */
  var items = [].slice.call(document.querySelectorAll('.r')), groups = new Map();
  items.forEach(function (el) { var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1); el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's'); });
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* services: active item swaps the photo (hover/focus on desktop, scroll position on phones) */
  var wItems = [].slice.call(document.querySelectorAll('.what__i'));
  var wImgs = [].slice.call(document.querySelectorAll('.what__pic img'));
  function setW(k) {
    wItems.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-k') === k); });
    wImgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  }
  setW('0');
  wItems.forEach(function (li) {
    li.addEventListener('mouseenter', function () { setW(li.getAttribute('data-k')); });
    li.addEventListener('focus', function () { setW(li.getAttribute('data-k')); });
  });
  if ('IntersectionObserver' in window) {
    var wio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !window.matchMedia('(hover: hover)').matches) setW(e.target.getAttribute('data-k')); }); }, { rootMargin: '-45% 0px -45% 0px' });
    wItems.forEach(function (li) { wio.observe(li); });
  }

  /* count-up: years since the sourced founding year */
  document.querySelectorAll('[data-since]').forEach(function (el) {
    var target = new Date().getFullYear() - parseInt(el.getAttribute('data-since'), 10);
    el.textContent = target;
    if (reduce || !('IntersectionObserver' in window)) return;
    var o = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / 1400); k = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * k); if (k < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* houses rail: drag with the mouse, arrow buttons */
  var rail = document.querySelector('.case__rail');
  if (rail) {
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-drag'); } rail.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; rail.classList.remove('is-drag'); });
    rail.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    document.querySelectorAll('.case__btn').forEach(function (b) {
      b.addEventListener('click', function () { rail.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * rail.clientWidth * 0.6, behavior: reduce ? 'auto' : 'smooth' }); });
    });
  }

  /* process line draws with scroll */
  var how = document.querySelector('.how__steps');
  if (how && !reduce) {
    var line = how.querySelector('.how__line');
    var upd = function () {
      var r = how.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.2)));
      line.style.setProperty('--lp', p.toFixed(3));
    };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22) + 'px)'; });
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

  /* signature scene: blueprint to building. The elevation draws itself phase by phase while the site photos rise in */
  var buildSec = document.querySelector('.build');
  var steps = [].slice.call(document.querySelectorAll('.build__steps li'));
  function setStep(i) { steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); }
  if (reduce || !window.gsap || !window.ScrollTrigger) { buildSec.classList.add('is-static'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 699px)', big: '(min-width: 700px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var count = document.querySelector('.build__k');
      var pbar = document.querySelector('.build__bar');
      var photos = gsap.utils.toArray('.build__photos .ph');
      var plan = document.querySelector('.plan');
      plan.setAttribute('viewBox', phone ? '50 24 330 286' : '0 0 400 330');

      gsap.set(photos.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(photos, { scale: 1.08 });
      gsap.set('.p-ground', { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(['.p-hatch', '.p-dig', '.p-found', '.p-scaf', '.p-dim'], { opacity: 0 });
      gsap.set('.p-found rect', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.p-slabs rect', { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set('.p-walls rect', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.p-win rect', { scale: 0, transformOrigin: '50% 50%' });
      gsap.set('.p-roof polygon', { y: -60, opacity: 0 });
      gsap.set('.p-scaf', { opacity: 0 });

      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      /* phase 0: ground */
      tl.to('.p-ground', { scaleX: 1, duration: .6 }, 0)
        .to('.p-hatch', { opacity: 1, duration: .3 }, .3)
        .to(photos[0], { scale: 1, duration: 1 }, 0)
      /* phase 1: dig */
        .to('.p-dig', { opacity: 1, duration: .4 }, 1)
        .to(photos[1], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8 }, 1)
      /* phase 2: foundation */
        .to('.p-found', { opacity: 1, duration: .1 }, 2)
        .to('.p-found rect', { scaleY: 1, duration: .5 }, 2)
        .to(photos[2], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8 }, 2)
      /* phase 3: slabs, one floor at a time */
        .to('.p-slabs rect', { scaleX: 1, duration: .35, stagger: .2 }, 3)
        .to(photos[3], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8 }, 3)
      /* phase 4: walls */
        .to('.p-walls rect', { scaleY: 1, duration: .35, stagger: .2 }, 4)
        .to(photos[4], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8 }, 4)
      /* phase 5: scaffold and render */
        .to('.p-scaf', { opacity: 1, duration: .3 }, 5)
        .to('.p-win rect', { scale: 1, duration: .3, stagger: .04 }, 5.2)
        .to(photos[5], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8 }, 5)
      /* phase 6: roof, scaffold off, handover */
        .to('.p-scaf', { opacity: 0, duration: .3 }, 6)
        .to('.p-roof polygon', { y: 0, opacity: 1, duration: .5, stagger: .08, ease: 'back.out(1.6)' }, 6.1)
        .to('.p-dim', { opacity: 1, duration: .3 }, 6.4)
        .to(photos[6], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8 }, 6)
        .to({}, { duration: .6 });

      var cur = -1;
      function upd(i) {
        if (i === cur) return; cur = i; setStep(i);
        count.textContent = '0' + (i + 1);
      }
      upd(0);
      var st = ScrollTrigger.create({
        trigger: '.build', pin: '.build__pin', start: 'top top', end: phone ? '+=260%' : '+=320%', scrub: .6, animation: tl,
        onUpdate: function (s) {
          var t = tl.time();
          upd(Math.max(0, Math.min(6, Math.floor(t + 0.15))));
          pbar.style.setProperty('--p', s.progress.toFixed(3));
        }
      });
      pbar.style.setProperty('--p', 0);
      return function () { st.kill(); tl.kill(); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 800);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
