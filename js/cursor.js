/* cursor.js — Custom cursor + scroll progress */
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const bar  = document.getElementById('scroll-bar');

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });

  (function animRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(animRing);
  })();

  // Expand ring on interactive elements
  document.addEventListener('mouseover', e => {
    if (!ring) return;
    const el = e.target.closest('a, button, .nav-card, .skill-card, .proj-card, .int-card, .social-card, .ci-item, .stat-card');
    if (el) {
      ring.style.width = '52px'; ring.style.height = '52px';
      ring.style.borderColor = 'rgba(0,229,255,0.85)';
    } else {
      ring.style.width = '34px'; ring.style.height = '34px';
      ring.style.borderColor = 'rgba(0,229,255,0.5)';
    }
  });

  // Scroll progress
  window.addEventListener('scroll', () => {
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = Math.min(1, window.scrollY / max) * 100 + '%';
  }, { passive: true });
})();
