/* K.A Pedrazzi Sagl: collage hero (cards fan out from a stack), header, menu, anchors, reveals, photo band parallax,
   magnetic buttons, form, and the GSAP signature scene: a scaffold goes up lift by lift in front of a village house,
   the facade is renewed from the top down, then the scaffold comes down. Level counter and phase list run off the
   same timeline. */
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

  /* photo band: slow parallax */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + ((p - 0.5) * -50).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(movePar); } }, { passive: true });
    movePar();
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + 'px)';
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
    html.classList.add('st-on');
    scafScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function scafScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return sec.querySelectorAll(s); };
    var lift = function (i) { return one('[data-lift="' + i + '"]'); };
    var render = one('[data-render]'), fullH = +render.getAttribute('height');
    var lvl = one('[data-lvl]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', 'Montaggio del ponteggio', 'Lavori in facciata', 'Smontaggio e cantiere pulito'];
    gsap.set([one('[data-scaf]'), one('[data-dmg]'), q('.w-old')], { opacity: 1 });
    gsap.set(q('.sl'), { autoAlpha: 0 });
    if (small) gsap.set(q('.sl'), { display: 'none' });
    if (small) sec.querySelector('.scaf').setAttribute('viewBox', '225 92 550 486');
    gsap.set(q('[data-wnew]'), { opacity: 0 });
    gsap.set(one('[data-gut]'), { opacity: 0 });
    gsap.set(render, { attr: { height: 0 } });
    gsap.set(q('.s-base'), { autoAlpha: 0, y: 10 });
    gsap.set(q('.s-std'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.s-led'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.s-br, .s-rail'), { autoAlpha: 0 });
    gsap.set(q('.s-board'), { autoAlpha: 0, x: -60 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var lvlUp = [], lvlDown = [];
    /* 1 scaffold up */
    tl.to(q('.s-base'), { autoAlpha: 1, y: 0, duration: .3, stagger: .05 }, .1)
      .to(one('.sl[data-sl="1"]'), { autoAlpha: 1, duration: .25 }, .3);
    for (var i = 1; i <= 4; i++) {
      var t0 = .5 + (i - 1) * .9, L = lift(i);
      tl.to(L.querySelectorAll('.s-std'), { scaleY: 1, duration: .45, stagger: .04 }, t0)
        .to(L.querySelectorAll('.s-led'), { scaleX: 1, duration: .4, ease: 'power1.inOut' }, t0 + .35)
        .to(L.querySelectorAll('.s-br'), { autoAlpha: 1, duration: .3, stagger: .05 }, t0 + .5)
        .to(L.querySelectorAll('.s-board'), { autoAlpha: 1, x: 0, duration: .4 }, t0 + .55)
        .to(L.querySelectorAll('.s-rail'), { autoAlpha: 1, duration: .3 }, t0 + .7);
      if (i <= 3) lvlUp.push(t0 + .6);
    }
    tl.to(one('.sl[data-sl="2"]'), { autoAlpha: 1, duration: .25 }, .9)
      .to(one('.sl[data-sl="3"]'), { autoAlpha: 1, duration: .25 }, 1.6)
      .to(one('.sl[data-sl="4"]'), { autoAlpha: 1, duration: .25 }, 1.9)
      .to(q('.sl'), { autoAlpha: 0, duration: .3 }, 4.3);
    /* 2 facade renewed from the top down */
    tl.to(render, { attr: { height: fullH }, duration: 3, ease: 'none' }, 4.6)
      .to(one('[data-dmg]'), { opacity: 0, duration: 3, ease: 'none' }, 4.6)
      .to(one('[data-gut]'), { opacity: 1, duration: .3 }, 4.7);
    var wins = q('.win');
    wins.forEach(function (w, k) {
      var tw = k < 3 ? 5.6 : 6.9;
      tl.to(w.querySelector('.w-old'), { opacity: 0, duration: .3 }, tw + (k % 3) * .12)
        .to(w.querySelector('[data-wnew]'), { opacity: 1, duration: .35 }, tw + .1 + (k % 3) * .12);
    });
    /* 3 scaffold down, top lift first */
    for (var j = 4; j >= 0; j--) {
      var td = 8 + (4 - j) * .45;
      tl.to(lift(j), { opacity: 0, y: -16, duration: .4, ease: 'power1.in' }, td);
      if (j >= 1 && j <= 3) lvlDown.push(td + .2);
    }
    tl.to(bar, { scaleX: 1, duration: 10.2, ease: 'none' }, 0)
      .to({}, { duration: .6 }, 10.2);

    var phAt = [0, 0, 4.4, 7.9], lastL = -1, lastP = -1;
    function sync() {
      var t = tl.time(), l = 0, p = 1;
      lvlUp.forEach(function (x) { if (t >= x) l++; });
      lvlDown.forEach(function (x) { if (t >= x) l--; });
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      if (l !== lastL) { lastL = l; lvl.textContent = l; }
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.textContent = '0' + p + '  ' + names[p];
      }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=200%' : '+=290%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
