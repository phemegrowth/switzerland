/* Chiarani Costruzioni: curtain hero (a green panel lifts off the photo, the C stamp lands), header, menu, anchors,
   reveals, accordion, parallax, magnetic buttons, form, and the GSAP signature scene: a stair built into a slope,
   in section. The natural ground is cut away, the formwork goes in, twelve concrete steps are cast from the bottom
   up, then the handrail and the grass. The counter and the phase list read the same timeline. */
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
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - (t.hasAttribute('data-scene') ? 0 : header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
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
  reveal(d.querySelectorAll('[data-steps]'), function (el) { el.classList.add('is-in'); });

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* place photo: slow parallax inside its mask */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      par.style.transform = 'translate3d(0,' + ((p - 0.5) * -46).toFixed(1) + 'px,0)';
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
    stairScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function stairScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); }, q = function (s) { return sec.querySelectorAll(s); };
    var cnt = one('[data-cnt]'), lbl = one('[data-cnt-lbl]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = q('.ph li');
    var names = ['', "Il pendio com'è", 'Scavo e casseri', 'Getto dei gradini, dal basso', 'Corrimano e verde'];
    var steps = q('[data-steps] path'), forms = q('[data-forms] rect'), N = steps.length;
    var cut = one('[data-cut]'), terrain = one('[data-terrain]'), rail = q('[data-rail] path'), grass = q('[data-grass] path'), tags = q('.sl-tag');

    gsap.set(cut, { opacity: 1 });
    gsap.set(terrain, { opacity: 1 });
    gsap.set(one('[data-forms]'), { opacity: 1 });
    gsap.set(forms, { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(steps, { opacity: 0, y: -26 });
    rail.forEach(function (p) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L, opacity: 0 }); });
    gsap.set(grass, { opacity: 0, scale: .2, transformOrigin: '50% 100%' });
    gsap.set(bar, { scaleX: 0 });
    if (small) one('.slope').setAttribute('viewBox', '170 50 720 450');

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    /* 1 the slope as it is */
    tl.fromTo(terrain, { strokeDashoffset: 0 }, { strokeDashoffset: -64, duration: 1.4, ease: 'none' }, 0)
      .to(tags[0], { opacity: 1, duration: .3 }, .3)
      .to(tags[0], { opacity: 0, duration: .3 }, 1.6);
    /* 2 dig and formwork (1.8 to 4.2) */
    tl.to(cut, { y: -40, opacity: 0, duration: 1.1, ease: 'power1.in' }, 1.9)
      .to(terrain, { opacity: .35, duration: .6 }, 2.2)
      .to(forms, { opacity: 1, scaleY: 1, duration: .3, stagger: .1 }, 2.9)
      .to(tags[1], { opacity: 1, duration: .3 }, 3.0)
      .to(tags[1], { opacity: 0, duration: .3 }, 4.3);
    /* 3 cast the steps from the bottom (4.4 to 7.6) */
    var castAt = [];
    steps.forEach(function (s, i) {
      var at = 4.4 + i * .26;
      castAt.push(at + .15);
      tl.to(s, { opacity: 1, y: 0, duration: .32, ease: 'power3.out' }, at);
    });
    tl.to(tags[2], { opacity: 1, duration: .3 }, 5.0)
      .to(tags[2], { opacity: 0, duration: .3 }, 7.5)
      .to(forms, { opacity: 0, duration: .5, stagger: .03 }, 7.4);
    /* 4 handrail and green */
    tl.to(rail, { opacity: 1, duration: .05, stagger: .12 }, 8.0)
      .to(rail, { strokeDashoffset: 0, duration: .5, stagger: .12 }, 8.0)
      .to(tags[3], { opacity: 1, duration: .3 }, 8.6)
      .to(grass, { opacity: 1, scale: 1, duration: .4, stagger: .08 }, 8.8)
      .to(terrain, { opacity: 0, duration: .5 }, 8.9)
      .to(bar, { scaleX: 1, duration: 9.8, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.8);

    var phAt = [0, 0, 1.8, 4.3, 7.9], lastP = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, c = 0;
      for (var k = 1; k < phAt.length; k++) if (t >= phAt[k]) p = k;
      for (var i = 0; i < castAt.length; i++) if (t >= castAt[i]) c++;
      if (c !== lastC) { lastC = c; cnt.textContent = c; lbl.textContent = 'gradini gettati su ' + N; }
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.textContent = '0' + p + '  ' + names[p];
      }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=210%' : '+=280%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
