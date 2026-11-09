/* Impresa pittura Franzoni homepage: hero entrance and photo parallax, header, menu, anchors, reveals, service list with photo swap,
   drag strip, generation line and year count, magnetic buttons, form, and the GSAP signature scene (facade repainted by the roller). */
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

  /* anchors with header offset (the pinned scene starts at its own top) */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#facciata' ? 0 : header.offsetHeight - 1);
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

  /* scroll-linked bits: hero photo parallax, generation line */
  var heroImg = d.querySelector('.hero__img'), heroFrame = d.querySelector('.hero__frame');
  var gens = d.querySelector('[data-line]'), gensFill = d.querySelector('.gens__line span');
  var tick = false;
  function frame() {
    tick = false;
    var vh = window.innerHeight;
    if (heroImg && heroFrame) {
      var r = heroFrame.getBoundingClientRect();
      if (r.bottom > 0) heroImg.style.transform = 'translateY(' + (-Math.min(1, Math.max(0, -r.top / r.height + 0.0)) * 14 - 2).toFixed(2) + '%)';
    }
    if (gens && gensFill) {
      var g = gens.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.75 - g.top) / g.height));
      gensFill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* years in business count up (a quantity: years since 1895) */
  var cnt = d.querySelector('[data-since]');
  if (cnt) {
    var to = new Date().getFullYear() - parseInt(cnt.getAttribute('data-since'), 10);
    cnt.textContent = to;
    if (!reduce && 'IntersectionObserver' in window) {
      cnt.textContent = '0';
      var cio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        cio.disconnect();
        var t0 = null, dur = 1600;
        requestAnimationFrame(function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          cnt.textContent = Math.round(to * e);
          if (k < 1) requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      cio.observe(cnt);
    }
  }

  /* services: hover, focus or tap swaps the photo */
  var pic = d.querySelector('[data-swap]'), sItems = d.querySelectorAll('.serv__list li');
  function setServ(li) {
    sItems.forEach(function (x) { x.classList.toggle('is-on', x === li); });
    var src = li.getAttribute('data-img');
    if (!pic || !src || pic.getAttribute('src') === src) return;
    pic.classList.add('is-fade');
    setTimeout(function () { pic.src = src; pic.alt = li.getAttribute('data-alt') || ''; pic.classList.remove('is-fade'); }, reduce ? 0 : 220);
  }
  sItems.forEach(function (li) {
    var b = li.querySelector('button');
    b.addEventListener('click', function () { setServ(li); });
    b.addEventListener('focus', function () { setServ(li); });
    li.addEventListener('mouseenter', function () { if (window.matchMedia('(pointer: fine)').matches) setServ(li); });
  });
  if (sItems[0]) sItems[0].classList.add('is-on');

  /* drag strip with progress bar */
  var strip = d.querySelector('[data-drag]'), bar = d.querySelector('.strip__bar span');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    function prog() { if (bar) bar.style.transform = 'scaleX(' + Math.min(1, (strip.scrollLeft + strip.clientWidth) / strip.scrollWidth).toFixed(3) + ')'; }
    strip.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
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

  /* signature scene: the facade, coat by coat */
  function scene() {
    var sec = d.querySelector('.paint');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 760px)').matches;
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var svg = q('.paint__svg'), cracks = qa('.sv-cracks path'), patches = qa('.sv-patches rect');
    var pStr = qa('.st--p'), cStr = qa('.st--c'), roller = q('.sv-roller'), cyl = q('.rl-cyl');
    var color = q('.sv-color'), pctBox = q('.paint__pct'), pct = q('.paint__pctn'), card = q('.paint__card');
    var pcs = qa('.pc'), chips = qa('.chip'), list = qa('.paint__list li'), num = q('.paint__num'), name = q('.paint__name');
    var names = ['Sopralluogo e diagnosi', 'Preparazione', 'Colore a rullo', 'La tinta giusta'];
    var cols = ['#E8752E', '#ECEBE6', '#F1CC3A'];

    cracks.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    gsap.set(patches, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set([pStr, cStr], { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(roller, { x: 102, y: 168, autoAlpha: 0 });
    gsap.set(svg, { autoAlpha: 0, y: 30 });
    gsap.set(pctBox, { autoAlpha: 0 });
    gsap.set(card, { autoAlpha: 0, y: 30 });
    gsap.set([pcs[1], pcs[2]], { autoAlpha: 0 });
    var st = { pct: 0 };
    pct.textContent = '0';

    var cx = function (i) { return 70 + 63 * i + 32; };
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=230%' : '+=300%', pin: q('.paint__pin'), scrub: 0.6,
        onUpdate: function (s) {
          var t = s.progress * tl.duration(), k = t < 2.7 ? 0 : t < 5.3 ? 1 : t < 8.8 ? 2 : 3;
          num.textContent = '0' + (k + 1); name.textContent = names[k];
          list.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
          var c = t < 10 ? 0 : t < 11.4 ? 1 : 2;
          chips.forEach(function (ch, i) { ch.classList.toggle('is-on', k === 3 && i === c); });
        }
      }
    });
    tl.to(svg, { autoAlpha: 1, y: 0, duration: 0.5 }, 0);
    // 01 diagnosis: cracks appear on the raw plaster
    cracks.forEach(function (p, i) { tl.to(p, { strokeDashoffset: 0, duration: 0.9 }, 0.5 + i * 0.25); });
    // 02 preparation: cracks filled, primer rolled on stripe by stripe
    tl.to(patches, { scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.6)' }, 2.1);
    tl.to(cracks, { opacity: 0, duration: 0.4 }, 2.5);
    tl.to(roller, { autoAlpha: 1, duration: 0.2 }, 2.7);
    tl.set(cyl, { fill: '#F4F5F3' }, 2.7);
    pStr.forEach(function (r, i) {
      var t0 = 2.8 + i * 0.4;
      tl.set(roller, { x: cx(i), y: 168 }, t0);
      tl.to(r, { scaleY: 1, duration: 0.38 }, t0);
      tl.to(roller, { y: 548, duration: 0.38 }, t0);
    });
    tl.to(patches, { opacity: 0, duration: 0.3 }, 5.2);
    // 03 colour, two coats in one pass per field, the % follows
    tl.set(cyl, { fill: cols[0] }, 5.4);
    tl.to(pctBox, { autoAlpha: 1, duration: 0.3 }, 5.3);
    cStr.forEach(function (r, i) {
      var t0 = 5.4 + i * 0.52;
      tl.set(roller, { x: cx(i), y: 168 }, t0);
      tl.to(r, { scaleY: 1, duration: 0.5 }, t0);
      tl.to(roller, { y: 548, duration: 0.5 }, t0);
    });
    tl.to(st, { pct: 100, duration: 3.1, onUpdate: function () { pct.textContent = Math.round(st.pct); } }, 5.4);
    // 04 the colour of their own jobs: the same facade takes the tints of Solduno, Orselina, Minusio
    tl.to(roller, { autoAlpha: 0, y: 600, duration: 0.4 }, 8.6);
    tl.to(pctBox, { autoAlpha: 0, duration: 0.3 }, 8.8);
    tl.to(card, { autoAlpha: 1, y: 0, duration: 0.5 }, 8.9);
    tl.to(color, { fill: cols[1], duration: 0.6 }, 10);
    tl.to(pcs[1], { autoAlpha: 1, duration: 0.5 }, 10);
    tl.to(color, { fill: cols[2], duration: 0.6 }, 11.4);
    tl.to(pcs[2], { autoAlpha: 1, duration: 0.5 }, 11.4);
    tl.to({}, { duration: 0.8 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
