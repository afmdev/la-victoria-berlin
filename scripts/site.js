document.getElementById('year').textContent = new Date().getFullYear();

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Mobile hamburger menu ────────────────────────────
(function () {
  const nav = document.getElementById('navbar');
  const navLinks = document.querySelector('.nav-links');
  if (!nav || !navLinks) return;

  const lang = (document.documentElement.lang || 'de').slice(0, 2);
  const labels = {
    de: { open: 'Menü öffnen', close: 'Menü schließen', nav: 'Mobile Navigation' },
    en: { open: 'Open menu',   close: 'Close menu',     nav: 'Mobile navigation' },
    es: { open: 'Abrir menú',  close: 'Cerrar menú',    nav: 'Navegación móvil' },
    fr: { open: 'Ouvrir le menu', close: 'Fermer le menu', nav: 'Navigation mobile' },
    it: { open: 'Apri menu',   close: 'Chiudi menu',    nav: 'Navigazione mobile' },
  };
  const t = labels[lang] || labels.de;

  // Use existing button/panel from HTML, or create them if not present
  let btn = document.getElementById('navHamburger');
  if (btn && btn.dataset.mobileInit) return; // already wired up by inline script
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'nav-hamburger';
    btn.id = 'navHamburger';
    [0, 1, 2].forEach(() => btn.appendChild(document.createElement('span')));
    nav.appendChild(btn);
  }
  btn.setAttribute('aria-label', t.open);
  btn.setAttribute('aria-expanded', 'false');

  let panel = document.getElementById('mobileMenu');
  if (!panel) {
    panel = document.createElement('nav');
    panel.className = 'mobile-menu';
    panel.id = 'mobileMenu';
    panel.setAttribute('aria-label', t.nav);
    navLinks.querySelectorAll('a').forEach(a => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.className = 'mobile-menu-link';
      link.textContent = a.textContent.trim();
      panel.appendChild(link);
    });
    nav.after(panel);
  }
  panel.setAttribute('aria-hidden', 'true');

  function close() {
    btn.classList.remove('open');
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-label', t.open);
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    panel.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));
    btn.setAttribute('aria-label', isOpen ? t.close : t.open);
  });

  panel.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      close();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 10);
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !panel.contains(e.target)) close();
  });
})();

// Photo carousel v2 (all 51 reviews, interleaved photo/no-photo, DOM recycling)
(function () {
  const track = document.getElementById('c2Track');
  const viewport = document.getElementById('c2Viewport');
  if (!track) return;

  const GAP = 16;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x22/g, '&quot;');
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(String(u || '')) ? u : '';
  }

  function buildCard(r) {
    const lvl = r.google_reviewer_level;
    const badge = lvl ? '<span class="c2-author-badge">Lokaler Guide &middot; L' + esc(lvl) + '</span>' : '';
    const text = r.review_text ? '<p class="c2-text">&bdquo;' + esc(r.review_text) + '&ldquo;</p>' : '';
    const avatar = safeUrl(r.reviewer_image_link)
      ? '<img class="c2-avatar" src="' + safeUrl(r.reviewer_image_link) + '" alt="" loading="lazy">'
      : '';
    return '<div class="c2-card">'
      + '<div class="c2-body"><div class="c2-author-row">'
      + avatar
      + '<div class="c2-author-info"><span class="c2-author-name">' + esc(r.author) + '</span>' + badge + '</div>'
      + '</div><div class="c2-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' + text + '</div></div>';
  }

  function buildCards(all) {
    return all.map(function (r, i) { return buildCard(r, i); }).join('');
  }

  // Continuous scroll via DOM recycling - each card exists once
  let offset = 0;
  let paused = false;
  let last = performance.now();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pxPerSec = prefersReducedMotion ? 0 : 45;
  let cachedCardW = 0;
  let rafId = null;

  // Invalidate cached width when cards resize (e.g. viewport width change)
  new ResizeObserver(function () { cachedCardW = 0; }).observe(track);

  function measureCardW() {
    const fc = track.firstElementChild;
    cachedCardW = fc ? fc.getBoundingClientRect().width + GAP : 0;
  }

  function frame(now) {
    // Clamp dt so a background-tab returning doesn't cause a huge jump
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused && track.firstElementChild) {
      if (!cachedCardW) measureCardW();
      if (cachedCardW > 0) {
        offset += pxPerSec * dt;
        while (offset >= cachedCardW && track.children.length > 1) {
          offset -= cachedCardW;
          track.appendChild(track.firstElementChild);
        }
        track.style.transform = 'translateX(' + (-offset) + 'px)';
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function startRaf() {
    if (!rafId) {
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  }

  function stopRaf() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // Stop the loop entirely when the carousel is off-screen
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) startRaf();
    else stopRaf();
  }, { threshold: 0 }).observe(track);

  function step(dir) {
    const n = 3;
    if (dir > 0) {
      for (var i = 0; i < n && track.children.length > 1; i++) track.appendChild(track.firstElementChild);
    } else {
      for (var i = 0; i < n && track.children.length > 1; i++) track.insertBefore(track.lastElementChild, track.firstElementChild);
    }
    offset = 0;
    track.style.transform = 'translateX(0px)';
  }

  function init(all) {
    if (!all || !all.length) return;
    track.innerHTML = buildCards(all);
    // rAF is managed by the IntersectionObserver above
  }

  function fromEmbed() {
    const el = document.getElementById('c2ReviewsData');
    try { return el ? JSON.parse(el.textContent) : []; } catch (e) { return []; }
  }
  var pageLang = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  var supportedLangs = ['de', 'en', 'es', 'it', 'fr', 'pl', 'nl'];
  if (supportedLangs.indexOf(pageLang) === -1) pageLang = 'de';

  fetch('../../data/reviews/reviews.' + pageLang + '.json')
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (data) { init(Array.isArray(data) ? data : (data.reviews || [])); })
    .catch(function () {
      fetch('../../data/reviews/reviews.de.json')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) { init(Array.isArray(data) ? data : (data.reviews || [])); })
        .catch(function () { init(fromEmbed()); });
    });

  if (viewport) {
    viewport.addEventListener('mouseenter', function () { paused = true; });
    viewport.addEventListener('mouseleave', function () { paused = false; });
  }
  document.querySelector('.c2-btn-prev').addEventListener('click', function () { step(-1); });
  document.querySelector('.c2-btn-next').addEventListener('click', function () { step(1); });
})();

// Lightbox (event delegation - works with dynamically added cards)
(function () {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const lbClose = document.getElementById('lightboxClose');
  let lbItems = [];
  let lbIndex = -1;

  function updateNavVisibility() {
    const show = lbItems.length > 1;
    lbPrev.style.display = show ? 'flex' : 'none';
    lbNext.style.display = show ? 'flex' : 'none';
  }

  function showAt(index) {
    if (!lbItems.length) return;
    lbIndex = (index + lbItems.length) % lbItems.length;
    lbImg.src = lbItems[lbIndex].getAttribute('href') || '';
  }

  function openFrom(el) {
    lbItems = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    lbIndex = lbItems.indexOf(el);
    if (lbIndex < 0) {
      lbItems = [el];
      lbIndex = 0;
    }
    updateNavVisibility();
    showAt(lbIndex);
    lb.classList.add('open');
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-lightbox]');
    if (!el) return;
    e.preventDefault();
    openFrom(el);
  });

  function closeLb() {
    lb.classList.remove('open');
    lbImg.src = '';
    lbItems = [];
    lbIndex = -1;
  }

  function moveLb(delta) {
    if (!lb.classList.contains('open') || lbItems.length < 2) return;
    showAt(lbIndex + delta);
  }

  lbPrev.addEventListener('click', function () { moveLb(-1); });
  lbNext.addEventListener('click', function () { moveLb(1); });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') moveLb(-1);
    if (e.key === 'ArrowRight') moveLb(1);
  });
})();
