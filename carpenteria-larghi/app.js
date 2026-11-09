/* Carpenteria Larghi: blueprint-frame hero (hairlines draw, photo fades in, headline on the frame edge), header,
   menu, anchors, reveals, service list that swaps the photo, photo band parallax, magnetic buttons, form, and the
   GSAP signature scene: a king-post truss assembled piece by piece (tie beam, rafters, king post, struts), the
   joints bolted, then the roof build-up laid on it layer by layer up to the tiles. Counters, bar and phase list
   read the same timeline. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });
  var kb = d.querySelector('[data-kb]');
  if (kb && !reduce) setTimeout(function () { kb.classList.add('kb'); }, 2000);

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

  /* services: the list drives the photo */
  var list = d.querySelector('[data-swap]');
  if (list) {
    var items = list.querySelectorAll('li'), pics = d.querySelectorAll('.svc__pics img'), cap = d.querySelector('[data-cap]');
    var caps = ['Struttura del tetto. Foto di esempio', 'Copertura in coppi. Foto Carpenteria Larghi', 'Tetto in legno. Foto Carpenteria Larghi', 'Costruzione in legno. Foto Carpenteria Larghi'];
    var pick = function (li) {
      var k = +li.getAttribute('data-img');
      items.forEach(function (o) { o.classList.toggle('is-on', o === li); });
      pics.forEach(function (p, i) { p.classList.toggle('is-on', i === k); });
      if (cap) cap.textContent = caps[k];
    };
    items.forEach(function (li) {
      var b = li.querySelector('button');
      li.addEventListener('mouseenter', function () { pick(li); });
      b.addEventListener('focus', function () { pick(li); });
      b.addEventListener('click', function () { pick(li); });
    });
  }

  /* place band: slow parallax */
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
    trussScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function trussScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); };
    var all = function (s) { return sec.querySelectorAll(s); };
    var M = function (k) { return one('[data-m="' + k + '"]'); };
    var L = function (k) { return one('[data-lab="' + k + '"]'); };
    var ly = function (k) { return all('[data-ly="' + k + '"]'); };
    var jts = all('.jt'), labs = all('.lab'), dim = one('[data-dim]');
    var cP = one('[data-pieces]'), cL = one('[data-layers]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = all('.phases li');
    var phNames = ['', 'Catena', 'Puntoni', 'Monaco e saette', 'Giunzioni', 'Tavolato e isolazione', 'Listelli e tegole'];
    var phDesc = [''];
    phs.forEach(function (li) { var sm = li.querySelector('small'); phDesc.push(sm ? sm.textContent : ''); });
    if (small) one('svg.truss').setAttribute('viewBox', '40 60 920 560');

    gsap.set([M('tie'), M('pl'), M('pr'), M('king'), M('sl'), M('sr')], { autoAlpha: 0 });
    gsap.set(jts, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(all('.ly'), { autoAlpha: 0 });
    gsap.set(labs, { autoAlpha: 0 });
    gsap.set(dim, { autoAlpha: 0 });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var phAt = [0, 0, 1.2, 2.6, 4.2, 5.4, 7.6], pieceAt = [], layerAt = [];
    /* 1 tie beam slides in from the left onto the walls */
    tl.fromTo(M('tie'), { autoAlpha: 0, x: -260 }, { autoAlpha: 1, x: 0, duration: .9 }, .1)
      .to(L('tie'), { autoAlpha: 1, duration: .3 }, .8)
      .to(dim, { autoAlpha: 1, duration: .4 }, .8);
    pieceAt.push(.6);
    /* 2 rafters swing down onto the tie beam, pivoting on the eaves */
    tl.fromTo(M('pl'), { autoAlpha: 0, rotation: -28, svgOrigin: '106 460' }, { autoAlpha: 1, rotation: 0, svgOrigin: '106 460', duration: .9 }, 1.2)
      .fromTo(M('pr'), { autoAlpha: 0, rotation: 28, svgOrigin: '894 460' }, { autoAlpha: 1, rotation: 0, svgOrigin: '894 460', duration: .9 }, 1.45)
      .to(L('tie'), { autoAlpha: 0, duration: .3 }, 1.4)
      .to(L('raf'), { autoAlpha: 1, duration: .3 }, 1.9)
      .to(dim, { autoAlpha: .35, duration: .3 }, 1.4);
    pieceAt.push(1.7, 1.95);
    /* 3 king post drops from above, struts swing in */
    tl.fromTo(M('king'), { autoAlpha: 0, y: -200 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, 2.6)
      .fromTo(M('sl'), { autoAlpha: 0, x: 40, y: 30 }, { autoAlpha: 1, x: 0, y: 0, duration: .6 }, 3.1)
      .fromTo(M('sr'), { autoAlpha: 0, x: -40, y: 30 }, { autoAlpha: 1, x: 0, y: 0, duration: .6 }, 3.3)
      .to(L('raf'), { autoAlpha: 0, duration: .3 }, 2.6)
      .to(L('king'), { autoAlpha: 1, duration: .3 }, 3.0)
      .to(L('strut'), { autoAlpha: 1, duration: .3 }, 3.5);
    pieceAt.push(3.0, 3.5, 3.7);
    /* 4 joints: plates and bolts pop in one by one */
    tl.to([L('king'), L('strut')], { autoAlpha: 0, duration: .3 }, 4.2);
    jts.forEach(function (j, i) { tl.to(j, { scale: 1, duration: .25, ease: 'back.out(2.4)' }, 4.25 + i * .16); });
    /* 5 + 6 roof build-up, left and right slope together, each layer dropping onto the one below */
    var lyAt = [5.4, 6.1, 6.8, 7.6, 8.3];
    [0, 1, 2, 3, 4].forEach(function (k, i) {
      tl.fromTo(ly(k), { autoAlpha: 0, y: -46 }, { autoAlpha: 1, y: 0, duration: .55, ease: 'power3.out' }, lyAt[i]);
      layerAt.push(lyAt[i] + .3);
    });
    tl.to(L('iso'), { autoAlpha: 1, duration: .3 }, 6.4)
      .to(L('iso'), { autoAlpha: 0, duration: .3 }, 7.9)
      .to(L('teg'), { autoAlpha: 1, duration: .3 }, 8.7)
      .to(dim, { autoAlpha: 1, duration: .4 }, 8.8)
      .to(bar, { scaleX: 1, duration: 9.4, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.4);

    var lastP = -1, lastA = -1, lastB = -1;
    function sync() {
      var t = tl.time(), p = 1, a = 0, b = 0;
      for (var i = 1; i < phAt.length; i++) if (t >= phAt[i]) p = i;
      for (var j = 0; j < pieceAt.length; j++) if (t >= pieceAt[j]) a = j + 1;
      for (var k = 0; k < layerAt.length; k++) if (t >= layerAt[k]) b = k + 1;
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.innerHTML = '<b>0' + p + '</b>' + phNames[p] + '<small>' + phDesc[p] + '</small>';
      }
      if (a !== lastA) { lastA = a; cP.textContent = a; }
      if (b !== lastB) { lastB = b; cL.textContent = b; }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
