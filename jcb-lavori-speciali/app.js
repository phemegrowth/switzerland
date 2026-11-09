/* JCB Lavori speciali homepage: split hero with a parallax photo, header, menu, anchors, reveals, area list photo swap,
   drag gallery, magnetic buttons, form, and the GSAP signature scene (a damaged concrete slab is repaired in seven steps). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

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
    }, { rootMargin: margin || '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* areas list swaps the photo */
  var aimg = d.querySelector('[data-aimg]');
  if (aimg) {
    var aImgs = aimg.querySelectorAll('img'), aItems = d.querySelectorAll('[data-alist] li');
    function showA(li) {
      var i = parseInt(li.getAttribute('data-i'), 10) || 0;
      aImgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
      aItems.forEach(function (x) { x.classList.toggle('is-act', x === li); });
    }
    aItems.forEach(function (li) { li.addEventListener('mouseenter', function () { showA(li); }); });
    if ('IntersectionObserver' in window) {
      var io3 = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) showA(e.target); }); }, { rootMargin: '-42% 0px -42% 0px' });
      aItems.forEach(function (li) { io3.observe(li); });
    }
  }

  /* drag gallery with progress bar */
  var drag = d.querySelector('[data-drag]'), bar = d.querySelector('[data-drag-bar]');
  if (drag) {
    var down = false, sx = 0, sl = 0, moved = false;
    drag.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = drag.scrollLeft; drag.classList.add('is-down'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; drag.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-down'); });
    drag.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { drag.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    function prog() {
      var m = drag.scrollWidth - drag.clientWidth;
      var vis = drag.clientWidth / drag.scrollWidth;
      var p = m > 0 ? drag.scrollLeft / m : 1;
      bar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(1) + '%) scaleX(1)';
      bar.style.width = (vis * 100).toFixed(1) + '%';
    }
    drag.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
  }

  /* hero photo parallax: the image moves slower than the page */
  var par = d.querySelector('[data-par] img');
  if (par && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight * 1.2);
        par.style.transform = 'translateY(' + (-y * 0.12).toFixed(1) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate un nome, una ditta o un ente.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe l\u2019opera e il problema.' };
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

  /* ---------- signature scene: the repair ---------- */
  var sec = d.querySelector('[data-scene]');
  if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
  var steps = [
    ['Danno', 'Fattori ambientali e sali antigelo fanno arrugginire i ferri d\u2019armatura: il calcestruzzo si fessura e si stacca.'],
    ['Demolizione', 'Il calcestruzzo degradato viene rimosso fino ai ferri.'],
    ['Armature', 'I ferri vengono puliti e protetti dalla corrosione.'],
    ['Calcestruzzo spruzzato', 'Il beton spruzzato ricostruisce la sezione.'],
    ['Iniezioni', 'Le fessure vengono iniettate e tornano a tenuta d\u2019acqua.'],
    ['Guaina liquida PU', 'Una guaina fluida impermeabilizza la soletta, con raccordi su ogni forma.'],
    ['Rinforzo in carbonio', 'Lamelle in fibra di carbonio incollate sotto la soletta ne aumentano la portata.']
  ];
  var nowN = sec.querySelector('[data-now-n]'), nowT = sec.querySelector('[data-now-t]'), nowD = sec.querySelector('[data-now-d]');
  var chips = sec.querySelectorAll('[data-chips] li');
  var bad = sec.querySelector('[data-bad]'), exp = sec.querySelector('[data-exp]'), mortar = sec.querySelector('[data-mortar]');
  var cracks = sec.querySelectorAll('[data-crack]'), memb = sec.querySelector('[data-memb]'), cfrp = sec.querySelector('[data-cfrp]');
  var noz = sec.querySelector('[data-noz]'), drops = sec.querySelector('[data-drops]');
  var labs = function (i) { return sec.querySelectorAll('[data-lab="' + i + '"]'); };
  var cur = -1;
  function setStep(i) {
    if (i === cur) return; cur = i;
    nowN.textContent = '0' + (i + 1);
    nowT.textContent = steps[i][0];
    nowD.textContent = steps[i][1];
    chips.forEach(function (c, j) { c.classList.toggle('is-act', j === i); c.classList.toggle('is-done', j < i); });
  }
  function start() {
    gsap.registerPlugin(ScrollTrigger);
    var small = window.innerWidth < 700;
    var svg = sec.querySelector('.sect');
    if (small && svg) svg.setAttribute('viewBox', svg.getAttribute('data-vb-small'));
    var rustC = { fill: '#8f4a26', stroke: '#6d3519' }, steelC = { fill: '#5d656b', stroke: '#a8112e' };
    gsap.set(bad, { opacity: 1 });
    gsap.set(exp.querySelectorAll('circle'), { fill: rustC.fill, stroke: rustC.stroke, strokeWidth: 3 });
    gsap.set(cracks, { stroke: '#3b4247' });
    gsap.set(mortar, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set([memb, cfrp], { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(sec.querySelectorAll('.lab'), { opacity: 0 });
    gsap.set(drops, { opacity: 1, y: -30 });
    gsap.set(noz, { opacity: 0, x: -160 });
    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=230%' : '+=300%', pin: true, scrub: 0.6, anticipatePin: 1,
      onUpdate: function (s) { setStep(Math.min(6, Math.floor(s.progress * 7.2 * 0.999))); } } });
    tl.fromTo(sec.querySelectorAll('.fix__head, .chips'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3, ease: 'power2.out' }, 0);
    // 0 damage: water drops fall into the cracks
    tl.to(drops, { y: 70, duration: 0.8 }, 0.1).to(drops, { opacity: 0, duration: 0.2 }, 0.75);
    tl.to(labs(0), { opacity: 1, duration: 0.15 }, 0.25).to(labs(0), { opacity: 0, duration: 0.15 }, 0.95);
    // 1 demolition: degraded concrete drops out
    tl.to(bad, { y: 60, opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.15);
    tl.to(labs(1), { opacity: 1, duration: 0.15 }, 1.3).to(labs(1), { opacity: 0, duration: 0.15 }, 1.95);
    // 2 rebar cleaned and protected
    tl.to(exp.querySelectorAll('circle'), { fill: steelC.fill, stroke: steelC.stroke, strokeWidth: 5, duration: 0.5 }, 2.2);
    tl.to(labs(2), { opacity: 1, duration: 0.15 }, 2.3).to(labs(2), { opacity: 0, duration: 0.15 }, 2.95);
    // 3 shotcrete: nozzle sweeps and the section fills
    tl.to(noz, { opacity: 1, duration: 0.1 }, 3.05).to(noz, { x: 160, duration: 0.8 }, 3.1).to(noz, { opacity: 0, duration: 0.1 }, 3.85);
    tl.to(mortar, { scaleY: 1, duration: 0.8 }, 3.1);
    tl.to(labs(3), { opacity: 1, duration: 0.15 }, 3.3).to(labs(3), { opacity: 0, duration: 0.15 }, 3.95);
    // 4 injections: cracks fill with resin
    tl.to(cracks, { stroke: '#c99a2e', duration: 0.5 }, 4.2);
    tl.to(labs(4), { opacity: 1, duration: 0.15 }, 4.3).to(labs(4), { opacity: 0, duration: 0.15 }, 4.95);
    // 5 liquid membrane on top
    tl.to(memb, { scaleX: 1, duration: 0.7 }, 5.1);
    tl.to(labs(5), { opacity: 1, duration: 0.15 }, 5.3);
    // 6 carbon strip below, then the final labels
    tl.to(cfrp, { scaleX: 1, duration: 0.7 }, 6.1);
    tl.to([labs(6), labs(2), labs(3), labs(4)], { opacity: 1, duration: 0.2 }, 6.5);
    tl.to({}, { duration: 0.4 }, 7);
    setStep(0);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
