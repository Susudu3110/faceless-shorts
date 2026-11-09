// MOTION RIG — the body-motion library for inside-out (and usable by every flat style).
// goal: characters never tread air, knees/elbows solve properly, movement has
// anticipation + overshoot + squash. Everything here returns values or draws
// into the shared ctx — no side effects beyond that.
import { ctx, C, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, circle } from './lib.js';

// ─── IK: two-segment limb. Root (x1,y1), tip (x2,y2), lengths l1,l2, bend dir. ───
// Returns [mx, my, tx, ty] — the joint (elbow/knee) and the solved tip. Cosine
// law; when the target is out of reach the limb stays straight-ish (no tearing).
export function joint(x1, y1, x2, y2, l1, l2, dir = 1) {
  let dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1e-4;
  const reach = Math.min(l1 + l2, d);
  d = Math.min(l1 + l2 - 0.5, Math.max(Math.abs(l1 - l2) + 0.5, d));
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const base = Math.atan2(dy, dx);
  const jx = x1 + Math.cos(base + a * dir) * l1;
  const jy = y1 + Math.sin(base + a * dir) * l1;
  const tx = x1 + (dx / Math.hypot(dx, dy)) * reach;
  const ty = y1 + (dy / Math.hypot(dx, dy)) * reach;
  return [jx, jy, tx, ty];
}

/** draw a 2-segment limb (stroke) + optional tip callback at the solved tip */
export function limb(x1, y1, x2, y2, l1, l2, dir, width, color, tip = null) {
  const [mx, my, tx, ty] = joint(x1, y1, x2, y2, l1, l2, dir);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, my); ctx.lineTo(tx, ty); ctx.stroke();
  if (tip) tip(tx, ty);
  return { mx, my, tx, ty };
}

// ─── walk cycle. 4 classic keys (contact · down · passing · up) baked into sin/IK.
// ph = phase in TAU; spd = horizontal chars/s (visual consonance with bg motion);
// returns joint angles + pose facts so caller composes the character.
export function cycle(ph, o = {}) {
  const spd = o.spd ?? 1.2;              // steps per second
  const stride = o.stride ?? 30;         // px of foot travel relative to body
  const lift = o.lift ?? 22;
  const lean = o.lean ?? 0.03;
  const s = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
  // stance foot stays put; swing foot travels forward and lifts
  const f = (sw) => ({
    x: sw * stride * 0.5 + Math.cos(ph) * stride * 0.22,
    y: -Math.abs(sw) * lift * 0.45 - (sw > 0 ? Math.sin(ph * 2) * lift * 0.5 : 0),
  });
  const bob = Math.abs(Math.cos(ph)) * -9;
  return {
    legA: f(s), legB: f(s2),
    armA: -s * 0.5, armB: -s2 * 0.5,
    bob, lean: lean * Math.sign(spd || 1),
    heelX: Math.sin(ph * 2) * 4,
  };
}

/** springy secondary motion: value that follows a target with overshoot */
export function makeSpring(stiff = 0.22, damp = 0.72) {
  let x = 0, v = 0;
  return (target) => { v = damp * v + stiff * (target - x); x += v; return x; };
}

/** squash & stretch wrapper: draws fn with axis squash around (x, y) */
export function squash(x, y, sx, sy, fn) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy); ctx.translate(-x, -y);
  fn(); ctx.restore();
}

/** ease with anticipation: dips -a before rising to 1 */
export function anticipating(t, a = 0.2) {
  const s = clamp(t, 0, 1);
  if (s < 0.28) return -Math.sin((s / 0.28) * Math.PI) * a;
  return eio((s - 0.28) / 0.72);
}

// ─── TRANSITION ZOO (draw at the END of shot A and/or START of shot B).
// each returns nothing; they darken/cover/reveal edges. keep cuts + overlays varied.
export const Tz = {
  /** whip wipe: hard directional smear. dir: -1 left, +1 right, 0 up */
  whip(t, dir = 1) {
    const p = clamp(t, 0, 1);
    const w = W * (1 - p);
    return { cover: (x) => dir * x, rect: [p < 0.5 ? dir * W * p * 2 : W + dir * (W * (p - 0.5) * 2), 0, W, H] };
  },
  /** screen dip to ink (fading through black — never cheap-feeling at 0.12 s) */
  dip(t, a = 1) { return a * (t < 0.5 ? eo(t / 0.5) : 1 - seg(t, 0.5, 1)) * 0.9; },
  /** iris close/open around (cx, cy) */
  iris(t, cx = W / 2, cy = H / 2, a = 1) { return a; },
  /** pop-through: white flash frame */
  flash(t) { return (1 - clamp(t, 0, 1)) * 0.9; },
};

export function whipWipe(t, dir = 1) {
  const p = clamp(t, 0, 1);
  if (p <= 0 || p >= 1) return;
  const width = W * 1.15;
  const x = dir > 0 ? lerp(-1.25 * W, 1.25 * W, p) : lerp(1.25 * W, -1.25 * W, p);
  ctx.fillStyle = C.ink;
  ctx.fillRect(x - width / 2, -300, width, H + 600);
}
export function dipOverlay(a) { if (a <= 0) return; ctx.fillStyle = C.ink; ctx.globalAlpha = a; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.globalAlpha = 1; }
export function flashOverlay(a) { if (a <= 0) return; ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = a; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.globalAlpha = 1; }
export function irisOverlay(t, cx, cy, close, a) { /* implemented in kit via composite — see STYLE-UPGRADES */ }

/** draw whip streaks away from direction of travel (use with the wipe) */
export function whipStreaks(t, dir = 1) {
  if (t > 0.75 || t < 0.05) return;
  ctx.save(); ctx.globalAlpha = 0.35; ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const y = (i * 253 + 80) % H;
    ctx.strokeStyle = i % 2 ? C.white : C.ink;
    ctx.lineWidth = 6 + rnd(i) * 22;
    ctx.beginPath(); ctx.moveTo(dir * -W * (t - i * 0.06) * 3, y); ctx.lineTo(dir * -W * (t - i * 0.06) * 3 + dir * (W * 0.5), y); ctx.stroke();
  }
  ctx.restore(); ctx.globalAlpha = 1;
}
