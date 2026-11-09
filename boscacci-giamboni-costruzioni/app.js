/* Boscacci & Giamboni homepage: hero entrance and strip drift, header, menu, anchors, reveals, service photo swap,
   drag gallery, process line, magnetic buttons, form, and the GSAP signature scene (a house section built layer by layer). */
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1, behavior: reduce ? 'auto' : 'smooth' });
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

  /* hero strip: images drift at different speeds while the hero scrolls away */
  var stripImgs = d.querySelectorAll('.strip__c img');
  if (!reduce && stripImgs.length) {
    var ticking = false;
    function drift() {
      ticking = false;
      var y = Math.min(window.scrollY, window.innerHeight * 1.2);
      stripImgs.forEach(function (im, i) { im.style.transform = 'scale(1.08) translateY(' + (y * (0.04 + i * 0.025)).toFixed(1) + 'px)'; });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
  }

  /* services: the line in the middle of the screen is active, its photo shows on the left */
  var items = d.querySelectorAll('.wl__i'), pic = d.querySelector('[data-swap]'), curSrc = pic ? pic.getAttribute('src') : '';
  function setActive(it) {
    items.forEach(function (x) { x.classList.toggle('is-on', x === it); });
    var src = it.getAttribute('data-img');
    if (!pic || src === curSrc) return;
    curSrc = src;
    pic.classList.add('is-fade');
    setTimeout(function () { pic.src = src; pic.classList.remove('is-fade'); }, reduce ? 0 : 220);
  }
  if (items.length) {
    items.forEach(function (it) { it.addEventListener('mouseenter', function () { setActive(it); }); });
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setActive(e.target); }); }, { rootMargin: '-45% 0px -50% 0px' });
      items.forEach(function (it) { io2.observe(it); });
    }
  }

  /* drag to scroll gallery */
  var drag = d.querySelector('[data-drag]');
  if (drag) {
    var down = false, sx = 0, sl = 0, moved = 0;
    drag.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = drag.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.abs(dx); if (moved > 4) drag.classList.add('is-drag'); drag.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-drag'); });
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { drag.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var st = list.querySelectorAll('.st__i');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.2)));
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
      var w = f.closest('.field'), err = w && w.querySelector('.err');
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    req.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* signature scene */
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    sectionScene(window.innerWidth < 700);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function sectionScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var layers = sec.querySelectorAll('.L');
    var names = Array.prototype.map.call(sec.querySelectorAll('[data-layers] li'), function (li) { return li.textContent.replace(/^\d+/, '').trim(); });
    var lis = sec.querySelectorAll('[data-layers] li');
    var stepN = sec.querySelector('[data-step-n]'), stepT = sec.querySelector('[data-step-t]'), meter = sec.querySelector('[data-meter]');
    var N = layers.length, cur = -2;
    var svg = sec.querySelector('svg');
    if (small && svg.getAttribute('data-vb-small')) svg.setAttribute('viewBox', svg.getAttribute('data-vb-small'));

    sec.querySelectorAll('.draw').forEach(function (p) {
      var len = 1200;
      try { len = Math.ceil(p.getTotalLength()) + 2; } catch (e) {}
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    });
    layers.forEach(function (g) {
      gsap.set(g.querySelectorAll(':scope > :not(.draw)'), { autoAlpha: 0 });
    });
    gsap.set(sec.querySelectorAll('.g-wall'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(sec.querySelector('.g-pit'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(sec.querySelector('.g-roof'), { y: -40 });
    gsap.set(sec.querySelector('.g-ground'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(meter, { scaleX: 0 });

    function paint(p) {
      var t = p * tl.duration();
      var k = Math.min(N - 1, Math.floor(t - 0.8));
      gsap.set(meter, { scaleX: p });
      if (k === cur) return;
      cur = k;
      lis.forEach(function (li, i) { li.classList.toggle('is-done', i < k); li.classList.toggle('is-act', i === k); });
      var kk = Math.max(0, k);
      stepN.textContent = '0' + (kk + 1);
      stepT.textContent = k < 0 ? 'Il terreno' : names[kk];
    }

    var tl;
    tl = gsap.timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=200%' : '+=280%', pin: true, scrub: 0.6, anticipatePin: 1, onUpdate: function (s) { paint(s.progress); } } });
    tl.fromTo(sec.querySelectorAll('.sect__text > *'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 }, 0)
      .to(sec.querySelector('.g-ground'), { scaleX: 1, duration: 0.6 }, 0.1);
    layers.forEach(function (g, i) {
      var t = 0.6 + i * 1;
      tl.to(g.querySelectorAll('.draw'), { strokeDashoffset: 0, duration: 0.55, ease: 'none' }, t)
        .to(g.querySelectorAll(':scope > :not(.draw)'), { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, t + 0.3);
    });
    tl.to(sec.querySelectorAll('.g-wall'), { scaleY: 1, duration: 0.6, stagger: 0.1 }, 3.7)
      .to(sec.querySelector('.g-pit'), { scaleY: 1, duration: 0.5 }, 0.8)
      .to(sec.querySelector('.g-roof'), { y: 0, duration: 0.5 }, 4.8)
      .to({}, { duration: 0.5 }, 6.4);
    paint(tl.scrollTrigger ? tl.scrollTrigger.progress : 0);
  }
})();
