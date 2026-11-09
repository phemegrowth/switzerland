/* Ugo Clerici SA homepage: hero entrance and rating count-up, header, menu, anchors, reveals, accordion with photo swap,
   lake parallax, magnetic buttons, form, and the GSAP signature scene (excavation, rebar, formwork, concrete pour, striking). */
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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#getto' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals */
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

  /* hero figure: Google rating counts up from 0,0 (a quantity, from the Google profile) */
  var rating = d.querySelector('[data-rating]');
  if (rating && !reduce) {
    var to = parseFloat(rating.getAttribute('data-rating')), t0 = null, dur = 1300;
    rating.textContent = '0,0';
    setTimeout(function () {
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        rating.textContent = (to * e).toFixed(1).replace('.', ',');
        if (p < 1) requestAnimationFrame(step);
      });
    }, 350);
  }

  /* accordion, one open at a time, photo swaps */
  var acc = d.querySelector('[data-acc]'), pic = d.querySelector('[data-swap]');
  if (acc) {
    var items = acc.querySelectorAll('.acc__i');
    function open(it) {
      items.forEach(function (x) {
        var on = x === it;
        x.classList.toggle('is-open', on);
        x.querySelector('.acc__b').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      var src = it.getAttribute('data-img');
      if (pic && src && pic.getAttribute('src') !== src) {
        pic.classList.add('is-fade');
        setTimeout(function () {
          pic.src = src;
          pic.alt = it.querySelector('.acc__b').textContent.replace(/^\d+/, '').trim();
          pic.classList.remove('is-fade');
        }, reduce ? 0 : 260);
      }
    }
    items.forEach(function (it) {
      it.querySelector('.acc__b').addEventListener('click', function () { open(it); });
    });
  }

  /* lake photo drifts slower than the page */
  var lake = d.querySelector('.lake'), lakeImg = d.querySelector('.lake__pic img');
  if (lake && lakeImg && !reduce) {
    var tk = false;
    function lp() {
      tk = false;
      var r = lake.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      lakeImg.style.transform = 'translateY(' + (-p * 12).toFixed(2) + '%)';
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(lp); } }, { passive: true });
    lp();
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate il vostro nome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete il lavoro in due righe.' };
    var req = form.querySelectorAll('[required]');
    function check(f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    req.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene: the pour */
  function scene() {
    var sec = d.querySelector('.pour');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 860px)').matches;
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var soil = q('.pour__soil'), pit = q('.pour__pit'), rebar = qa('.pour__rebar path'), fl = q('.pour__fl'), fr = q('.pour__fr');
    var wave = q('.pour__wave'), gline = q('.pour__gline'), pct = q('.pour__pctn'), pctBox = q('.pour__pct'), gauge = q('.pour__gauge');
    var num = q('.pour__num'), name = q('.pour__name'), list = qa('.pour__list li'), end = q('.pour__end');
    var names = ['Scavo', 'Armatura e casseri', 'Getto del calcestruzzo', 'Disarmo'];
    function prep(p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; return L; }
    prep(pit); rebar.forEach(prep); prep(gline);

    gsap.set(fl, { x: -260, autoAlpha: 0 });
    gsap.set(fr, { x: 260, autoAlpha: 0 });
    gsap.set(wave, { x: 0, y: 580 });
    gsap.set([gauge, pctBox], { autoAlpha: 0 });
    gsap.set(q('.pour__svg'), { autoAlpha: 0, y: 40 });
    var state = { pct: 0 };
    pct.textContent = '0';

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=210%' : '+=260%', pin: q('.pour__pin'), scrub: 0.6,
        onUpdate: function (st) {
          var t = st.progress * tl.duration(), k = t < 2.6 ? 0 : t < 5 ? 1 : t < 8.6 ? 2 : 3;
          num.textContent = '0' + (k + 1); name.textContent = names[k];
          list.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        }
      }
    });
    tl.to(q('.pour__svg'), { autoAlpha: 1, y: 0, duration: 0.6 }, 0);
    // 01 dig
    tl.to(soil, { y: -170, autoAlpha: 0, duration: 1.6, ease: 'power1.in' }, 0.6);
    tl.to(pit, { strokeDashoffset: 0, duration: 1.4 }, 0.9);
    // 02 rebar and formwork
    rebar.forEach(function (p, i) { tl.to(p, { strokeDashoffset: 0, duration: 1.1 }, 2.6 + i * 0.12); });
    tl.to(fl, { x: 0, autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, 3.4);
    tl.to(fr, { x: 0, autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, 3.5);
    tl.to([gauge, pctBox], { autoAlpha: 1, duration: 0.5 }, 4.4);
    // 03 pour: the wave rises and travels sideways, the gauge and the % follow
    tl.to(wave, { y: 144, x: -160, duration: 3.6, ease: 'power1.inOut' }, 5);
    tl.to(gline, { strokeDashoffset: 0, duration: 3.6, ease: 'power1.inOut' }, 5);
    tl.to(state, { pct: 100, duration: 3.6, ease: 'power1.inOut', onUpdate: function () { pct.textContent = Math.round(state.pct); } }, 5);
    tl.to(rebar, { opacity: 0.18, duration: 2.6 }, 5.6);
    tl.to(wave, { x: -160, y: 150, duration: 0.3 }, 8.6);
    // 04 strike the formwork
    tl.to(fl, { x: -200, autoAlpha: 0, duration: 1.2, ease: 'power2.in' }, 8.9);
    tl.to(fr, { x: 200, autoAlpha: 0, duration: 1.2, ease: 'power2.in' }, 9);
    tl.to(end, { autoAlpha: 1, duration: 0.6 }, 9.8);
    tl.to({}, { duration: 0.6 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
