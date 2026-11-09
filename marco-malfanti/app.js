(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = function () { return window.innerWidth < 860; };

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-go'); });

  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-small', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.querySelector('.burger');
  var nav = document.getElementById('menu');
  var setMenu = function (open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* count-up (years in business only) */
  var countUp = function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    var tick = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };

  /* reveals */
  var items = [].slice.call(document.querySelectorAll('.r'));
  var reveal = function (el) {
    el.classList.add('is-in');
    var c = el.querySelector('.count');
    if (c && !c.dataset.done) { c.dataset.done = '1'; countUp(c); }
  };
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('r'); });
        el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)), 6) * 80 + 'ms';
        reveal(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
      else io.observe(el);
    });
  }

  /* gallery thumbs */
  var big = document.querySelector('.gallery__big');
  [].slice.call(document.querySelectorAll('.thumb')).forEach(function (b, i, all) {
    b.addEventListener('click', function () {
      if (b.classList.contains('is-on')) return;
      all.forEach(function (x) { x.classList.toggle('is-on', x === b); });
      big.classList.add('is-swap');
      setTimeout(function () {
        big.src = b.getAttribute('data-src');
        big.alt = b.getAttribute('data-alt');
        big.classList.remove('is-swap');
      }, reduce ? 0 : 320);
    });
  });

  /* form */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', area: 'Scegliete il comune.', message: 'Scrivete in due righe il lavoro.' };
    var check = function (el) {
      var f = el.closest('.field');
      var ok = el.value.trim() !== '';
      if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      if (ok && el.type === 'tel') ok = el.value.replace(/\D/g, '').length >= 9;
      f.classList.toggle('is-bad', !ok);
      f.querySelector('.err').textContent = ok ? '' : (msgs[el.name] || 'Campo obbligatorio.');
      return ok;
    };
    var fields = [].slice.call(form.querySelectorAll('[required]'));
    fields.forEach(function (el) { el.addEventListener('blur', function () { if (el.value) check(el); }); });
    form.addEventListener('submit', function (e) {
      var bad = fields.filter(function (el) { return !check(el); });
      if (bad.length) { e.preventDefault(); bad[0].focus(); }
    });
  }

  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var build = function () {
    /* hero reel drifts left while the hero scrolls away */
    var track = document.querySelector('.reel__track');
    var reel = document.querySelector('.reel');
    gsap.to(track, {
      x: function () { return -Math.max(0, track.scrollWidth - reel.clientWidth * 0.55); },
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
    });

    /* rebar scene */
    var scene = document.querySelector('.rebar');
    var spacers = scene.querySelector('.rb-spacers');
    var xs = [].slice.call(scene.querySelectorAll('.rb-x .rb-bar'));
    var ys = [].slice.call(scene.querySelectorAll('.rb-y .rb-bar'));
    var ties = [].slice.call(scene.querySelectorAll('.rb-tie-row'));
    var n1 = scene.querySelector('.rb-n1');
    var n2 = scene.querySelector('.rb-n2');
    var steps = [].slice.call(scene.querySelectorAll('.rebar__steps li'));
    var end = scene.querySelector('.rebar__end');
    var c = function (v) { return Math.max(0, Math.min(1, v)); };
    var lay = function (list, from, to, p, axis) {
      var rp = c((p - from) / (to - from)) * list.length;
      list.forEach(function (g, i) {
        var t = c(rp - i);
        g.style.opacity = t;
        if (axis) g.style.transform = (axis === 'x' ? 'translateX(' : 'translateY(') + (-70 * (1 - t)).toFixed(1) + 'px)';
      });
      return Math.floor(rp + 0.001);
    };
    var paint = function (p) {
      spacers.style.opacity = c(p / 0.1);
      var a = lay(xs, 0.14, 0.4, p, 'x');
      var b = lay(ys, 0.42, 0.68, p, 'y');
      var t = lay(ties, 0.7, 0.88, p, null);
      n1.textContent = String(a + b).padStart(2, '0');
      n2.textContent = String(t * 13).padStart(3, '0');
      var cur = steps[0];
      steps.forEach(function (li) {
        var on = p >= parseFloat(li.getAttribute('data-at'));
        li.classList.toggle('is-on', on);
        if (on) cur = li;
      });
      steps.forEach(function (li) { li.classList.toggle('is-cur', li === cur); });
      end.classList.toggle('is-on', p >= 0.94);
    };
    paint(0);
    ScrollTrigger.create({
      trigger: scene,
      start: 'top top',
      end: function () { return phone() ? '+=170%' : '+=240%'; },
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) { paint(self.progress); },
      onRefresh: function (self) { paint(self.progress); }
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
