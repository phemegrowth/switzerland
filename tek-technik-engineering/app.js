(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = function () { return window.innerWidth < 860; };

  /* year */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* hero entrance: starts on the first frame, headline done well under 1.6 s */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function () { hero.classList.add('is-go'); });

  /* header shrink */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-small', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
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

  /* scroll reveals with the above-the-fold guard */
  var items = [].slice.call(document.querySelectorAll('.r'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('r'); }) : [];
        var i = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(i, 6) * 80 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* services: hover (desktop) or centred row (phone) swaps the photo */
  var imgs = [].slice.call(document.querySelectorAll('.services__fig img'));
  var rows = [].slice.call(document.querySelectorAll('.srv'));
  var show = function (row) {
    var k = row.getAttribute('data-k');
    rows.forEach(function (r) { r.classList.toggle('is-hot', r === row); });
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-k') === k); });
  };
  rows.forEach(function (row) { row.addEventListener('mouseenter', function () { show(row); }); });
  if ('IntersectionObserver' in window) {
    var mid = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting && phone()) show(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (r) { mid.observe(r); });
  }

  /* drag strip */
  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  /* magnetic buttons */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    [].slice.call(document.querySelectorAll('.magnet')).forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = 'translate(' + dx * 8 + 'px,' + dy * 6 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* form validation */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = { name: 'Scrivete il vostro nome.', phone: 'Serve un numero di telefono.', email: 'Controllate l\'indirizzo email.', problem: 'Scegliete una voce.', message: 'Raccontate in due righe il problema.' };
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

  /* GSAP: hero parallax, thermal scan scene, process line */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var build = function () {
    gsap.to('.hero__fig', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    var scan = document.querySelector('.scan');
    var heat = scan.querySelector('.scan__heat');
    var bar = scan.querySelector('.scan__bar');
    var draw = scan.querySelector('.scan__draw');
    var pct = scan.querySelector('.scan__pct');
    var steps = [].slice.call(scan.querySelectorAll('.scan__steps li'));
    var pins = [].slice.call(scan.querySelectorAll('.scan__pin'));
    var end = scan.querySelector('.scan__end');
    var paint = function (p) {
      var s = Math.min(1, Math.max(0, p / 0.82));
      heat.style.clipPath = 'inset(0 0 ' + ((1 - s) * 100).toFixed(2) + '% 0)';
      bar.style.transform = 'translateY(' + (s * draw.clientHeight).toFixed(1) + 'px)';
      bar.style.opacity = s >= 1 ? '0' : '1';
      pct.textContent = String(Math.round(s * 100)).padStart(3, '0');
      scan.classList.toggle('is-heat', s > 0.02);
      var cur = steps[0];
      steps.forEach(function (li) {
        var on = s >= parseFloat(li.getAttribute('data-at'));
        li.classList.toggle('is-on', on);
        if (on) cur = li;
      });
      steps.forEach(function (li) { li.classList.toggle('is-cur', li === cur); });
      pins.forEach(function (pn) { pn.classList.toggle('is-on', s >= parseFloat(pn.getAttribute('data-at'))); });
      end.classList.toggle('is-on', p >= 0.88);
    };
    paint(0);
    ScrollTrigger.create({
      trigger: scan,
      start: 'top top',
      end: function () { return phone() ? '+=160%' : '+=230%'; },
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) { paint(self.progress); },
      onRefresh: function (self) { paint(self.progress); }
    });

    var line = document.querySelector('.steps__line i');
    gsap.fromTo(line, { scaleX: phone() ? 1 : 0, scaleY: phone() ? 0 : 1 }, {
      scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.steps__track', start: 'top 80%', end: 'bottom 55%', scrub: true }
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
})();
