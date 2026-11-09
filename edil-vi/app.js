(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = function () { return window.innerWidth < 860; };

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* hero curtain: starts on the first frame */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-go'); });

  /* header */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-small', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* menu */
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

  /* reveals */
  var items = [].slice.call(document.querySelectorAll('.r'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('r'); });
        el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)), 6) * 80 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* accordion with height animation */
  [].slice.call(document.querySelectorAll('.acc__item')).forEach(function (d) {
    var sum = d.querySelector('summary');
    var body = d.querySelector('.acc__body');
    sum.addEventListener('click', function (e) {
      if (reduce || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        var h = body.offsetHeight;
        var a = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.22,.7,.12,1)' });
        a.onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var h2 = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.22,.7,.12,1)' });
      }
    });
  });

  /* form */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', work: 'Scegliete il tipo di lavoro.', message: 'Descrivete il lavoro in due righe.' };
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
    /* paving scene: one scroll value drives sand, rows, counter, kerb and step list */
    var scene = document.querySelector('.pave');
    var sand = scene.querySelector('.pv-sand');
    var rows = [].slice.call(scene.querySelectorAll('.pv-row'));
    var kerb = scene.querySelector('.pv-kerb');
    var num = scene.querySelector('.pave__n');
    var steps = [].slice.call(scene.querySelectorAll('.pave__steps li'));
    var N = rows.length;
    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
    var paint = function (p) {
      sand.style.opacity = clamp((p - 0.1) / 0.08);
      var rp = clamp((p - 0.22) / 0.6) * N;
      rows.forEach(function (g, i) {
        var t = clamp(rp - i);
        g.style.opacity = t;
        g.style.transform = 'translateY(' + (-14 * (1 - t)).toFixed(1) + 'px)';
      });
      var laid = Math.floor(rp + 0.001);
      num.textContent = String(Math.min(N, laid)).padStart(2, '0');
      kerb.style.strokeDashoffset = (100 * (1 - clamp((p - 0.86) / 0.12))).toFixed(1);
      var cur = steps[0];
      steps.forEach(function (li) {
        var on = p >= parseFloat(li.getAttribute('data-at'));
        li.classList.toggle('is-on', on);
        if (on) cur = li;
      });
      steps.forEach(function (li) { li.classList.toggle('is-cur', li === cur); });
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

    gsap.to('.proc__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.proc', start: 'top 75%', end: 'bottom 60%', scrub: true } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
