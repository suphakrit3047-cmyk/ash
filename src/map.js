// ===== MAP (canvas, procedural, seeded) =====
const VMAP = (() => {
  const W = 800, H = 520, S = 2;
  let seed = 7319;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const G = 64, grid = new Float32Array(G * G).map(() => rnd());
  const gv = (i, j) => grid[((j % G + G) % G) * G + ((i % G + G) % G)];
  const sm = t => t * t * (3 - 2 * t);
  function vnoise(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = sm(x - i), fy = sm(y - j); const a = gv(i, j), b = gv(i + 1, j), c = gv(i, j + 1), d = gv(i + 1, j + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
  function fbm(x, y) { let v = 0, a = .5, f = 1; for (let o = 0; o < 5; o++) { v += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return v; }

  const C = { aurelis: [400, 230], kragmor: [190, 160], grieve: [600, 205], mulvane: [395, 405], dunes: [165, 375] };
  const SER = [300, 66]; // floating city
  const ORDER = ['sea', 'aurelis', 'undercity', 'kragmor', 'grieve', 'mulvane', 'dunes', 'serenth'];
  const TINT = { aurelis: [86, 74, 48], undercity: [64, 56, 48], kragmor: [56, 60, 70], grieve: [74, 58, 54], mulvane: [52, 62, 46], dunes: [84, 82, 68] };
  const region = new Uint8Array(W * H);

  function land(x, y) {
    const nx = (x - 400) / 360, ny = (y - 280) / 225;
    let v = 1.05 - Math.sqrt(nx * nx + ny * ny) + (fbm(x / 120, y / 120) - .5) * 1.25 + (fbm(x / 35 + 3, y / 35 + 3) - .5) * .35;
    for (const k in C) { const dx = x - C[k][0], dy = y - C[k][1]; v += Math.max(0, .35 - Math.sqrt(dx * dx + dy * dy) / 200); }
    return v > .32;
  }
  function regionAt(x, y) {
    if (!land(x, y)) return 0;
    const ax = x - C.aurelis[0], ay = y - C.aurelis[1], ad = Math.sqrt(ax * ax + ay * ay * 1.3);
    if (ad < 30) return 1;
    if (ad < 52 + (fbm(x / 20, y / 20) - .5) * 14) return 2;
    let best = 0, bd = 1e9;
    ['aurelis', 'kragmor', 'grieve', 'mulvane', 'dunes'].forEach((k, n) => { const dx = x - C[k][0], dy = y - C[k][1]; const d = Math.sqrt(dx * dx + dy * dy) + (k === 'aurelis' ? 70 : 0) + (fbm(x / 45 + n * 11, y / 45 + n * 7) - .5) * 70; if (d < bd) { bd = d; best = ORDER.indexOf(k); } });
    return best;
  }

  let base = null, masks = {};
  function build() {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) region[y * W + x] = regionAt(x, y);
    const lo = document.createElement('canvas'); lo.width = W; lo.height = H;
    const lc = lo.getContext('2d'), img = lc.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, r = region[i], o = i * 4;
      if (!r) {
        const near = (x > 2 && region[i - 3]) || (x < W - 3 && region[i + 3]) || (y > 2 && region[i - 3 * W]) || (y < H - 3 && region[i + 3 * W]);
        const n = fbm(x / 30, y / 30) * 10;
        d[o] = 15 + n; d[o + 1] = 17 + n; d[o + 2] = 24 + n * 1.3; if (near) { d[o] += 10; d[o + 1] += 12; d[o + 2] += 14; }
      } else {
        const t = TINT[ORDER[r]], n = (fbm(x / 18, y / 18) - .5) * 26;
        const edge = (x > 0 && region[i - 1] !== r) || (x < W - 1 && region[i + 1] !== r) || (y > 0 && region[i - W] !== r) || (y < H - 1 && region[i + W] !== r);
        const coast = edge && ((x > 0 && !region[i - 1]) || (x < W - 1 && !region[i + 1]) || (y > 0 && !region[i - W]) || (y < H - 1 && !region[i + W]));
        if (coast) { d[o] = 160; d[o + 1] = 136; d[o + 2] = 96; }
        else if (edge) { d[o] = 26; d[o + 1] = 24; d[o + 2] = 26; }
        else { d[o] = t[0] + n; d[o + 1] = t[1] + n; d[o + 2] = t[2] + n; }
      }
      d[o + 3] = 255;
    }
    lc.putImageData(img, 0, 0);

    // per-realm highlight masks
    ORDER.forEach((k, idx) => {
      if (!idx || k === 'serenth') return;
      const m = document.createElement('canvas'); m.width = W; m.height = H;
      const mc = m.getContext('2d'), mi = mc.createImageData(W, H);
      for (let i = 0; i < W * H; i++) if (region[i] === idx) { mi.data[i * 4] = 192; mi.data[i * 4 + 1] = 154; mi.data[i * 4 + 2] = 92; mi.data[i * 4 + 3] = 255; }
      mc.putImageData(mi, 0, 0); masks[k] = m;
    });

    base = document.createElement('canvas'); base.width = W * S; base.height = H * S;
    const c = base.getContext('2d');
    c.imageSmoothingEnabled = true; c.drawImage(lo, 0, 0, W * S, H * S); c.scale(S, S);
    seed = 99;
    const inR = (x, y, k) => region[(y | 0) * W + (x | 0)] === ORDER.indexOf(k);
    const scatter = (k, n, fn) => { let tries = 0, done = 0; while (done < n && tries++ < n * 40) { const x = rnd() * W, y = rnd() * H; if (inR(x, y, k) && inR(x + 6, y, k) && inR(x - 6, y, k)) { fn(x, y); done++; } } };
    c.lineCap = 'round';
    // sea waves
    c.strokeStyle = 'rgba(140,150,170,.18)'; c.lineWidth = .8;
    for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H; if (!region[(y | 0) * W + (x | 0)]) { c.beginPath(); c.arc(x, y, 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } }
    // kragmor mountains
    c.strokeStyle = 'rgba(205,210,220,.55)'; c.lineWidth = 1.1;
    scatter('kragmor', 46, (x, y) => { const s = 6 + rnd() * 6; c.beginPath(); c.moveTo(x - s, y + s * .6); c.lineTo(x, y - s * .7); c.lineTo(x + s, y + s * .6); c.stroke(); c.beginPath(); c.moveTo(x, y - s * .7); c.lineTo(x + s * .3, y); c.stroke(); });
    // dunes glass arcs
    c.strokeStyle = 'rgba(190,220,215,.45)';
    scatter('dunes', 60, (x, y) => { c.beginPath(); c.arc(x, y + 4, 7, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); });
    c.fillStyle = 'rgba(200,240,235,.6)';
    scatter('dunes', 30, (x, y) => { c.fillRect(x, y, 1.4, 1.4); });
    // mulvane reeds
    c.strokeStyle = 'rgba(150,170,110,.55)';
    scatter('mulvane', 70, (x, y) => { c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.moveTo(x - 1, y); c.lineTo(x - 2, y - 5); c.moveTo(x + 1.5, y); c.lineTo(x + 2.5, y - 4); c.stroke(); });
    // grieve ash + battle marks
    c.fillStyle = 'rgba(30,26,26,.6)';
    scatter('grieve', 120, (x, y) => { c.beginPath(); c.arc(x, y, .9 + rnd(), 0, 7); c.fill(); });
    c.strokeStyle = 'rgba(200,110,95,.7)'; c.lineWidth = 1.3;
    scatter('grieve', 7, (x, y) => { c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 4, y + 4); c.moveTo(x + 4, y - 4); c.lineTo(x - 4, y + 4); c.stroke(); });
    // undercity huts
    c.fillStyle = 'rgba(30,26,24,.75)';
    scatter('undercity', 70, (x, y) => c.fillRect(x, y, 2.4, 2.4));
    // aurelis walls
    const [ax, ay] = C.aurelis;
    c.strokeStyle = 'rgba(230,200,130,.85)';
    [26, 18, 10].forEach((r, i) => { c.lineWidth = 1.6 - i * .3; c.beginPath(); c.ellipse(ax, ay, r, r / 1.14, 0, 0, 7); c.stroke(); });
    c.fillStyle = '#e8c87e'; c.beginPath(); c.arc(ax, ay, 2.6, 0, 7); c.fill();

    // river: ash washed from the mountains down into the fens
    c.strokeStyle = 'rgba(120,140,165,.75)'; c.lineWidth = 1.6; c.beginPath();
    let rx = 228, ry = 196; c.moveTo(rx, ry);
    for (let t = 0; t < 1; t += .02) { const tx = 228 + (372 - 228) * t, ty = 196 + (430 - 196) * t; rx = tx + Math.sin(t * 14) * 14 + (fbm(t * 6, 3) - .5) * 30; ry = ty; c.lineTo(rx, ry); }
    c.stroke();
    c.font = 'italic 10px Pridi, serif'; c.fillStyle = 'rgba(160,180,200,.8)'; c.textAlign = 'center'; c.fillText('แม่น้ำเถ้า', 268, 262);

    // trade routes
    const route = (a, b, label, bend) => {
      const mx = (a[0] + b[0]) / 2 + bend[0], my = (a[1] + b[1]) / 2 + bend[1];
      c.setLineDash([3, 4]); c.strokeStyle = 'rgba(220,200,160,.45)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(mx, my, b[0], b[1]); c.stroke(); c.setLineDash([]);
      const tx = .25 * a[0] + .5 * mx + .25 * b[0], ty = .25 * a[1] + .5 * my + .25 * b[1];
      c.font = '10px Sarabun, sans-serif'; c.fillStyle = 'rgba(225,210,180,.75)'; c.textAlign = 'center'; c.fillText(label, tx, ty - 4);
    };
    const edgeOf = (k, toward) => { const [x, y] = C[k]; const dx = toward[0] - x, dy = toward[1] - y, l = Math.hypot(dx, dy); const r = k === 'aurelis' ? 58 : 22; return [x + dx / l * r, y + dy / l * r]; };
    route(edgeOf('kragmor', C.aurelis), edgeOf('aurelis', C.kragmor), 'แร่เหล็กและทอง', [0, -22]);
    route(edgeOf('aurelis', C.grieve), edgeOf('grieve', C.aurelis), 'อาวุธ', [0, -26]);
    route(edgeOf('dunes', C.aurelis), edgeOf('aurelis', C.dunes), 'แก้วและเกลือ', [-20, 18]);
    route(edgeOf('mulvane', C.aurelis), edgeOf('aurelis', C.mulvane), 'สมุนไพรและคนรับจ้างทดลองยา', [56, 0]);

    // serenth: shadow, clouds, island
    const [sx, sy] = SER;
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(sx + 40, sy + 120, 46, 12, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(210,215,225,.10)';
    for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(sx - 60 + rnd() * 130, sy + 22 + rnd() * 16, 26 + rnd() * 20, 8 + rnd() * 5, 0, 0, 7); c.fill(); }
    c.fillStyle = '#3b3f4c'; c.beginPath(); c.moveTo(sx - 44, sy); c.quadraticCurveTo(sx, sy - 10, sx + 44, sy);
    c.lineTo(sx + 26, sy + 12); c.lineTo(sx + 12, sy + 30); c.lineTo(sx + 2, sy + 16); c.lineTo(sx - 10, sy + 36); c.lineTo(sx - 22, sy + 14); c.closePath(); c.fill();
    c.fillStyle = '#d6dbe6'; [-22, -8, 6, 20].forEach((dx, i) => c.fillRect(sx + dx, sy - 12 - (i % 2) * 6, 3, 12 + (i % 2) * 6));
    c.strokeStyle = 'rgba(214,219,230,.6)'; c.lineWidth = .8; c.beginPath(); c.moveTo(sx - 44, sy); c.quadraticCurveTo(sx, sy - 10, sx + 44, sy); c.stroke();

    // labels
    const label = (t, x, y, size = 13) => { c.font = `${size}px Pridi, Georgia, serif`; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(14,15,20,.85)'; c.strokeText(t, x, y); c.fillStyle = '#eadfca'; c.fillText(t, x, y); };
    label('นครลอยเซเรนธ์', sx, sy - 22);
    label('ออเรลิส', ax, ay - 34, 13);
    label('ใต้กำแพง', ax + 64, ay + 46, 11);
    label('ครากมอร์', C.kragmor[0], C.kragmor[1] - 34);
    label('ที่ราบเถ้ากรีฟ', C.grieve[0] + 20, C.grieve[1] + 4);
    label('หนองพิษมูลเวน', C.mulvane[0], C.mulvane[1] + 30);
    label('ทะเลทรายแก้ว', C.dunes[0], C.dunes[1] + 34);
    c.font = '18px Chonburi, serif'; c.textAlign = 'left'; c.fillStyle = 'rgba(192,154,92,.9)'; c.fillText('เวลมอร์', 24, 40);
    c.font = '10px Sarabun, sans-serif'; c.fillStyle = 'rgba(200,190,170,.6)'; c.fillText('ฉบับปี ห.ถ. 312', 24, 56);
    // compass + scale
    const cx = W - 42, cy = H - 52;
    c.strokeStyle = 'rgba(200,180,140,.7)'; c.fillStyle = 'rgba(200,180,140,.7)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx, cy - 18); c.lineTo(cx + 5, cy); c.lineTo(cx, cy + 18); c.lineTo(cx - 5, cy); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(cx, cy - 18); c.lineTo(cx + 5, cy); c.lineTo(cx - 5, cy); c.closePath(); c.fill();
    c.font = '10px Sarabun, sans-serif'; c.textAlign = 'center'; c.fillText('เหนือ', cx, cy - 22);
    c.beginPath(); c.moveTo(W - 150, H - 18); c.lineTo(W - 70, H - 18); c.moveTo(W - 150, H - 22); c.lineTo(W - 150, H - 14); c.moveTo(W - 70, H - 22); c.lineTo(W - 70, H - 14); c.stroke();
    c.fillText('100 ลีก', W - 110, H - 24);
  }

  function center(id) {
    if (id === 'serenth') return SER.slice();
    if (id === 'undercity') return [C.aurelis[0] + 40, C.aurelis[1] + 26];
    return C[id].slice();
  }
  function hit(x, y) {
    if (Math.abs(x - SER[0]) < 50 && y > SER[1] - 30 && y < SER[1] + 38) return 'serenth';
    const r = region[(Math.max(0, Math.min(H - 1, y | 0))) * W + Math.max(0, Math.min(W - 1, x | 0))];
    return r ? ORDER[r] : null;
  }
  // opts: {hl, marks:[{id, text, color}], path:[id...]}
  function draw(cv, opts = {}) {
    if (!base) return;
    if (cv.width !== W * S) { cv.width = W * S; cv.height = H * S; }
    const c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(base, 0, 0);
    c.scale(S, S);
    if (opts.hl && masks[opts.hl]) { c.globalAlpha = .28; c.drawImage(masks[opts.hl], 0, 0); c.globalAlpha = 1; }
    if (opts.hl === 'serenth') { c.strokeStyle = '#c09a5c'; c.lineWidth = 2; c.beginPath(); c.ellipse(SER[0], SER[1] + 8, 54, 34, 0, 0, 7); c.stroke(); }
    if (opts.path && opts.path.length > 1) {
      c.strokeStyle = '#d9b26a'; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath();
      opts.path.forEach((id, i) => { const [x, y] = center(id); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.setLineDash([]);
    }
    (opts.marks || []).forEach(m => {
      const [x, y] = center(m.id);
      c.fillStyle = m.color || '#c09a5c'; c.strokeStyle = '#121318'; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = m.color || '#c09a5c'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, 11, 0, 7); c.stroke();
      if (m.text) { c.font = '12px Sarabun, sans-serif'; c.textAlign = 'left'; c.lineWidth = 3; c.strokeStyle = 'rgba(14,15,20,.9)'; c.strokeText(m.text, x + 15, y + 4); c.fillStyle = '#f0e4cc'; c.fillText(m.text, x + 15, y + 4); }
    });
  }
  function toMap(cv, ev) { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H]; }
  return { build, draw, hit, toMap, ready: () => !!base };
})();
