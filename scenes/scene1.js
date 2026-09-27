/* SAHNE 1 — SAYILAR (0–10 s)  Hangileri rasyonel?
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  /** text with exponents written as ^{…}, centred at x */
  function pw(ctx, str, x, y, size, o = {}) {
    const a = o.alpha ?? 1; if (a <= 0) return;
    const parts = []; let rest = str;
    while (rest.length) { const i = rest.indexOf('^{'); if (i < 0) { parts.push([rest, false]); break; } if (i > 0) parts.push([rest.slice(0, i), false]); const j = rest.indexOf('}', i); parts.push([rest.slice(i + 2, j), true]); rest = rest.slice(j + 1); }
    const W = F().width, ws = parts.map(([s, sup]) => W(ctx, s, sup ? size * 0.6 : size)), tot = ws.reduce((p, q) => p + q, 0);
    let left = x - tot / 2;
    if (o.halo !== false) { ctx.fillStyle = `rgba(${LI.PAPER_RGB},${0.85 * a})`; ctx.fillRect(left - 14, y - size * 0.75, tot + 28, size * 1.35); }
    parts.forEach(([s, sup], i) => { A.text(ctx, s, left, sup ? y - size * 0.38 : y, { size: sup ? size * 0.6 : size, alpha: a, align: 'left', color: o.color }); left += ws[i]; });
  }
  function eqs(ctx, env, t, rows) {
    const E = KD.L(env).EQ;
    rows.forEach(([t0, t1, s, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) pw(ctx, s, E.x, E.y[i], E.s * (hot ? 1.05 : 0.9), { alpha: al, color: hot ? A.amber : undefined }); });
  }
  /** a line typed out from a fixed left edge */
  function typed(ctx, env, i, str, t, t0, t1, speed = 18, hot) {
    const E = KD.L(env).EQ, al = win(t, t0, t1) * END(t); if (al <= 0) return;
    const size = E.s * 0.9, full = F().width(ctx, str, size), n = Math.min(str.length, Math.floor((t - t0) * speed));
    const left = E.x - full / 2, s = str.slice(0, Math.max(1, n));
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${0.85 * al})`; ctx.fillRect(left - 14, E.y[i] - size * 0.62, F().width(ctx, s, size) + 28, size * 1.2);
    A.text(ctx, s, left, E.y[i], { size, alpha: al, align: 'left', color: hot ? A.amber : undefined });
  }
  const CARDS = ['3/8', '2/11', '√2', '0,75', 'π', '√16', '−5', '√3'];
  const RAT = { '3/8': 1, '2/11': 1, '0,75': 1, '√16': 1, '−5': 1 };
  function cards(ctx, env, t, a) {
    if (a <= 0) return; const C = KD.L(env).CARDS, n = CARDS.length, V = env.V;
    CARDS.forEach((c, i) => {
      const k = a * seg(t, 5.0 + i * 0.25, 5.4 + i * 0.25); if (k <= 0) return;
      const per = V ? 4 : n, row = V ? Math.floor(i / 4) : 0, col = V ? i % 4 : i;
      const x = lerp(C.x0, C.x1, per > 1 ? col / (per - 1) : 0.5), y = C.y + row * C.s * 1.8;
      const w = F().width(ctx, c, C.s) + 34;
      ctx.fillStyle = `rgba(${LI.PAPER_RGB},${k})`; ctx.fillRect(x - w / 2, y - C.s * 0.75, w, C.s * 1.5);
      Ink.path(ctx, [[x - w / 2, y - C.s * 0.75], [x + w / 2, y - C.s * 0.75], [x + w / 2, y + C.s * 0.75], [x - w / 2, y + C.s * 0.75], [x - w / 2, y - C.s * 0.75]], { w: 2.5, alpha: k * 0.9, seed: 1200 + i * 5, taper: [0, 0] });
      F().T(ctx, c, x, y, { size: C.s, alpha: k });
    });
  }
  function sorted(ctx, env, t, a) {
    if (a <= 0) return; const C = KD.L(env).COL, cnt = [0, 0];
    const h = a * seg(t, 47.2, 47.6);
    F().T(ctx, 'Rasyonel', C.x[0], C.y0, { size: C.s * 1.1, alpha: h, halo: true, color: A.amber }); F().T(ctx, 'İrrasyonel', C.x[1], C.y0, { size: C.s * 1.1, alpha: h, halo: true });
    CARDS.forEach((c, i) => {
      const side = RAT[c] ? 0 : 1, row = ++cnt[side], k = a * seg(t, 48.2 + i * 0.8, 48.6 + i * 0.8); if (k <= 0) return;
      const note = { '3/8': ' = 0,375', '2/11': ' = 0,1818…', '0,75': ' = 3/4', '√16': ' = 4', '−5': ' = −5/1', '√2': ' = 1,41421…', 'π': ' = 3,14159…', '√3': ' = 1,73205…' }[c];
      F().T(ctx, c + note, C.x[side], C.y0 + row * C.dy, { size: C.s * 0.78, alpha: k, halo: true, color: side ? undefined : A.amber });
    });
  }

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'Bu sayılardan hangileri rasyonel?'],
      [10.6, 27.8, 'Ölçüt: ondalık gösterim'],
      [28.4, 45.8, 'Hesap makinesiyle bakalım'],
      [46.4, 63.8, 'Sayıları ayıralım'],
      [64.4, 79.8, 'İki zor soru'],
    ]);
  }

  function figure(ctx, env, t) {
    const a = END(t);
    cards(ctx, env, t, a * win(t, 4.6, 10.2));
    typed(ctx, env, 0, '3 ÷ 8 = 0,375', t, 11.4, 27.8);
    typed(ctx, env, 1, 'ondalık gösterim bitiyor ✓', t, 13.2, 27.8, 30, true);
    typed(ctx, env, 2, '2 ÷ 11 = 0,181818181818…', t, 15.6, 27.8);
    typed(ctx, env, 3, '18 tekrar ediyor: 0,(18) ✓', t, 18.0, 27.8, 30, true);
    typed(ctx, env, 4, 'Rasyonel: a/b biçiminde yazılabilen sayı', t, 21.4, 27.8, 30);
    typed(ctx, env, 0, '√2 = 1,414213562373095…', t, 29.4, 45.8);
    typed(ctx, env, 1, 'π = 3,141592653589793…', t, 31.6, 45.8);
    typed(ctx, env, 2, 'Ne bitiyor ne tekrar ediyor ✗', t, 34.0, 45.8, 30, true);
    typed(ctx, env, 3, '√16 = 4 · √3 = 1,732050807…', t, 36.4, 45.8);
    typed(ctx, env, 4, 'İrrasyonel: a/b biçiminde yazılamaz', t, 39.4, 45.8, 30, true);
    sorted(ctx, env, t, a * win(t, 46.8, 63.8));
    typed(ctx, env, 0, '0,1010010001000… ?', t, 65.4, 79.8);
    typed(ctx, env, 1, 'Düzenli ama tekrar etmiyor: irrasyonel', t, 67.4, 79.8, 30, true);
    typed(ctx, env, 2, '22/7 = 3,142857142857…', t, 70.4, 79.8);
    typed(ctx, env, 3, '142857 tekrar ediyor: rasyonel (π değil!)', t, 72.6, 79.8, 30, true);
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[5.6, 10.2, 'Kesirler, ondalıklar, kökler ve π'],
      [11.4, 27.8, 'Ondalık gösterimi bölme ile bulalım'],
      [29.4, 45.8, 'Hesap makinesi basamakları gösteriyor'],
      [47.4, 63.8, 'Ölçüte göre iki gruba ayıralım'],
      [65.4, 79.8, 'Her düzen tekrar demek değil']]);
    exprs(ctx, t, at(W, 1), [[8.0, 10.2, 'Nasıl karar vereceğiz?'], [24.0, 27.8, 'Bitiyor ya da tekrar ediyorsa: rasyonel'],
      [42.0, 45.8, 'Ne bitiyor ne tekrar ediyorsa: irrasyonel'],
      [57.0, 63.8, 'Tam kare olmayan sayıların karekökleri irrasyonel'],
      [76.0, 79.8, 'Karar, ondalık gösterimle ölçütü karşılaştırarak']]);
    exprs(ctx, t, at(W, 2), [[9.0, 10.2, 'Ölçüt: ondalık gösterim', true], [26.0, 27.8, 'Ölçüt hazır', true],
      [44.0, 45.8, 'Karşılaştırdık', true], [60.0, 63.8, 'Rasyonel ve irrasyonel: iki grup', true], [78.0, 79.8, 'Yargı: veriyle, ölçütle!', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Ölçüt: ondalık gösterim', 80.6], ['Bitiyor ya da tekrar ediyor: rasyonel', 81.6], ['Ne bitiyor ne tekrar ediyor: irrasyonel', 82.6], ['√2 ve π irrasyonel!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'Numbers', nameTr: 'Sayılar', concept: 'Which are rational?', conceptTr: 'Hangileri rasyonel?', render });
})(window.LI = window.LI || {});
