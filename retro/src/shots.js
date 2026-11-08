// YOUR BODY IF YOU WALK BACKWARDS EVERY DAY: the shot list.
// A shot: { id, at, cam: [cx, cy], zoom, note, draw(lt, d, t) } · lt = time in shot, t = film time.
// Cut = L(i) - 0.08. Cues: types listed in styles/inside-out/STYLE.md §6.
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, rnd, circle, bigText } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.08);

  // ── 1 · HOOK: he walks forward, minding nothing ─────────────────────────
  {
    const st = cut(0);
    add({ id: 'S01', at: st, cam: [540, 830], zoom: 0.1, note: 'park, he strolls forward normally',
      draw(lt) {
        K.park();
        K.walker(500, 1150, 1.5, lt * 8, false, 1);
        bigText('?', 870, 560, 110, C.yellow, 0.25, eob(seg(lt, 0.8, 1.1)));
      } });
    cue(st + 0.9, 'pop', { gain: 0.5 });
  }

  // ── 2 · the flip: he turns around and walks backwards ───────────────────
  {
    const st = cut(1), back = Wd('back', 1) - st;
    add({ id: 'S02', at: st, cam: [540, 830], zoom: 0.16, note: 'the flip: walker in reverse, head checks over shoulder',
      draw(lt, d) {
        K.park();
        const flip = lt < back;
        ctx.save(); if (flip) { ctx.translate(500, 0); ctx.scale(-1, 1); ctx.translate(-500, 0); }
        const x = lerp(660, 430, eio(seg(lt, back, Math.min(back + 1.2, d - 0.1))));
        K.walker(x, 1150, 1.5, lt * 8, lt > back, 1);
        ctx.restore();
        if (lt > back) K.speedLines(x - 120, 950, 0.5);
      } });
    cue(st, 'whoosh'); cue(st + back, 'boing', { gain: 0.6 }); cue(st + back + 0.15, 'slide', { dur: 0.8, gain: 0.5 });
  }

  // ── 3 · the study: 6-week calendar drops ────────────────────────────────
  {
    const st = cut(2);
    add({ id: 'S03', at: st, cam: [540, 780], zoom: 0.1, note: 'STUDY calendar drops; pill on "walk"',
      draw(lt) {
        ctx.fillStyle = C.bg; ctx.fillRect(-300, -300, W + 600, H + 600);
        K.calendar(540, lerp(-420, 740, eob(seg(lt, 0, 0.5))), 1.05, '6', 'WEEKS');
        K.pill('KNEE PAIN TRIAL', 540, 1140, 54, C.ink, C.white, eob(seg(lt, 0.6, 0.9)));
      } });
    cue(st, 'whoosh'); cue(st + 0.5, 'thud'); cue(st + 0.7, 'pop', { gain: 0.5 });
  }

  // ── 4 · x-ray knee: pain down, thighs up ────────────────────────────────
  {
    const st = cut(3), down = Wd('dropped', 3) - st, strong = Wd('stronger', 3) - st;
    add({ id: 'S04', at: st, cam: [540, 780], zoom: 0.14, note: 'x-ray knee: red stress fades on "down", quads grow on "stronger"',
      draw(lt, d, t) {
        K.xray(t);
        const stress = 0.95 * (1 - eo(seg(lt, down, down + 0.7)));
        const quads = eio(seg(lt, strong, strong + 1.0)) * 0.9;
        K.knee(540, 760, 1.5, Math.max(stress, 0.06), quads);
        K.pill('PAIN', 240, 1080, 54, C.red, C.white, eob(seg(lt, 0.2, 0.5)) * (lt > down ? 0.75 : 1));
        K.arrow(240, 1165, 84, Math.PI / 2, 0.9);
        K.pill('QUADS', 840, 1080, 54, C.ink, C.yellow, eob(seg(lt, strong, strong + 0.3)));
        K.arrow(840, 1165, 84 * quads + 20, -Math.PI / 2, Math.max(0.25, quads));
      } });
    cue(st, 'whoosh'); cue(st + down, 'sparkle', { dur: 0.9, gain: 0.55 }); cue(st + strong, 'pop', { gain: 0.6 });
  }

  // ── 5 · why: knee spared, quads loaded ──────────────────────────────────
  {
    const st = cut(4), load = Wd('quads', 4) - st, spared = Wd('kneecap', 4) - st;
    add({ id: 'S05', at: st, cam: [540, 740], zoom: 0.2, note: 'knee close-up: arrows of force shift behind the kneecap',
      draw(lt, d, t) {
        K.xray(t);
        const cyc = Math.sin(lt * 6) * 0.5 + 0.5;
        K.knee(540, 760, 2.1, 0.10 + cyc * 0.06, 0.45 + lim2(sec6(lt, load) * 0.25));
        K.tag('LOAD ON QUADS', 420, 300, 555, 470, 46, eob(seg(lt, load, load + 0.3)));
        K.pill('KNEE SPARED', 540, 1140, 56, C.ink, C.yellow, eob(seg(lt, spared, spared + 0.25)));
      } });
    cue(st, 'whoosh'); cue(st + load, 'boing', { gain: 0.5 }); cue(st + spared, 'pop', { gain: 0.6 });
  }

  // ── 6 · calories: stopwatch + 40% ───────────────────────────────────────
  {
    const st = cut(5), bakery = Wd('forty', 5) - st, blast = Wd('Calories', 5) - st;
    add({ id: 'S06', at: st, cam: [540, 760], zoom: 0.1, note: 'stopwatch spins, 40% MORE CALORIES bursts on the word',
      draw(lt) {
        ctx.fillStyle = C.bg; ctx.fillRect(-300, -300, W + 600, H + 600);
        K.stopwatch(540, 720, 1.5, lt * 10);
        if (lt > blast) {
          const p = eob(seg(lt, blast, blast + 0.3));
          K.pill('40% MORE CALORIES', 540, 480, 74, C.yellow, C.ink, p);
          K.burst(540, 720, 1.4, Math.max(0, 1 - (lt - blast) * 1.4));
        }
        K.walker(180, 1130, 0.8, lt * 8, true, -1);
      } });
    cue(st, 'whoosh'); cue(st + bakery, 'tock'); cue(st + blast, 'pop', { gain: 0.7 });
  }

  // ── 7 · the brain plans every step ──────────────────────────────────────
  {
    const st = cut(6), plan = Wd('plans', 6) - st;
    add({ id: 'S07', at: st, cam: [540, 760], zoom: 0.12, note: 'head cross-section, brain pings itinerary dots',
      draw(lt) {
        ctx.fillStyle = C.bg; ctx.fillRect(-300, -300, W + 600, H + 600);
        const pulse = lt > plan ? Math.abs(Math.sin((lt - plan) * 11)) : 0;
        circle(540, 790, 300, C.skin); circle(540 - 30, 786, 292, C.skinShade); circle(540 + 6, 800, 286, C.skin);
        K.brain(540, 790, 2.0, pulse);
        // itinerary dots light up left to right as steps are planned
        for (let i = 0; i < 4; i++) {
          const on = seg(lt, plan * 0.4 + i * 0.28, plan * 0.4 + i * 0.28 + 0.25);
          if (on <= 0) continue;
          circle(300 + i * 160, 1180, 26 * on, C.yellow);
          K.arrow(300 + i * 160 + 30, 1180, 120, 0, 0.5 * on);
        }
      } });
    cue(st, 'whoosh'); cue(st + Math.max(0.2, plan), 'sparkle', { dur: 0.8, gain: 0.5 });
  }

  // ── 8 · balance up, focus up ────────────────────────────────────────────
  {
    const st = cut(7), bal = Wd('balance', 7) - st, focus = Wd('focus', 7) - st;
    add({ id: 'S08', at: st, cam: [540, 830], zoom: 0.1, note: 'wobble then steady; two pills pop on words',
      draw(lt, d) {
        K.park();
        const x = lerp(660, 420, eio(seg(lt, 0.1, d - 0.2)));
        K.walker(x, 1150, 1.45, lt * 7, true, 1);
        K.pill('BALANCE UP', 320, 480, 56, C.ink, C.white, eob(seg(lt, bal, bal + 0.25)));
        K.pill('FOCUS UP', 810, 480, 56, C.ink, C.yellow, eob(seg(lt, focus, focus + 0.25)));
      } });
    cue(st, 'whoosh'); cue(st + bal, 'pop', { gain: 0.55 }); cue(st + focus, 'pop', { gain: 0.55 });
  }

  // ── 9 · the twist: trip on nothing ──────────────────────────────────────
  {
    const st = cut(8), tw = Wd('twist', 8) - st, trip = Wd('trip', 8) - st;
    add({ id: 'S09', at: st, cam: [540, 830], zoom: 0.18, note: 'the twist stamp, then he tips over on "trip"',
      draw(lt) {
        K.room();
        const fall = seg(lt, trip, trip + 0.55);
        ctx.save(); ctx.translate(540, 1150); ctx.rotate(-fall * 0.55); ctx.translate(-540, -1150);
        K.walker(540, 1140, 1.35, lt * 3, true, 1);
        ctx.restore();
        if (fall > 0) { K.burst(560, 1170, 1.1, 1 - fall); K.shockLines(540, 860, 320, 1 - fall); }
        if (lt > tw) bigText('THE TWIST', 540, 440, 110, C.red, -0.08, eob(seg(lt, tw, tw + 0.3)));
      } });
    cue(st, 'whoosh'); cue(st + tw, 'slam', { gain: 0.5 }); cue(st + trip, 'thud'); cue(st + trip, 'alarm', { dur: 0.7, gain: 0.45 });
  }

  // ── 10 · the rules: flat floor, 20 minutes, eyes up no phone ────────────
  {
    const st = cut(9), f = Wd('flat', 9) - st, m = Wd('minutes', 9) - st, ph = Wd('phone', 9) - st;
    add({ id: 'S10', at: st, cam: [540, 800], zoom: 0.06, note: 'three rule pills pop in slow sequence',
      draw(lt) {
        ctx.fillStyle = C.bg; ctx.fillRect(-300, -300, W + 600, H + 600);
        K.pill('FLAT FLOOR ONLY', 540, 620, 62, C.ink, C.white, eob(seg(lt, f, f + 0.3)));
        K.pill('20 MINUTES A DAY', 540, 830, 62, C.ink, C.white, eob(seg(lt, m, m + 0.3)));
        K.pill('EYES UP, NO PHONE', 540, 1040, 62, C.red, C.white, eob(seg(lt, ph, ph + 0.3)));
        if (lt > ph) K.redX(540, 1040, 0.28, eob(seg(lt, ph + 0.25, ph + 0.45)));
      } });
    cue(st, 'whoosh'); cue(st + f, 'pop', { gain: 0.5 }); cue(st + m, 'pop', { gain: 0.5 }); cue(st + ph, 'slam', { gain: 0.45 });
  }

  // ── 11 · the park stares ────────────────────────────────────────────────
  {
    const st = cut(10), stare = Wd('stares', 10) - st;
    add({ id: 'S11', at: st, cam: [540, 830], zoom: 0.1, note: 'bystanders freeze, eyes wide; hero walks backwards past them',
      draw(lt) {
        K.park();
        const x = lerp(760, 300, eio(seg(lt, 0.15, 2.0)));
        K.man({ x: 180, y: 1190, s: 1.15, eyes: lt > stare ? 'wide' : 'n', brow: lt > stare ? 1 : 0.2, mouth: 'o' });
        K.man({ x: 900, y: 1190, s: 1.15, eyes: lt > stare ? 'wide' : 'n', brow: lt > stare ? 1 : 0.2, mouth: 'o', look: -1 });
        K.walker(x, 1150, 1.3, lt * 7, true, 1);
        if (lt > stare) { K.shockLines(900, 900, 200, 0.8); K.shockLines(180, 900, 200, 0.8); }
      } });
    cue(st, 'whoosh'); cue(st + stare, 'boing', { gain: 0.55 });
  }

  // ── 12 · smile back — getting ahead ─────────────────────────────────────
  {
    const st = cut(11), grin = Wd('smile', 11) - st, ahead = Wd('ahead', 11) - st;
    add({ id: 'S12', at: st, cam: [540, 800], zoom: 0.2, note: 'close-up grin, yellow up-arrow on "ahead"',
      draw(lt) {
        K.room();
        const p = eio(seg(lt, 0, 0.5));
        K.man({ x: 540, y: 1330, s: 2.1, mouth: lt > grin ? 'grin' : 'smirk', smirk: true, brow: 0.45, eyes: 'n', arm: K.armPose(K.ARM.hip, K.ARM.point, p) });
        const a = eob(seg(lt, ahead, ahead + 0.35));
        if (a) { K.arrow(540, 560, 200, -Math.PI / 2, a); bigText('AHEAD', 540, 420, 120, C.yellow, 0.12, a); }
      } });
    cue(st, 'whoosh'); cue(st + ahead, 'pop', { gain: 0.7 });
  }

  // helpers used here
  function lim2(v) { return Math.max(0, Math.min(1, clamp(v))); }
  function sec6(t, a) { return t > a ? 1 : 0; }

  return { shots: S, cues: CUES };
}
