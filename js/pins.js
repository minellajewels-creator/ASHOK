/* pins.js — Show/hide info pins based on scroll position */
(function () {

  /* Each pin: id, scroll window to show [show, hide] */
  const pins = [
    { id: 'pin-0', show: 0.04, hide: 0.18 },
    { id: 'pin-1', show: 0.12, hide: 0.26 },
    { id: 'pin-2', show: 0.20, hide: 0.34 },
    { id: 'pin-3', show: 0.27, hide: 0.42 },
    { id: 'pin-4', show: 0.35, hide: 0.50 },
    { id: 'pin-5', show: 0.43, hide: 0.60 },
  ];

  function getProgress() {
    const sec = document.getElementById('space-section');
    if (!sec) return 0;
    const h = sec.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, window.scrollY / h));
  }

  function update() {
    const p = getProgress();
    pins.forEach(({ id, show, hide }) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (p >= show && p < hide) {
        el.classList.add('pin-show');
        el.classList.remove('pin-fade');
      } else if (p >= hide) {
        el.classList.remove('pin-show');
        el.classList.add('pin-fade');
      } else {
        el.classList.remove('pin-show', 'pin-fade');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
