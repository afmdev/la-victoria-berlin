// Geteilter Footer für alle Seiten unter lang/de/ (index.html, menu.html, …).
// Einzige Quelle der Wahrheit: hier ändern → überall aktualisiert.
// Wird in das Element <div id="site-footer"></div> injiziert.
(function () {
  var mount = document.getElementById('site-footer');
  if (!mount) return;

  mount.outerHTML = [
    '<footer class="site-footer" role="contentinfo">',

    '  <ul class="footer-social" aria-label="Social Media">',
    '    <li>',
    '      <a href="https://www.instagram.com/lavictoriaberlin/" target="_blank" rel="noopener" aria-label="La Victoria en Instagram">',
    '        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88"/></svg>',
    '      </a>',
    '    </li>',
    '    <li>',
    '      <a href="https://www.facebook.com/lavictoriaberlin" target="_blank" rel="noopener" aria-label="La Victoria en Facebook">',
    '        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07"/></svg>',
    '      </a>',
    '    </li>',
    '    <li>',
    '      <a href="https://www.youtube.com/@lavictoriaberlin" target="_blank" rel="noopener" aria-label="La Victoria en YouTube">',
    '        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81M9.55 15.57V8.43L15.82 12z"/></svg>',
    '      </a>',
    '    </li>',
    '    <li>',
    '      <a href="https://www.threads.net/@lavictoriaberlin" target="_blank" rel="noopener" aria-label="La Victoria en Threads">',
    '        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.19 24h-.01c-3.58-.02-6.33-1.2-8.18-3.51C2.35 18.44 1.5 15.59 1.47 12.01v-.02c.03-3.58.88-6.43 2.53-8.48C5.85 1.2 8.6.02 12.18 0h.01c2.75.02 5.04.73 6.83 2.1 1.68 1.29 2.86 3.13 3.51 5.47l-2.04.57c-1.1-3.96-3.9-5.98-8.3-6.02-2.91.02-5.11.94-6.54 2.72C4.31 6.5 3.62 8.91 3.59 12c.03 3.09.72 5.5 2.06 7.16 1.43 1.78 3.63 2.7 6.54 2.72 2.62-.02 4.36-.63 5.8-2.05 1.65-1.61 1.62-3.59 1.09-4.8-.31-.71-.87-1.3-1.63-1.75-.19 1.35-.62 2.45-1.28 3.27-.89 1.1-2.14 1.7-3.73 1.79-1.2.07-2.36-.22-3.26-.8-1.06-.69-1.69-1.74-1.75-2.96-.07-1.19.41-2.29 1.33-3.08.88-.76 2.12-1.21 3.58-1.29.98-.06 1.93-.02 2.79.11-.13-.74-.38-1.33-.75-1.76-.51-.59-1.31-.88-2.36-.89h-.03c-.84 0-1.99.23-2.72 1.32L7.73 7.85c.98-1.45 2.57-2.26 4.48-2.26h.04c3.19.02 5.1 1.98 5.29 5.39.11.05.22.09.32.14 1.49.7 2.58 1.76 3.15 3.07.8 1.82.87 4.79-1.55 7.16-1.85 1.81-4.09 2.63-7.27 2.65"/></svg>',
    '      </a>',
    '    </li>',
    '    <li>',
    '      <a href="https://x.com/lavictoriaberlin" target="_blank" rel="noopener" aria-label="La Victoria en X (Twitter)">',
    '        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zM17.61 20.64h2.04L6.49 3.24H4.3z"/></svg>',
    '      </a>',
    '    </li>',
    '  </ul>',

    '  <nav class="footer-legal" aria-label="Legal">',
    '    <a href="../impressum.html">Aviso Legal</a>',
    '    <span aria-hidden="true">·</span>',
    '    <a href="../datenschutz.html">Política de Privacidad</a>',
    '  </nav>',

    '  <div class="footer-bottom">',
    '    <p class="copyright">© <span id="year"></span> La Victoria · Berlin</p>',
    '  </div>',
    '  <div class="yellow-strip"></div>',
    '</footer>'
  ].join('\n');

  // Jahr im Copyright dynamisch setzen
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
