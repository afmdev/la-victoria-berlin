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
})();
