// Runs before first paint (render-blocking, external so CSP needs no 'unsafe-inline').
// Applies the saved theme and the human/LLM view so the page never flashes.
(function () {
  var d = document.documentElement;
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') d.setAttribute('data-theme', t);
    var q = new URLSearchParams(location.search).get('view');
    if (q === 'llm' || q === 'human') localStorage.setItem('view', q);
    if ((q || localStorage.getItem('view')) === 'llm') d.setAttribute('data-view', 'llm');
  } catch {
    if (/[?&]view=llm\b/.test(location.search)) d.setAttribute('data-view', 'llm');
  }
  // LLM view has no motion, so skip cross-document view transitions there.
  function skip(e) {
    if (e.viewTransition && d.getAttribute('data-view') === 'llm')
      e.viewTransition.skipTransition();
  }
  addEventListener('pageswap', skip);
  addEventListener('pagereveal', skip);
})();
