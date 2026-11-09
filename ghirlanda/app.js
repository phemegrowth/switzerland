/* Ghirlanda SA homepage: hero entrance and photo parallax, header, menu, anchors, reveals, count-ups, work list,
   drag gallery, process line, magnetic buttons, form, and the GSAP signature scene (exploded floors). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header shrinks on scroll */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* in-page anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#fasi' ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* scroll reveals (anything already on screen shows at once) */
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

  /* count-ups (quantities only: years in business, generations, team) */
  var yearsEl = d.querySelector('[data-since]');
  if (yearsEl) yearsEl.setAttribute('data-count', String(new Date().getFullYear() - parseInt(yearsEl.getAttribute('data-since'), 10)));
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  });

  /* hero photo: moves slower than the page */
  var heroImg = d.querySelector('.hero__frame img');
  if (heroImg && !reduce) {
    var tick = false;
    function par() {
      tick = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.3);
      heroImg.style.transform = 'translateY(' + (-y * 0.18 - 0).toFixed(1) + 'px)';
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(par); } }, { passive: true });
  }

  /* work list: on touch screens the row in the middle of the screen opens its photo */
  var rows = d.querySelectorAll('.wl__i');
  if (reduce) rows.forEach(function (r) { r.classList.add('is-on'); });
  else if ('IntersectionObserver' in window && window.matchMedia('(hover: none)').matches) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-on', e.isIntersecting); });
    }, { rootMargin: '-40% 0px -45% 0px' });
    rows.forEach(function (r) { io2.observe(r); });
  }

  /* drag to scroll gallery */
  var drag = d.querySelector('[data-drag]');
  if (drag) {
    var down = false, sx = 0, sl = 0;
    drag.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = drag.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) drag.classList.add('is-drag'); drag.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-drag'); });
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') drag.scrollBy({ left: 360, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') drag.scrollBy({ left: -360, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var st = list.querySelectorAll('.steps__i');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / (r.height)));
      list.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

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

  /* signature scene: exploded floors */
  function scene() {
    var sec = d.querySelector('.xp');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 860px)').matches;
    var stage = sec.querySelector('.xp__stage');
    var slices = Array.prototype.slice.call(sec.querySelectorAll('.xp__sl')).sort(function (a, b) { return a.dataset.i - b.dataset.i; });
    var labs = slices.map(function (s) { return s.querySelector('.xp__lab'); });
    var list = sec.querySelectorAll('.xp__list li');
    var num = sec.querySelector('.xp__num'), now = sec.querySelector('.xp__now'), end = sec.querySelector('.xp__end');
    var names = ['Scavo e fondazioni', 'Piano terra e murature', 'Solaio in calcestruzzo armato', 'Piano superiore e serramenti', 'Tetto e copertura'];
    var spread = function () { return stage.offsetHeight * (small ? 0.15 : 0.17); };

    gsap.set(slices, { yPercent: 160, autoAlpha: 0 });
    gsap.set(labs, { autoAlpha: 0, x: -12 });
    gsap.set(sec.querySelector('.xp__head'), { autoAlpha: 0, y: 30 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=200%' : '+=260%', pin: sec.querySelector('.xp__pin'), scrub: 0.6,
        onUpdate: function (st) {
          var p = st.progress, k = Math.max(0, Math.min(4, Math.floor((p - 0.3) / 0.42 * 5)));
          if (p < 0.3) k = Math.max(0, Math.min(4, Math.floor(p / 0.3 * 5)));
          num.textContent = '0' + (k + 1);
          now.textContent = names[k];
          list.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
        }
      }
    });
    tl.to(sec.querySelector('.xp__head'), { autoAlpha: 1, y: 0, duration: 0.8 }, 0);
    // 1. the building assembles from the foundations up
    slices.forEach(function (s, i) { tl.to(s, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0.2 + i * 0.45); });
    // 2. it comes apart, floor by floor, each with its label
    slices.forEach(function (s, i) {
      tl.to(s, { y: function () { return -(i - 2) * spread(); }, '--edge': 1, duration: 2.2, ease: 'power1.inOut' }, 3);
      tl.to(labs[i], { autoAlpha: 1, x: 0, duration: 0.6 }, 3.3 + i * 0.45);
    });
    // 3. hold, then it closes again into one building
    tl.to({}, { duration: 1.4 });
    tl.to(slices, { y: 0, '--edge': 0, duration: 1.8, ease: 'power2.inOut' }, 7.6);
    tl.to(labs, { autoAlpha: 0, duration: 0.6 }, 7.6);
    tl.to(end, { autoAlpha: 1, duration: 0.8 }, 8.8);
    tl.to({}, { duration: 0.6 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
