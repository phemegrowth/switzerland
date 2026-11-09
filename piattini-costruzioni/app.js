/* Piattini homepage: header, menu, anchors, reveals, hero collage (stack, fan, settle), services rows that swap the photo,
   count-up, drag strip, process line, magnetic buttons, form, and the GSAP signature scene: five photo triangles fly in
   and build the Piattini mark from the ground up, then turn into the logo colours. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('rm');

  /* hero collage: stacked in the centre, fans out, settles into the collage (total about 1.2 s) */
  var col = d.querySelector('[data-collage]');
  var cards = col ? Array.prototype.slice.call(col.querySelectorAll('.card')) : [];
  if (cards.length && !reduce) {
    var cr = col.getBoundingClientRect(), cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    var fan = [-14, 9, -6, 15, -2];
    var off = cards.map(function (c) { var r = c.getBoundingClientRect(); return [cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)]; });
    cards.forEach(function (c, i) {
      c.style.transition = 'none';
      c.style.transform = 'translate(' + off[i][0].toFixed(0) + 'px,' + off[i][1].toFixed(0) + 'px) rotate(' + (i * 2 - 4) + 'deg) scale(.86)';
    });
    col.offsetWidth; // commit the stacked state
    requestAnimationFrame(function () {
      cards.forEach(function (c, i) {
        c.style.transition = 'transform .45s cubic-bezier(.3,.7,.2,1) ' + (i * 40) + 'ms';
        c.style.transform = 'translate(' + (off[i][0] * .45).toFixed(0) + 'px,' + (off[i][1] * .45).toFixed(0) + 'px) rotate(' + fan[i] + 'deg) scale(.94)';
      });
      setTimeout(function () {
        cards.forEach(function (c, i) {
          c.style.transition = 'transform .75s cubic-bezier(.22,.8,.2,1) ' + (i * 50) + 'ms';
          c.style.transform = '';
        });
      }, 520);
    });
  }
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
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : header.offsetHeight - 1), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

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

  /* count-up for sourced quantities only */
  reveal(d.querySelectorAll('[data-count]'), function (el) {
    var to = +el.getAttribute('data-count');
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    el.textContent = '0'; requestAnimationFrame(step);
  });

  /* services: active row (hover on desktop, centre of screen while scrolling) swaps the large photo */
  var rows = d.querySelectorAll('[data-rows] .row'), rimg = d.querySelector('[data-rows-img]'), curSrc = rimg ? rimg.getAttribute('src') : '';
  function activate(row) {
    rows.forEach(function (r) { r.classList.toggle('is-on', r === row); });
    var src = row.getAttribute('data-img');
    if (!rimg || src === curSrc) return;
    curSrc = src;
    if (reduce) { rimg.src = src; return; }
    rimg.classList.add('is-out');
    setTimeout(function () { var im = new Image(); im.onload = im.onerror = function () { rimg.src = src; rimg.classList.remove('is-out'); }; im.src = src; }, 220);
  }
  rows.forEach(function (r) { r.addEventListener('mouseenter', function () { activate(r); }); });
  if ('IntersectionObserver' in window && rows.length) {
    var rio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) activate(e.target); }); }, { rootMargin: '-46% 0px -46% 0px' });
    rows.forEach(function (r) { rio.observe(r); });
  }

  /* drag strip with a progress bar */
  var strip = d.querySelector('[data-drag]'), bar = d.querySelector('[data-drag-bar]');
  if (strip) {
    function sync() {
      if (!bar) return;
      var max = strip.scrollWidth - strip.clientWidth, w = strip.clientWidth / strip.scrollWidth;
      bar.style.width = (w * 100).toFixed(1) + '%';
      bar.style.transform = 'translateX(' + (max > 0 ? (strip.scrollLeft / max) * ((1 - w) / w) * 100 : 0).toFixed(1) + '%)';
    }
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    if (window.matchMedia('(pointer: fine)').matches) {
      var down = false, sx = 0, sl = 0, moved = false;
      strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag'); });
      window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; strip.scrollLeft = sl - dx; });
      window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
      strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    }
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* process line draws with scroll */
  d.querySelectorAll('[data-steps]').forEach(function (list) {
    var st = list.querySelectorAll('.step');
    function draw() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.78 - r.top) / (r.height + vh * 0.2)));
      list.style.setProperty('--p', p.toFixed(3));
      st.forEach(function (it, i) { it.classList.toggle('is-lit', p >= i / st.length + 0.02 || p === 1); });
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  });

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.24).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Indicate nome e cognome.', phone: 'Indicate un numero per richiamarvi.', email: 'Indicate un indirizzo email valido.', message: 'Descrivete in due righe il lavoro.' };
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

  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    markScene(window.innerWidth < 860);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  /* Signature scene: the Piattini mark is built from five photo triangles, bottom first; then it becomes the logo */
  function markScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var tris = Array.prototype.slice.call(sec.querySelectorAll('.tri')).sort(function (a, b) { return a.getAttribute('data-tri') - b.getAttribute('data-tri'); });
    var fills = sec.querySelectorAll('.tri__fill'), tags = sec.querySelectorAll('.tri__tag'), ghost = sec.querySelector('.mk-ghost');
    var items = sec.querySelectorAll('.phases li'), endLine = sec.querySelector('[data-end]');
    var ui = { n: sec.querySelector('[data-p-n]'), t: sec.querySelector('[data-p-t]'), d: sec.querySelector('[data-p-d]') };
    var k = small ? 0.75 : 1;
    tris.forEach(function (t) {
      var f = t.getAttribute('data-from').split(',').map(Number);
      gsap.set(t, { x: f[0] * k, y: f[1] * k, rotation: f[2], autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' });
    });
    gsap.set(tags, { autoAlpha: 0 });
    gsap.set(endLine, { autoAlpha: 0, y: 12 });
    var cur = -2;
    function show(i) {
      if (i === cur) return; cur = i;
      var j = Math.max(0, Math.min(4, i));
      items.forEach(function (li, m) { li.classList.toggle('is-on', m === j && i >= 0 && i < 5); li.classList.toggle('is-done', m < j || i >= 5); });
      ui.n.textContent = '0' + (j + 1);
      ui.t.textContent = items[j].getAttribute('data-t');
      ui.d.textContent = items[j].getAttribute('data-d');
    }
    var T0 = 0.4, STEP = 0.9;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: function () { var t = tl.time(); show(t < T0 + STEP * 0.5 ? 0 : Math.min(5, Math.floor((t - T0 + STEP * 0.5) / STEP))); },
      scrollTrigger: { trigger: sec, start: 'top top', end: small ? '+=190%' : '+=260%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    tl.fromTo(sec.querySelectorAll('.mark__text > .eyebrow, .mark__text > .h2, .phase, .phases'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out' }, 0);
    tris.forEach(function (t, i) {
      tl.to(t, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: STEP * 0.95, ease: 'power3.out' }, T0 + i * STEP);
      tl.to(tags[i], { autoAlpha: 1, duration: 0.15 }, T0 + i * STEP + STEP * 0.8);
    });
    var TE = T0 + tris.length * STEP;
    tl.to(tags, { autoAlpha: 0, duration: 0.2 }, TE)
      .to(fills, { opacity: 1, duration: 0.6, stagger: 0.08 }, TE + 0.05)
      .to(ghost, { autoAlpha: 0, duration: 0.3 }, TE)
      .to(endLine, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, TE + 0.4)
      .to({}, { duration: 0.5 });
    show(0);
  }
})();
