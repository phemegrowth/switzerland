/* Studio Immobiliare Comolatti: arched-frame hero (the arch line draws itself, the photo rises inside it), header,
   menu, anchors, reveals, accordion, lake band parallax, magnetic buttons, form, and the GSAP signature scene: a
   lakeside condominium in PPP. The building draws, its twelve units light up floor by floor, the four common parts
   are outlined (what the administration looks after), one unit goes on sale and is sold. Counters, bar and phase
   list read the same timeline. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });
  var kb = d.querySelector('[data-kb]');
  if (kb && !reduce) setTimeout(function () { kb.classList.add('kb'); }, 2200);

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

  /* accordion */
  d.querySelectorAll('[data-acc] .acc__it').forEach(function (it, i, all) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      all.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      if (open) { it.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* lake band: slow parallax */
  var par = d.querySelector('[data-par]');
  if (par && !reduce) {
    var pt = false;
    var movePar = function () {
      pt = false;
      var r = par.parentNode.parentNode.getBoundingClientRect(), vh = window.innerHeight;
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
    pppScene(window.innerWidth < 961);
    var rf = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', rf);
    setTimeout(rf, 1200);
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);

  function pppScene(small) {
    var sec = d.querySelector('[data-scene]');
    if (!sec) return;
    var one = function (s) { return sec.querySelector(s); };
    var all = function (s) { return sec.querySelectorAll(s); };
    var units = Array.prototype.slice.call(all('.unit'));
    var body = one('.bldg__body'), bldg = one('[data-bldg]'), stairw = one('[data-stairw]');
    var cps = all('.cp'), sale = one('[data-sale]'), tag = one('[data-tag]'), tagt = one('[data-tagt]'), stamp = one('[data-stamp]'), lead = one('.sale__lead');
    var cU = one('[data-units]'), cC = one('[data-common]'), bar = one('[data-bar]'), now = one('[data-now]'), phs = all('.phases li');
    var phNames = ['', 'Lo stabile', 'Le unità', 'Le parti comuni', 'Una vendita', 'Venduto'];
    var phNum = ['', 'I', 'II', 'III', 'IV', 'V'];
    var phDesc = [''];
    phs.forEach(function (li) { var sm = li.querySelector('small'); phDesc.push(sm ? sm.textContent : ''); });
    var saleUnit = units[4];
    if (small) one('svg.bld').setAttribute('viewBox', '160 66 830 560');

    /* floors light from the ground up: floor 3 is the lowest */
    var order = units.slice().sort(function (a, b) { return (+b.getAttribute('data-f')) - (+a.getAttribute('data-f')) || (+a.getAttribute('data-c')) - (+b.getAttribute('data-c')); });
    gsap.set(bldg, { autoAlpha: 0, y: 30 });
    gsap.set([stairw, units], { autoAlpha: 0 });
    gsap.set(cps, { autoAlpha: 0 });
    gsap.set(sale, { autoAlpha: 1 });
    gsap.set([tag, lead, stamp], { autoAlpha: 0 });
    gsap.set(stamp, { scale: 1.6, transformOrigin: '50% 50%' });
    gsap.set(bar, { scaleX: 0 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    var phAt = [0, 0, 1.4, 4.4, 6.7, 8.2], unitAt = [], cpAt = [];
    /* 1 the building rises */
    tl.to(bldg, { autoAlpha: 1, y: 0, duration: 1 }, .1)
      .to([stairw].concat(units), { autoAlpha: 1, duration: .4 }, .9);
    /* 2 units light up floor by floor */
    order.forEach(function (u, i) {
      var t = 1.5 + i * .22;
      unitAt.push(t);
      tl.fromTo(u, { scale: .9, transformOrigin: '50% 50%' }, { scale: 1, duration: .3, ease: 'back.out(2)' }, t);
    });
    /* 3 common parts */
    cps.forEach(function (c, i) {
      var t = 4.5 + i * .45; cpAt.push(t);
      tl.fromTo(c, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .35 }, t);
    });
    tl.to(cps, { autoAlpha: .25, duration: .4 }, 6.5);
    /* 4 one unit goes on sale */
    tl.fromTo(lead, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, 6.8)
      .fromTo(tag, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: .45 }, 6.9);
    /* 5 sold */
    tl.to(stamp, { autoAlpha: 1, scale: 1, duration: .35, ease: 'back.out(2.4)' }, 8.25)
      .to(bar, { scaleX: 1, duration: 9.6, ease: 'none' }, 0)
      .to({}, { duration: .5 }, 9.6);

    var lastP = -1, lastU = -1, lastC = -1;
    function sync() {
      var t = tl.time(), p = 1, u = 0, c = 0;
      for (var i = 1; i < phAt.length; i++) if (t >= phAt[i]) p = i;
      for (var j = 0; j < unitAt.length; j++) if (t >= unitAt[j]) u = j + 1;
      for (var k = 0; k < cpAt.length; k++) if (t >= cpAt[k]) c = k + 1;
      order.forEach(function (el, idx) { el.classList.toggle('is-lit', idx < u); });
      saleUnit.classList.toggle('is-sale', t >= 6.7 && t < 8.2);
      saleUnit.classList.toggle('is-sold', t >= 8.2);
      tagt.textContent = t >= 8.2 ? 'Venduto' : 'In vendita';
      if (p !== lastP) {
        lastP = p;
        phs.forEach(function (li) { li.classList.toggle('is-on', +li.getAttribute('data-ph') === p); });
        if (now) now.innerHTML = '<b>' + phNum[p] + '</b>' + phNames[p] + '<small>' + phDesc[p] + '</small>';
      }
      if (u !== lastU) { lastU = u; cU.textContent = u; }
      if (c !== lastC) { lastC = c; cC.textContent = c; }
    }
    tl.eventCallback('onUpdate', sync);
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: small ? '+=220%' : '+=300%', pin: true, scrub: .6, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    sync();
  }
})();
