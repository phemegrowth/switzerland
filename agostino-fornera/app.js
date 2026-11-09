/* Agostino Fornera SA homepage: hero hexagon reveal and years count-up, header, menu, anchors, reveals, spec rows with photo swap,
   place parallax, dates line, magnetic buttons, form, and the GSAP signature scene (isometric frame from rebar to plaster). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* hero figure: years since the SA was formed (1997), counted up */
  var fig = d.querySelector('[data-count-since]');
  if (fig) {
    var to = new Date().getFullYear() - parseInt(fig.getAttribute('data-count-since'), 10);
    fig.textContent = to;
    var lab = fig.closest('.fig'); if (lab) lab.setAttribute('aria-label', to + ' anni come società anonima');
    if (!reduce) {
      fig.textContent = '0';
      setTimeout(function () {
        var t0 = null;
        requestAnimationFrame(function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
          fig.textContent = Math.round(to * e);
          if (k < 1) requestAnimationFrame(step);
        });
      }, 250);
    }
  }

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

  /* anchors */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#cantiere' ? 0 : header.offsetHeight - 1);
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

  /* scroll-linked: place photo parallax, dates line */
  var place = d.querySelector('.place'), pImg = d.querySelector('.place__bg img'), dates = d.querySelector('[data-line]');
  var tk = false;
  function frame() {
    tk = false;
    var vh = window.innerHeight;
    if (place && pImg) {
      var r = place.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) pImg.style.transform = 'translateY(' + (((vh - r.top) / (vh + r.height) - 0.5) * -12).toFixed(2) + '%)';
    }
    if (dates) {
      var g = dates.getBoundingClientRect();
      dates.style.setProperty('--p', Math.min(1, Math.max(0, (vh * 0.85 - g.top) / (vh * 0.5))).toFixed(3));
    }
  }
  if (!reduce) { window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(frame); } }, { passive: true }); frame(); }
  else if (dates) dates.style.setProperty('--p', 1);

  /* spec rows: hover, focus or tap swaps the photo */
  var pic = d.querySelector('[data-swap]'), rows = d.querySelectorAll('.row');
  function setRow(r) {
    rows.forEach(function (x) { x.classList.toggle('is-on', x === r); });
    var src = r.getAttribute('data-img');
    if (!pic || !src || pic.getAttribute('src') === src) return;
    pic.classList.add('is-fade');
    setTimeout(function () { pic.src = src; pic.alt = r.getAttribute('data-alt') || ''; pic.classList.remove('is-fade'); }, reduce ? 0 : 220);
  }
  rows.forEach(function (r) {
    r.setAttribute('tabindex', '0');
    r.addEventListener('mouseenter', function () { setRow(r); });
    r.addEventListener('focus', function () { setRow(r); });
    r.addEventListener('click', function () { setRow(r); });
  });
  if (rows[0]) rows[0].classList.add('is-on');

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

  /* signature scene: the isometric frame, from rebar to plaster */
  function scene() {
    var sec = d.querySelector('.iso');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 760px)').matches;
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var svg = q('.iso__svg'), num = q('.iso__num'), name = q('.iso__name'), desc = q('.iso__desc'), bar = q('.iso__bar span'), list = qa('.iso__list li');
    var steps = [
      ['Fondazione', 'La platea in calcestruzzo, con i ferri di ripresa per i pilastri.'],
      ['Ferri e casseri', 'Le gabbie d’armatura dei pilastri e delle travi, poi i casseri.'],
      ['Cemento armato', 'Il getto: pilastri e travi prendono forma, i casseri si tolgono.'],
      ['Muratura', 'Le pareti salgono tra i pilastri, corso dopo corso.'],
      ['Intonaco e gesso', 'L’intonaco chiude la muratura, poi le finiture in gesso.']
    ];
    var fnd = q('.i-found'), rebP = q('.i-rebar--p'), rebS = q('.i-rebar--s'), forms = qa('.i-form'), sform = q('.i-sform');
    var cols = qa('.i-col'), slab = q('.i-slab'), cw = qa('.cwy, .cwx'), cp = q('.cp'), wins = q('.i-wins');
    [rebP, rebS].forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    gsap.set(fnd, { y: 40, autoAlpha: 0 });
    gsap.set(forms, { autoAlpha: 0 });
    gsap.set(sform, { autoAlpha: 0 });
    gsap.set(cols, { autoAlpha: 0 });
    gsap.set(slab, { autoAlpha: 0, y: -20 });
    gsap.set(cw, { y: 200 });
    gsap.set(cp, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(wins, { autoAlpha: 0 });
    gsap.set(qa('.i-lab'), { autoAlpha: 0 });
    gsap.set(svg, { scale: 0.92, transformOrigin: '50% 50%' });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=240%' : '+=300%', pin: q('.iso__pin'), scrub: 0.6,
        onUpdate: function (s) {
          var k = Math.min(4, Math.floor(s.progress * tl.duration() / 2.4));
          bar.style.transform = 'scaleX(' + s.progress.toFixed(3) + ')';
          if (num.textContent !== '0' + (k + 1)) {
            num.textContent = '0' + (k + 1); name.textContent = steps[k][0]; desc.textContent = steps[k][1];
            list.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
          }
        }
      }
    });
    tl.to(svg, { scale: 1, duration: 12 }, 0);
    // 01 foundation
    tl.to(fnd, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0.2);
    tl.to(q('.lb1'), { autoAlpha: 1, duration: 0.3 }, 0.8);
    // 02 rebar then formwork
    tl.to(rebP, { strokeDashoffset: 0, duration: 1.3 }, 2.4);
    tl.to(rebS, { strokeDashoffset: 0, duration: 0.6 }, 3.3);
    tl.to(forms, { autoAlpha: 0.92, duration: 0.4, stagger: 0.1 }, 3.9);
    tl.to(q('.lb2'), { autoAlpha: 1, duration: 0.3 }, 2.6);
    // 03 concrete: columns fill, beams formwork, beams, forms off
    tl.to(cols, { autoAlpha: 1, duration: 0.4, stagger: 0.12 }, 4.9);
    tl.to(sform, { autoAlpha: 0.92, duration: 0.3 }, 5.3);
    tl.to(slab, { autoAlpha: 1, y: 0, duration: 0.5 }, 5.7);
    tl.to([forms, sform], { autoAlpha: 0, duration: 0.5 }, 6.3);
    tl.to(q('.lb3'), { autoAlpha: 1, duration: 0.3 }, 5.4);
    // 04 masonry rises between the columns
    tl.to(cw, { y: 0, duration: 1.6 }, 7.3);
    tl.to(q('.lb4'), { autoAlpha: 1, duration: 0.3 }, 7.6);
    // 05 plaster sweeps across, windows open
    tl.to(cp, { scaleX: 1, duration: 1.4 }, 9.7);
    tl.to(wins, { autoAlpha: 1, duration: 0.4 }, 10.9);
    tl.to(q('.lb5'), { autoAlpha: 1, duration: 0.3 }, 10);
    tl.to({}, { duration: 0.6 }, 11.4);

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
