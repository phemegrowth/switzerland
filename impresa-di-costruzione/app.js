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

  /* hero photo moves slower than the page (parallax, transform only) */
  var par = document.querySelector('.hero__par');
  if (par && !reduce) {
    var tk = false;
    var px = function () { tk = false; var y = Math.min(window.scrollY, window.innerHeight * 1.2); par.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)'; };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(px); } }, { passive: true });
    px();
  }

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

  /* signature scene: setting out the grid of axes, then plinths, columns and the first slab */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  function build() {
    var mobile = window.innerWidth < 700;
    var steps = [].slice.call(document.querySelectorAll('.assi__steps li'));
    var count = document.querySelector('.assi__k');
    var bar = document.querySelector('.assi__bar');
    document.querySelectorAll('.f-ray').forEach(function (r) { var l = r.getTotalLength(); r.style.strokeDasharray = l; r.style.strokeDashoffset = l; });

    gsap.set(['.f-plot', '.f-plotlab', '.f-lab', '.f-beams'], { opacity: 0 });
    gsap.set('.f-rays', { opacity: 1 });
    gsap.set(['.f-station', '.f-pegs g', '.f-bub', '.f-pl', '.f-col'], { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.f-pegs', { opacity: 1 });
    gsap.set('.f-ax--v', { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set('.f-ax--h', { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set('.f-slab', { scaleX: 0, transformOrigin: '0% 50%', opacity: 1 });
    gsap.set('.f-pegs path, .f-pegs circle', { opacity: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(['.f-plot', '.f-plotlab'], { opacity: 1, duration: 0.3 }, 0)
      .to('.f-station', { scale: 1, duration: 0.3, ease: 'back.out(2)' }, 0.15)
      .to('.f-l0', { opacity: 1, duration: 0.3 }, 0.3)
      .to('.f-pegs path, .f-pegs circle', { opacity: 1, duration: 0.2, stagger: 0.1 }, 0.35)
      .to('.f-ray0', { strokeDashoffset: 0, duration: 0.5, stagger: 0.15, ease: 'none' }, 0.5)
      .to('.f-ax--v', { scaleY: 1, duration: 0.5, stagger: 0.08 }, 1.2)
      .to('.f-ax--h', { scaleX: 1, duration: 0.5, stagger: 0.08 }, 1.35)
      .to('.f-ray1', { strokeDashoffset: 0, duration: 0.3, stagger: 0.06, ease: 'none' }, 1.2)
      .to('.f-bub', { scale: 1, duration: 0.25, stagger: 0.05, ease: 'back.out(2)' }, 1.5)
      .to('.f-l1', { opacity: 1, duration: 0.3 }, 1.7)
      .to(['.f-rays', '.f-l0'], { opacity: 0, duration: 0.35 }, 2.3)
      .to('.f-beams', { opacity: 1, duration: 0.4 }, 2.4)
      .to('.f-pl', { scale: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(1.6)' }, 2.5)
      .to('.f-l2', { opacity: 1, duration: 0.3 }, 2.8)
      .to('.f-l1', { opacity: 0, duration: 0.3 }, 3.3)
      .to('.f-col', { scale: 1, duration: 0.25, stagger: 0.05, ease: 'back.out(2.4)' }, 3.6)
      .to('.f-l3', { opacity: 1, duration: 0.3 }, 3.9)
      .to('.f-l2', { opacity: 0, duration: 0.3 }, 4.5)
      .to('.f-slab', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 4.8)
      .to('.f-l4', { opacity: 1, duration: 0.3 }, 5.4)
      .to({}, { duration: 0.5 });

    var marks = [0, 1.2, 2.4, 3.6, 4.8];
    var c = -1;
    function setStep(i) {
      if (i === c) return; c = i;
      steps.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      count.textContent = '0' + (i + 1);
    }
    setStep(0);
    ScrollTrigger.create({
      trigger: '.assi', pin: '.assi__pin', start: 'top top', end: mobile ? '+=190%' : '+=280%', scrub: 0.6, animation: tl,
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
