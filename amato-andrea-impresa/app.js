/* Amato Andrea homepage: wordmark entrance, header, menu, anchors, reveals, service list with photo swap,
   review rotator, drag gallery, steps line, magnetic buttons, form, and the GSAP signature scene
   (a drywall partition built layer by layer: guides, studs, insulation, boards, joints, skim coat, niche). */
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

  /* anchors with header offset (the pinned scene starts at its own top) */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (id === '#parete' ? 0 : header.offsetHeight - 1);
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

  /* services: active item follows scroll, hover or focus; the sticky photo swaps */
  var items = d.querySelectorAll('.work__i'), pic = d.querySelector('[data-swap]');
  function activate(it) {
    if (it.classList.contains('is-on')) return;
    items.forEach(function (x) { x.classList.toggle('is-on', x === it); });
    var src = it.getAttribute('data-img');
    if (pic && src && pic.getAttribute('src') !== src) {
      pic.classList.add('is-fade');
      setTimeout(function () { pic.src = src; pic.classList.remove('is-fade'); }, reduce ? 0 : 280);
    }
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { activate(it); });
    it.addEventListener('focus', function () { activate(it); });
    it.addEventListener('click', function () { activate(it); });
  });
  if ('IntersectionObserver' in window) {
    var wio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) activate(e.target); }); }, { rootMargin: '-45% 0px -45% 0px' });
    items.forEach(function (it) { wio.observe(it); });
  }

  /* reviews rotator */
  var qs = d.querySelectorAll('.q'), qi = 0, qn = d.querySelector('.quotes__i'), qTimer = null, stage = d.querySelector('.quotes__stage');
  function showQ(n) {
    qi = (n + qs.length) % qs.length;
    qs.forEach(function (q, i) { q.classList.toggle('is-on', i === qi); });
    if (qn) qn.textContent = '0' + (qi + 1);
  }
  d.querySelectorAll('.qbtn').forEach(function (b) {
    b.addEventListener('click', function () { showQ(qi + (b.getAttribute('data-q') === 'next' ? 1 : -1)); restart(); });
  });
  function restart() {
    if (reduce) return;
    clearInterval(qTimer);
    qTimer = setInterval(function () { showQ(qi + 1); }, 6500);
  }
  if (stage) {
    stage.addEventListener('mouseenter', function () { clearInterval(qTimer); });
    stage.addEventListener('mouseleave', restart);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) restart(); else clearInterval(qTimer); }); }).observe(stage);
    }
  }

  /* gallery: drag to scroll with the mouse */
  var track = d.querySelector('.gal__track');
  if (track) {
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add('is-drag'); });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; track.classList.remove('is-drag'); });
    track.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { track.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* steps: the red line draws with scroll */
  var rail = d.querySelector('.steps__rail'), fill = d.querySelector('.steps__fill');
  if (rail && fill && !reduce) {
    var tk = false;
    function sp() {
      tk = false;
      var r = rail.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.6)));
      fill.style.setProperty('--p', p.toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(sp); } }, { passive: true });
    sp();
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
    var fields = form.querySelectorAll('[required], input[type=email]');
    function check(f) {
      var w = f.closest('.field'), err = w.querySelector('.err');
      var v = f.value.trim(), ok = f.required ? v !== '' : true;
      if (ok && v && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/\D/g, '').length >= 9;
      w.classList.toggle('has-err', !ok);
      err.textContent = ok ? '' : (msgs[f.name] || 'Campo obbligatorio.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    fields.forEach(function (f) { f.addEventListener('blur', function () { if (f.value) check(f); }); });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* screws on the stud lines (drawn for every mode, hidden under the skim coat at the end) */
  var NS = 'http://www.w3.org/2000/svg', sg = d.querySelector('.w-screws');
  if (sg) {
    [210, 358, 506, 654, 802].forEach(function (x) {
      for (var y = 96; y <= 530; y += 62) {
        var c = d.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 4);
        sg.appendChild(c);
      }
    });
  }

  /* signature scene: the partition wall */
  function scene() {
    var sec = d.querySelector('.scene');
    if (!sec || reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var small = window.matchMedia('(max-width: 920px)').matches;
    var q = function (s) { return sec.querySelector(s); }, qa = function (s) { return sec.querySelectorAll(s); };
    var svg = q('.wall'), outline = q('.w-outline'), gT = q('.w-guide--t'), gB = q('.w-guide--b');
    var studs = qa('.w-studs rect'), wool = qa('.w-wool rect'), boards = qa('.w-board'), screws = qa('.w-screws circle');
    var tape = qa('.w-tape rect'), skim = q('.w-skim'), trowel = q('.w-trowel'), niche = q('.w-niche'), light = q('.w-light');
    var endG = q('.w-end'), dim = q('.w-dimline'), dimT = q('.w-dimt'), dimG = q('.w-dim');
    var num = q('.scene__num'), name = q('.scene__name'), list = qa('.scene__list li'), pct = q('.scene__pctn');
    var names = ['Guide a pavimento e soffitto', 'Montanti', 'Isolamento', 'Lastre', 'Giunti e viti', 'Rasatura e nicchia'];
    var marks = [0, 1.6, 3.1, 4.4, 6.2, 7.5];
    var pcts = [[0, 0], [1.6, 12], [3.1, 30], [4.4, 48], [6.2, 70], [7.5, 85], [9.4, 96], [10.6, 100]];
    function prep(p) { var L = p.getTotalLength ? p.getTotalLength() : 1000; p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; }
    prep(outline); prep(dim);

    gsap.set(svg, { autoAlpha: 0, y: 30 });
    gsap.set(gT, { x: -900 }); gsap.set(gB, { x: 900 });
    gsap.set(studs, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(wool, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(boards, { x: 1000, autoAlpha: 0 });
    gsap.set(screws, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(tape, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(skim, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(trowel, { autoAlpha: 0, x: 0 });
    gsap.set(niche, { autoAlpha: 0, scale: .94, transformOrigin: '50% 50%' });
    gsap.set(light, { autoAlpha: 0 });
    gsap.set(endG, { autoAlpha: 0, x: -30 });
    gsap.set([dimT], { autoAlpha: 0 });
    gsap.set(dimG.querySelectorAll('path')[1], { autoAlpha: 0 });
    pct.textContent = '0';

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: small ? '+=200%' : '+=280%', pin: q('.scene__pin'), scrub: 0.6,
        onUpdate: function (st) {
          var t = st.progress * tl.duration(), k = 0;
          for (var i = 0; i < marks.length; i++) if (t >= marks[i]) k = i;
          num.textContent = '0' + (k + 1); name.textContent = names[k];
          list.forEach(function (li, i) { li.classList.toggle('is-on', i === k); });
          var v = 0;
          for (var j = 0; j < pcts.length - 1; j++) {
            if (t >= pcts[j][0]) {
              var a = pcts[j], b = pcts[j + 1], f = Math.min(1, (t - a[0]) / (b[0] - a[0]));
              v = a[1] + (b[1] - a[1]) * f;
            }
          }
          pct.textContent = Math.round(v);
        }
      }
    });
    tl.to(svg, { autoAlpha: 1, y: 0, duration: .5 }, 0);
    tl.to(outline, { strokeDashoffset: 0, duration: 1 }, .2);
    // 01 guides
    tl.to(gT, { x: 0, duration: 1, ease: 'power2.out' }, .6);
    tl.to(gB, { x: 0, duration: 1, ease: 'power2.out' }, .7);
    // 02 studs drop in, then the spacing is dimensioned
    studs.forEach(function (s, i) { tl.to(s, { scaleY: 1, duration: .7, ease: 'power2.out' }, 1.6 + i * .12); });
    tl.to(dim, { strokeDashoffset: 0, duration: .5 }, 2.5);
    tl.to([dimT, dimG.querySelectorAll('path')[1]], { autoAlpha: 1, duration: .3 }, 2.7);
    // 03 insulation rises between the studs
    wool.forEach(function (w, i) { tl.to(w, { scaleY: 1, duration: .8, ease: 'power1.out' }, 3.1 + i * .08); });
    // 04 boards slide in one after the other
    boards.forEach(function (b, i) { tl.to(b, { x: 0, autoAlpha: 1, duration: .8, ease: 'power3.out' }, 4.4 + i * .45); });
    tl.to([dimT, dimG], { autoAlpha: .35, duration: .4 }, 5.6);
    // 05 screws and joint tape
    tl.to(screws, { scale: 1, duration: .25, stagger: .018, ease: 'back.out(3)' }, 6.2);
    tl.to(tape, { scaleY: 1, duration: .7, stagger: .2 }, 6.6);
    tl.to(screws, { fill: '#f3f3f1', duration: .4 }, 7.2);
    // 06 the skim coat sweeps across behind the red trowel edge, then the niche and its light
    tl.to(trowel, { autoAlpha: 1, duration: .1 }, 7.5);
    tl.to(skim, { scaleX: 1, duration: 1.6, ease: 'power1.inOut' }, 7.5);
    tl.to(trowel, { x: 882, duration: 1.6, ease: 'power1.inOut' }, 7.5);
    tl.to(trowel, { autoAlpha: 0, duration: .2 }, 9.1);
    tl.to(niche, { autoAlpha: 1, scale: 1, duration: .8, ease: 'power2.out' }, 9.4);
    tl.to(light, { autoAlpha: 1, duration: .6 }, 10);
    tl.to(endG, { autoAlpha: 1, x: 0, duration: .6, ease: 'power2.out' }, 10.1);
    tl.to({}, { duration: .6 });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(scene); else scene();
})();
