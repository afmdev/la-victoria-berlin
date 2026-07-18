// Geteiltes Navbar-Verhalten für alle Seiten im jeweiligen Sprachordner (index.html, menu.html, …).
// 1) Scroll-Zustand: schwarzer Hintergrund + gelbe Links ab >60px Scroll.
// 2) Mobiles Hamburger-Menü: gleitet von oben herab / nach oben.

(function () {
  // 0) Aktuelle Sprache merken → bevorzugt bei der automatischen Erkennung auf "/"
  try {
    var lang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (lang) localStorage.setItem('lv_lang', lang);
  } catch (e) {}

  // 1) Navbar-Scroll-Zustand via Sentinel (kein scroll-Listener → keine unnötige Last)
  var nav = document.getElementById('navbar');
  var sentinel = document.getElementById('navSentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('scrolled', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  // 2) Mobiles Menü: öffnen (herab) / schließen (hinauf)
  var btn = document.getElementById('navHamburger');
  var menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      btn.classList.toggle('open', open);
      // aria-expanded kommuniziert den Zustand sprachneutral an Screenreader
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    };

    btn.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });

    // Beim Klick auf einen Link schließen
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Mit Escape schließen
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setOpen(false);
    });
  }

  // 3) Sprach-Dropdown: Vorhang-Animation beim Öffnen UND beim Schließen.
  //    <details> animiert das Schließen nicht von selbst → wir spielen die
  //    Rückwärts-Animation und schließen erst danach.
  var dds = document.querySelectorAll('details.lang-dd, details.lang-dd-mobile');
  for (var i = 0; i < dds.length; i++) {
    (function (dd) {
      var summary = dd.querySelector('summary');
      var ul = dd.querySelector('ul');
      if (!summary || !ul) return;
      var outAnim = dd.classList.contains('lang-dd-mobile') ? 'lang-curtain-m-out' : 'lang-curtain-d-out';
      var closing = false;

      summary.addEventListener('click', function (e) {
        if (closing) { e.preventDefault(); return; }      // Klicks während des Einrollens ignorieren
        if (dd.open) {
          // Schließen: erst nach oben einrollen, dann <details> schließen
          e.preventDefault();
          closing = true;
          ul.style.animation = outAnim + ' 0.32s cubic-bezier(0.4, 0, 0.2, 1) both';
          var done = function () {
            ul.removeEventListener('animationend', done);
            dd.open = false;
            closing = false;
            ul.style.animation = '';
          };
          ul.addEventListener('animationend', done);
        }
        // Öffnen: native Umschaltung läuft normal; toggle-Handler startet die Öffnen-Animation
      });

      dd.addEventListener('toggle', function () {
        if (!dd.open) return;
        // Öffnen-Animation bei JEDEM Öffnen neu starten (sonst läuft sie nur beim ersten Mal)
        ul.style.animation = 'none';
        void ul.offsetWidth;
        ul.style.animation = '';
      });
    })(dds[i]);
  }

  // 4) Reviews-Marquee: erst bauen, wenn die Sektion in den Viewport scrollt (lazy),
  //    danach läuft eine reine CSS-Animation. Daten liegen inline (#c2-data) → kein fetch.
  var section = document.getElementById('reviews2');
  var track = document.getElementById('c2Track');
  var dataEl = document.getElementById('c2-data');
  if (section && track && dataEl && 'IntersectionObserver' in window) {
    var esc = function (s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    var card = function (r) {
      var rating = Math.max(0, Math.min(5, parseInt(r.rating, 10) || 5));
      var stars = '★★★★★'.slice(0, rating);
      var avatar = r.avatar
        ? '<img class="c2-avatar" src="' + esc(r.avatar) + '" alt="" loading="lazy" decoding="async" width="40" height="40" referrerpolicy="no-referrer">'
        : '';
      return '<article class="c2-card"><div class="c2-body">'
        + '<div class="c2-author-row">' + avatar
        + '<div class="c2-author-info"><span class="c2-author-name">' + esc(r.author) + '</span>'
        + '<span class="c2-stars" aria-label="' + rating + '/5">' + stars + '</span></div></div>'
        + '<p class="c2-text">' + esc(r.text) + '</p></div></article>';
    };
    var built = false;
    var build = function () {
      if (built) return; built = true;
      var data;
      try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
      if (!data || !data.length) return;
      var html = data.map(card).join('');
      track.innerHTML = html + html; // verdoppeln → nahtlose Schleife bei translateX(-50%)
      track.style.setProperty('--c2-dur', (data.length * 4.5) + 's');
      track.classList.add('c2-animate');
    };
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { build(); io.disconnect(); }
    }, { rootMargin: '300px' });
    io.observe(section);
  }
})();
