/* Impresa costruzioni Pervangher homepage: deck deal entrance, header, menu, anchors, reveals, accordion with photo swap,
   yard parallax, years count-up, magnetic buttons, form, and the GSAP signature scene (a valley section the camera travels along). */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');

  /* hero deck: every card starts stacked at the deck centre, fans out, then settles into the collage */
  var deck = d.querySelector('.deck');
  if (deck && !reduce) {
    var dr = deck.getBoundingClientRect(), cx = dr.width / 2, cy = dr.height / 2;
    var fan = ['-9deg', '7deg', '-4deg', '11deg'];
    deck.querySelectorAll('.deck__c').forEach(function (c, i) {
      var x = c.offsetLeft + c.offsetWidth / 2, y = c.offsetTop + c.offsetHeight / 2;
      c.style.setProperty('--dx', (cx - x).toFixed(0) + 'px');
      c.style.setProperty('--dy', (cy - y).toFixed(0) + 'px');
      c.style.setProperty('--r1', fan[i]);
    });
  }
  if (reduce) html.classList.add('is-ready', 'is-dealt');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready', 'is-dealt'); }); });

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
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#sezione' ? 0 : header.offsetHeight - 1);
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

  /* yard photo drifts slower than the page */
  var yard = d.querySelector('.yard'), yImg = d.querySelector('.yard__bg img');
  if (yard && yImg && !reduce) {
    var tk = false;
    function yp() {
      tk = false;
      var r = yard.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      yImg.style.transform = 'translateY(' + ((p - 0.5) * -10).toFixed(2) + '%)';
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(yp); } }, { passive: true });
    yp();
  }

  /* years since 1946, counted up (a quantity) */
  var cnt = d.querySelector('[data-since]');
  if (cnt) {
    var to = new Date().getFullYear() - parseInt(cnt.getAttribute('data-since'), 10);
    cnt.textContent = to;
    if (!reduce && 'IntersectionObserver' in window) {
      cnt.textContent = '0';
      var cio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        cio.disconnect();
        var t0 = null;
        requestAnimationFrame(function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - k, 3);
          cnt.textContent = Math.round(to * e);
          if (k < 1) requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      cio.observe(cnt);
    }
  }

  /* accordion, one open at a time, photo swaps */
  var acc = d.querySelector('[data-acc]'), pic = d.querySelector('[data-swap]');
  if (acc) {
    var items = acc.querySelectorAll('.acc__i');
    items.forEach(function (it) {
      it.querySelector('.acc__b').addEventListener('click', function () {
        items.forEach(function (x) {
          var on = x === it;
          x.classList.toggle('is-open', on);
          x.querySelector('.acc__b').setAttribute('aria-expanded', on ? 'true' : 'false');
        });
        var src = it.getAttribute('data-img');
        if (pic && src && pic.getAttribute('src') !== src) {
          pic.classList.add('is-fade');
          setTimeout(function () { pic.src = src; pic.alt = it.getAttribute('data-alt') || ''; pic.classList.remove('is-fade'); }, reduce ? 0 : 240);
        }
      });
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

  /* signature scene: the valley section */
  function scene() {
    var sec = d.querySelector('.valle');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 760px)').matches;
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var stage = q('.valle__stage'), svg = q('.valle__svg');
    stage.classList.add('is-pan');
    var num = q('.valle__num'), name = q('.valle__name'), desc = q('.valle__desc'), dots = qa('.valle__dots li');
    var steps = [
      ['Pareti rocciose', 'Ancoraggi e reti per mettere in sicurezza la roccia.'],
      ['Ripari e bosco', 'Ripari contro gli eventi naturali, opere forestali e rinaturazione.'],
      ['Edifici', 'Costruzioni edili, anche come impresa generale, e risanamenti.'],
      ['Strade e condotte', 'Scavo, fondazione in inerti, pavimentazione, condotte.'],
      ['Argini', 'Arginature dei corsi d’acqua, blocco su blocco.'],
      ['Inerti e calcestruzzo', 'Sabbia, ghiaia e granito, e il calcestruzzo prodotto in proprio.'],
      ['Servizio invernale', 'Quando nevica, le strade restano aperte.']
    ];
    var centres = [430, 720, 1125, 1580, 1980, 2300, 2300];
    function panX(i) {
      var sc = stage.clientHeight / 680, w = 2480 * sc, cw = stage.clientWidth;
      return -Math.max(0, Math.min(w - cw, centres[i] * sc - cw / 2));
    }

    // initial states: every built element starts out of sight
    var anchors = q('.v-anchor'), net = q('.v-net');
    var La = anchors.getTotalLength(); anchors.style.strokeDasharray = La + ' ' + La; anchors.style.strokeDashoffset = La;
    gsap.set(net, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(qa('.v-tree'), { scale: 0, transformOrigin: '50% 100%' });
    gsap.set(qa('.v-fence'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.v-found'), { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(q('.v-walls'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.v-roof'), { y: -90, autoAlpha: 0 });
    var cut = q('.v-cut');
    gsap.set(cut, { autoAlpha: 0 });
    gsap.set(q('.v-gravel'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.v-pipe'), { y: -120, autoAlpha: 0 });
    gsap.set(q('.v-asph'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.v-lane'), { autoAlpha: 0 });
    gsap.set(qa('.v-blk'), { y: -110, autoAlpha: 0 });
    gsap.set(q('.v-silo'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.v-belt'), { autoAlpha: 0 });
    gsap.set(qa('.v-heap'), { scaleY: 0, transformOrigin: '50% 100%' });
    var snow = qa('.v-snow path');
    snow.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
    gsap.set(qa('.v-lab'), { autoAlpha: 0, y: 14 });
    gsap.set(q('.valle__snowfall'), { autoAlpha: 0, y: -40 });
    gsap.set(svg, { x: panX(0) });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=320%' : '+=380%', pin: q('.valle__pin'), scrub: 0.7, invalidateOnRefresh: true,
        onUpdate: function (s) {
          var k = Math.min(6, Math.floor(s.progress * tl.duration() / 2));
          if (num.textContent !== '0' + (k + 1)) {
            num.textContent = '0' + (k + 1); name.textContent = steps[k][0]; desc.textContent = steps[k][1];
            dots.forEach(function (li, i) { li.classList.toggle('is-on', i <= k); });
          }
        }
      }
    });
    // the camera travels from station to station
    for (var i = 1; i < 6; i++) tl.to(svg, { x: function (n) { return function () { return panX(n); }; }(i), duration: 0.9, ease: 'power1.inOut' }, i * 2 - 0.2);
    // 01 rock face
    tl.to(q('.l1'), { autoAlpha: 1, y: 0, duration: 0.3 }, 0.1);
    tl.to(anchors, { strokeDashoffset: 0, duration: 0.8 }, 0.3);
    tl.to(net, { scaleY: 1, duration: 0.9, ease: 'power1.out' }, 1);
    // 02 barriers and forest
    tl.to(q('.l2'), { autoAlpha: 1, y: 0, duration: 0.3 }, 2.6);
    tl.to(qa('.v-fence'), { scaleY: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(1.4)' }, 2.8);
    tl.to(qa('.v-tree'), { scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.6)' }, 3.2);
    // 03 building
    tl.to(q('.l3'), { autoAlpha: 1, y: 0, duration: 0.3 }, 4.6);
    tl.to(q('.v-found'), { scaleY: 1, duration: 0.3 }, 4.7);
    tl.to(q('.v-walls'), { scaleY: 1, duration: 0.7 }, 5);
    tl.to(q('.v-roof'), { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 5.6);
    // 04 road
    tl.to(q('.l4'), { autoAlpha: 1, y: 0, duration: 0.3 }, 6.6);
    tl.to(cut, { autoAlpha: 1, duration: 0.2 }, 6.7);
    tl.to(q('.v-pipe'), { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.in' }, 6.9);
    tl.to(q('.v-gravel'), { scaleY: 1, duration: 0.5 }, 7.2);
    tl.to(q('.v-asph'), { scaleX: 1, duration: 0.5 }, 7.7);
    tl.to(q('.v-lane'), { autoAlpha: 1, duration: 0.2 }, 8.1);
    // 05 embankments
    tl.to(q('.l5'), { autoAlpha: 1, y: 0, duration: 0.3 }, 8.6);
    tl.to(qa('.v-blk'), { y: 0, autoAlpha: 1, duration: 0.3, stagger: 0.14, ease: 'power2.in' }, 8.8);
    // 06 aggregates and concrete
    tl.to(q('.l6'), { autoAlpha: 1, y: 0, duration: 0.3 }, 10.6);
    tl.to(q('.v-silo'), { scaleY: 1, duration: 0.5 }, 10.7);
    tl.to(q('.v-belt'), { autoAlpha: 1, duration: 0.2 }, 11.1);
    tl.to(qa('.v-heap'), { scaleY: 1, duration: 0.5, stagger: 0.15 }, 11.2);
    // 07 winter: snow settles, the road stays clear
    tl.to(q('.valle__snowfall'), { autoAlpha: 1, y: 0, duration: 0.8 }, 12.2);
    tl.to(snow, { strokeDashoffset: 0, duration: 0.9 }, 12.4);
    tl.to(q('.l7'), { autoAlpha: 1, y: 0, duration: 0.3 }, 12.6);
    tl.to({}, { duration: 1 }, 13);

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
