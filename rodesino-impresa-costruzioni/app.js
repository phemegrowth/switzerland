/* Rodesino Impresa Costruzioni: page behaviour */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Year */
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-small', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
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

  /* Hero entrance: starts on the first frame, headline visible in about 1 s */
  var hero = document.querySelector('.hero');
  var counters = hero.querySelectorAll('.count');
  if (reduce) {
    hero.classList.add('go');
  } else {
    counters.forEach(function (c) { c.textContent = '0'; });
    requestAnimationFrame(function () {
      hero.classList.add('go');
      counters.forEach(function (c) {
        var to = +c.dataset.to, t0 = performance.now(), dur = 1100;
        (function tick(t) {
          var k = Math.min(1, (t - t0) / dur);
          c.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    });
  }

  /* Reveals */
  var rs = document.querySelectorAll('.r');
  if (reduce || !('IntersectionObserver' in window)) {
    rs.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rs.forEach(function (el, i) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 4) * 80 + 'ms';
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else io.observe(el);
    });
  }

  /* Services: photo swap on hover, focus and scroll */
  var svcs = document.querySelectorAll('.svc');
  var photos = document.querySelectorAll('.work__photo img');
  function setSvc(k) {
    svcs.forEach(function (s) { s.classList.toggle('is-on', s.dataset.k === k); });
    photos.forEach(function (p) { p.classList.toggle('is-on', p.dataset.k === k); });
  }
  svcs.forEach(function (s) {
    s.addEventListener('mouseenter', function () { setSvc(s.dataset.k); });
    s.addEventListener('focus', function () { setSvc(s.dataset.k); });
  });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setSvc(e.target.dataset.k); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    svcs.forEach(function (s) { so.observe(s); });
  }

  /* Drag strip */
  var track = document.querySelector('.strip__track');
  if (track) {
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('is-drag'); });
    track.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { track.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* Magnetic button */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* Process line draws with scroll */
  var proc = document.querySelector('.proc');
  var procLine = document.querySelector('.proc__line span');
  if (proc && procLine && !reduce) {
    var upd = function () {
      var r = proc.getBoundingClientRect();
      var p = (window.innerHeight * 0.8 - r.top) / (r.height + window.innerHeight * 0.3);
      procLine.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    };
    upd();
    window.addEventListener('scroll', upd, { passive: true });
  }

  /* Form validation */
  var form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var box = f.closest('.f'), err = box.querySelector('.err'), msg = '';
        var v = f.value.trim();
        if (!v) msg = 'Campo obbligatorio.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Indirizzo email non valido.';
        else if (f.type === 'tel' && v.replace(/\D/g, '').length < 9) msg = 'Numero di telefono non valido.';
        box.classList.toggle('bad', !!msg); err.textContent = msg;
        if (msg && ok) { ok = false; f.focus(); }
      });
      if (!ok) e.preventDefault();
    });
  }

  /* Signature scene: vertical site section, camera rises from the trench to the ridge */
  var scene = document.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var svg = scene.querySelector('.scene__svg');
  var stage = scene.querySelector('.scene__stage');
  var steps = scene.querySelectorAll('.steps li');
  var qEl = scene.querySelector('.q');
  var curT = scene.querySelector('.cur-t'), curS = scene.querySelector('.cur-s');
  var staffBar = scene.querySelector('.quota__staff');
  var phone = window.matchMedia('(max-width: 900px)').matches;
  var Q = ['-2,40', '-1,95', '+-0,00', '+3,58', '+5,84'];
  var QN = [-2.40, -1.95, 0, 3.58, 5.84];

  function fmt(v) {
    if (Math.abs(v) < 0.005) return '±0,00';
    return (v > 0 ? '+' : '−') + Math.abs(v).toFixed(2).replace('.', ',');
  }

  function build() {
    var aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
    var cam = { x: 560, y: 900, h: phone ? 470 : 420 };
    function applyCam() {
      var w = cam.h * aspect;
      svg.setAttribute('viewBox', (cam.x - w / 2).toFixed(1) + ' ' + (cam.y - cam.h / 2).toFixed(1) + ' ' + w.toFixed(1) + ' ' + cam.h.toFixed(1));
    }
    applyCam();
    var q = { v: QN[0] };
    function setQ() {
      qEl.textContent = fmt(q.v);
      staffBar.style.backgroundPosition = '0 ' + (q.v * 14).toFixed(1) + 'px';
    }
    setQ();

    var $ = function (s) { return svg.querySelectorAll(s); };
    gsap.set([$('.sc-ground'), $('.sc-tag'), $('.sc-bed'), $('.sc-pipe'), $('.sc-back'), $('.sc-foot'), $('.sc-ret'), $('.sc-wall > path'), $('.sc-c'), $('.sc-open'), $('.sc-r'), $('.sc-roof > rect'), $('.sc-cut')], { opacity: 0 });
    gsap.set($('.sc-dig, .sc-dig2'), { opacity: 0 });
    gsap.set($('.sc-pipe'), { x: 260 });
    gsap.set($('.sc-foot, .sc-ret, .sc-bed'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set($('.sc-c'), { y: 26 });
    gsap.set($('.sc-r'), { y: -30 });
    gsap.set($('.sc-mtn__l'), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set($('.sc-cut path'), { strokeDashoffset: 0 });
    if (phone) gsap.set($('.sc-tag'), { display: 'none' });

    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    var B = [0, 1.6, 2.8, 4.0, 6.0];
    /* 0: the ground appears, then the dig */
    tl.to($('.sc-ground'), { opacity: 1, duration: 0.3 }, 0)
      .to($('.sc-dig, .sc-dig2'), { opacity: 1, duration: 0.3 }, 0)
      .to($('.sc-cut'), { opacity: 1, duration: 0.3 }, 0.35)
      .to($('.sc-dig'), { opacity: 0, y: -40, duration: 0.7, ease: 'power1.in' }, 0.6)
      .to($('.sc-dig2'), { opacity: 0, y: -60, duration: 0.7, ease: 'power1.in' }, 0.75)
      .to($('.t1'), { opacity: 1, duration: 0.25 }, 0.5)
    /* 1: canalisation */
      .to(cam, { x: 650, y: 900, h: phone ? 420 : 380, duration: 1.0, onUpdate: applyCam, ease: 'power1.inOut' }, B[1])
      .to(q, { v: QN[1], duration: 0.4, onUpdate: setQ }, B[1])
      .to($('.sc-bed'), { opacity: 1, scaleY: 1, duration: 0.35 }, B[1] + 0.1)
      .to($('.sc-pipe'), { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, B[1] + 0.35)
      .to($('.sc-back'), { opacity: 1, duration: 0.35 }, B[1] + 0.85)
      .to($('.t2'), { opacity: 1, duration: 0.25 }, B[1] + 0.4)
    /* 2: footing and retaining wall */
      .to(cam, { x: 360, y: 740, h: phone ? 560 : 520, duration: 1.0, onUpdate: applyCam, ease: 'power1.inOut' }, B[2])
      .to(q, { v: QN[2], duration: 0.6, onUpdate: setQ }, B[2])
      .to($('.sc-cut'), { opacity: 0, duration: 0.3 }, B[2] + 0.2)
      .to($('.sc-foot'), { opacity: 1, scaleY: 1, duration: 0.6, ease: 'power2.out' }, B[2] + 0.3)
      .to($('.sc-ret'), { opacity: 1, scaleY: 1, duration: 0.6, ease: 'power2.out' }, B[2] + 0.5)
      .to($('.t3'), { opacity: 1, duration: 0.25 }, B[2] + 0.7)
      .to($('.t1'), { opacity: 0, duration: 0.2 }, B[2] + 0.25)
    /* 3: stone walls course by course */
      .to(cam, { x: 400, y: 520, h: phone ? 700 : 640, duration: 1.4, onUpdate: applyCam, ease: 'power1.inOut' }, B[3])
      .to(q, { v: QN[3], duration: 1.6, onUpdate: setQ }, B[3])
      .to($('.sc-wall > path'), { opacity: 1, duration: 0.2 }, B[3] + 0.1)
      .to($('.sc-c'), { opacity: 1, y: 0, duration: 0.3, stagger: 1.5 / $('.sc-c').length, ease: 'power2.out' }, B[3] + 0.1)
      .to($('.sc-open'), { opacity: 1, duration: 0.3 }, B[3] + 1.4)
      .to($('.t4'), { opacity: 1, duration: 0.25 }, B[3] + 0.6)
    /* 4: roof of piode, eaves to ridge, then the whole section with the valley behind */
      .to(cam, { x: 400, y: 330, h: phone ? 560 : 520, duration: 1.0, onUpdate: applyCam, ease: 'power1.inOut' }, B[4])
      .to(q, { v: QN[4], duration: 1.0, onUpdate: setQ }, B[4])
      .to($('.sc-r'), { opacity: 1, y: 0, duration: 0.3, stagger: 0.09, ease: 'power2.out' }, B[4] + 0.2)
      .to($('.sc-roof > rect'), { opacity: 1, duration: 0.2 }, B[4] + 1.2)
      .to($('.t5'), { opacity: 1, duration: 0.25 }, B[4] + 0.5)
      .to(cam, { x: phone ? 430 : 400, y: phone ? 660 : 680, h: phone ? 1220 : 1240, duration: 1.2, onUpdate: applyCam, ease: 'power1.inOut' }, B[4] + 1.5)
      .to($('.sc-mtn__l'), { strokeDashoffset: 0, duration: 1.0 }, B[4] + 1.6)
      .to($('.t1'), { opacity: 1, duration: 0.3 }, B[4] + 2.2);
    tl.to({}, { duration: 0.4 });

    var copy = [];
    steps.forEach(function (li) { copy.push([li.querySelector('b').textContent, li.querySelector('span').textContent]); });
    var last = -1;
    function setStep() {
      var t = tl.time(), s = 0;
      for (var i = 0; i < B.length; i++) if (t >= B[i] + (i ? 0.25 : 0)) s = i;
      if (s === last) return;
      last = s;
      steps.forEach(function (li, i) { li.classList.toggle('is-on', i === s); li.classList.toggle('is-done', i < s); });
      curT.textContent = copy[s][0]; curS.textContent = copy[s][1];
    }
    tl.eventCallback('onUpdate', setStep);
    setStep();

    ScrollTrigger.create({
      trigger: scene,
      pin: scene.querySelector('.scene__pin'),
      start: 'top top',
      end: phone ? '+=190%' : '+=280%',
      scrub: 0.6,
      animation: tl
    });
  }

  var go = function () { build(); ScrollTrigger.refresh(); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
