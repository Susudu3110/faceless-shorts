// ONE HIDDEN CORSET MUSCLE (the plank film): 16 cuts on the narration's clock.
// Construct: role-play hook ("You're a spine") → the corset gets switched off →
// the lazy re-hiring interview = the plank → 9:38 record + BP-drop flip → CTA.
// Motion law: NOTHING ever freezes (breathe/wiggle/float), transitions rotate
// through the zoo, one word-chunk caption per beat (captions.js handles chunks).
import { ctx, C, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, circle, ell, rr, fillAll, bigText } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as M from './core/motion.js';
import * as K from './core/kit.js';

export function buildShots() {
  const S = [], CUES = [];
  const add = (o) => (S.push(o), o);
  const cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.08);

  // ── local actors ─────────────────────────────────────────────────────────
  // spine: a breathing stack of vertebrae; brace = 0..1 shield intensity
  function spine(x, y, s, t, brace = 0, lean = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s, s);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const yy = -i * 34 + 90;
      const curve = Math.sin((i / n) * TAU) * 26;                 // gentle S-curve
      const breathe = 1 + 0.03 * Math.sin(t * 6 + i);
      ctx.save(); ctx.translate(curve, yy); ctx.scale(breathe, 1);
      const hot = brace > 0 && Math.floor(t * 6 + i * 1.7) % 9 === i % 9;
      rr(-30, -15, 60, 26, 10); ctx.fillStyle = hot ? C.yellow : C.navy; ctx.fill();
      rr(-22, -11, 44, 18, 8); ctx.fillStyle = hot ? C.white : C.cyan; ctx.fill();
      ell(0, 15, 30, 7, C.cyanShade ?? C.navy);
      if (brace > 0) {                                            // locking ring
        ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.35 + 0.4 * brace;
        ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
    ctx.restore();
  }
  // corset torso: belt bands (on = braced yellow, off = gray asleep)
  function corset(x, y, s, t, on, wake = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.stomach(0, 0, 1.25, 0.5 + 0.4 * Math.sin(t * 5));
    const bands = on ? 3 : 1;
    for (let i = 0; i < bands; i++) {
      const sq = 1 + 0.05 * Math.sin(t * 7 + i * 2);
      ctx.strokeStyle = on ? C.yellow : C.gray ?? '#9aa0a6';
      ctx.lineWidth = 20 - i * 3; ctx.globalAlpha = on ? 0.95 : 0.4 * wake;
      ctx.beginPath(); ctx.ellipse(0, 30 + i * 44 - 40, 150 * sq, 210 - i * 26, 0, -0.6 * Math.PI, 0.6 * Math.PI); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  // plank man: forearm plank facing LEFT. (x, y) = floor contact line.
  function plankMan(x, y, s, t, shk = 0) {
    const wob = Math.sin(t * 2.6) * (8 + shk * 14);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.globalAlpha = 0.16; ell(0, 52, 330, 30, C.ink); ctx.globalAlpha = 1;   // contact shadow
    const breathe = 1 + 0.03 * Math.sin(t * 6.5);
    ctx.save(); ctx.translate(0, wob * 0.35); ctx.rotate(0.018 * Math.sin(t * 2.2)); ctx.scale(breathe, 1);
    // legs first (behind torso): thigh chain → shin → foot flat on the floor
    // legs: flat along the floor (hip → knee → ankle), toes tucked
    ctx.strokeStyle = C.pants; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(150, -58 + wob * 0.5); ctx.lineTo(272, -26 + wob * 0.3); ctx.lineTo(324, 34); ctx.stroke();
    rr(302, 18, 66, 28, 13); ctx.fillStyle = C.ink; ctx.fill();               // foot
    // torso: horizontal slab, belly line shaded
    rr(-190, -112, 390, 92, 44); ctx.fillStyle = C.shirt; ctx.fill();
    ctx.fillStyle = C.shirtShade; rr(-186, -34, 382, 14, 7); ctx.fill();
    // head at the FRONT (left), looking ahead-down, strained
    const hx = -214, hy = -102;
    circle(hx + 44, hy + 6, 46, C.skinShade); circle(hx + 40, hy + 2, 43, C.skin);
    ctx.fillStyle = C.ink;
    circle(hx + 18, hy + 8, 6.5, C.ink); circle(hx + 36, hy + 12, 6.5, C.ink);
    circle(hx + 20, hy - 2, 2.5, C.white); circle(hx + 38, hy + 2, 2.5, C.white);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx + 10, hy - 26); ctx.lineTo(hx + 34, hy - 30); ctx.stroke();               // brow
    ctx.beginPath(); ctx.moveTo(hx + 14, hy + 30); ctx.quadraticCurveTo(hx + 24, hy + 38, hx + 34, hy + 30); ctx.stroke(); // grimace
    // front forearm: vertical column planted UNDER the shoulder, fist on the floor
    ctx.fillStyle = C.skin;
    rr(-196, -58, 52, 108, 26); ctx.fill();
    circle(-170, 46, 26, C.skin);
    ctx.fillStyle = C.skinShade; rr(-196, -58, 18, 104, 9); ctx.fill();                                       // shade edge
    // rear arm: sliver behind the torso
    ctx.strokeStyle = C.skinShade; ctx.lineWidth = 20;
    ctx.beginPath(); ctx.moveTo(-120, -40); ctx.lineTo(-88, -6); ctx.stroke();
    ctx.restore();
    if (shk > 0) {                                                             // effort: sweat + shock
      for (let i = 0; i < 4; i++) { const a = i * 1.9 + t * 4; circle(120 + Math.sin(a) * 60, -130 - (i % 2) * 20, 5, C.cyan); }
      K.shockLines(0, -140, 250, shk * 0.8);
    }
    ctx.restore();
  }
  // floor with parallax tiles
  function gymFloor(t, cx = 0) {
    fillAll(C.floor ?? '#efe7d6');
    ctx.fillStyle = '#e2d7be';
    const off = (t * 40 + cx * 0.4) % 160;
    for (let gx = -200; gx < W + 200; gx += 160) ctx.fillRect(gx - off, 1240, 80, H - 1240 + 300);
    ctx.fillStyle = '#d9cdb2'; ctx.fillRect(-300, 1180, W + 600, 30);
  }

  // ═════════════════════════════ THE FILM ═════════════════════════════

  // ── 1 · 0.00 · "You're a spine." — POV spine wakes, frame one moves ──────
  {
    const st = cut(0);
    add({ id: 'S01', at: st, cam: [540, 860], zoom: 0.12, note: 'POV spine wakes (KO: motion on frame 1)',
      draw(lt, d, t) {
        K.xray(t);
        spine(540, 900, 1.9, t, 0, eo(seg(lt, 0, 0.5)) * -0.05);
        bigText('YOU', 540, 300, 130, C.white, 0.02, eob(seg(lt, 0, 0.3)));
        M.dipOverlay(1 - eo(seg(lt, 0, 0.25)));
      } });
    cue(st + 0.05, 'heartbeat'); cue(st + 0.25, 'pop', { gain: 0.5 });
  }

  // ── 2 · "And you've carried a one sixty pound human..." ─────────────────
  {
    const st = cut(1);
    add({ id: 'S02', at: st, cam: [540, 820], zoom: 0.1, note: 'spine carries a wobbling human',
      draw(lt, d, t) {
        K.room();
        spine(640, 1120, 1.25, t, 0, 0.04 * Math.sin(t * 4));
        const jig = Math.sin(t * 7) * 12 + Math.sin(t * 11.3) * 4;
        ctx.save(); ctx.translate(640, 690 + jig); ctx.scale(0.85, 0.85);
        circle(0, -210, 50, C.skinShade); circle(-3, -214, 47, C.skin);
        circle(14, -220, 6, C.ink);
        rr(-40, -160, 80, 150, 30); ctx.fillStyle = C.shirt; ctx.fill();
        M.limb(-30, -150, -78 - jig, -26 + Math.sin(t * 9) * 30, 90, 90, 1, 18, C.skin);
        M.limb(30, -150, 88 + jig, -20 - Math.sin(t * 9 + 1) * 34, 90, 90, -1, 18, C.skin);
        ctx.restore();
        K.arrow(300, 640, 130, 0.35, 0.9);                                  // weight arrow
        K.pill('160 LBS', 250, 700 - 16 * Math.sin(t * 5), 54, C.ink, C.yellow, eob(seg(lt, 0.5, 0.8)));
      } });
    cue(st, 'whoosh'); cue(st + 0.6, 'thud', { gain: 0.4 });
  }

  // ── 3 · "never supposed to do it alone" — a stranger appears behind ─────
  {
    const st = cut(2);
    add({ id: 'S03', at: st, cam: [540, 800], zoom: 0.1, note: 'the helper fades in behind',
      draw(lt, d, t) {
        K.room();
        const a = eio(seg(lt, 0.3, 1.1));
        ctx.globalAlpha = a;
        ctx.save(); ctx.translate(180, 1050); ctx.scale(1.05, 1.05);
        corset(0, -300, 0.9, t, 1, a);
        ctx.restore(); ctx.globalAlpha = 1;
        spine(760, 1120, 1.1, t, 0);
        if (lt > 0.9) M.whipStreaks(seg(lt, 0.9, 1.5), -1);
      } });
    cue(st + 0.35, 'sparkle');
  }

  // ── 4 · "YOU SEE — hidden corset muscle" (the click line) ───────────────
  {
    const st = cut(3);
    add({ id: 'S04', at: st, cam: [540, 760], zoom: 0.16, note: 'x-ray torso, corset labels itself',
      draw(lt, d, t) {
        K.xray(t);
        corset(540, 700, 1.75, t, 1);
        K.pill('TRANSVERSE', 540, 320, 62, C.ink, C.yellow, eob(seg(lt, 0.4, 0.7)));
        K.pill('ABDOMINIS', 540, 1250, 54, C.ink, C.white, eob(seg(lt, 1.0, 1.3)));
        K.arrow.call ? 0 : 0;
        K.warning(1020, 1080 + 8 * Math.sin(t * 5), 1.1);
      } });
    cue(st + 0.45, 'pop'); cue(st + 1.05, 'plop', { gain: 0.5 });
  }

  // ── 5 · "squeezes armor-tight, locks every vertebra" (match cut host) ───
  {
    const st = cut(4);
    add({ id: 'S05', at: st, cam: [540, 830], zoom: 0.2, note: 'vertebrae lock in sequence',
      draw(lt, d, t) {
        K.xray(t);
        const locks = seg(lt, 0.3, 2.4);
        spine(540, 900, 1.8, t, 0.4 + 0.6 * locks);
        const bi = Math.floor((t * 4.2) % 9);                 // scan NEVER stops
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 8; ctx.lineCap = 'round';
        const yb = 900 - bi * 58 + 60;
        ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 9));
        ctx.beginPath(); ctx.arc(540 + Math.sin((bi / 9) * TAU) * 40, yb, 58, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 1;
        if (lt > d - 0.35) M.whipWipe(seg(lt, d - 0.35, d), 1);              // whip out
      } });
    cue(st + 0.35, 'slam', { gain: 0.45 }); for (let k = 0; k < 4; k++) cue(st + 0.9 + k * 0.42, 'tock', { gain: 0.55 });
  }

  // ── 6 · "we all sat down — corset switched OFF" (the villain) ───────────
  {
    const st = cut(5);
    add({ id: 'S06', at: st, cam: [540, 840], zoom: 0.1, note: 'office chair; LED dim red; corset sleeps',
      draw(lt, d, t) {
        gymFloor(t);
        // office chair
        ctx.save(); ctx.translate(300, 1230);
        rr(-90, -320, 190, 40, 18); ctx.fillStyle = C.ink; ctx.fill();
        rr(-80, -300, 26, 240, 12); ctx.fillStyle = C.ink; ctx.fill();
        circle(0, 20, 26, '#6b6f76'); circle(0, 20, 12, '#3c4046');
        ctx.restore();
        // seated man, idle screen-lamp sway
        ctx.save(); ctx.translate(310, 1210); ctx.scale(1.15, 1.15);
        const wob = Math.sin(t * 2.4) * 3;
        rr(-46, -250, 92, 190, 34); ctx.fillStyle = C.shirt; ctx.fill();
        circle(0, -300, 52, C.skinShade); circle(-3, -304, 49, C.skin);
        circle(16, -310, 7, C.ink); circle(34, -296, 3, C.white);
        M.limb(-40, -220, -46 + Math.sin(t * 11) * 22, -60 + wob, 96, 96, 1, 16, C.skin); // finger tapping
        M.limb(40, -220, 60, -80, 96, 96, -1, 16, C.skin);
        ctx.restore();
        // the OFF switch, nailed to the corset ghost
        ctx.globalAlpha = 0.92; ctx.translate(0, 0);
        corset(810, 660, 1.0, t, 0);
        ctx.globalAlpha = 1;
        const led = 0.3 + 0.7 * (Math.sin(t * 5.1) > -0.1 ? 1 : 0.15);         // flicker (below sampling Nyquist)
        circle(810, 880 + 26, 12, '#ff4d4d'); ctx.globalAlpha = led; circle(810, 906, 12, '#ff4d4d'); ctx.globalAlpha = 1;
        bigText('OFF', 810, 500, 120, C.red, -0.06, eob(seg(lt, 0.9, 1.2)) * (1 + 0.06 * Math.sin(t * 5.1)));
      } });
    cue(st, 'slam'); cue(st + 1.15, 'pop', { gain: 0.6 }); cue(st + 2.4, 'zip', { gain: 0.5 });
  }

  // ── 7 · "your back carries everything alone" ────────────────────────────
  {
    const st = cut(6);
    add({ id: 'S07', at: st, cam: [540, 820], zoom: 0.12, note: 'spine under a giant block, strain',
      draw(lt, d, t) {
        K.room();
        const str = 0.5 + 0.5 * Math.sin(t * 3);
        spine(540, 980, 1.35, t, 0, 0.05 * Math.sin(t * 2.6) * str);
        const b = 1 + 0.05 * Math.sin(t * 5);
        ctx.save(); ctx.translate(540, 700 + 26 * Math.sin(t * 5)); ctx.scale(b, b);
        rr(-190, -120, 380, 240, 30); ctx.fillStyle = '#8d8fa3'; ctx.fill();
        rr(-150, -80, 120, 140, 16); ctx.fillStyle = '#7b7d90'; ctx.fill();
        rr(30, -80, 120, 90, 16); ctx.fillStyle = '#a3a5b8'; ctx.fill();
        ctx.restore();
        K.shockLines(540, 620, 300, str * 0.7); K.speedLines(120, 560, 0.5 + 0.4 * str);
        K.pill('ALL ALONE', 540, 330, 58, C.ink, C.red, eob(seg(lt, 0.3, 0.6)));
      } });
    cue(st + 0.3, 'thud'); cue(st + 1.6, 'boing', { gain: 0.5 });
  }

  // ── 8 · "ache finds you. you stretch. you crack it." ────────────────────
  {
    const st = cut(7);
    add({ id: 'S08', at: st, cam: [540, 820], zoom: 0.14, note: 'man bends to touch toes; CRACK star',
      draw(lt, d, t) {
        gymFloor(t);
        const bend = eio(seg(lt, 0.2, 1.5));
        ctx.save(); ctx.translate(500, 1180); ctx.scale(1.4, 1.4);
        ctx.rotate(bend * 1.15);                                            // bow
        const bob = 1 + 0.03 * Math.sin(t * 6);
        ctx.scale(bob, 1);
        rr(-36, -250, 72, 190, 30); ctx.fillStyle = C.shirt; ctx.fill();
        circle(0, -306, 50, C.skinShade); circle(-3, -310, 47, C.skin);
        circle(13, -316, 6, C.ink);
        M.limb(-30, -230, -10, -36, 120, 118, 1, 18, C.skin);               // arms reach down
        M.limb(30, -230, 14, -30, 120, 118, -1, 18, C.skin);
        ctx.restore();
        if (lt > 1.7) {                                                     // crack star
          const a = seg(lt, 1.7, 1.85);
          ctx.save(); ctx.globalAlpha = 1 - seg(lt, 2.2, d);
          K.burst(500, 760, 1.1 * a, 1 - seg(lt, 1.9, d));
          bigText('CRACK', 500, 460, 96, C.yellow, -0.08, eob(seg(lt, 1.7, 1.95)));
          ctx.restore();
        }
      } });
    cue(st + 0.25, 'slide', { dur: 1 }); cue(st + 1.75, 'slam'); cue(st + 2.6, 'zip', { gain: 0.5 });
  }

  // ── 9 · "the armor stays asleep" (Zzz bloom, dip in) ────────────────────
  {
    const st = cut(8);
    add({ id: 'S09', at: st, cam: [540, 840], zoom: 0.1, note: 'sleeping corset, Zzz rise, ink dip',
      draw(lt, d, t) {
        ctx.fillStyle = '#26262e'; ctx.fillRect(-300, -300, W + 600, H + 600);
        ctx.save(); ctx.translate(540 + 10 * Math.sin(t * 0.9), 740 + Math.sin(t * 1.3) * 14); corset(0, 0, 1.6, t, 0); ctx.restore();
        for (let i = 0; i < 3; i++) {
          const p = ((lt * 0.9 + i * 0.33) % 1);
          ctx.globalAlpha = (1 - p) * 0.9;
          bigText('Z', 660 + i * 36, 520 - p * 180, 60 + p * 46, '#b9bdc4', i % 2 ? 0.18 : -0.12, 1);
          ctx.globalAlpha = 1;
        }
        M.dipOverlay(seg(lt, d - 0.2, d) * 0.9);                            // dip OUT to next
      } });
    cue(st, 'plop'); cue(st + 0.9, 'sparkle', { gain: 0.4 });
  }

  // ── 10 · "re-hiring interview: hold a push-up, don't move" (THE PLANK) ──
  {
    const st = cut(9);
    add({ id: 'S10', at: st, cam: [540, 880], zoom: 0.12, note: 'anticipation → plank freezes in',
      draw(lt, d, t) {
        gymFloor(t);
        K.walker(lerp(-80, 250, eo(seg(lt, 0, 1.5))), 1150, 1.35, t * 7, false, 1); // walks IN
        if (lt > 1.6) {                                                     // drop to plank
          const drop = eio(seg(lt, 1.6, 2.3));
          const rise = seg(lt, 2.3, 2.6);
          ctx.save(); ctx.translate(640 - drop * 40, 1150 - drop * 210 + rise * 150);
          ctx.scale(1.05, 1.05); ctx.rotate(drop * 1.35 - rise * 1.35);      // pivot to floor
          ctx.translate(-760, -1150);
          plankMan(760, 1170, 1.0, t);
          ctx.restore();
          if (rise > 0.9) bigText('PLANK', 760, 500, 110, C.yellow, 0.03, eob(seg(lt, 2.7, 3)) * (1 + 0.04 * Math.sin(lt * 8)));
        }
        M.dipOverlay(1 - eo(seg(lt, 0, 0.18))) * 0;
      } });
    cue(st + 0.1, 'whoosh'); cue(st + 1.7, 'slide', { dur: 0.8 }); cue(st + 2.35, 'slam', { gain: 0.6 });
  }

  // ── 11 · "stillness is the whole trick" (brace pulse close-up) ──────────
  {
    const st = cut(10);
    add({ id: 'S11', at: st, cam: [540, 780], zoom: 0.16, note: 'plank torso + bracing bands + spine pulse',
      draw(lt, d, t) {
        K.xray(t);
        ctx.save(); ctx.translate(lerp(420, 540, eo(seg(lt, 0, 0.4))), 900); ctx.scale(lerp(1.2, 1.35, eo(seg(lt, 0, 0.4))), lerp(1.2, 1.35, eo(seg(lt, 0, 0.4)))); ctx.translate(-540, -900); // subject enters from the next scene
        plankMan(540, 800, 1.35, t, seg(lt, 1.2, 2.2) * 0.9);
        ctx.restore();
        const pulse = 0.5 + 0.5 * Math.sin(t * 8);
        ctx.strokeStyle = C.yellow; ctx.globalAlpha = 0.5 + 0.45 * pulse; ctx.lineWidth = 10;
        ctx.save(); ctx.translate(540, 690); ctx.scale(1.35, 1.35);
        ctx.beginPath(); ctx.arc(0, 0, 300 * (1 - pulse * 0.05), 0, TAU); ctx.stroke(); ctx.restore();
        ctx.globalAlpha = 1;
        K.pill('24 BONES BRACED', 540, 1130, 52, C.ink, C.yellow, eob(seg(lt, 0.5, 0.8))) ;
      } });
    cue(st, 'heartbeat'); cue(st + 0.55, 'boing', { gain: 0.45 }); cue(st + 1.3, 'inhale', { gain: 0.5 });
  }

  // ── 12 · "world record: 9 hours, 38 minutes" (match cut: hand→hand) ─────
  {
    const st = cut(11);
    add({ id: 'S12', at: st, cam: [540, 840], zoom: 0.2, note: 'giant stopwatch runs at timer speed; record card',
      draw(lt, d, t) {
        K.xray(t);
        const spin = 0.4 + lt * 3.4;
        K.stopwatch(660, 960, 1.6 + 0.05 * Math.sin(t * 7), spin);
        // custom record card (fits '9:38:47' cleanly)
        ctx.save(); ctx.translate(250, 400 + 8 * Math.sin(t * 3)); ctx.rotate(-0.04);
        rr(-190, -150, 380, 300, 26); ctx.fillStyle = C.white; ctx.fill();
        rr(-190, -150, 380, 70, 26); ctx.fillStyle = C.red; ctx.fill();
        ctx.font = '900 58px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink;
        ctx.fillText('9:38:47', 0, 40);
        bigText('RECORD', 0, 108, 42, C.red, 0, 1);
        ctx.restore();
        K.pill('GWR · MAY 2023', 810, 380, 46, C.ink, C.yellow, eob(seg(lt, 1.1, 1.4)));
        if (lt > d - 0.3) M.whipWipe(seg(lt, d - 0.3, d), -1);
      } });
    cue(st, 'whoosh'); cue(st + 0.5, 'sparkle'); for (let k = 0; k < 5; k++) cue(st + 0.8 + k * 0.3, 'tock', { gain: 0.4 });
  }

  // ── 13 · "you only need three sets of thirty seconds" ───────────────────
  {
    const st = cut(12);
    add({ id: 'S13', at: st, cam: [540, 830], zoom: 0.1, note: '3×30 pill trio pops; small plank loops',
      draw(lt, d, t) {
        gymFloor(t);
        for (let i = 0; i < 3; i++) {
          const on = eob(seg(lt, 0.3 + i * 0.42, 0.62 + i * 0.42));
          ctx.save(); ctx.translate(300 + i * 240, 940 + 10 * Math.sin(t * 6 + i)); ctx.scale(0.62, 0.62);
          ctx.globalAlpha = 0.35 + 0.65 * on;
          plankMan(0, 0, 1, t + i * 1.7, 0);
          ctx.restore(); ctx.globalAlpha = 1;
          K.pill('30', 300 + i * 240, 1250, 64 + 6 * on, C.ink, C.yellow, on);
        }
        K.pill('× 3 SETS', 540, 640, 58, C.ink, C.white, eob(seg(lt, 1.6, 1.9)));
      } });
    for (let k = 0; k < 3; k++) cue(st + 0.35 + k * 0.42, 'pop', { gain: 0.55 });
    cue(st + 1.7, 'sparkle');
  }

  // ── 14 · "270 studies → blood pressure DROPS" (two-beat long scene) ─────
  {
    const st = cut(13);
    add({ id: 'S14', at: st, cam: [540, 800], zoom: 0.14, note: 'heart beats slower as the gauge sinks',
      draw(lt, d, t) {
        K.xray(t);
        // gauge: needle sinks as review lands
        const drop = eo(seg(lt, 0.9, 3.4));
        ctx.save(); ctx.translate(540, 760); ctx.scale(1.5, 1.5);
        ell(0, 0, 210, 210, C.navy);
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 26;
        ctx.beginPath(); ctx.arc(0, 0, 170, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
        ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, 170, Math.PI * 0.75, Math.PI * 0.75 + (Math.PI * 1.5) * (1 - 0.4 * drop)); ctx.stroke();
        ctx.save(); ctx.rotate(Math.PI * 0.75 + (Math.PI * 1.5) * (0.82 - 0.42 * drop) + 0.03 * Math.sin(t * 3.5));
        ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.stroke(); ctx.restore();
        circle(0, 0, 26, C.white);
        ctx.restore();
        const hb = Math.max(0.9, 1.6 - drop * 0.9);                          // heart slows
        K.heart(220, 380, 1.15, Math.max(0, Math.sin(t * 12 / hb)) * 0.55);  // continuous pulse
        ctx.save(); ctx.setLineDash([26, 18]); ctx.lineDashOffset = -t * 60; // rotating dashed ring
        ctx.strokeStyle = C.cyan; ctx.globalAlpha = 0.5; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(540, 760, 350, 0, TAU); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.restore();
        K.pill('270 STUDIES', 540, 350, 56, C.ink, C.yellow, eob(seg(lt, 0.4, 0.7)));
        K.pill('BP DROPS', 820, 1140 - 20 * Math.sin(t * 5), 62 * (1 + 0.05 * Math.sin(t * 9)), C.ink, C.white, eob(seg(lt, 1.6, 1.95)));
      } });
    cue(st + 0.4, 'heartbeat'); cue(st + 1.0, 'sparkle'); cue(st + 2.3, 'plop', { gain: 0.6 });
    cue(st + 3.45, 'pop', { gain: 0.5 });
  }

  // ── 15 · "your back isn't weak — it's out of a job" (the flip) ──────────
  {
    const st = cut(14);
    add({ id: 'S15', at: st, cam: [540, 830], zoom: 0.12, note: 'worker-badge flip: OUT OF A JOB → RE-HIRED',
      draw(lt, d, t) {
        K.room();
        // badge with flip
        const flip = seg(lt, 1.0, 1.6);
        const sc = Math.abs(Math.cos(flip * Math.PI));
        ctx.save(); ctx.translate(540 + 6 * Math.sin(t * 6), 760 + 5 * Math.sin(t * 4.3)); ctx.scale(1.45 * Math.max(0.04, sc), 1.45);
        rr(-150, -190, 300, 380, 26); ctx.fillStyle = C.white; ctx.fill();
        rr(-150, -190, 300, 74, 26); ctx.fillStyle = flip < 0.5 ? C.red : C.yellow; ctx.fill();
        circle(0, -80, 44, C.skinShade); circle(-2, -84, 41, C.skin);
        rr(-96, -6, 192, 120, 14); ctx.fillStyle = '#efe7d6'; ctx.fill();
        bigText(flip < 0.5 ? 'FIRED' : 'HIRED', 0, 66, 78, flip < 0.5 ? C.red : C.ink, 0, 1);
        ctx.restore();
        spine(200, 1180, 1.05, t, flip > 0.5 ? 1 : 0, 0.04 * Math.sin(t * 5.2));
        ctx.save(); ctx.translate(880, 1180); ctx.rotate(0.03 * Math.sin(t * 4.7)); corset(0, 0, 0.85, t, flip > 0.5 ? 1 : 0); ctx.restore();
        if (lt > 1.7) { M.whipStreaks(seg(lt, 1.7, 2.2), 1); K.burst(540, 700, 0.7 + 0.3 * Math.sin(t * 7), 0.9); }
      } });
    cue(st, 'whoosh'); cue(st + 1.15, 'zip', { gain: 0.6 }); cue(st + 1.65, 'sparkle', { gain: 0.7 });
  }

  // ── 16 · CTA: "Follow for one move every day." ───────────────────────────
  {
    const st = cut(15);
    add({ id: 'S16', at: st, cam: [540, 820], zoom: 0.1, note: 'brand card: walker dashes, ring, follow',
      draw(lt, d, t) {
        gymFloor(t);
        K.walker(lerp(-100, 560, eo(seg(lt, 0, 0.9))), 1150, 1.45, lt * 11, false, 1);
        ctx.save(); ctx.translate(540, 560 + 8 * Math.sin(t * 6));
        ctx.strokeStyle = C.ink; ctx.lineWidth = 16;
        ctx.beginPath(); ctx.arc(0, 0, 210 * (1 - 0.03 * Math.sin(t * 7)), -0.45 * Math.PI, 1.05 * Math.PI); ctx.stroke();
        ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(0, 0, 168, 0, TAU); ctx.fill();
        circle(0, -60, 46, C.skinShade); circle(-2, -64, 43, C.skin);
        rr(-64, 10, 128, 120, 34); ctx.fillStyle = C.shirt; ctx.fill();
        M.limb(-54, 40, -110, 90, 74, 74, 1, 20, C.skin);                    // thumbs-up-ish arm
        circle(0, -46 - eo(seg(lt, 0.2, 1)) * 6, 7, C.ink);
        ctx.restore();
        const fade = T.dur - st;                                             // outro breath
        bigText('ONE MOVE', 540, 1080, 96, C.ink, 0, eob(seg(lt, 0.3, 0.7)));
        bigText('DAILY', 540, 1190, 96, C.yellow, 0, eob(seg(lt, 0.5, 0.9)));
        if (fade < 0.9) { ctx.fillStyle = '#000'; ctx.globalAlpha = seg(lt, d - 0.55, d) * 1; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.globalAlpha = 1; }
      } });
    cue(st, 'slide', { dur: 0.7 }); cue(st + 0.5, 'pop', { gain: 0.6 }); cue(st + 1.1, 'sparkle', { gain: 0.6 });
  }

  return { shots: S, cues: CUES };
}
