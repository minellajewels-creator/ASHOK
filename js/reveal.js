/* reveal.js — Scroll-triggered reveal animations */
(function () {
  function initReveals() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 8) * 0.07 + 's';
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(el => obs.observe(el));
  }

  // Run on load
  document.addEventListener('DOMContentLoaded', initReveals);

  // Also expose so pages can call after dynamic content loads
  window.initReveals = initReveals;
})();
