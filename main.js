/* ==========================================================================
   PORTFOLIO SCRIPTS
   Shivam Bhilare – AI Engineer
   ========================================================================== */

// 6. Interactive Moments Constellation: real photos from assets/constellation
const PHOTOS = [
  { src: 'assets/constellation/1.JPG', alt: 'Shivam Bhilare - Moment 1' },
  { src: 'assets/constellation/2.jpeg', alt: 'Shivam Bhilare - Moment 2' },
  { src: 'assets/constellation/3.jpeg', alt: 'Shivam Bhilare - Moment 3' },
  { src: 'assets/constellation/4.jpeg', alt: 'Shivam Bhilare - Moment 4' },
  { src: 'assets/constellation/5.jpeg', alt: 'Shivam Bhilare - Moment 5' },
  { src: 'assets/constellation/6.jpeg', alt: 'Shivam Bhilare - Moment 6' },
  { src: 'assets/constellation/7.jpg', alt: 'Shivam Bhilare - Moment 7' },
  { src: 'assets/constellation/8.jpg', alt: 'Shivam Bhilare - Moment 8' }
];

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const R = document.documentElement;
const progressBar = $('scroll-progress');

/* --------------------------------------------------------------------------
   1. Sky Photos & Theme Palette Crossfade
   -------------------------------------------------------------------------- */
const cv = $('stars'), x = cv.getContext('2d');
const sk = [...$('skies').children];

// CSS theme variables per time-of-day: Morning, Midday, Afternoon, Sunset, Night
const V = ['--l1', '--l2', '--rg', '--boy', '--rim'];
const S = [
  ['#4c6a5c', '#2b4036', '#8fb0b8', '#1c2a35', '#ffe9c7'], // Morning (0)
  ['#3f7058', '#234a38', '#9cc3b4', '#16261f', '#ffffff'], // Midday (1)
  ['#5d6a43', '#34401f', '#c3b98a', '#241e14', '#ffd9a0'], // Afternoon (2)
  ['#4a3a3d', '#241a22', '#a8685f', '#150a1c', '#ffb36b'], // Sunset (3)
  ['#0c1428', '#060a14', '#2a3a63', '#04050c', '#b9d4ff']  // Night (4)
];

const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const cl = k => Math.max(0, Math.min(1, k));
const ez = k => k * k * (3 - 2 * k);

let w = 0, h = 0, sa = 0, sm = 0, tp = 0, ss = null;

function size() {
  w = cv.width = innerWidth;
  h = cv.height = innerHeight;
}

/* --------------------------------------------------------------------------
   2. Avatar (Guy) System
   -------------------------------------------------------------------------- */
const GUY_SOURCES = [
  'assets/guy/guy-1.webp',
  'assets/guy/guy-2.webp',
  'assets/guy/guy-3.webp',
  'assets/guy/guy-4.webp',
  'assets/guy/guy-5.webp'
];

const BF = GUY_SOURCES.map((src, idx) => {
  const img = new Image();
  img.src = src;
  img.onerror = () => {
    // Fallback to png if webp not supported
    img.src = `assets/guy/guy-${idx + 1}.png`;
  };
  return img;
});

// Avatar light tint per time of day
const TN = [
  [200, 215, 235, 0.10], // Morning
  [255, 255, 255, 0.00], // Midday
  [255, 190, 110, 0.18], // Afternoon
  [255, 110,  70, 0.30], // Sunset
  [ 14,  24,  70, 0.58]  // Night
];

const bc = $('boy'), bx = bc.getContext('2d');

let lastBoyF = -1, lastBoyI = -1, lastBoyE = -1;

function drawBoy(f, i, e) {
  const isMobile = innerWidth <= 768;
  const r = isMobile ? 1 : Math.min(devicePixelRatio || 1, 1.5);
  const cw = Math.round(bc.clientWidth * r);
  const ch = Math.round(bc.clientHeight * r);
  if (!cw || !ch) return;

  if (bc.width !== cw || bc.height !== ch) {
    bc.width = cw;
    bc.height = ch;
    lastBoyF = -1;
  }

  // Skip redundant heavy re-rendering when scroll hasn't meaningfully changed
  if (Math.abs(f - lastBoyF) < 0.001 && i === lastBoyI && Math.abs(e - lastBoyE) < 0.001) {
    return;
  }
  lastBoyF = f;
  lastBoyI = i;
  lastBoyE = e;

  const A = BF[i], B = BF[i + 1];
  if (!A || !B || !A.complete || !B.complete) return;

  const wg = ez(cl((f - i - 0.35) / 0.3));
  bx.globalCompositeOperation = 'source-over';
  bx.clearRect(0, 0, cw, ch);
  bx.globalAlpha = 1 - wg;
  bx.drawImage(A, 0, 0, cw, ch);
  bx.globalCompositeOperation = 'lighter';
  bx.globalAlpha = wg;
  bx.drawImage(B, 0, 0, cw, ch);

  const a = TN[i], b = TN[i + 1], c = a.map((n, k) => n + (b[k] - n) * e);
  bx.globalCompositeOperation = 'source-atop';
  bx.globalAlpha = 1;
  bx.fillStyle = 'rgba(' + c.slice(0, 3).map(Math.round).join(',') + ',' + c[3] + ')';
  bx.fillRect(0, 0, cw, ch);
}

/* --------------------------------------------------------------------------
   3. Illustrated Terrain (Back Hills & Front Grass Layers)
   -------------------------------------------------------------------------- */
const imgLandBack = new Image(), imgLandFront = new Image();
imgLandBack.src = 'assets/land/land-back.webp';
imgLandBack.onerror = () => { imgLandBack.src = 'assets/land/land-back.png'; };

imgLandFront.src = 'assets/land/land-front.webp';
imgLandFront.onerror = () => { imgLandFront.src = 'assets/land/land-front.png'; };

const landBack = $('land-back'), lbx = landBack.getContext('2d');
const landFront = $('land-front'), lfx = landFront.getContext('2d');

// Terrain atmospheric tint across times of day
const TL_back = [
  [175, 205, 235, 0.20],
  [255, 255, 255, 0.00],
  [255, 175,  90, 0.24],
  [215,  80,  68, 0.38],
  [  8,  14,  38, 0.74]
];

const TL_front = [
  [195, 215, 235, 0.12],
  [255, 255, 255, 0.00],
  [255, 190, 100, 0.18],
  [225,  95,  60, 0.32],
  [ 12,  18,  44, 0.68]
];

let lastF = -1, lastI = -1, lastE = -1;

function drawLand(f, i, e) {
  const isMobile = innerWidth <= 768;
  const r = isMobile ? 1 : Math.min(devicePixelRatio || 1, 1.5);
  const cw = Math.round(landBack.clientWidth * r);
  const ch = Math.round(landBack.clientHeight * r);
  if (!cw || !ch || !imgLandBack.complete || !imgLandFront.complete) return;

  if (landBack.width !== cw || landBack.height !== ch) {
    landBack.width = landFront.width = cw;
    landBack.height = landFront.height = ch;
    lastF = -1;
  }

  // Avoid unnecessary heavy re-renders if position hasn't meaningfully changed
  if (Math.abs(f - lastF) < 0.001) return;
  lastF = f; lastI = i; lastE = e;

  // Terrain hills proportion: hills occupy bottom ~62% of asset height (1536 / 955)
  const dh = Math.round(ch * (1536 / 955));
  const dy = ch - dh;
  const dw = cw;

  // Layer 1: Back hills and trees
  const ba = TL_back[i], bb = TL_back[i + 1], bc = ba.map((n, k) => n + (bb[k] - n) * e);
  lbx.globalCompositeOperation = 'source-over';
  lbx.clearRect(0, 0, cw, ch);
  lbx.drawImage(imgLandBack, 0, dy, dw, dh);
  if (bc[3] > 0.005) {
    lbx.globalCompositeOperation = 'source-atop';
    lbx.fillStyle = 'rgba(' + Math.round(bc[0]) + ',' + Math.round(bc[1]) + ',' + Math.round(bc[2]) + ',' + bc[3] + ')';
    lbx.fillRect(0, 0, cw, ch);
  }

  // Layer 3: Front grass ridge
  const fa = TL_front[i], fb = TL_front[i + 1], fc = fa.map((n, k) => n + (fb[k] - n) * e);
  lfx.globalCompositeOperation = 'source-over';
  lfx.clearRect(0, 0, cw, ch);
  lfx.drawImage(imgLandFront, 0, dy, dw, dh);
  if (fc[3] > 0.005) {
    lfx.globalCompositeOperation = 'source-atop';
    lfx.fillStyle = 'rgba(' + Math.round(fc[0]) + ',' + Math.round(fc[1]) + ',' + Math.round(fc[2]) + ',' + fc[3] + ')';
    lfx.fillRect(0, 0, cw, ch);
  }
}

// Grass sway driven by scroll
function updateGrassSway(dScroll, smProg) {
  if (reduce) {
    landFront.style.transform = 'none';
    return;
  }
  const swayAngle = Math.max(-2.5, Math.min(2.5, Math.sin(smProg * 24) * 0.8 + dScroll * 18));
  const swayX = Math.max(-6, Math.min(6, Math.sin(smProg * 24) * 3 + dScroll * 40));
  landFront.style.transform = 'translate3d(' + swayX.toFixed(1) + 'px,0,0) skewX(' + swayAngle.toFixed(2) + 'deg)';
}

/* --------------------------------------------------------------------------
   4. Natural Flocking Birds Engine & Night Shooting Stars
   -------------------------------------------------------------------------- */
const flocks = [];
let lastFlockSpawn = 0;

function createFlock(startX) {
  const count = 3 + Math.floor(Math.random() * 5); // 3 to 7 birds
  const leaderY = h * (0.10 + Math.random() * 0.26);
  const vx = 0.85 + Math.random() * 0.45;
  const vy = (Math.random() - 0.48) * 0.14;
  const birds = [];

  for (let k = 0; k < count; k++) {
    const ang = (k % 2 === 0 ? 1 : -1) * (0.35 + Math.random() * 0.25);
    const dst = (k + 1) * (20 + Math.random() * 14);
    birds.push({
      ox: -Math.cos(ang) * dst,
      oy: Math.sin(ang) * dst,
      size: 13 + Math.random() * 6,
      flapSpeed: 0.0055 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
      driftSeed: Math.random() * 100,
      flapDuration: 1.2 + Math.random() * 0.6,
      glideDuration: 2.8 + Math.random() * 2.0
    });
  }
  return { x: startX, y: leaderY, vx, vy, birds };
}

function initFlocks() {
  flocks.length = 0;
  if (!reduce) {
    // Start with 1 flock already soaring mid-sky
    flocks.push(createFlock(w * 0.38));
    // And 1 entering from the horizon
    flocks.push(createFlock(-160));
    lastFlockSpawn = performance.now();
  }
}

function updateFlocks(t) {
  // Continuously spawn new flocks so the sky remains alive
  if (flocks.length < 2 && t - lastFlockSpawn > 4000) {
    flocks.push(createFlock(-180));
    lastFlockSpawn = t;
  }
  for (let i = flocks.length - 1; i >= 0; i--) {
    const fl = flocks[i];
    fl.x += fl.vx;
    fl.y += fl.vy;
    if (fl.x > w + 250) {
      flocks.splice(i, 1);
    }
  }
}

function getBirdStyle(f) {
  if (f <= 0.8) {
    const t = f / 0.8;
    return { alpha: 0.85 * (1 - t * t), rgb: [48, 54, 62] }; // Dark gray in morning
  } else if (f < 1.3) {
    return { alpha: 0, rgb: [48, 54, 62] }; // Faded out at midday
  } else if (f <= 2.0) {
    const t = (f - 1.3) / 0.7;
    return { alpha: 0.85 * (t * t * (3 - 2 * t)), rgb: [68, 44, 28] }; // Warm dark brown in afternoon
  } else if (f <= 3.0) {
    const t = f - 2.0;
    const r = Math.round(68 + (52 - 68) * t);
    const g = Math.round(44 + (22 - 44) * t);
    const b = Math.round(28 + (54 - 28) * t);
    return { alpha: 0.85 + 0.05 * t, rgb: [r, g, b] }; // Transition to deep purple at sunset
  } else if (f <= 3.5) {
    const t = (f - 3.0) / 0.5;
    return { alpha: 0.90 * (1 - t * t), rgb: [52, 22, 54] }; // Deep purple twilight fading out
  } else {
    return { alpha: 0, rgb: [52, 22, 54] }; // Gone at night (shooting stars take over)
  }
}

// Realistic curved bird silhouette with articulated wing flap
function drawBirdSilhouette(ctx, bx, by, size, flap, angle) {
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);
  ctx.beginPath();

  const span = size;
  let elbowX, elbowY, tipX, tipY;

  if (flap >= 0) {
    // Downstroke: elbow arches up, tips push down and back
    elbowX = span * 0.44;
    elbowY = -flap * size * 0.22 - size * 0.08;
    tipX = span * 0.96;
    tipY = flap * size * 0.38;
  } else {
    // Upstroke / Gliding dihedral: wings fold slightly, tips sweep up
    elbowX = span * 0.38;
    elbowY = flap * size * 0.36;
    tipX = span * 0.86;
    tipY = flap * size * 0.56;
  }

  // Left wing tip -> elbow -> head
  ctx.moveTo(-tipX, tipY);
  ctx.quadraticCurveTo(-elbowX * 1.1, elbowY - size * 0.05, -size * 0.15, -size * 0.08);
  ctx.lineTo(0, -size * 0.12);
  ctx.lineTo(size * 0.15, -size * 0.08);
  // Head -> right elbow -> right tip
  ctx.quadraticCurveTo(elbowX * 1.1, elbowY - size * 0.05, tipX, tipY);
  // Right tip -> lower elbow -> tail
  ctx.quadraticCurveTo(elbowX, elbowY + size * 0.14, size * 0.12, size * 0.12);
  ctx.lineTo(0, size * 0.32);
  ctx.lineTo(-size * 0.12, size * 0.12);
  // Tail -> lower left elbow -> left tip
  ctx.quadraticCurveTo(-elbowX, elbowY + size * 0.14, -tipX, tipY);

  ctx.fill();
  ctx.restore();
}

let lastSkyFxT = 0;

function renderSkyFx(t, f) {
  // On mobile screens, throttle sky particles to ~30 FPS to leave GPU overhead for scrolling
  if (innerWidth <= 768 && t - lastSkyFxT < 33) return;
  lastSkyFxT = t;

  x.clearRect(0, 0, w, h);
  if (reduce) return;

  // 1. Birds in flight (morning, late afternoon, sunset)
  const bs = getBirdStyle(f);
  if (bs.alpha > 0.01) {
    updateFlocks(t);
    x.save();
    x.fillStyle = 'rgba(' + bs.rgb[0] + ',' + bs.rgb[1] + ',' + bs.rgb[2] + ',' + bs.alpha.toFixed(3) + ')';

    for (let fi = 0; fi < flocks.length; fi++) {
      const fl = flocks[fi];
      for (let bi = 0; bi < fl.birds.length; bi++) {
        const b = fl.birds[bi];
        // Natural wind drift
        const bx = fl.x + b.ox + Math.cos(t * 0.0012 + b.driftSeed) * 4;
        const by = fl.y + b.oy + Math.sin(t * 0.0015 + b.driftSeed) * 5;
        const baseAngle = Math.atan2(fl.vy + Math.cos(t * 0.0015 + b.driftSeed) * 0.02, fl.vx);

        // Realistic burst-and-glide flight dynamics
        const period = b.flapDuration + b.glideDuration;
        const cycle = ((t * 0.001 + b.phase) % period);
        let flap = -0.12; // Natural locked dihedral glide posture
        let bank = 0;

        if (cycle < b.flapDuration) {
          // Flapping burst
          flap = Math.cos(cycle * Math.PI * 5);
        } else {
          // Soaring glide with subtle banking into the air current
          bank = Math.sin(t * 0.002 + b.driftSeed) * 0.06;
        }

        drawBirdSilhouette(x, bx, by, b.size, flap, baseAngle + bank);
      }
    }
    x.restore();
  }

  // 2. Shooting stars at night
  if (sa >= 0.5) {
    if (!ss && Math.random() < 0.007) {
      // Spawn on the right half of the screen (55% to 92% width), and higher up (5% to 35% height)
      const startX = w * (0.55 + Math.random() * 0.37);
      const startY = h * (0.05 + Math.random() * 0.30);
      const angle = 0.50 + Math.random() * 0.20; // Falling angle (~30 to 40 degrees downwards to the right or left)
      const length = 260 + Math.random() * 180;
      const speed = 0.018 + Math.random() * 0.012;
      ss = { 
        x: startX, 
        y: startY, 
        dx: -Math.cos(angle) * length * 0.6, // Slight drift leftwards or rightwards across open sky
        dy: Math.sin(angle) * length * 1.5,  // Increased vertical falling coverage reaching lower down
        tail: 90 + Math.random() * 40,
        speed: speed,
        l: 0 
      };
    }
    if (ss) {
      ss.l += ss.speed;
      const headX = ss.x + ss.dx * ss.l;
      const headY = ss.y + ss.dy * ss.l;
      const tailX = headX - (ss.dx / Math.hypot(ss.dx, ss.dy)) * ss.tail;
      const tailY = headY - (ss.dy / Math.hypot(ss.dx, ss.dy)) * ss.tail;

      const g = x.createLinearGradient(tailX, tailY, headX, headY);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.7, 'rgba(200,225,255,0.6)');
      g.addColorStop(1, 'rgba(255,255,255,0.95)');

      x.save();
      x.globalAlpha = sa * Math.sin(ss.l * Math.PI); // Smooth fade in and fade out
      x.strokeStyle = g;
      x.lineWidth = 1.8;
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(tailX, tailY);
      x.lineTo(headX, headY);
      x.stroke();
      x.restore();

      if (ss.l >= 1) ss = null;
    }
  }
}

/* --------------------------------------------------------------------------
   5. Scroll Animation Loop & Render Pipeline
   -------------------------------------------------------------------------- */
let lastAppliedP = -1;

function paint(p) {
  if (Math.abs(p - lastAppliedP) < 0.0008) return;
  lastAppliedP = p;

  const f = p * 4, i = Math.min(3, Math.floor(f)), e = ez(f - i);

  // Update theme variables
  V.forEach((v, k) => {
    const u = rgb(S[i][k]), b = rgb(S[i + 1][k]);
    R.style.setProperty(v, 'rgb(' + u.map((n, j) => Math.round(n + (b[j] - n) * e)) + ')');
  });

  // Crossfade skies (omit continuous matrix transforms on mobile to save GPU cycles)
  const isMobile = innerWidth <= 768;
  sk.forEach((im, k) => {
    im.style.opacity = k ? ez(cl(f - k + 1)) : 1;
    if (!isMobile && !reduce) {
      im.style.transform = 'translate3d(0,' + (-p * 2.5) + '%,0) scale(' + (1 + p * 0.04) + ')';
    }
  });

  sa = cl((p - 0.78) / 0.18);
  drawBoy(f, i, e);
  drawLand(f, i, e);
}

function loop(t) {
  requestAnimationFrame(loop);
  const m = R.scrollHeight - innerHeight;
  tp = m > 0 ? cl(scrollY / m) : 0;
  const dScroll = tp - sm;
  sm += dScroll * (reduce ? 1 : 0.07);
  if (Math.abs(tp - sm) < 0.0002) sm = tp;

  paint(sm);
  updateGrassSway(dScroll, sm);
  renderSkyFx(t || performance.now(), sm * 4);
  if (progressBar) progressBar.style.transform = 'scaleX(' + tp + ')';
}

function handleResize() {
  size();
  const f = sm * 4, i = Math.min(3, Math.floor(f)), e = ez(f - i);
  drawBoy(f, i, e);
  drawLand(f, i, e);
}

addEventListener('resize', handleResize);
size();
initFlocks();

imgLandBack.onload = () => { const f = sm * 4, i = Math.min(3, Math.floor(f)), e = ez(f - i); drawLand(f, i, e); };
imgLandFront.onload = () => { const f = sm * 4, i = Math.min(3, Math.floor(f)), e = ez(f - i); drawLand(f, i, e); };
requestAnimationFrame(loop);

/* --------------------------------------------------------------------------
   6. Interactive Photo Constellation
   -------------------------------------------------------------------------- */
const field = $('field'), cons = $('cons'), cx = cons.getContext('2d');
const N = PHOTOS.length || 8, stars = [];
let fw = 0, fh = 0, pts = [], edges = [], born = 0, fmx = -999, fmy = -999, vis = true, lw = 0, lh = 0;

for (let i = 0; i < N; i++) {
  const b = document.createElement('button'), d = document.createElement('span');
  b.className = 'star';
  b.type = 'button';
  b.setAttribute('aria-label', 'Photo ' + (i + 1));
  d.className = 'pic';

  const photo = PHOTOS[i];
  if (photo) {
    const src = typeof photo === 'string' ? photo : photo.src;
    const fallback = typeof photo === 'object' ? photo.fallback : null;
    const ar = typeof photo === 'object' ? photo.ar : null;

    if (ar) {
      if (d.style.setProperty) d.style.setProperty('--ar', ar);
      d.style.aspectRatio = ar;
    }

    const m = new Image();
    m.src = src;
    m.alt = (typeof photo === 'object' && photo.alt) ? photo.alt : 'Photograph ' + (i + 1);
    m.decoding = 'async';
    m.onload = () => {
      const ratio = `${m.naturalWidth} / ${m.naturalHeight}`;
      if (d.style.setProperty) d.style.setProperty('--ar', ratio);
      d.style.aspectRatio = ratio;
    };
    if (fallback) {
      m.onerror = () => {
        m.src = fallback;
      };
    }
    d.appendChild(m);
  } else {
    d.textContent = 'Your photo here';
  }

  b.innerHTML = '<i></i>';
  b.appendChild(d);
  b.addEventListener('click', () => {
    const was = b.classList.contains('on');
    stars.forEach(s => s.classList.remove('on'));
    if (!was) b.classList.add('on');
  });
  field.appendChild(b);
  stars.push(b);
}

function gen() {
  fw = field.clientWidth;
  fh = field.clientHeight;
  const pad = 50;
  let d = Math.min(fw, fh) * 0.3, tries = 0;
  pts = [];

  while (pts.length < N) {
    const p = {
      bx: pad + Math.random() * (fw - 2 * pad),
      by: pad + Math.random() * (fh - 2 * pad),
      ph: Math.random() * 6,
      x: 0,
      y: 0,
      k: 0
    };
    if (pts.every(q => Math.hypot(q.bx - p.bx, q.by - p.by) > d)) pts.push(p);
    if (++tries % 200 === 0) d *= 0.9;
  }

  const seen = new Set();
  edges = [];
  pts.forEach((p, i) => {
    pts
      .map((q, j) => [j, Math.hypot(q.bx - p.bx, q.by - p.by)])
      .filter(a => a[0] !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, i % 3 === 0 ? 3 : 2)
      .forEach(a => {
        const k = Math.min(i, a[0]) + '-' + Math.max(i, a[0]);
        if (!seen.has(k)) {
          seen.add(k);
          edges.push([i, a[0]]);
        }
      });
  });

  born = performance.now();
  stars.forEach((s, i) => {
    s.classList.remove('in', 'on');
    setTimeout(() => s.classList.add('in'), 80 + i * 90);
  });
}

function fit() {
  const r = Math.min(devicePixelRatio || 1, 2);
  cons.width = fw * r;
  cons.height = fh * r;
  cx.setTransform(r, 0, 0, r, 0, 0);
}

function initConstellation() {
  const cw = field.clientWidth;
  const ch = field.clientHeight;
  if (cw === lw && ch === lh) return;
  lw = cw;
  lh = ch;
  gen();
  fit();
}

field.addEventListener('pointermove', e => {
  const r = field.getBoundingClientRect();
  fmx = e.clientX - r.left;
  fmy = e.clientY - r.top;
});

field.addEventListener('pointerleave', () => {
  fmx = fmy = -999;
});

// Dismiss open photo on tap/click outside for mobile
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.star') && !e.target.closest('#redraw')) {
    stars.forEach(s => s.classList.remove('on'));
  }
});

new IntersectionObserver(e => {
  vis = e[0].isIntersecting;
}).observe(field);

let lastFrameT = 0;

function frame(t) {
  requestAnimationFrame(frame);
  if (!vis) return;

  // On mobile screens, throttle constellation animation to ~30 FPS
  if (innerWidth <= 768 && t - lastFrameT < 33) return;
  lastFrameT = t;

  cx.clearRect(0, 0, fw, fh);
  const pw = Math.min(220, innerWidth * 0.68);

  pts.forEach((p, i) => {
    let px = p.bx + (reduce ? 0 : Math.sin(t / 2200 + p.ph) * 8);
    let py = p.by + (reduce ? 0 : Math.cos(t / 2600 + p.ph) * 8);
    const dx = fmx - px, dy = fmy - py, k = Math.max(0, 1 - Math.hypot(dx, dy) / 180);
    px += dx * k * 0.18;
    py += dy * k * 0.18;
    p.x = px;
    p.y = py;
    p.k = k;

    const el = stars[i];
    el.style.transform = 'translate(' + px + 'px,' + py + 'px)';
    let sh = Math.max(0, 6 - (px - pw / 2));
    if (px + pw / 2 > fw - 6) sh = fw - 6 - (px + pw / 2);
    el.style.setProperty('--dx', sh + 'px');
    el.classList.toggle('below', py < 180);
  });

  const a = Math.min(1, (t - born) / 900);
  cx.lineWidth = 1;
  for (const e of edges) {
    const A = pts[e[0]], B = pts[e[1]], m = Math.max(A.k, B.k);
    cx.globalAlpha = a * (0.22 + 0.5 * m);
    cx.strokeStyle = m > 0.05 ? '#cfe1ff' : '#8fb0ff';
    cx.beginPath();
    cx.moveTo(A.x, A.y);
    cx.lineTo(B.x, B.y);
    cx.stroke();
  }
}

addEventListener('resize', initConstellation);
$('redraw').addEventListener('click', gen);
initConstellation();
requestAnimationFrame(frame);

/* --------------------------------------------------------------------------
   7. Mobile Navigation Drawer Toggle
   -------------------------------------------------------------------------- */
const navToggle = $('nav-toggle');
const navLinks = $('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('nav') && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

