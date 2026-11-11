/* Hanko SA: hero entrance and parallax, header, full-screen menu, anchors, reveals, count-up,
   services list that drives the photo, method line, magnetic buttons, contact bar, form validation,
   and the GSAP signature scene (a timber house assembled panel by panel on a blueprint grid). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = window.matchMedia('(max-width: 899px)');
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var yr = d.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* header */
  var hd = d.getElementById('hd');
  var hero = d.querySelector('.hero');
  var cbar = d.querySelector('.cbar'), wa = d.querySelector('.wa-float');
  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle('is-small', y > 40);
    var past = hero.getBoundingClientRect().bottom < 80;
    var nearEnd = (window.innerHeight + y) > (d.documentElement.scrollHeight - 40);
    if (cbar) cbar.classList.toggle('is-on', past && !nearEnd);
    if (wa) wa.classList.toggle('is-on', past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* disabled language links do nothing */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') return;
      if (id === '#top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#montaggio' ? 0 : hd.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals: anything already on screen shows at once */
  function reveal(els, cb, margin) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * 0.92) cb(el); else io.observe(el); });
  }
  var rvSel = '.srv__head, .srv__it, .proj__txt, .proj__fig, .about__photo, .about__txt > *, .method__head, .flow__it, .contact__info > *, .form, .proof__item';
  var rvEls = d.querySelectorAll(rvSel);
  rvEls.forEach(function (el) { el.classList.add('rv'); });
  reveal(rvEls, function (el) { el.classList.add('is-in'); });

  /* count-up: years since 2015 (a quantity) */
  var cnt = d.querySelector('.count[data-since]');
  if (cnt) {
    var to = new Date().getFullYear() - parseInt(cnt.getAttribute('data-since'), 10);
    cnt.textContent = to;
    if (!reduce) {
      cnt.textContent = '0';
      reveal([cnt], function () {
        var t0 = null;
        requestAnimationFrame(function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1200);
          cnt.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        });
      });
    }
  }

  /* method line draws when seen */
  var fl = d.querySelector('.flow__line');
  if (fl) reveal([fl.parentNode], function () { fl.classList.add('is-in'); }, '0px 0px -25% 0px');

  /* services: hover, focus or the row in the middle of the screen drives the photo */
  var items = d.querySelectorAll('.srv__it'), pics = d.querySelectorAll('.srv__stack img');
  function setSrv(k) {
    items.forEach(function (it) { it.classList.toggle('is-on', it.getAttribute('data-k') === k); });
    pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-k') === k); });
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { setSrv(it.getAttribute('data-k')); });
    it.addEventListener('focus', function () { setSrv(it.getAttribute('data-k')); });
  });
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) setSrv(e.target.getAttribute('data-k')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { sio.observe(it); });
  }

  /* magnetic buttons (desktop pointer only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 9; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 4; }
    };
    function check(inp) {
      var ok = rules[inp.name](inp.value);
      inp.closest('.f').classList.toggle('is-bad', !ok);
      inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    Object.keys(rules).forEach(function (n) {
      var inp = form.elements[n];
      inp.addEventListener('blur', function () { if (inp.value) check(inp); });
      inp.addEventListener('input', function () { if (inp.closest('.f').classList.contains('is-bad')) check(inp); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      Object.keys(rules).forEach(function (n) { if (!check(form.elements[n]) && !bad) bad = form.elements[n]; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  /* ---------- GSAP: hero parallax and the signature scene ---------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var steps = d.querySelectorAll('.step');
  var capN = d.querySelector('.scene__capn'), capT = d.querySelector('.scene__capt');
  var meterBar = d.querySelector('.meter__bar i'), meterPc = d.querySelector('.meter__pc b');
  var svg = d.querySelector('.house');
  var marks = [0, 0.16, 0.46, 0.62, 0.8];
  var lastS = -1;
  function setStep(p) {
    var s = 0;
    for (var i = 0; i < marks.length; i++) if (p >= marks[i]) s = i;
    meterBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    meterPc.textContent = Math.round(p * 100);
    if (s === lastS) return;
    lastS = s;
    steps.forEach(function (st, i) { st.classList.toggle('is-on', i === s); st.classList.toggle('is-done', i < s); });
    var on = steps[s];
    capN.textContent = on.querySelector('.step__n').textContent;
    capT.innerHTML = '<b>' + on.querySelector('.step__t').textContent + '.</b> ' + on.querySelector('.step__d').textContent;
  }

  function build() {
    /* hero photo moves slower than the page */
    gsap.fromTo('.hero__img', { yPercent: -4 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, function (ctx) {
      var mob = ctx.conditions.mob;
      svg.setAttribute('viewBox', mob ? '96 70 608 440' : '0 0 800 560');
      var panels = gsap.utils.toArray('.panel');
      gsap.set('.slab', { scaleX: 0, transformOrigin: '50% 50%' });
      gsap.set('.dim', { opacity: 0 });
      gsap.set(panels, { y: -520 });
      gsap.set('.cable', { opacity: 1 });
      gsap.set('.ins', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.roof__l', { x: -60, y: -420 });
      gsap.set('.roof__r', { x: 60, y: -420 });
      gsap.set('.facade', { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.glass', { opacity: 0 });
      gsap.set('.tag', { opacity: 0 });

      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.to('.slab', { scaleX: 1, duration: 1.2 }, 0)
        .to('.dim', { opacity: 1, duration: .6 }, .5)
        .to('.tag[data-t="0"]', { opacity: 1, duration: .4 }, .7);
      panels.forEach(function (p, i) {
        var t = 1.7 + i * .75;
        tl.to(p, { y: 0, duration: .9, ease: 'power3.out' }, t)
          .to(p.querySelector('.cable'), { opacity: 0, duration: .3 }, t + .9);
      });
      tl.to('.tag[data-t="1"]', { opacity: 1, duration: .4 }, 2.2)
        .to('.ins', { scaleY: 1, duration: .8, stagger: .22 }, 4.9)
        .to('.tag[data-t="2"]', { opacity: 1, duration: .4 }, 5.1)
        .to('.roof__l', { x: 0, y: 0, duration: 1, ease: 'power3.out' }, 6.4)
        .to('.roof__r', { x: 0, y: 0, duration: 1, ease: 'power3.out' }, 6.7)
        .to('.tag[data-t="3"]', { opacity: 1, duration: .4 }, 7)
        .to('.facade', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'none' }, 8.2)
        .to('.glass', { opacity: 1, duration: .6 }, 9.3)
        .to('.tag[data-t="4"]', { opacity: 1, duration: .4 }, 9.2)
        .to({}, { duration: .6 }, 9.9);

      ScrollTrigger.create({
        trigger: '.scene', start: 'top top', end: mob ? '+=150%' : '+=240%',
        pin: '.scene__pin', scrub: .6, animation: tl,
        onUpdate: function (self) { setStep(self.progress); },
        onToggle: function (self) { d.body.classList.toggle('in-scene', self.isActive); }
      });
      setStep(0);
      return function () { lastS = -1; };
    });
    ScrollTrigger.refresh();
  }

  var built = false;
  function go() { if (built) return; built = true; build(); }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(go); else go();
  setTimeout(go, 1200);
  window.addEventListener('load', function () { go(); ScrollTrigger.refresh(); });
})();
