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
  // Also skip on back/forward: the user expects an instant return, and fading the
  // project page over the sticky project stack looks like a glitch.
  function skip(e) {
    var type = e.activation ? e.activation.navigationType : '';
    if (e.viewTransition && (d.getAttribute('data-view') === 'llm' || type === 'traverse'))
      e.viewTransition.skipTransition();
  }
  addEventListener('pageswap', skip);
  addEventListener('pagereveal', skip);
})();
