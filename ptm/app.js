/* PTM SA homepage: hero entrance (survey grid and frame draw in), header, menu, anchors, reveals, count-up,
   services list that drives a sticky photo, logbook with a cursor-following photo, process line, magnetic buttons,
   form validation, and the GSAP signature scene "Dal palazzo all'inerte" (demolition, belt, crusher, graded stacks). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.remove('no-js');
  html.classList.add('js');
  if (reduce) html.classList.add('is-ready');
  else requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.add('is-ready'); }); });

  /* header */
  var header = d.querySelector('.header');
  function onScroll() { header.classList.toggle('is-small', w.scrollY > 40); }
  w.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
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
      w.scrollTo({ top: t.getBoundingClientRect().top + w.scrollY - header.offsetHeight + 1, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* reveals, with the above-the-fold guard */
  function reveal(els, cb) {
    els = Array.prototype.slice.call(els);
    if (!('IntersectionObserver' in w) || reduce) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { cb(el); }, (k++) * 80);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) cb(el); else io.observe(el); });
  }
  reveal(d.querySelectorAll('.r'), function (el) { el.classList.add('is-in'); });

  /* count-up (Facebook followers) */
  function fmt(n, sep) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep || ''); }
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10), sep = el.getAttribute('data-sep');
    if (reduce || !to) { el.textContent = fmt(to, sep); return; }
    var t0 = null, dur = 1500;
    el.textContent = '0';
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))), sep);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* services: the line nearest the middle of the screen (or the hovered one) drives the sticky photo */
  var svc = d.querySelector('[data-svc]');
  if (svc) {
    var items = Array.prototype.slice.call(svc.querySelectorAll('.svc__i'));
    var imgs = d.querySelectorAll('.svc__img'), cap = d.querySelector('.svc__cap span');
    var front = 0, current = 0;
    function show(i) {
      if (i === current) return;
      current = i;
      items.forEach(function (it, k) { it.classList.toggle('is-on', k === i); });
      if (cap) cap.textContent = ('0' + (i + 1)).slice(-2);
      var next = imgs[1 - front];
      next.onload = null;
      next.src = items[i].getAttribute('data-img');
      next.classList.add('is-on');
      imgs[front].classList.remove('is-on');
      front = 1 - front;
    }
    items.forEach(function (it, k) { it.addEventListener('mouseenter', function () { show(k); }); });
    var ticking = false;
    w.addEventListener('scroll', function () {
      if (ticking || w.innerWidth <= 760) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var mid = w.innerHeight * 0.5, best = 0, bd = 1e9;
        items.forEach(function (it, k) { var r = it.getBoundingClientRect(); var dd = Math.abs(r.top + r.height / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
        var box = svc.getBoundingClientRect();
        if (box.top < mid && box.bottom > mid) show(best);
      });
    }, { passive: true });
  }

  /* logbook: the photo follows the cursor on desktop */
  var log = d.querySelector('[data-log]'), fl = d.querySelector('.log__float');
  if (log && fl && !reduce && w.matchMedia('(hover: hover)').matches) {
    var fimg = fl.querySelector('img'), tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      fl.style.transform = 'translate(' + (cx + 24) + 'px,' + (cy - 120) + 'px) scale(' + (fl.classList.contains('is-on') ? 1 : 0.85) + ')';
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(loop) : null;
    }
    log.querySelectorAll('.log__row').forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        fimg.src = row.getAttribute('data-img');
        if (!fl.classList.contains('is-on')) { cx = tx = e.clientX; cy = ty = e.clientY; }
        fl.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
    });
    log.addEventListener('mouseleave', function () { fl.classList.remove('is-on'); if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* process line draws with scroll */
  var how = d.querySelector('[data-how]');
  if (how) {
    var line = how.querySelector('.how__line i');
    var hs = function () {
      var r = how.getBoundingClientRect();
      var p = reduce ? 1 : Math.min(1, Math.max(0, (w.innerHeight * 0.8 - r.top) / (r.height + w.innerHeight * 0.3)));
      line.style.setProperty('--p', p.toFixed(3));
    };
    w.addEventListener('scroll', hs, { passive: true });
    w.addEventListener('resize', hs);
    hs();
  }

  /* magnetic buttons */
  if (!reduce && w.matchMedia('(hover: hover)').matches) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = d.querySelector('.form');
  if (form) {
    var checks = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      'work-type': function (v) { return v !== ''; },
      message: function (v) { return v.trim().length > 4; }
    };
    function check(el) {
      var fn = checks[el.name]; if (!fn) return true;
      var ok = fn(el.value);
      el.closest('.f').classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.f') && el.closest('.f').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      Object.keys(checks).forEach(function (n) { var el = form.elements[n]; if (el && !check(el) && !bad) bad = el; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  var y = d.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- signature scene: Dal palazzo all'inerte ---------- */
  var svg = d.querySelector('[data-scene]');
  if (!svg || !w.gsap) { d.querySelectorAll('.steps li').forEach(function (li) { li.classList.add('is-on'); }); return; }
  var gsap = w.gsap, ST = w.ScrollTrigger;
  if (ST) gsap.registerPlugin(ST);
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = d.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  var LAYOUT = {
    d: { vb: [40, 118, 1150, 520], G: 560, gx: [30, 1170], bx: 270, bw: 200, fh: 72, ex: 60, es: 1, L1: 190, L2: 150,
         pile: 370, ps: 13, belt: [[500, 554], [702, 252]], box: [700, 280, 100, 100], hop: [680, 250, 840 - 680],
         exit: [750, 392], deck: [[770, 404], [1172, 474]], stacks: [868, 995, 1118], G2: 560,
         lab: { building: [520, 150], belt: [538, 430], deck: [1030, 405], fin: [1010, 150] }, small: false },
    m: { vb: [0, 70, 600, 850], G: 400, gx: [16, 584], bx: 300, bw: 170, fh: 56, ex: 22, es: 0.86, L1: 165, L2: 145,
         pile: 385, ps: 11, belt: [[300, 396], [178, 452]], box: [60, 480, 100, 90], hop: [40, 452, 140],
         exit: [110, 584], deck: [[80, 616], [580, 700]], stacks: [215, 365, 505], G2: 830,
         lab: { building: null, belt: null, deck: [470, 640], fin: [440, 528] }, small: true }
  };

  function build(key, staticEnd) {
    var L = LAYOUT[key], G = L.G, G2 = L.G2;
    var rnd = seeded(83);
    svg.setAttribute('viewBox', L.vb.join(' '));
    svg.classList.toggle('is-m', key === 'm');
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    /* grounds with hatching */
    function ground(y, x0, x1) {
      el('line', { x1: x0, y1: y, x2: x1, y2: y, 'class': 'sc-line' }, svg);
      for (var x = x0 + 12; x < x1; x += 18) el('line', { x1: x, y1: y + 2, x2: x - 9, y2: y + 11, 'class': 'sc-thin' }, svg);
    }
    ground(G, L.gx[0], L.gx[1]);
    if (G2 !== G) ground(G2, L.gx[0], L.gx[1]);

    /* building, five floors */
    var floors = [];
    var bG = el('g', {}, svg);
    for (var k = 0; k < 5; k++) {
      var fy = G - L.fh * (k + 1);
      var g = el('g', { 'class': 'sc-floor' }, bG);
      el('rect', { 'class': 'body', x: L.bx, y: fy, width: L.bw, height: L.fh }, g);
      var ww = L.bw * 0.16, wh = L.fh * 0.38;
      for (var j = 0; j < 3; j++) el('rect', { 'class': 'win', x: L.bx + L.bw * (0.14 + j * 0.28), y: fy + L.fh * 0.3, width: ww, height: wh }, g);
      if (k === 4) el('rect', { 'class': 'body', x: L.bx - 6, y: fy - 8, width: L.bw + 12, height: 8 }, g);
      floors.push(g);
    }
    var bLab = null;
    if (L.lab.building) {
      bLab = el('g', {}, svg);
      el('polyline', { points: (L.bx + L.bw) + ',' + (G - L.fh * 5 + 20) + ' ' + (L.lab.building[0] - 8) + ',' + (L.lab.building[1] + 8), 'class': 'sc-thin' }, bLab);
      var t = el('text', { x: L.lab.building[0], y: L.lab.building[1] + 12, 'class': 'sc-txt' }, bLab); t.textContent = 'Edificio da demolire';
    }

    /* belt with rollers, crusher, screen deck */
    var b0 = L.belt[0], b1 = L.belt[1];
    var ang = Math.atan2(b1[1] - b0[1], b1[0] - b0[0]), nx = -Math.sin(ang) * 7, ny = Math.cos(ang) * 7;
    var beltG = el('g', {}, svg);
    el('line', { x1: b0[0], y1: b0[1], x2: b1[0], y2: b1[1], 'class': 'sc-line' }, beltG);
    var beltMove = el('line', { x1: b0[0] + nx, y1: b0[1] + ny, x2: b1[0] + nx, y2: b1[1] + ny, 'class': 'sc-dash' }, beltG);
    for (var r = 0; r <= 6; r++) { var px = b0[0] + (b1[0] - b0[0]) * r / 6, py = b0[1] + (b1[1] - b0[1]) * r / 6; el('circle', { cx: px + nx / 2, cy: py + ny / 2, r: 3.5, 'class': 'sc-thin' }, beltG); }
    var legX = b0[0] + (b1[0] - b0[0]) * 0.6, legY = b0[1] + (b1[1] - b0[1]) * 0.6;
    el('line', { x1: legX, y1: legY + 6, x2: legX, y2: (key === 'm' ? G2 : G), 'class': 'sc-thin' }, beltG);

    var parts = el('g', {}, svg); /* particles sit under the crusher, so they vanish inside it */

    var bx = L.box;
    var cr = el('g', {}, svg);
    el('polygon', { points: L.hop[0] + ',' + L.hop[1] + ' ' + (L.hop[0] + L.hop[2]) + ',' + L.hop[1] + ' ' + (bx[0] + bx[2]) + ',' + bx[1] + ' ' + bx[0] + ',' + bx[1], 'class': 'sc-box' }, cr);
    el('rect', { x: bx[0], y: bx[1], width: bx[2], height: bx[3], 'class': 'sc-box' }, cr);
    el('rect', { x: bx[0], y: bx[1] + bx[3] - 6, width: bx[2], height: 6, 'class': 'sc-red' }, cr);
    var ct = el('text', { x: bx[0] + bx[2] / 2, y: bx[1] + bx[3] / 2 + 4, 'text-anchor': 'middle', 'class': 'sc-boxtxt' }, cr); ct.textContent = 'Frantoio';
    el('line', { x1: bx[0] + 10, y1: bx[1] + bx[3], x2: bx[0] + 4, y2: (key === 'm' ? G2 : G), 'class': 'sc-thin' }, svg);
    el('line', { x1: bx[0] + bx[2] - 10, y1: bx[1] + bx[3], x2: bx[0] + bx[2] - 4, y2: (key === 'm' ? G2 : G), 'class': 'sc-thin' }, svg);

    var dk = L.deck;
    var deckG = el('g', {}, svg);
    el('line', { x1: dk[0][0], y1: dk[0][1], x2: dk[1][0], y2: dk[1][1], 'class': 'sc-line' }, deckG);
    var dslope = (dk[1][1] - dk[0][1]) / (dk[1][0] - dk[0][0]);
    function deckY(x) { return dk[0][1] + (x - dk[0][0]) * dslope; }
    for (var hx = dk[0][0] + 10; hx < dk[1][0]; hx += 12) el('line', { x1: hx, y1: deckY(hx) + 3, x2: hx, y2: deckY(hx) + 8, 'class': 'sc-thin' }, deckG);
    [dk[0][0] + 20, dk[1][0] - 20].forEach(function (lx) { el('line', { x1: lx, y1: deckY(lx), x2: lx, y2: G2, 'class': 'sc-thin' }, deckG); });

    /* excavator with a two-link arm (simple IK) */
    var es = L.es, ex = L.ex;
    function X(v) { return ex + v * es; }
    function Y(v) { return G - v * es; }
    var exG = el('g', {}, svg);
    el('rect', { x: X(0), y: Y(26), width: 150 * es, height: 26 * es, rx: 13 * es, 'class': 'sc-line' }, exG);
    [18, 52, 86, 120].forEach(function (cx) { el('circle', { cx: X(cx + 6), cy: Y(13), r: 7 * es, 'class': 'sc-thin' }, exG); });
    el('rect', { x: X(28), y: Y(80), width: 104 * es, height: 50 * es, 'class': 'sc-box' }, exG);
    el('rect', { x: X(80), y: Y(116), width: 44 * es, height: 38 * es, 'class': 'sc-line' }, exG);
    el('rect', { x: X(28), y: Y(52), width: 104 * es, height: 6 * es, 'class': 'sc-red' }, exG);
    var P = { x: X(118), y: Y(62) };
    var boom = el('line', { 'class': 'sc-redl' }, exG), stick = el('line', { 'class': 'sc-redl' }, exG);
    var jaw = el('polyline', { 'class': 'sc-redl' }, exG);
    el('circle', { cx: P.x, cy: P.y, r: 5, 'class': 'sc-red' }, exG);
    var elbowDot = el('circle', { r: 4, 'class': 'sc-red' }, exG);
    function setArm(h) {
      var T = { x: L.bx + 16, y: G - L.fh * h - 8 };
      if (h <= 0.02) T = { x: L.bx - 14, y: G - 26 };
      var dx = T.x - P.x, dy = T.y - P.y, dd = Math.hypot(dx, dy);
      dd = Math.max(Math.abs(L.L1 - L.L2) + 2, Math.min(L.L1 + L.L2 - 2, dd));
      var a = Math.atan2(dy, dx), b = Math.acos((L.L1 * L.L1 + dd * dd - L.L2 * L.L2) / (2 * L.L1 * dd));
      var E = { x: P.x + L.L1 * Math.cos(a - b), y: P.y + L.L1 * Math.sin(a - b) };
      var Tx = P.x + dd * Math.cos(a), Ty = P.y + dd * Math.sin(a);
      boom.setAttribute('x1', P.x); boom.setAttribute('y1', P.y); boom.setAttribute('x2', E.x); boom.setAttribute('y2', E.y);
      stick.setAttribute('x1', E.x); stick.setAttribute('y1', E.y); stick.setAttribute('x2', Tx); stick.setAttribute('y2', Ty);
      elbowDot.setAttribute('cx', E.x); elbowDot.setAttribute('cy', E.y);
      jaw.setAttribute('points', (Tx - 10) + ',' + (Ty + 12) + ' ' + Tx + ',' + Ty + ' ' + (Tx + 12) + ',' + (Ty + 10));
    }

    /* labels */
    var labs = [];
    function label(xy, txt, parent) {
      var g = el('g', {}, parent || svg);
      var t = el('text', { x: xy[0], y: xy[1], 'class': 'sc-txt', 'text-anchor': 'middle' }, g); t.textContent = txt;
      return g;
    }
    var beltLab = L.lab.belt ? label(L.lab.belt, 'Nastro') : null;
    var deckLab = label(L.lab.deck, 'Vaglio');
    var names = ['Sabbia', 'Ghiaietto', 'Ghiaia'];
    var stackLabs = L.stacks.map(function (sx, i) { return label([sx, G2 + (L.small ? 46 : 34)], names[i]); });
    var fin = el('g', {}, svg);
    var finTxt = L.small ? ['Inerti riciclati,', 'pronti per un altro cantiere.'] : ['Inerti riciclati, pronti per un altro cantiere.'];
    var fw = L.small ? 470 : 520, fhh = L.small ? 104 : 54;
    el('rect', { x: L.lab.fin[0] - fw / 2, y: L.lab.fin[1] - fhh / 2, width: fw, height: fhh, 'class': 'sc-pill' }, fin);
    el('rect', { x: L.lab.fin[0] - fw / 2, y: L.lab.fin[1] - fhh / 2, width: 6, height: fhh, 'class': 'sc-red' }, fin);
    var maxW = 0;
    finTxt.forEach(function (s, i) {
      var t = el('text', { x: L.lab.fin[0] - fw / 2 + 26, y: L.lab.fin[1] - fhh / 2 + (L.small ? 44 + i * 40 : 35), 'class': 'sc-txt--big' }, fin); t.textContent = s;
      try { maxW = Math.max(maxW, t.getBBox().width); } catch (e) {}
    });
    if (maxW) { var nw = maxW + 52; fin.querySelectorAll('rect')[0].setAttribute('width', nw); var nx0 = Math.min(L.lab.fin[0] - fw / 2, L.vb[0] + L.vb[2] - nw - 10); fin.querySelectorAll('rect').forEach(function (r) { r.setAttribute('x', nx0); }); fin.querySelectorAll('text').forEach(function (tt) { tt.setAttribute('x', nx0 + 26); }); }

    /* particles: 72 chunks of concrete */
    var N = 72, greys = ['#9b9da2', '#b9bbbf', '#7f8186', '#cfd0d3', '#6c6e73'];
    var counts = [30, 24, 18], cls = [];
    counts.forEach(function (c, i) { for (var n = 0; n < c; n++) cls.push(i); });
    for (var s = cls.length - 1; s > 0; s--) { var q = Math.floor(rnd() * (s + 1)); var tmp = cls[s]; cls[s] = cls[q]; cls[q] = tmp; }
    var P0 = [];
    for (var i = 0; i < N; i++) {
      var pts = [], rr = 6.5;
      for (var v = 0; v < 6; v++) { var aa = v / 6 * Math.PI * 2 + rnd() * 0.5, rv = rr * (0.7 + rnd() * 0.55); pts.push((Math.cos(aa) * rv).toFixed(1) + ',' + (Math.sin(aa) * rv).toFixed(1)); }
      var poly = el('polygon', { points: pts.join(' '), fill: greys[i % greys.length] }, parts);
      var floor = 4 - Math.floor(i / (N / 5));
      P0.push({ el: poly, floor: floor, c: cls[i] });
    }
    /* fall order = index order (top floor first); pile slots bottom-up */
    var rows = [12, 11, 10, 9, 8, 7, 6, 5, 4], slot = 0;
    var pileXY = [];
    rows.forEach(function (c, r) { for (var n = 0; n < c; n++) pileXY.push([L.pile + (n - (c - 1) / 2) * L.ps + (rnd() - 0.5) * 3, G - 7 - r * L.ps * 0.82]); });
    /* stack slots per class */
    var stackRows = [[7, 6, 6, 5, 4, 2], [6, 5, 5, 4, 3, 1], [5, 4, 4, 3, 2]], sp = L.small ? [12, 16, 22] : [11, 15, 21], scl = L.small ? [0.8, 1.1, 1.55] : [0.75, 1.05, 1.5];
    var stackXY = stackRows.map(function (rs, ci) {
      var out = [];
      rs.forEach(function (c, r) { for (var n = 0; n < c; n++) out.push([L.stacks[ci] + (n - (c - 1) / 2) * sp[ci] + (rnd() - 0.5) * 2, G2 - sp[ci] * 0.55 - r * sp[ci] * 0.8]); });
      return out;
    });
    var used = [0, 0, 0];
    var drop = [L.stacks[0], L.stacks[1], L.stacks[2]];

    var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    var proxy = { h: 5 };
    setArm(5);
    var bs = L.small ? 1.35 : 1.15;
    P0.forEach(function (p) {
      var fy = G - L.fh * (p.floor + 1);
      p.sx = L.bx + 8 + rnd() * (L.bw - 16); p.sy = fy + 8 + rnd() * (L.fh - 16);
      gsap.set(p.el, { x: p.sx, y: p.sy, opacity: 0, scale: bs, rotation: rnd() * 360, transformOrigin: '50% 50%' });
    });
    /* 1. demolition, top floor first */
    for (var f = 4; f >= 0; f--) {
      var tb = 0.3 + (4 - f) * 0.72;
      tl.to(proxy, { h: f, duration: 0.6, ease: 'power1.inOut', onUpdate: function () { setArm(proxy.h); } }, tb - 0.3);
      tl.to(floors[f], { opacity: 0, y: 12, rotation: f % 2 ? 2.5 : -2.5, svgOrigin: (L.bx + L.bw / 2) + ' ' + (G - L.fh * f), duration: 0.32 }, tb);
      P0.forEach(function (p, idx) {
        if (p.floor !== f) return;
        p.pile = pileXY[idx];
        tl.set(p.el, { opacity: 1 }, tb);
        tl.to(p.el, { x: p.pile[0], y: p.pile[1], rotation: '+=120', duration: 0.62, ease: 'power2.in' }, tb + (idx % 15) * 0.012);
      });
    }
    if (bLab) tl.to(bLab, { opacity: 0, duration: 0.3 }, 3.3);
    tl.to(proxy, { h: 0, duration: 0.01, onUpdate: function () { setArm(proxy.h); } }, 3.95);
    /* 2-3. belt, crusher, screen, stacks */
    var t0 = 4.0, order = P0.slice().reverse();
    tl.fromTo(beltMove, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': -260 }, duration: 4.6 }, t0);
    tl.fromTo(cr, { x: -1.4 }, { x: 1.4, duration: 0.07, repeat: 47, yoyo: true }, t0 + 0.75);
    order.forEach(function (p, j) {
      var c = p.c, sxy = stackXY[c][used[c]++] || [L.stacks[c], G2 - 8];
      var dropX = drop[c] + (rnd() - 0.5) * 16;
      var ts = t0 + j * 0.045;
      tl.to(p.el, { keyframes: [
        { x: b0[0] + (rnd() - 0.5) * 6, y: b0[1] - 8, duration: 0.22, ease: 'power1.inOut' },
        { x: b1[0], y: b1[1] - 8, duration: 0.5 },
        { x: bx[0] + bx[2] / 2, y: bx[1] + 20, duration: 0.14 },
        { x: L.exit[0], y: L.exit[1] - 14, scale: scl[c], duration: 0.22 },
        { x: L.exit[0] + 16, y: L.exit[1] + 8, duration: 0.08 },
        { x: dropX, y: deckY(dropX) - 7, rotation: '+=160', duration: 0.32 },
        { x: sxy[0], y: sxy[1], duration: 0.3, ease: 'power2.in' }
      ] }, ts);
    });
    if (beltLab) { tl.fromTo(beltLab, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0); }
    tl.fromTo(deckLab, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 5.2);
    stackLabs.forEach(function (g, i) { tl.fromTo(g, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, 7.6 + i * 0.15); });
    if (beltLab) tl.to(beltLab, { opacity: 0, duration: 0.3 }, 8.4);
    tl.fromTo(fin, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45 }, 8.9);
    tl.to({}, { duration: 0.6 }, 9.4);

    /* steps UI follows the timeline */
    var stepEls = d.querySelectorAll('[data-steps] li'), bar = d.querySelector('.meter__bar'), now = d.querySelector('.cycle__now');
    var bounds = [0, 3.9, 5.0, 8.1], titles = ['Demolizione', 'Carico', 'Frantumazione e vagliatura', 'Inerti riciclati'], last = -1;
    function ui() {
      var t = tl.time(), s = 0;
      for (var b = 0; b < bounds.length; b++) if (t >= bounds[b]) s = b;
      if (bar) bar.style.transform = 'scaleX(' + tl.progress().toFixed(3) + ')';
      if (s !== last) {
        last = s;
        stepEls.forEach(function (li, k) { li.classList.toggle('is-on', k === s); });
        if (now) now.innerHTML = '<span>0' + (s + 1) + '</span> ' + titles[s];
      }
    }
    tl.eventCallback('onUpdate', ui);

    if (staticEnd || !ST) {
      tl.progress(1); ui();
      stepEls.forEach(function (li) { li.classList.add('is-on'); });
      return function () {};
    }
    var stObj = ST.create({
      trigger: '.cycle', start: 'top top', end: key === 'm' ? '+=170%' : '+=240%',
      pin: '.cycle__pin', scrub: 0.6, animation: tl, anticipatePin: 1, invalidateOnRefresh: false
    });
    ui();
    return function () { stObj.kill(true); tl.kill(); };
  }

  function start() {
    if (reduce) { build(w.innerWidth <= 760 ? 'm' : 'd', true); return; }
    var mm = gsap.matchMedia();
    mm.add('(max-width: 760px)', function () { return build('m', false); });
    mm.add('(min-width: 761px)', function () { return build('d', false); });
    w.addEventListener('load', function () { if (ST) ST.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else start();
})();
