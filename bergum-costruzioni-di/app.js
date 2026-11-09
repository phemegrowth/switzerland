/* Bergum Costruzioni: page behaviour */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.classList.toggle('open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Hero: headline lines rise, the closed stack of cards fans out into a collage */
  var hero = document.querySelector('.hero');
  if (reduce) { hero.classList.add('go', 'fan'); }
  else requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      hero.classList.add('go');
      setTimeout(function () { hero.classList.add('fan'); }, 180);
    });
  });

  /* Reveals */
  var rs = document.querySelectorAll('.r');
  if (reduce || !('IntersectionObserver' in window)) {
    rs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 4) * 80 + 'ms';
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else io.observe(el);
    });
  }

  /* Magnetic button */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.22) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var box = f.closest('.f'), err = box.querySelector('.err'), msg = '', v = f.value.trim();
        if (!v) msg = 'Campo obbligatorio.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Indirizzo email non valido.';
        else if (f.type === 'tel' && v.replace(/\D/g, '').length < 9) msg = 'Numero di telefono non valido.';
        box.classList.toggle('bad', !!msg); err.textContent = msg;
        if (msg && ok) { ok = false; f.focus(); }
      });
      if (!ok) e.preventDefault();
    });
  }

  /* Signature scene: one wall, re-laid in three bonds, then plastered and levelled */
  var scene = document.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var phone = window.matchMedia('(max-width: 900px)').matches;
  var svg = scene.querySelector('.scene__svg');
  var U = 44, H = 26, C = 12, X0 = 40, Y0 = 60, W = 12;
  function layout(name, c) {
    var even = c % 2 === 0, out = [], i, x;
    if (name === 'run') {
      if (even) for (i = 0; i < 6; i++) out.push([2 * i, 2, 's']);
      else { out.push([0, 1, 'h']); for (i = 0; i < 5; i++) out.push([1 + 2 * i, 2, 's']); out.push([11, 1, 'h']); }
    } else if (name === 'eng') {
      if (even) for (i = 0; i < 6; i++) out.push([2 * i, 2, 's']);
      else for (i = 0; i < 12; i++) out.push([i, 1, 'h']);
    } else {
      if (even) { x = 0; for (i = 0; i < 4; i++) { out.push([x, 2, 's']); out.push([x + 2, 1, 'h']); x += 3; } }
      else { out.push([0, 0.5, 'h']); x = 0.5; for (i = 0; i < 3; i++) { out.push([x, 2, 's']); out.push([x + 2, 1, 'h']); x += 3; } out.push([x, 2, 's']); out.push([x + 2, 0.5, 'h']); }
    }
    return out;
  }
  var FILL = { s: '#B3B8BB', h: '#7C8488' };
  function target(name, c, k) {
    var lay = layout(name, c);
    if (k < lay.length) return { x: X0 + lay[k][0] * U + 2, width: lay[k][1] * U - 4, fill: FILL[lay[k][2]], opacity: 1 };
    return { x: X0 + W * U, width: 0, fill: FILL.s, opacity: 0 };
  }
  var count = function (name) { var n = 0; for (var c = 0; c < C; c++) n += layout(name, c).length; return n; };
  var N = { run: count('run'), eng: count('eng'), fle: count('fle') };

  var bricks = [].slice.call(svg.querySelectorAll('.b'));
  var bonds = scene.querySelectorAll('.bonds li');
  var cnt = scene.querySelector('.cnt');
  var curT = scene.querySelector('.cur-t'), curS = scene.querySelector('.cur-s');
  var plaster = svg.querySelector('.b-plaster'), level = svg.querySelector('.b-level'), bubble = svg.querySelector('.b-bubble');

  function build() {
    /* start: running bond, every brick lifted out of sight above the wall */
    bricks.forEach(function (b) {
      var c = +b.dataset.c, k = +b.dataset.k, t = target('run', c, k);
      b.classList.remove('b--s', 'b--h');
      b.setAttribute('x', t.x); b.setAttribute('width', Math.max(0, t.width)); b.setAttribute('fill', t.fill);
      gsap.set(b, { opacity: 0, y: -60 });
    });
    if (phone) svg.setAttribute('viewBox', '30 18 600 368');
    var mortar = svg.querySelector('.b-mortar'), ruler = svg.querySelector('.b-ruler');
    gsap.set([mortar, ruler], { opacity: 0 });
    gsap.set(plaster, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(level, { opacity: 0, y: -30 });
    gsap.set(bubble, { attr: { cx: X0 + 160 } });
    var meter = { n: 0 };
    function setN() { cnt.textContent = Math.round(meter.n); }
    setN();

    var B = [0, 2.6, 4.6, 6.6];
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to([mortar, ruler], { opacity: 1, duration: 0.2 }, 0.02);
    /* 1: laid course by course, running bond */
    for (var c = 0; c < C; c++) {
      var row = bricks.filter(function (b) { return +b.dataset.c === c && +b.dataset.k < layout('run', c).length; });
      tl.to(row, { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' }, 0.15 + c * 0.18);
    }
    tl.to(meter, { n: N.run, duration: 2.2, onUpdate: setN }, 0.15);
    /* 2 and 3: the same bricks slide into English bond, then Flemish bond */
    function morph(name, at) {
      bricks.forEach(function (b) {
        var c = +b.dataset.c, k = +b.dataset.k, t = target(name, c, k);
        tl.to(b, { attr: { x: t.x, width: Math.max(0, t.width), fill: t.fill }, opacity: t.opacity, y: 0, duration: 0.8, ease: 'power2.inOut' }, at + 0.15 + c * 0.04);
      });
      tl.to(meter, { n: N[name], duration: 0.9, onUpdate: setN }, at + 0.15);
    }
    morph('eng', B[1]);
    morph('fle', B[2]);
    /* 4: plaster spreads over part of the wall, the level lands and its bubble settles */
    tl.to(plaster, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, B[3] + 0.1)
      .to(level, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, B[3] + 0.9)
      .to(bubble, { attr: { cx: X0 + 210 }, duration: 0.6, ease: 'elastic.out(1, .5)' }, B[3] + 1.3)
      .to({}, { duration: 0.5 });

    var copy = [];
    bonds.forEach(function (li) { copy.push([li.querySelector('b').textContent, li.querySelector('span').textContent]); });
    var last = -1;
    function setStep() {
      var t = tl.time(), s = 0;
      for (var i = 0; i < B.length; i++) if (t >= B[i] + (i ? 0.1 : 0)) s = i;
      if (s === last) return;
      last = s;
      bonds.forEach(function (li, i) { li.classList.toggle('is-on', i === s); li.classList.toggle('is-done', i < s); });
      curT.textContent = copy[s][0]; curS.textContent = copy[s][1];
    }
    tl.eventCallback('onUpdate', setStep);
    setStep();

    ScrollTrigger.create({
      trigger: scene,
      pin: scene.querySelector('.scene__pin'),
      start: 'top top',
      end: phone ? '+=180%' : '+=260%',
      scrub: 0.6,
      animation: tl
    });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { build(); ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
