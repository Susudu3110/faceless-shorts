# SKILL-UPGRADE NOTES — motion-lab bench report (2026-11-09)

THE ASK: "check at last how good the skills became — I will tell you to make a video later."
This is that check. A 13.6 s / 9-scene test film was built, rendered, measured, and fixed
until every number passed the doctrine. No upload, nothing posted.

## THE NUMBERS (before → after, same instrument: tools/measure.py)
| measure | hated retro r7 | Tall Tale draft | motion lab NOW | target |
|---|---|---|---|---|
| still_frames_pct | 9.3 ❌ | 3.5 ⚠ | **1.5** ✅ | < 2% |
| longest_hold_s | 0.7 ❌ | 0.3 ✅ | **0.2** ✅ | ≤ 0.33 s |
| camera_motion_mean | 5.6 ❌ | 10.5 ⚠ | **19.3** ✅ | ~10.5+ |
| body_movement | 7.6 ❌ | 12.0 ⚠ | **19.5** ✅ | ~12+ |
| cut_interval_mean_s | ~4.8 ❌ | 2.84 ✅ | **2.1** ✅ | 2–4 s |
| transitions used | 1 kind | ~4 kinds | **8 kinds** ✅ | 11+ zoo |

3.4× camera motion, 2.6× body movement, 6× fewer dead frames vs the video you hated.

## WHAT THE SKILL NOW GUARANTEES (upgraded blocks, all code, all in the repo)
1. **Body-motion rig** (`src/core/motion.js`): 2-segment cosine-law IK (`joint/limb`) —
   knees plant, elbows solve, no floating feet, no mirrored leg bugs; walk `cycle()`
   with bob/lean/heel flick; `squash()` wrapper; `makeSpring()` overshoot;
   `anticipating()` wind-ups; reaction bank (4 faces, one rig).
2. **Anatomy that reads** (`kit.js knee()` v2): femur+tibia anchored into a GLIDING
   patella, quad sleeve that grows with highlight fibers, pulsing stress ring.
3. **Transition zoo** (`motion.js Tz` + overlays): whip wipe (directional band),
   ink dip (fully releasing), flash pop, iris, match-cut shape echo, camera punch-in,
   parallax re-frame, subject-enters-from-next-scene — 8 kinds proven in one film.
4. **The instrument** (`tools/measure.py`): 10-second-sampled ffmpeg+numpy scanner —
   camera motion, still %, longest hold, cut candidates/cadence, fine detail,
   contrast, body movement. Numbers decide where to look; eyes decide what's good.
5. **Music with variation** (`tools/music.py`): 5 viral-style presets (hype/bouncy/
   dark/glow/troll) × per-episode seed → different chords/bass/arp/drums/riser every
   video, so the channel never sounds templated. Wired into mix.py via script.json
   {"music": "hype", "seed": 9}; music ducks 24 dB under voice; drop lands on the twist.
6. **CTA bank** (CRAFT-PLAYBOOK.md §8): 7 rotating sign-offs, ≤ 8 words, placed over the
   punchline aftermath, never blocking the loop-back beat.
7. **The 31M-view hit recipe** (playbook §6): impossible first line → one-scene
   escalation → "You see…" click line ~⅔ through → last line flips the first →
   65 s / ~240 words / one-word captions / camera never stops / per-frame QA pass.

## BUGS THE BENCH CAUGHT (why "measure + probe" is now mandatory before any render)
- Ghost captions: stale script.json over new scenes → rewritten per project.
- Inverted dip math → permanent screen haze ("broken fade" feel).
- **ctx.globalAlpha negative → silently ignored by canvas → kept alpha 1 → full-frame
  charcoal cover for 0.4 s.** Found only via frame probes at the exact hold timestamps.
- Static anatomy between beats (match-cut freeze) → calendar falls in, stopwatch hand
  ticks, pills breathe: constant-motion discipline is now a checklist item, not luck.

## RENDER PROOF
motionlab/renders/lab.mp4 — 13.6 s, 408 frames, seeded hype track + 16 SFX cues,
rendered locally in ~48 s. Contact sheet: every scene reads (planted boots, solved
knees, consistent characters, x-ray anatomy, one-word captions).

## NEXT (when you say "make a video")
plan (impossible line + twist + CTA) → shots on THIS rig → per-frame check →
cloud render (12-chunk GitHub Actions, ~4 min) → measure → eye check → THEN,
and only then, ask you live about uploading with title/desc/tags packet.

## POST-PUBLISH LOOP (added 2026-11-09, from the 7-day + ZIO transcripts)
Day 1–2 gates: swipe-through ≥ 80% · retention ≥ 90%. Pass → double down (same
lane, same recipe boxes, next topic). Fail → written flop diagnosis (topic-mood /
intro-stakes / no-payoff), which becomes the next video's fix — never deleted, the
data feeds the recipe list. After ~10 videos: re-watch our top performers, extend
the VIRAL RECIPE LIST in CRAFT-PLAYBOOK §12, rotate one improvement axis per batch
(transitions → captions → color → SFX → voice). If views decay with the same
technique, the FORMULA is stale → re-scan niche winners, revise list, repeat.
