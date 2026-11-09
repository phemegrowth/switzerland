/* Gabriela Weber Immobiliare: page behaviour */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* Hero curtain: starts on the first frame */
  var hero = document.querySelector('.hero');
  if (reduce) hero.classList.add('go');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('go'); }); });

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

  /* Accordion with height animation (one open at a time) */
  var items = document.querySelectorAll('.acc__i');
  items.forEach(function (d) {
    var sum = d.querySelector('summary'), body = d.querySelector('.acc__b');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var opening = !d.open;
      if (opening) items.forEach(function (o) { if (o !== d && o.open) close(o); });
      if (opening) open(d); else close(d);
    });
  });
  function open(d) {
    var b = d.querySelector('.acc__b');
    d.open = true;
    if (reduce) return;
    var h = b.scrollHeight;
    b.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  function close(d) {
    var b = d.querySelector('.acc__b');
    if (reduce) { d.open = false; return; }
    var a = b.animate([{ height: b.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'ease-in' });
    a.onfinish = function () { d.open = false; };
  }

  /* Who: hover / focus / scroll image swap */
  var whos = document.querySelectorAll('.who__i');
  var pics = document.querySelectorAll('.who__pics img');
  function setWho(k) {
    whos.forEach(function (w) { w.classList.toggle('is-on', w.dataset.k === k); });
    pics.forEach(function (p) { p.classList.toggle('is-on', p.dataset.k === k); });
  }
  whos.forEach(function (w) {
    w.addEventListener('mouseenter', function () { setWho(w.dataset.k); });
    w.addEventListener('focus', function () { setWho(w.dataset.k); });
  });
  if ('IntersectionObserver' in window && window.matchMedia('(max-width: 900px)').matches) {
    var wo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setWho(e.target.dataset.k); }); }, { rootMargin: '-40% 0px -50% 0px' });
    whos.forEach(function (w) { wo.observe(w); });
  }

  /* Magnetic call button */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.15) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25) + 'px)';
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

  /* Signature scene: a PPP building, its millesimi, then the split of the common costs */
  var scene = document.querySelector('[data-scene]');
  if (!scene || reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var phone = window.matchMedia('(max-width: 900px)').matches;
  var svg = scene.querySelector('.scene__svg');
  var $ = function (s) { return svg.querySelectorAll(s); };
  var steps = scene.querySelectorAll('.steps li');
  var mPm = scene.querySelector('.m-pm'), mChf = scene.querySelector('.m-chf');
  var curT = scene.querySelector('.cur-t'), curS = scene.querySelector('.cur-s');
  var rows = scene.querySelectorAll('.ledger__rows li');
  var tot = scene.querySelector('.ledger__tot'), stamp = scene.querySelector('.stamp');
  var PM = [95, 105, 110, 120, 125, 130, 150, 165];
  function chf(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }

  function build() {
    if (phone) svg.setAttribute('viewBox', '46 8 508 594');
    var units = $('.w-u');
    gsap.set($('.w-out'), { strokeDashoffset: 1 });
    gsap.set($('.w-door'), { opacity: 0 });
    gsap.set(units, { opacity: 0 });
    gsap.set($('.w-u__bg'), { scaleY: 0, transformOrigin: '50% 100%', transformBox: 'fill-box' });
    gsap.set($('.w-pm'), { opacity: 0, y: 8 });
    gsap.set($('.w-chf'), { opacity: 0, y: 8 });
    gsap.set($('.w-flow'), { strokeDashoffset: 1, opacity: 1 });
    gsap.set($('.w-src'), { opacity: 0, y: -16 });
    gsap.set(rows, { opacity: 0, x: 16 });
    gsap.set(tot, { opacity: 0 });
    gsap.set(stamp, { opacity: 0, scale: 1.8, rotate: -14 });
    var meter = { pm: 0, chf: 0 };
    function setMeters() { mPm.textContent = Math.round(meter.pm); mChf.textContent = chf(meter.chf); }
    setMeters();

    var B = [0, 1.4, 4.0, 6.8];
    var tl = gsap.timeline({ defaults: { ease: 'none' } });
    /* 0: the building draws itself */
    tl.to($('.w-out'), { strokeDashoffset: 0, duration: 1.0, stagger: 0.06, ease: 'power1.inOut' }, 0.05)
      .to($('.w-door'), { opacity: 1, duration: 0.2 }, 1.0);
    /* 1: units fill floor by floor (ground first), each shows its millesimi; the meter counts to 1000 */
    units.forEach(function (u, i) {
      var t = B[1] + i * 0.3;
      tl.to(u, { opacity: 1, duration: 0.12 }, t)
        .to(u.querySelector('.w-u__bg'), { scaleY: 1, duration: 0.3, ease: 'power2.out' }, t)
        .to(u.querySelector('.w-pm'), { opacity: 1, y: 0, duration: 0.22 }, t + 0.1)
        .to(rows[i], { opacity: 1, x: 0, duration: 0.22 }, t + 0.1);
    });
    var pmAt = [0]; PM.forEach(function (p, i) { pmAt.push(pmAt[i] + p); });
    PM.forEach(function (p, i) {
      tl.to(meter, { pm: pmAt[i + 1], duration: 0.3, onUpdate: setMeters }, B[1] + i * 0.3 + 0.05);
    });
    /* 2: the common costs arrive and flow into the units by share */
    tl.to($('.w-src'), { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, B[2]);
    units.forEach(function (u, i) {
      var t = B[2] + 0.45 + i * 0.27;
      var flow = svg.querySelector('.w-flow[data-i="' + i + '"]');
      tl.to(flow, { strokeDashoffset: 0, duration: 0.3 }, t)
        .to(u.querySelector('.w-chf'), { opacity: 1, y: 0, duration: 0.2 }, t + 0.24)
        .to(meter, { chf: 24 * pmAt[i + 1], duration: 0.3, onUpdate: setMeters }, t + 0.05);
    });
    /* 3: the flows fade, the ledger closes with a total and a stamp */
    tl.to($('.w-flow'), { opacity: 0.25, duration: 0.3 }, B[3])
      .to(tot, { opacity: 1, duration: 0.3 }, B[3] + 0.1)
      .to(stamp, { opacity: 1, scale: 1, rotate: -6, duration: 0.35, ease: 'back.out(2)' }, B[3] + 0.4)
      .to($('.w-u__bg'), { fill: '#C9DCEA', duration: 0.4 }, B[3] + 0.1)
      .to({}, { duration: 0.6 });

    var copy = [];
    steps.forEach(function (li) { copy.push([li.querySelector('b').textContent, li.querySelector('span').textContent]); });
    var last = -1;
    function setStep() {
      var t = tl.time(), s = 0;
      for (var i = 0; i < B.length; i++) if (t >= B[i] + (i ? 0.05 : 0)) s = i;
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
      end: phone ? '+=180%' : '+=260%',
      scrub: 0.6,
      animation: tl
    });
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { build(); ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
