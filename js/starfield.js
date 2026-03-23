/* starfield.js — Deep space canvas with scroll-driven zoom */
(function () {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], time = 0;
  const STAR_COUNT = 750;
  const COLORS = ['#ffffff','#cce8ff','#ffeedd','#ffd6d6','#ccffee','#e8ccff'];

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Init stars ── */
  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        ox: Math.random() * W,        // original X
        oy: Math.random() * H,        // original Y
        r:  0.3 + Math.random() * 1.8,
        brightness: 0.4 + Math.random() * 0.6,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.004 + Math.random() * 0.012,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        isGiant: Math.random() < 0.05
      });
    }
  }

  /* ── Scroll progress (0–1) within space section ── */
  function getProgress() {
    const sec = document.getElementById('space-section');
    if (!sec) return 0;
    const h = sec.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, window.scrollY / h));
  }

  /* ── Draw nebula clouds ── */
  function drawNebula(p) {
    const nebulae = [
      { x: W * 0.28, y: H * 0.38, rx: 380, ry: 210, color: 'rgba(168,85,247,', a: 0.055 },
      { x: W * 0.72, y: H * 0.60, rx: 300, ry: 180, color: 'rgba(0,100,210,',   a: 0.045 },
      { x: W * 0.50, y: H * 0.22, rx: 260, ry: 150, color: 'rgba(200,55,100,',  a: 0.038 },
      { x: W * 0.14, y: H * 0.70, rx: 200, ry: 120, color: 'rgba(0,185,225,',   a: 0.04 },
      { x: W * 0.85, y: H * 0.30, rx: 230, ry: 140, color: 'rgba(255,100,50,',  a: 0.035 },
    ];
    nebulae.forEach(n => {
      const alpha = n.a * (1 - p * 0.5);
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
      g.addColorStop(0, n.color + alpha + ')');
      g.addColorStop(1, n.color + '0)');
      ctx.save();
      ctx.scale(1, n.ry / n.rx);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── Main draw ── */
  function draw() {
    const p = getProgress();

    // Background colour
    const bg = Math.floor(2 + p * 4);
    ctx.fillStyle = `rgb(${bg},${bg},${bg + 14})`;
    ctx.fillRect(0, 0, W, H);

    drawNebula(p);

    // Zoom: stars radiate from centre as p increases
    const zoom = 1 + p * 12;
    const cx = W / 2, cy = H / 2;

    stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;
      const tw = Math.sin(s.twinkle) * 0.28 + 0.72;

      const sx = cx + (s.ox - cx) * zoom;
      const sy = cy + (s.oy - cy) * zoom;
      if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) return;

      const size  = s.r * (1 + p * 3) * tw;
      const alpha = s.brightness * tw * Math.max(0, 1 - p * 0.4);

      ctx.globalAlpha = alpha;
      if (s.isGiant || s.brightness > 0.8) {
        ctx.shadowColor = s.color;
        ctx.shadowBlur  = 4 + p * 10;
      }
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.globalAlpha = 1;

   // Replace the existing Earth glow block with this:
if (p > 0.65) {
  const ea = (p - 0.65) / 0.35;
  drawEarthOnStarfield(ctx, W, H, ea, time);
}

    // Fade out big hero name
    const hero = document.getElementById('space-hero');
    if (hero) hero.style.opacity = Math.max(0, 1 - p * 5);

    // Fade out scroll hint
    const hint = document.getElementById('scroll-hint');
    if (hint) hint.style.opacity = Math.max(0, 1 - p * 12);

    time++;
    requestAnimationFrame(draw);
  }
  
function drawEarthOnStarfield(ctx, W, H, alpha, time) {
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.28 * alpha; // grows as alpha increases

  // Atmosphere
  const atmo = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.4);
  atmo.addColorStop(0, `rgba(30,110,230,${0.2 * alpha})`);
  atmo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = atmo;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2); ctx.fill();

  // Ocean
  const ocean = ctx.createRadialGradient(cx - r*0.28, cy - r*0.32, 0, cx, cy, r);
  ocean.addColorStop(0, '#1a55a8'); ocean.addColorStop(1, '#040e30');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ocean;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
  /* ── Shooting stars ── */
  function spawnShootingStar() {
    const p = getProgress();
    if (p > 0.55) return;
    const sec = document.getElementById('space-section');
    if (!sec) return;

    const el = document.createElement('div');
    el.className = 'shoot-star';
    const angle = -10 + Math.random() * 25;
    el.style.cssText = `
      top:${Math.random() * H * 0.65}px;
      left:${Math.random() * W * 0.5}px;
      transform:rotate(${angle}deg);
    `;
    sec.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  window.addEventListener('resize', () => { resize(); initStars(); });
  resize();
  initStars();
  draw();
  setInterval(spawnShootingStar, 2800 + Math.random() * 1800);
})();
