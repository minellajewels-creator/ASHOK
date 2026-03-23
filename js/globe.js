/* globe.js — Rotating Earth canvas, orbiting, landing at Coimbatore */
(function () {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, time = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function getProgress() {
    const sec = document.getElementById('globe-section');
    if (!sec) return 0;
    const rect = sec.getBoundingClientRect();
    const h = sec.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -rect.top / h));
  }

  /* Coimbatore: 10.99°N, 76.96°E */
  const CBE = {
    lat: 10.99 * Math.PI / 180,
    lon: 76.96 * Math.PI / 180
  };

  /* Project lat/lon to canvas XY */
  function project(lat, lon, rotation, cx, cy, r) {
    const x = r * Math.cos(lat) * Math.sin(lon + rotation);
    const y = -r * Math.sin(lat);
    const z = r * Math.cos(lat) * Math.cos(lon + rotation);
    return { x: cx + x, y: cy + y, z };
  }

  /* ── Land dot data ── */
  const LAND = [];
  function buildLand() {
    for (let lat = -85; lat <= 85; lat += 5.5) {
      for (let lon = -180; lon < 180; lon += 6.5) {
        if (isLand(lat, lon)) {
          LAND.push([lat * Math.PI / 180, lon * Math.PI / 180]);
        }
      }
    }
  }

  function isLand(lat, lon) {
    // Europe
    if (lat > 36 && lat < 72 && lon > -12 && lon < 40) return true;
    // Africa
    if (lat > -36 && lat < 38 && lon > -18 && lon < 52) return true;
    // Asia (mainland)
    if (lat > 5  && lat < 80 && lon > 40  && lon < 145) return true;
    // South/SE Asia
    if (lat > -10 && lat < 25 && lon > 95 && lon < 145) return true;
    // Japan + Korea
    if (lat > 30 && lat < 50 && lon > 125 && lon < 145) return true;
    // North America
    if (lat > 15 && lat < 75 && lon > -168 && lon < -52) return true;
    // South America
    if (lat > -58 && lat < 14 && lon > -82 && lon < -34) return true;
    // Australia
    if (lat > -44 && lat < -10 && lon > 113 && lon < 155) return true;
    // Greenland
    if (lat > 60 && lat < 85 && lon > -58 && lon < -16) return true;
    // Antarctica
    if (lat < -67) return true;
    // UK + Ireland
    if (lat > 50 && lat < 62 && lon > -10 && lon < 2) return true;
    // Scandinavia
    if (lat > 55 && lat < 72 && lon > 4 && lon < 32) return true;
    return false;
  }

  /* ── Background stars for globe section ── */
  function drawBgStars(p) {
    for (let i = 0; i < 220; i++) {
      const bx = ((Math.sin(i * 1.73 + 0.5) + 1) / 2) * W;
      const by = ((Math.cos(i * 2.37 + 1.2) + 1) / 2) * H;
      const br = 0.3 + ((Math.sin(i * 0.6) + 1) / 2) * 1.1;
      const ba = (0.25 + ((Math.sin(i * 0.78 + time * 0.008) + 1) / 2) * 0.65) * (1 - p * 0.3);
      ctx.globalAlpha = ba;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ── Draw Coimbatore marker ── */
  function drawCBE(x, y, alpha) {
    ctx.save();

    // Pulsing rings
    for (let i = 0; i < 3; i++) {
      const rp = ((time * 0.022 + i * (1/3)) % 1);
      const rr = 8 + rp * 35;
      ctx.globalAlpha = (1 - rp) * alpha * 0.85;
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.stroke();
    }

    // Centre dot
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff6b35';
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    if (alpha > 0.45) {
      const la = (alpha - 0.45) / 0.55;
      ctx.globalAlpha = la;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px "Space Mono", monospace';
      ctx.fillText('COIMBATORE', x + 14, y - 8);
      ctx.fillStyle = 'rgba(255,107,53,0.85)';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText('10.99°N  76.96°E', x + 14, y + 6);
      ctx.fillText('Tamil Nadu, India', x + 14, y + 19);
    }
    ctx.restore();
  }

  /* ── Main draw ── */
  function drawGlobe(p) {
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) * 0.33 * (1 + p * 0.28);

    drawBgStars(p);

    // Atmosphere
    const atmo = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.4);
    atmo.addColorStop(0,   'rgba(30,110,230,0.18)');
    atmo.addColorStop(0.5, 'rgba(0,60,180,0.08)');
    atmo.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = atmo;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2); ctx.fill();

    // Ocean base
    const ocean = ctx.createRadialGradient(cx - r*0.28, cy - r*0.32, r*0.08, cx, cy, r);
    ocean.addColorStop(0,   '#1a55a8');
    ocean.addColorStop(0.4, '#0d3578');
    ocean.addColorStop(0.7, '#082258');
    ocean.addColorStop(1,   '#040e30');
    ctx.fillStyle = ocean;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    // Clip to globe
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

    // Rotation: starts fast, decelerates to align Coimbatore facing viewer
    const baseRot  = time * 0.005;
    const targetRot = -CBE.lon + Math.PI * 0.5;
    const rotation  = p < 0.4
      ? baseRot
      : baseRot + (targetRot - baseRot) * ((p - 0.4) / 0.6) * ((p - 0.4) / 0.6);

    // Land dots
    LAND.forEach(([lat, lon]) => {
      const pt = project(lat, lon, rotation, cx, cy, r);
      if (pt.z < 0) return;

      const depth = (pt.z / r + 1) / 2;
      const dotR  = 1.5 + depth * 1.2;

      // Distinguish land
      const isAntarctica = lat < -67 * Math.PI / 180;
      const baseG = isAntarctica
        ? Math.floor(210 + depth * 45)
        : Math.floor(55 + depth * 70);
      const baseR = isAntarctica ? Math.floor(205 + depth * 50) : Math.floor(35 + depth * 55);
      const baseB = isAntarctica ? Math.floor(220 + depth * 35) : Math.floor(28 + depth * 28);

      ctx.globalAlpha = 0.48 + depth * 0.52;
      ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, dotR, 0, Math.PI * 2); ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.restore();

    // Specular highlight
    const spec = ctx.createRadialGradient(cx - r*0.38, cy - r*0.38, 0, cx, cy, r);
    spec.addColorStop(0,   'rgba(255,255,255,0.13)');
    spec.addColorStop(0.5, 'rgba(255,255,255,0.03)');
    spec.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = spec;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    // Coimbatore marker
    if (p > 0.58) {
      const markerAlpha = Math.min(1, (p - 0.58) / 0.42);
      const cpt = project(CBE.lat, CBE.lon, rotation, cx, cy, r);
      if (cpt.z > 0) drawCBE(cpt.x, cpt.y, markerAlpha);
    }

    // Globe label
    const lbl = document.getElementById('globe-label');
    if (lbl) {
      if (p > 0.25) lbl.classList.add('visible');
      else lbl.classList.remove('visible');
    }
  }

  /* ── Animation loop ── */
  function animate() {
    const p = getProgress();
    const sec = document.getElementById('globe-section');
    if (sec) {
      const rect = sec.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        drawGlobe(p);
      }
    }
    time++;
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  buildLand();
  animate();
})();
