/* Maurizio Perri SA: hero entrance (name, photo strip from the right, strip drift on scroll), header, menu, anchors,
   reveals, count-up of their own figures, magnetic buttons, form, and the GSAP signature scene: a bare plot seen in plan
   turns into a garden (survey and design, stone walls and granite path, irrigation, rolled lawn and planting, lights and water). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals (anything already in view shows at once) */
  function reveal(els, cb) {
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up of a sourced quantity (years of activity) when the proof band comes into view */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* hero photo strip drifts left as the page scrolls (transform only) */
  var strip = d.querySelector('.strip');
  if (strip && !reduce && window.innerWidth > 640) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var y = window.scrollY;
        if (y < window.innerHeight * 1.5) strip.style.transform = 'translate3d(' + (-y * 0.22).toFixed(1) + 'px,0,0)';
      });
    }, { passive: true });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
    var req = form.querySelectorAll('[required]');
    var check = function (f) {
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* GSAP signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gardenScene(window.innerWidth < 860);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    if (d.fonts && d.fonts.addEventListener) d.fonts.addEventListener('loadingdone', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function gardenScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var q = function (s) { return sec.querySelectorAll(s); }, q1 = function (s) { return sec.querySelector(s); };
    var stages = q('.stages li');
    var ui = { n: q1('[data-s-n]'), t: q1('[data-s-t]'), d: q1('[data-s-d]') };
    var design = q('.design path, .design circle'), walls = q('[data-wall]'), slabs = q('.slabs rect');
    var drip = q('.drip path'), spr = q('.spr circle'), lawn = q('.lawn rect'), hedge = q('.hedge rect');
    var trees = q('.trees > g'), beds = q('.beds path, .fl circle'), lights = q('.lights circle'), pond = q1('[data-pond]');

    gsap.set(design, { strokeDashoffset: 1, opacity: 1 });
    gsap.set(walls, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(slabs, { autoAlpha: 0, scale: .4, transformOrigin: '50% 50%' });
    gsap.set(drip, { strokeDashoffset: 1 });
    gsap.set(spr, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(lawn, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(hedge, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(trees, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(beds, { autoAlpha: 0 });
    gsap.set(lights, { autoAlpha: 0, scale: .2, transformOrigin: '50% 50%' });
    gsap.set(pond, { scale: 0, transformOrigin: '50% 50%' });

    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      ui.n.textContent = '0' + (i + 1);
      ui.t.textContent = stages[i].getAttribute('data-t');
      ui.d.textContent = stages[i].getAttribute('data-d');
    }
    var cuts = [1.2, 2.1, 2.9, 4.2];
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { var t = tl.time(), i = 0; while (i < cuts.length && t >= cuts[i]) i++; show(i); },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(q('.scene__text > .eyebrow, .scene__text > .h2, .stage, .legend'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0)
      /* 1. survey and design lines */
      .to(design, { strokeDashoffset: 0, duration: 0.6, stagger: 0.08 }, 0.35)
      /* 2. stone walls and granite slabs */
      .to(design, { opacity: 0.25, duration: 0.3 }, 1.2)
      .to(walls, { scaleX: 1, duration: 0.45, stagger: 0.12, ease: 'power2.out' }, 1.2)
      .to(slabs, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.04, ease: 'back.out(2)' }, 1.45)
      /* 3. irrigation lines and sprinklers */
      .to(drip, { strokeDashoffset: 0, duration: 0.45, stagger: 0.07 }, 2.1)
      .to(spr, { scale: 1, duration: 0.2, stagger: 0.04, ease: 'back.out(3)' }, 2.5)
      /* 4. rolled lawn, hedges, trees, beds */
      .to(lawn, { scaleX: 1, duration: 0.35, stagger: 0.07, ease: 'power1.inOut' }, 2.9)
      .to([drip, spr], { autoAlpha: 0.25, duration: 0.3 }, 3.4)
      .to(hedge, { scaleY: 1, duration: 0.4, ease: 'power2.out' }, 3.5)
      .to(trees, { scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' }, 3.6)
      .to(beds, { autoAlpha: 1, duration: 0.3 }, 3.9)
      /* 5. water and lights */
      .to(design, { opacity: 0, duration: 0.2 }, 4.2)
      .to(pond, { scale: 1, duration: 0.4, ease: 'power2.out' }, 4.25)
      .to(lights, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.06, ease: 'back.out(3)' }, 4.45)
      .to({}, { duration: 0.6 });
    show(0);
  }
})();
