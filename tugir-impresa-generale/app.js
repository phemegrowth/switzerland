(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js'); html.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-in'); });

  var header = document.querySelector('.header'), bar = document.querySelector('.bar');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-small', y > 40);
    bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  /* reveals */
  var items = [].slice.call(document.querySelectorAll('.r')), groups = new Map();
  items.forEach(function (el) { var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1); el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's'); });
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el); });
  }

  /* accordion (height animated with grid rows) */
  document.querySelectorAll('.acc__b').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc__i'), open = !item.classList.contains('is-open');
      document.querySelectorAll('.acc__i').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.acc__b').setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
    });
  });

  /* count-up of years since the founding year */
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

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l’indirizzo email.', type: 'Scegliete di cosa si tratta.', message: 'Scrivete due righe sul progetto.' };
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

  /* signature scene: exploded section. Four bands of one shell building pull apart from the ground up, each gets its label, then they close again */
  var xs = document.querySelector('.xs');
  var labels = [].slice.call(document.querySelectorAll('.xs__labels li'));
  if (reduce || !window.gsap || !window.ScrollTrigger) { xs.classList.add('is-static'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function build() {
    var mm = gsap.matchMedia();
    mm.add({ phone: '(max-width: 899px)', big: '(min-width: 900px)' }, function (ctx) {
      var phone = ctx.conditions.phone;
      var bands = gsap.utils.toArray('.xs__b');          /* top to bottom: 0 roof ... 3 ground */
      var gap = phone ? 16 : 30;
      gsap.set(bands, { y: 0, opacity: 0, '--edge': 0, '--tag': 0 });
      gsap.set('.xs__h', { opacity: 0, y: 30 });
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to('.xs__h', { opacity: 1, y: 0, duration: .4 }, 0);
      /* the building assembles from the ground up, band by band */
      [3, 2, 1, 0].forEach(function (b, k) {
        tl.fromTo(bands[b], { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: .5 }, .2 + k * .3);
      });
      /* then it is pulled apart: every band lifts by its own floor count */
      tl.to(bands, { y: function (i) { return (i - 1.5) * gap; }, '--edge': 1, '--tag': 1, duration: .8, ease: 'power2.inOut' }, 1.6);
      /* one band at a time is highlighted, from foundations up */
      var marks = [];
      [3, 2, 1, 0].forEach(function (b, k) {
        var t = 2.5 + k * .7; marks.push(t);
        tl.to(bands, { opacity: function (i) { return i === b ? 1 : .35; }, duration: .3 }, t);
      });
      /* closes again: the finished section */
      tl.to(bands, { y: 0, opacity: 1, '--edge': 0, '--tag': 0, duration: .7, ease: 'power2.inOut' }, 5.6)
        .to({}, { duration: .4 });
      function setLabel(t) {
        var on = 3;
        for (var k = 0; k < marks.length; k++) if (t >= marks[k] - .05) on = 3 - k;
        labels.forEach(function (l) { l.classList.toggle('is-on', +l.getAttribute('data-i') === on); });
      }
      setLabel(0);
      var st = ScrollTrigger.create({
        trigger: '.xs', pin: '.xs__pin', start: 'top top', end: phone ? '+=170%' : '+=260%', scrub: .6, animation: tl,
        onUpdate: function () { setLabel(tl.time()); }
      });
      return function () { st.kill(); tl.kill(); };
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 800);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
