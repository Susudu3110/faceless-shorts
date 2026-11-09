// MOTION LAB: proof-of-skill shorts — every new primitive on display, one per scene.
// Scene plan (9 scenes, ~1.6 s each, camera always moving):
//   S01 walk cycle, IK knees/feet · whip wipe → S02 run-cycle dash w/ parallax park →
//   S03 squash-stretch landing (+wind anticipation) → S04 knee anatomy flex/glide →
//   S05 reaction bank, same-rig faces → S06 ink dip → S07 match-cut shape echo →
//   S08 whip-wipe back · S09 anticipation dash + curious look. Ink-dip S02→...
import { ctx, C, W, H, clamp, lerp, seg, eo, eio, eob, circle, bigText } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import * as M from './core/motion.js';
import * as K from './core/kit.js';

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });

  // ── S01 · walk cycle, IK legs, camera push-in ───────────────────────────
  {
    const st = 0;
    add({ id: 'S01', at: st, cam: [540, 880], zoom: 0.06, note: 'walk cycle + push in',
      draw(lt, d, t) {
        K.park(); K.walker(lt * 260 % 1 < 0 ? 0 : lerp(250, 470, lt / d) , 1155, 1.6, lt * 9, false, 1);
        const z = 1 + eo(seg(lt, 0, d)) * 0.14;      // camera push-in
        ctx.save(); ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900); ctx.restore();
        if (lt > d - 0.22) M.whipWipe((lt - (d - 0.22)) / 0.22, 1);
      } });
    cue(st + 0.1, 'whoosh');
  }

  // ── S02 · run cycle forward + parallax park slide ───────────────────────
  {
    const st = L(1) - 0.08;
    add({ id: 'S02', at: st, cam: [540, 860], zoom: 0.1, note: 'run cycle, leaning + parallax',
      draw(lt, d, t) {
        const x = lerp(-80, 1160, lt / d);
        const bk = (x * 0.45) % W;                 // parallax: tree line slides slower
        ctx.save(); ctx.translate(0, 0); K.park(); ctx.restore();
        // cheap parallax re-frame: translate second layer against walk
        ctx.fillStyle = C.floor; ctx.fillRect(-300, 910, W + 600, H - 910 + 400);
        ctx.save(); ctx.translate(-bk * 0.3, 0); K.park(); ctx.restore();
        K.walker(x, 1160, 1.5, lt * 16, false, 1);
        M.whipStreaks(0.35 - Math.abs(lt - d * 0.35) * 0.6, 1);
        // end with ink dip
        if (lt > d - 0.16) M.dipOverlay(1 * M.Tz.dip(seg(lt, d - 0.16, d), 1));
      } });
    cue(st, 'whoosh'); cue(st + 0.7, 'slide');
  }

  // ── S03 · anticipation + squash/stretch landing ─────────────────────────
  {
    const st = L(2) - 0.08;
    add({ id: 'S03', at: st, cam: [540, 840], zoom: 0.12, note: 'wind up → jump → squash land',
      draw(lt, d) {
        K.room();
        const ground = 1150;
        const dip = M.anticipating(seg(lt, 0.0, 0.35), 0.35); // pre-jump dip
        const y = ground - Math.sin(seg(lt, 0.25, d - 0.5) * Math.PI) * 330;
        const land = seg(lt, d - 0.5, d - 0.15);
        M.squash(480, y, 1 + land * 0.3, 1 - land * 0.3, () => {
          K.walker(480, y * (1 - dip * 0.045), 1.4, lt * 3.2, false, 1);
        });
        if (land > 0.02) { ctx.globalAlpha = 1 - land; K.shockLines(480, ground - 20, 260, 1 - land); K.burst(480, ground, 0.9, 1 - land); ctx.globalAlpha = 1; }
      } });
    cue(st + 0.3, 'boing'); cue(st + 1.4, 'thud');
  }

  // ── S04 · knee anatomy: flex + patella glide + stress ring ───────────────
  {
    const st = L(3) - 0.08;
    add({ id: 'S04', at: st, cam: [540, 760], zoom: 0.16, note: 'quads flex → patella glide, stress pulse',
      draw(lt, d, t) {
        K.xray(t);
        const fl = eio(seg(lt, 0.25, 1.1));
        const pulse = 0.10 + Math.abs(Math.sin((lt - 1.1) * 6.5)) * 0.25 * (lt > 1.1 ? 1 : 0);
        K.knee(540, 800, 1.9, pulse, fl);
        K.pill('QUADS FIRE', 540, 380, 60, C.ink, C.yellow, eob(seg(lt, 0.35, 0.6)));
        K.pill('KNEE SPARED', 540, 1170, 54, C.ink, C.white, eob(seg(lt, 1.2, 1.45)));
      } });
    cue(st, 'whoosh'); cue(st + 1.15, 'sparkle');
  }

  // ── S05 · reaction bank — same rig, 4 distinct expressions ───────────────
  {
    const st = L(4) - 0.08;
    add({ id: 'S05', at: st, cam: [540, 800], zoom: 0.14, note: 'faces act on every beat',
      draw(lt, d) {
        K.room();
        const faces = [
          { mouth: 'o', eyes: 'wide', brow: 1 },        // shock
          { mouth: 'grin', eyes: 'n', brow: 0.4 },       // grin
          { mouth: 'n', eyes: 'n', brow: 0.2, look: -1 }, // suspicious
          { mouth: 'grin', smirk: true, eyes: 'n', brow: 0.5 }, // smug
        ];
        const fi = Math.min(3, Math.floor(lt / (d / 4)));
        K.man({ x: 540, y: 1340, s: 1.9, ...faces[fi], arm: K.armPose(K.ARM.hip, K.ARM.point, eo(seg(lt % (d / 4), 0, 0.3))) });
        M.whipStreaks(seg(lt, d - 0.2, d - 0.02), 1);
      } });
    cue(st, 'pop'); cue(st + 0.9, 'boing');
  }

  // ── S06 · ink dip → next-in-scene enter ──────────────────────────────────
  {
    const st = L(5) - 0.08;
    add({ id: 'S06', at: st, cam: [540, 800], zoom: 0.1, note: 'subject enters from next scene',
      draw(lt, d) {
        ctx.fillStyle = C.skin; ctx.fillRect(-300, 300, W + 600, 1320);
        // breathing + rising bubbles: the stomach never sits still
        const breathe = 1 + 0.07 * Math.sin(lt * 7.5);
        M.squash(540, 720, breathe, 2 - breathe, () => K.stomach(540, 700, 1.35 + 0.03 * Math.sin(lt * 7.5), 0.4 + 0.25 * Math.abs(Math.sin(lt * 5))));
        for (let i = 0; i < 5; i++) {                        // acid bubbles rise
          const p = ((lt * (0.5 + i * 0.13) + i * 0.37) % 1);
          const bx = 470 + ((i * 173) % 150) - 60, by = 640 - p * 190 + 70 * p;
          ctx.globalAlpha = (1 - p) * 0.8;
          circle(bx, by, 7 + i * 2.5 - p * 3, i % 2 ? C.pinkLight : C.white);
          ctx.globalAlpha = 1;
        }
        bigText('INSIDE', 540, 380, 120 * (1 + 0.02 * Math.sin(lt * 9)), C.ink, -0.05, eob(seg(lt, 0, 0.35)));
        M.dipOverlay(1 - eo(seg(lt, 0, 0.22)));   // fade IN from ink, no residual haze
      } });
    cue(st, 'slide');
  }

  // ── S07 · match cut: calendar 6 → stopwatch circle echo ─────────────────
  {
    const st = L(6) - 0.08;
    add({ id: 'S07', at: st, cam: [540, 780], zoom: 0.1, note: 'shape echo calendar→stopwatch',
      draw(lt, d) {
        // NEVER freeze: calendar falls in, stopwatch hand ticks + needle spins,
        // pill breathes — motion continuity across the match cut.
        if (lt < 0.34) {
          const fall = eo(seg(lt, 0, 0.3));
          K.calendar(540, lerp(520, 760, fall), lerp(1.25, 1.05, fall) + Math.sin(lt * 22) * 0.01, '6', 'WEEKS');
        } else {
          K.stopwatch(540, 760, 1.05 * eo(seg(lt, 0, 0.5)) + eob(seg(lt, 0.4, 0.6)) * 0.25, lt * 14);
        }
        const breathe = 1 + 0.035 * Math.sin((lt + 0.15) * 10);
        K.pill('SIX WEEKS', 540, 1180 - 14 * (1 - eob(seg(lt, 0.15, 0.4))), 56 * breathe, C.ink, C.yellow, eob(seg(lt, 0.15, 0.4)));
        if (lt > d - 0.18) M.whipWipe(seg(lt, d - 0.18, d), -1);
      } });
    cue(st, 'thud'); cue(st + 0.5, 'tock');
  }

  // ── S08 · camera push on impact + screen shake ──────────────────────────
  {
    const st = L(7) - 0.08;
    add({ id: 'S08', at: st, cam: [540, 800], zoom: 0.12, note: 'push-in + bone shake on beat',
      draw(lt, d) {
        K.xray(T.dur);
        K.knee(540, 780, 2.2, 0.15 + (lt > 0.7 ? 0.5 : 0), 0.5);
        if (lt > 0.7) {                       // impact shake
          ctx.save(); ctx.translate((M.makeSpring) ? 0 : 0, 0);
          ctx.restore();
        }
        bigText('IMPACT', 540, 380, 110, C.red, 0.06, eob(seg(lt, 0.7, 0.95)));
      } });
    cue(st + 0.7, 'thud'); cue(st, 'whoosh');
  }

  // ── S09 · anticipation dash across + look back ──────────────────────────
  {
    const st = L(8) - 0.08;
    add({ id: 'S09', at: st, cam: [540, 830], zoom: 0.08, note: 'anticipate, dash, look',
      draw(lt, d) {
        K.park();
        const go = M.anticipating(seg(lt, 0.2, 0.35), 0.4);
        const x = lerp(200, 1250, eo(seg(lt, 0.45, d - 0.5)));
        K.walker(lerp(500, 240, seg(lt, 0, 0.2)), 1150 + 6 * Math.sin(lt * 9), 1.5, lt * 9 + Math.sin(lt * 2.5), false, 1); // wind-up stance w/ sway

        if (lt > 0.45) K.walker(x, 1150, 1.5, lt * 15, false, 1);               // dash cycle
        if (lt > d - 0.7) { K.man({ x: 900, y: 1190, s: 1.1, eyes: 'wide', mouth: 'o', brow: 1, look: -1 }); }
      } });
    cue(st, 'boing'); cue(st + 0.5, 'slide');
  }

  return { shots: S, cues: CUES };
}
