/* Camponovo Simone: split hero (huge type left, tall photo right that wipes in and then moves slower than the
   page), header, menu, anchors, reveals, magnetic buttons, form, and the GSAP signature scene: a wall finished in
   stucco veneziano. The cracks of the raw wall are filled, then the primer and three coats are swept on by a trowel
   in wide arcs (each sweep uncovers the next texture through an SVG mask), and a sheen runs across the polished
   surface. Counters, label, bar and phase list are all computed from the same timeline time. */
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

  /* hero photo moves slower than the page */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var frame = par.parentNode, pt = false;
    var movePar = function () {
      pt = false;
      var y = window.scrollY;
      if (y > window.innerHeight * 1.4) return;
      frame.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(movePar); } }, { passive: true });
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.1).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.18).toFixed(1) + 'px)';
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
  if (reduce || !window.gsap || !window.ScrollTrigger) html.classList.add('st-off');
  function start() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    html.classList.add('st-on');
    stuccoScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function stuccoScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); };
    var all = function (s) { return sec.querySelectorAll(s); };
    var trowel = one('[data-trowel]'), cracks = one('[data-cracks]'), sheen = one('[data-sheen]'), labt = one('[data-labt]');
    var cCoat = one('[data-coat]'), cGloss = one('[data-gloss]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = all('.phases li');
    var phNames = ['', 'Il muro', 'Il fondo', 'Prima mano', 'Seconda mano', 'Terza mano e lucidatura'];
    var phNum = ['', 'I', 'II', 'III', 'IV', 'V'];
    var labNames = ['', 'Muro grezzo', 'Fondo', 'Prima mano', 'Seconda mano', 'Lucidatura'];
    var phDesc = [''];
    phs.forEach(function (li) { var sm = li.querySelector('small'); phDesc.push(sm ? sm.textContent : ''); });
    var layers = [1, 2, 3, 4].map(function (k) {
      return Array.prototype.map.call(all('[data-layer="' + k + '"] path'), function (p) {
        var L = p.getTotalLength();
        p.style.strokeDasharray = L + ' ' + L;
        p.style.strokeDashoffset = L;
        return { el: p, L: L };
      });
    });
    var win = [[1.2, 2.6], [3.0, 4.8], [5.2, 7.0], [7.4, 9.2]];
    var phAt = [0, 0, 1.0, 3.0, 5.2, 7.4];
    var END = 10.6;
    gsap.set(trowel, { autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline();
    tl.to(cracks, { autoAlpha: 0, duration: .4 }, .9)
      .to(sheen, { x: 1500, duration: 1.1, ease: 'power1.inOut' }, 9.3)
      .to(bar, { scaleX: 1, duration: END - .4, ease: 'none' }, 0)
      .to({}, { duration: .4 }, END - .4);

    var lastP = -1, lastC = -1, lastG = -1;
    function sync() {
      var t = tl.time(), p = 1, coats = 0, active = null, pt = null;
      for (var i = 1; i < phAt.length; i++) if (t >= phAt[i]) p = i;
      layers.forEach(function (paths, k) {
        var a = win[k][0], b = win[k][1];
        var q = Math.max(0, Math.min(1, (t - a) / (b - a)));
        var n = paths.length;
        paths.forEach(function (o, j) {
          var qq = Math.max(0, Math.min(1, q * n - j));
          o.el.style.strokeDashoffset = (o.L * (1 - qq)).toFixed(1);
          if (q > 0 && q < 1 && qq > 0 && qq < 1) { active = o; pt = o.el.getPointAtLength(o.L * qq); }
        });
        if (k > 0 && q >= .98) coats++;
      });
      if (active && pt) {
        trowel.style.opacity = 1; trowel.style.visibility = 'visible';
        trowel.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
      } else { trowel.style.opacity = 0; }
      var g = t < 7.4 ? 0 : t < 9.2 ? Math.round((t - 7.4) / 1.8 * 70) : Math.round(70 + Math.min(1, (t - 9.2) / 1.2) * 30);
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.innerHTML = '<b>' + phNum[p] + '</b>' + phNames[p] + '<small>' + phDesc[p] + '</small>';
        if (labt) labt.textContent = labNames[p];
      }
      if (coats !== lastC) { lastC = coats; cCoat.textContent = coats; }
      if (g !== lastG) { lastG = g; cGloss.textContent = g; }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=220%' : '+=320%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
