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

// Photo carousel v2 (all 51 reviews, interleaved photo/no-photo, DOM recycling)
(function () {
  const track = document.getElementById('c2Track');
  const viewport = document.getElementById('c2Viewport');
  if (!track) return;

  const GAP = 16;
  const ICON_PATH = '../../assets/svg/icons/';
  const ICONS = [
    'icon-star-la-victoria-berlin.svg',
    'icon-fork-la-victoria-berlin.svg',
    'icon-flames-la-victoria-berlin.svg',
    'icon-umbrella-la-victoria-berlin.svg',
    'icon-rose-la-victoria-berlin.svg',
    'icon-chair-la-victoria-berlin.svg',
    'icon-star-2-la-victoria-berlin.svg',
  ];
  // bg color, CSS filter to colorise the icon
  // filter: brightness(0) = black; invert+sepia+saturate = yellow approx #FFCC00
  const PALETTES = [
    ['#FF6600', 'brightness(0) saturate(0)'],
    ['#FFCC00', 'brightness(0) saturate(0)'],
    ['#66B04F', 'brightness(0) saturate(0)'],
    ['#662D91', 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(3deg)'],
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x22/g, '&quot;');
  }
  function safeUrl(u) {
    return /^https?:\/\//i.test(String(u || '')) ? u : '';
  }

  function photoCard(r) {
    const img = safeUrl(r.image_links[0]);
    const lvl = r.google_reviewer_level;
    const badge = lvl ? '<span class="c2-author-badge">Lokaler Guide &middot; L' + esc(lvl) + '</span>' : '';
    const text = r.review_text ? '<p class="c2-text">&bdquo;' + esc(r.review_text) + '&ldquo;</p>' : '';
    return '<div class="c2-card">'
      + '<a class="c2-photo" href="' + esc(img) + '" data-lightbox>'
      + '<img src="' + esc(img) + '" alt="Gaestefoto - ' + esc(r.author) + '" loading="lazy"/>'
      + '<span class="c2-photo-hint">&#128269; Vergroessern</span></a>'
      + '<div class="c2-body"><div class="c2-author-row">'
      + '<img class="c2-avatar" src="' + esc(safeUrl(r.reviewer_image_link)) + '" alt="" loading="lazy"/>'
      + '<div class="c2-author-info"><span class="c2-author-name">' + esc(r.author) + '</span>' + badge + '</div>'
      + '</div><div class="c2-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' + text + '</div></div>';
  }

  function noPhotoCard(r, idx) {
    const pal = PALETTES[idx % PALETTES.length];
    const icon = ICON_PATH + ICONS[idx % ICONS.length];
    const lvl = r.google_reviewer_level;
    const badge = lvl ? '<span class="c2-author-badge">Lokaler Guide &middot; L' + esc(lvl) + '</span>' : '';
    const text = r.review_text ? '<p class="c2-text">&bdquo;' + esc(r.review_text) + '&ldquo;</p>' : '';
    return '<div class="c2-card">'
      + '<div class="c2-photo c2-photo--ph" style="background:' + pal[0] + '">'
      + '<img class="c2-ph-icon" src="' + icon + '" alt="" style="filter:' + pal[1] + '">'
      + '</div>'
      + '<div class="c2-body"><div class="c2-author-row">'
      + '<img class="c2-avatar" src="' + esc(safeUrl(r.reviewer_image_link)) + '" alt="" loading="lazy"/>'
      + '<div class="c2-author-info"><span class="c2-author-name">' + esc(r.author) + '</span>' + badge + '</div>'
      + '</div><div class="c2-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' + text + '</div></div>';
  }

  function buildCards(all) {
    const withPhoto = all.filter(function (r) { return r.image_links && r.image_links.length; });
    const noPhoto = all.filter(function (r) { return !r.image_links || !r.image_links.length; });
    const cards = [];
    let ni = 0;
    const len = Math.max(withPhoto.length, noPhoto.length);
    for (var i = 0; i < len; i++) {
      if (i < withPhoto.length) cards.push(photoCard(withPhoto[i]));
      if (i < noPhoto.length) cards.push(noPhotoCard(noPhoto[i], ni++));
    }
    return cards.join('');
  }

  // Continuous scroll via DOM recycling - each card exists once
  let offset = 0;
  let paused = false;
  let last = performance.now();
  let pxPerSec = 45;
  const ref = document.querySelector('.carousel-track');
  if (ref && ref.scrollWidth) pxPerSec = (ref.scrollWidth / 2) / 90;

  function cardW() {
    const fc = track.firstElementChild;
    return fc ? fc.getBoundingClientRect().width + GAP : 0;
  }

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    if (!paused && track.firstElementChild) {
      offset += pxPerSec * dt;
      let w = cardW();
      while (w > 0 && offset >= w && track.children.length > 1) {
        offset -= w;
        track.appendChild(track.firstElementChild);
        w = cardW();
      }
      track.style.transform = 'translateX(' + (-offset) + 'px)';
    }
    requestAnimationFrame(frame);
  }

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
    requestAnimationFrame(frame);
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
