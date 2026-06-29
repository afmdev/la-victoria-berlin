// Geteiltes Navbar-Verhalten für alle Seiten unter lang/de/ (index.html, menu.html, …).
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
})();
