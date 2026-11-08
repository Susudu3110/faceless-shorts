# One Move Daily — Strategy (data-backed, updated 2026-11-08)

## Channel
One Move Daily (@faxbouworkingout, UClm5nkbebpOkD89Aj54bzyQ) — 1 short/day, one exercise/theme,
evidence-backed, sources in description, "Altered content = yes", no-medical-advice disclaimer.
Upload category 27 (Education), made_for_kids false.

## Bestsellers (what the research showed)
- **CasiCreativo English** (751K subs, 79.4M views, 57 videos ≈ 1.4M/video) — organ/x-ray
  "Your Organs When You ___" — our visual template (Inside Out style).
- **Howz** — 9–12.7M-view "What happens if you do X every day?" animated shorts.
- **TED-Ed** 10,000 steps = 10M — authority framing works.
- Real-person lanes (Browney 12.5M, Utkan 89M singles) — different lane, do NOT chase.

## Rules the data gave us
1. **Length 15–30 s wins; hard cap 35 s** (winners: 12–30 s; ours were 35–52 s).
2. **Title formula: "Your Body When/If You [X]" + twist word** — organ-framing beats
   generic "What if u did pushups everyday".
3. **First frame = the body interior / loaded visual + hook text.** X-ray look is hot.
4. **The trust wedge nobody doing:** sources + honest caveats in every description,
   and a "what the evidence does NOT show" beat mid-video (re-hook).
5. Playlists: **one playlist per exercise** (Push-ups / Walking / Squats / Planks).
6. Loop-back ending; retune so average view duration ≥ ~26–30 s.

## Weekly topic bank (wacky + evidence-backed, fits "One Move")
- walking backwards (shipped as 'retro') — Alghadir 2019 RCT PMC6456984, Gondhalekar 2013 PMC3624710, ACSM +40% kcal, Cleveland Clinic caveat
- squats every day (top search gap among winners)
- cold showers, stairs-only month, 10-min sunlight morning, sleeping 8h, planks daily,
  grip strength (mortality predictor), nostril breathing vs mouth
Pick: title + wacky twist + ≥2 checkable studies + a visual reveal (x-ray/inside-body).

## Daily loop (user = 1 message)
1. User: "build episode: X" (6–7 AM IST).
2. Plan → text approval ("Build it?" gate).
3. scaffold (`new_video.sh <style> <slug>`), script.json (≤95 words), voice.py + words.py.
4. shots.js → `capture.mjs check` → `cues` → `tools/mix.py .` → contact-sheet LOOK → fix.
5. Push → `gh workflow run render.yml -f project=<slug> -f chunks=12` (~30 min).
6. Local concat not needed — workflow concats + attaches release.
7. Thumbnail (1280×720) + description (sources, disclaimer) + tags.
8. Upload via Zapier YouTube: confirm title/visibility with user → publish (test
   scheduled `publish_at` 19:00 IST; fallback immediate), category 27, add to playlist.
9. Evening: pull analytics (youtube_get_report), log to ANALYTICS.md, compare STRATEGY rules.

## Old-video policy
Pushups (pDY-5NLthPU, 1,301 views) + Walking (2o4w1WrWEKE, 1,245) stay live until a
quality remake beats them (>48 h head-to-head). Never delete proven-view videos early.
