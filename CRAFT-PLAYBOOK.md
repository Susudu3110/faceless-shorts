# CRAFT PLAYBOOK — measured rules + upgraded rig (2026-11-08)

Everything here came from three sources: the measurement doctrine in the
"exploding whale" build video, the documented Zack D. Films formula
(github.com/Anil-matcha/zack-d-films-ai-video-generator — 4 pillars), and
grade-level reading of TheOdd1sOut / Kurzgesagt / CasiCreativo / Howz.
Measure with `py tools/measure.py <video.mp4>` (needs ffmpeg + numpy only).

## 1. MEASURE FIRST (numbers decide where to look, eyes decide what's good)
| measure | reads as | hit zone |
|---|---|---|
| still_frames_pct | % of sampled frames where nothing moved | **< 2%** (hits: 98% of frames moving) |
| longest_hold_s | camera/world froze longest | **≤ 0.33 s** |
| camera_motion_mean | frame-diff energy, downscaled luma | reference ~10.5+ |
| body_movement | center-band frame-diff | reference ~12+ |
| cut interval | shots/second rhythm | **2–4 s per cut** (2 shots per beat: wide → close) |
| fine_detail | edge energy per frame | no fixed number; compare against a reference short |
| contrast | luma std | keep in reference band; jumps usually mean broken exposure |
| words_per_second | narration density | hits ≈ 3.7 wps, 35–45 s for series |

Baseline we're beating — "retro" (r7, the episode the user hated):
camera_motion 5.6 · still 9.3% ❌ · longest hold 0.7 s ❌ · cuts every ~4.8 s ❌ ·
two different characters ❌ · captions 2–3-word chunks ❌.
Zack D. formula translated to our flat pipeline:
1. **Curiosity-loop script** — every sentence opens a question the brain wants closed; the twist flips it; the last line loops to the opening shot.
2. **Consistency over style** — ONE character rig for every human (same face parts, proportions, palette in every scene); two drawing systems for "the same person" is the #1 credibility killer we shipped once and won't repeat.
3. **The look you commit to** — pick (flat x-ray / tall-tale 3D) per series, not per episode.
4. **Movement discipline** — camera or world moves in every shot; a cut is never a repeat framing; alternate wide-establish + close-detail on each beat.

## 2. MOTION RIG (src/core/motion.js — new, used by kit.js)
- `joint()` / `limb()` — cosine-law 2-segment IK. Legs and arms are now SOLVED, so feet plant and knees bend like knees (no mirrored-leg or floating-feet bugs).
- `cycle(ph)` — walk cycle with bob, lean, heel flick; passes stride/lift/lean options; run = cycle with bigger stride+lift and lean 0.12.
- `squash(x,y,sx,sy,fn)` — squash & stretch wrapper (landing, jumps, pops).
- `makeSpring()` — follow-with-overshoot for hair, props, medallions, anything hanging.
- `anticipating(t)` — ease that dips back before go (characters wind up).
- `Tz`/overlays — whipWipe, dip, flash, iris, + render-time guidance: every cut should change FRAMING, not just content.

## 3. WHAT WAS FIXED
- walker(): rebuilt on the rig — alternated legs with solved knees, planted boots,
  bent arms; usable for walk, run (props), and backward mode.
- knee(): flat anatomy — femur + tibia anchored in a gliding patella, quad sleeve
  with highlight fibers that GROWS, stress ring; verified against the study claims.
- Old failure modes the rig makes structurally hard: legs sharing one pose,
  foot/leg mismatch, kneecap floating, muscle-blob-covering-bone.

## 4. SCENE + TRANSITION DIET (11+ kinds, never the same twice in a row)
cut · smash cut (energy break) · match cut (shape echoes) · flow cut (motion
continues across) · whip wipe (directional) · iris in/out · ink dip · flash
pop · screen-space camera push-in (impact beats) · parallax re-frame ·
subject enters from the NEXT scene. Pull from the zoo; log which you used.

## 5. GROUND RULES FROM THE STUDY OF 20 HITS
- Voice: AI voice must be clean and human-paced — Reddit consensus: audiences
  flag slop from the VOICE first (no flat TTS drone; 1.0–1.1 speed, punchy reads).
- Open with a strange specific claim; say the thing when it appears on screen.
- Declare synthetic/illustrative content; sources for health claims; "linked to"
  phrasing for observational studies.
- Every joke/reaction lands ON a sound cue; SFX generated, not downloaded.

## 6. THE 3D-CARTOON HIT RECIPE (from the 31M-view channel teardown, 2026-11-09)
Every hit line-by-line is the same five moves:
1. **First line can't be true.** "It's impossible to get fired in Japan, but companies
   found something way worse." The viewer MUST know how. (Ours: the retro walk premise
   used the same trick.)
2. **Escalate one small scene at a time.** No repetition of emotional beats; each scene
   raises one question or one absurdity.
3. **The "You see…" line.** Almost every hit has one line that starts with "You see" —
   the moment the whole premise clicks. Place it ~⅔ through.
4. **The last line flips the first one.** Payoff that makes people rewatch (loop).
5. **Volume math:** 13¢/1K views · 65 s and ~240 words · simple ball-head + bean body +
   stick limbs · caption ONE word at a time · camera never stops. Made-in-30-minutes
   pacing is the moat: one idea → script → storyboard (check each frame) → scenes →
   voice → SFX → export. A per-frame check pass (floats, occlusions, wrong props) runs
   before export — always. Post 1/day, max 2, EVERY story different.

## 7. MUSIC — VARIATION IS THE ANTI-REPETITION WEAPON (tools/music.py)
License-safe tracks made in code; 5 energetic presets: hype · bouncy · dark · glow ·
troll. script.json: {"music": "hype", "seed": 9}. Seed changes chords, bass pattern,
arp figure, drum groove, riser/fill placement + build→drop shape for every episode —
same lane, new arrangement each time (that's what kills the "templated" feel).
- Drop/impact placed at the twist beat; riser in the last bar before it.
- Music ducks −24 dB under voice (mix.py automatic); voice stays 21 lines-style clean.
- Check loudness balance by measure/voice tracks, not "feel".

## 8. CTA BANK (rotate; never the same two videos in a row)
- "Follow for one move every day."  (channel promise — default sign-off)
- "Follow if your knees crack too."  (empathy mirror)
- "Share this with someone who walks wrong."  (tag-a-friend)
- "Save this before your next run."  (save-utility)
- "Subscribe — tomorrow's move is worse."  (curiosity forward-chain)
- "Like this video and your knees will glow." (playful "like for a cookie" style)
- "Comment 'BACKWARD' and I'll make the advanced one." (comment bait → next demand)
Put the CTA LAST 2–4 s over the punchline's aftermath, spoken + captioned; keep it
≤ 8 words. Never block the loop-back beat (the twist must hit before it starts).
## 9. ENGINE TRAPS (learned the hard way — never repeat)
- **ctx.globalAlpha with an invalid value (negative or >1) is silently IGNORED —
  the canvas keeps the previous alpha (often 1).** `alpha = 0.12*sin(...)` turned
  0.4 s of the lab film into a full-frame charcoal cover. RULE: always compute
  overlay alpha as `clamp(a, 0, 1)` (use lib helper once added), never on a raw
  signed expression.
- A still-frame detector is not a "style checker" — it found: ghost old script.json
  captions over new scenes, dips that never fully release, static anatomy between
  emotional beats. Measure → frame-probe the exact holds → fix code, not taste.
- Every overlay/dip must RETURN to zero: leftover haze reads as "broken fade".

