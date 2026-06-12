/* ============================================================
   SMART CRED · Interações e animações
   GSAP + ScrollTrigger + Lenis
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl = document.documentElement;
  if (prefersReduced) docEl.classList.add('reduce-motion');

  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    /* sem as libs de animação, nada pode ficar invisível (ver styles.css) */
    docEl.classList.add('no-gsap');
  }

  /* ---------- Scroll suave (Lenis) ---------- */
  var lenis = null;
  if (!prefersReduced && typeof Lenis !== 'undefined' && hasGsap) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: -92, duration: 1.4 });
    } else {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  }

  /* ---------- Âncoras ---------- */
  document.querySelectorAll('[data-anchor]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(href);
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
  });

  /* ---------- Preloader ---------- */
  var PRELOADER_MS = prefersReduced ? 0 : 1500;
  function finishLoad() {
    docEl.classList.add('is-loaded');
    heroIntro();
  }
  if (document.querySelector('.preloader')) {
    window.setTimeout(finishLoad, PRELOADER_MS);
  } else {
    finishLoad();
  }

  /* ---------- Entrada do hero ---------- */
  function heroIntro() {
    if (!hasGsap || !document.querySelector('.hero')) return;
    if (prefersReduced) {
      gsap.set('.hero__title .line__inner', { y: 0 });
      gsap.set("[data-hero]", { opacity: 1 });
      return;
    }
    gsap.set("[data-hero='sub']", { y: 14 });
    gsap.set("[data-hero='visual']", { scale: 0.94 });
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero__title .line__inner', { y: 0, duration: 1, stagger: 0.12 }, 0.05)
      .to("[data-hero='eyebrow']", { opacity: 1, duration: 0.6 }, 0.1)
      .to("[data-hero='sub']", { opacity: 1, y: 0, duration: 0.7 }, 0.55)
      .to("[data-hero='ctas']", { opacity: 1, duration: 0.7 }, 0.7)
      .to("[data-hero='badges']", { opacity: 1, duration: 0.7 }, 0.85)
      .to("[data-hero='visual']", { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.4)
      .from('.cube', { scale: 0, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'back.out(1.7)' }, 0.5);
  }

  /* ---------- Flutuação dos cubos + parallax ---------- */
  if (hasGsap && !prefersReduced) {
    document.querySelectorAll('.cube').forEach(function (cube, i) {
      gsap.to(cube, {
        y: (i % 2 === 0 ? -1 : 1) * (14 + i * 4),
        rotation: i % 2 === 0 ? 8 : -8,
        duration: 3 + i * 0.45,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    });

    var hero = document.querySelector('.hero');
    if (hero && window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var rx = (e.clientX / window.innerWidth - 0.5);
        var ry = (e.clientY / window.innerHeight - 0.5);
        document.querySelectorAll('.cube').forEach(function (cube, i) {
          var depth = (i % 3 + 1) * 10;
          gsap.to(cube, { x: rx * depth, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
        });
        var card = document.querySelector('[data-tilt]');
        if (card) {
          gsap.to(card, {
            rotationY: rx * 10,
            rotationX: -ry * 10,
            transformPerspective: 900,
            duration: 0.8,
            ease: 'power2.out'
          });
        }
      });
      hero.addEventListener('mouseleave', function () {
        var card = document.querySelector('[data-tilt]');
        if (card) gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power2.out' });
      });
    }

    var heroLogo = document.querySelector('.hero__logo');
    if (heroLogo) {
      gsap.to(heroLogo, { y: -16, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
  }

  /* ---------- Header: estado de scroll ---------- */
  var header = document.querySelector('.header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Barra de progresso ---------- */
  var progressBar = document.querySelector('.scroll-progress span');
  if (progressBar && hasGsap) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
    });
    gsap.set(progressBar, { scaleX: 0 });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.header__burger');
  var menu = document.querySelector('.menu');
  var menuOpen = false;
  function setMenu(open) {
    if (!menu || !burger) return;
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    }
  }
  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    setMenu(false);
    if (returnFocus && burger) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu(true);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu(false);
    });
  }

  /* ---------- Cursor customizado ---------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && hasGsap && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    var dot = cursor.querySelector('.cursor__dot');
    var ring = cursor.querySelector('.cursor__ring');
    var dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    var dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    var ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
    var ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });
    window.addEventListener('mousemove', function (e) {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    });
    document.querySelectorAll('a, button, .seg-tab').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ---------- Reveals por scroll ---------- */
  if (hasGsap) {
    if (prefersReduced) {
      gsap.set('[data-reveal]', { opacity: 1, y: 0 });
    } else {
      gsap.utils.toArray('[data-reveal]').forEach(function (el) {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true }
        });
      });
    }
  }

  /* ---------- Contadores ---------- */
  if (hasGsap && !prefersReduced) {
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.textContent = '0'; /* o HTML traz o valor final; com animação, conta a partir do zero */
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    });
  } else {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ---------- Barras do comparativo ---------- */
  if (hasGsap) {
    gsap.utils.toArray('.compare-bar__fill').forEach(function (bar, i) {
      gsap.to(bar, {
        scaleX: 1,
        duration: prefersReduced ? 0 : 1.3,
        delay: prefersReduced ? 0 : i * 0.18,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: bar, start: 'top 88%', once: true }
      });
    });
  }

  /* ---------- Linha de progresso dos passos ---------- */
  var stepsLine = document.querySelector('.steps__line span');
  if (stepsLine && hasGsap && !prefersReduced) {
    gsap.to(stepsLine, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.steps__wrap',
        start: 'top 75%',
        end: 'bottom 55%',
        scrub: 0.6
      }
    });
  } else if (stepsLine && hasGsap) {
    gsap.set(stepsLine, { scaleX: 1 });
  }

  /* ============================================================
     Pictogramas em blocos (Imóveis / Automóveis / Pesados)
     Cada ilustração é desenhada com os "blocos" da marca.
     ============================================================ */
  var TONES = {
    a: '#014FAD', // Azul Conquista
    b: '#013784', // Azul Construção
    c: '#002461', // Azul Patrimônio
    d: '#001147', // Azul Solidez
    l: '#7FB3FF', // Azul leve (destaque)
    w: '#DCE9FB'  // Vidro / janela
  };

  /* [coluna, linha, tom, redondo?] */
  var ART = {
    imoveis: {
      cols: 9, rows: 7,
      blocks: [
        [4, 0, 'c'],
        [3, 1, 'c'], [4, 1, 'b'], [5, 1, 'c'],
        [2, 2, 'c'], [3, 2, 'b'], [4, 2, 'a'], [5, 2, 'b'], [6, 2, 'c'],
        [1, 3, 'c'], [2, 3, 'b'], [3, 3, 'a'], [4, 3, 'a'], [5, 3, 'a'], [6, 3, 'b'], [7, 3, 'c'],
        [2, 4, 'b'], [3, 4, 'w'], [4, 4, 'a'], [5, 4, 'w'], [6, 4, 'b'],
        [2, 5, 'b'], [3, 5, 'a'], [4, 5, 'l'], [5, 5, 'a'], [6, 5, 'b'],
        [2, 6, 'b'], [3, 6, 'a'], [4, 6, 'l'], [5, 6, 'a'], [6, 6, 'b']
      ]
    },
    automoveis: {
      cols: 12, rows: 5,
      blocks: [
        [4, 1, 'b'], [5, 1, 'w'], [6, 1, 'w'], [7, 1, 'b'],
        [2, 2, 'c'], [3, 2, 'a'], [4, 2, 'a'], [5, 2, 'a'], [6, 2, 'a'], [7, 2, 'a'], [8, 2, 'a'], [9, 2, 'l'],
        [2, 3, 'b'], [3, 3, 'b'], [4, 3, 'b'], [5, 3, 'b'], [6, 3, 'b'], [7, 3, 'b'], [8, 3, 'b'], [9, 3, 'b'],
        [3, 4, 'd', true], [8, 4, 'd', true]
      ]
    },
    pesados: {
      cols: 12, rows: 6,
      blocks: [
        [1, 1, 'b'], [2, 1, 'b'], [3, 1, 'b'], [4, 1, 'b'], [5, 1, 'b'], [6, 1, 'b'], [7, 1, 'b'],
        [1, 2, 'a'], [2, 2, 'a'], [3, 2, 'a'], [4, 2, 'a'], [5, 2, 'a'], [6, 2, 'a'], [7, 2, 'a'],
        [1, 3, 'b'], [2, 3, 'b'], [3, 3, 'b'], [4, 3, 'b'], [5, 3, 'b'], [6, 3, 'b'], [7, 3, 'b'],
        [9, 2, 'a'], [10, 2, 'w'],
        [9, 3, 'a'], [10, 3, 'a'],
        [2, 4, 'd', true], [3, 4, 'd', true], [9, 4, 'd', true], [10, 4, 'd', true]
      ]
    }
  };

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function renderArt(svg, animate) {
    var key = svg.getAttribute('data-art');
    var art = ART[key];
    if (!art) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var vb = svg.viewBox.baseVal;
    var gap = 5;
    var cell = Math.min(
      (vb.width - gap * (art.cols - 1)) / art.cols,
      (vb.height - gap * (art.rows - 1)) / art.rows
    );
    var totalW = art.cols * cell + (art.cols - 1) * gap;
    var totalH = art.rows * cell + (art.rows - 1) * gap;
    var offX = (vb.width - totalW) / 2;
    var offY = (vb.height - totalH) / 2;

    var rects = art.blocks.map(function (blk) {
      var rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', offX + blk[0] * (cell + gap));
      rect.setAttribute('y', offY + blk[1] * (cell + gap));
      rect.setAttribute('width', cell);
      rect.setAttribute('height', cell);
      rect.setAttribute('rx', blk[3] ? cell / 2 : Math.max(4, cell * 0.22));
      rect.setAttribute('fill', TONES[blk[2]] || TONES.a);
      svg.appendChild(rect);
      return rect;
    });

    if (animate && hasGsap && !prefersReduced) {
      gsap.from(rects, {
        scale: 0,
        opacity: 0,
        transformOrigin: '50% 50%',
        duration: 0.5,
        stagger: { each: 0.022, from: 'random' },
        ease: 'back.out(1.8)'
      });
    }
  }

  document.querySelectorAll('.seg-art').forEach(function (svg) {
    renderArt(svg, false);
  });

  /* ---------- Tabs "Nossos consórcios" ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.seg-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.seg-panel'));

  /* sem JS os painéis ficam todos visíveis; com JS, só o ativo */
  panels.forEach(function (p) { p.hidden = !p.classList.contains('is-active'); });

  function activateTab(tab) {
    var targetId = tab.getAttribute('aria-controls');
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.setAttribute('tabindex', active ? '0' : '-1');
    });
    panels.forEach(function (p) {
      var show = p.id === targetId;
      if (show) {
        p.hidden = false;
        p.classList.add('is-active');
        var art = p.querySelector('.seg-art');
        if (art) renderArt(art, true);
        if (hasGsap && !prefersReduced) {
          gsap.fromTo(p.querySelector('.seg-panel__body'),
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
        }
      } else {
        p.hidden = true;
        p.classList.remove('is-active');
      }
    });
    /* a altura do documento muda com a troca de painel */
    if (hasGsap) ScrollTrigger.refresh();
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener('click', function () { activateTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      activateTab(next);
    });
  });

  /* ---------- Link ativo no header ---------- */
  if (hasGsap) {
    var sections = ['vantagens', 'consorcios', 'como-funciona', 'sobre'];
    sections.forEach(function (id) {
      var section = document.getElementById(id);
      var link = document.querySelector(".header__nav a[href='#" + id + "']");
      if (!section || !link) return;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: function (self) { link.classList.toggle('is-active', self.isActive); }
      });
    });
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
