# Cloud render (GitHub Actions) — no paid service

Your render runs on GitHub's 4-core virtual machines, **for free**, on a public repo.
Each push/dispatch spawns one virtual machine per chunk, so a full episode renders in ~5–10 min of wall time instead of hours.

## One-time setup (5 min)

```bash
sudo apt-get install -y gh          # GitHub CLI
gh auth login                        # pick: HTTPS, paste a browser code
gh repo create faceless-shorts --public --source=. --push
```

## Render a video (no terminal needed after this)

1. Open https://github.com/<you>/faceless-shorts/actions
2. Click **Render** → **Run workflow**
3. Fill in:
   - **Project**: folder with an `index.html`, e.g. `mailed`, `_tttest/tt`
   - **Chunks**: parallel pieces — `12` default, more = faster, max ~18
   - **Draft**: leave unchecked for final quality
4. Click **Run workflow**. Watch: green rows = ok, yellow = running.
5. When done (~10 min), the finished MP4 is posted under **Releases** (right sidebar) — download `final.mp4`.
6. The **QC** artifact (top of the run page) has `review/all.jpg` — the same contact sheet you check locally.
   Red X = something failed; open the failing job's log.

## What it does per run

1. **QC job** — installs Chrome + ffmpeg, boots the page, checks every shot draws without exceptions
   (`capture.mjs check`), regenerates `cues.json` → `mix.py` → `mix.wav` (numpy/scipy, no Kokoro in the
   cloud: your voice track `data/narration.wav` is committed already), and builds the contact sheet.
2. **Chunk jobs** — one VM per chunk, each runs exactly
   `node tools/capture.mjs video renders/chunk-XX.mp4 START END`
   using the same `--draft` semantics as locally.
3. **Concat job** — `ffmpeg -f concat` the chunks in order, then attaches `final.mp4` to a
   release so it never expires (workflow artifacts do expire; releases don't).

## Voice / music in the cloud

- `narration.wav` (Kokoro) is **made locally**, where you already run it, and is committed to the repo.
- `mix.wav` is rebuilt by CI on every render via `tools/mix.py` (procedural effects + music bed + narration).
- If narration changes locally → `git add <project>/data/narration.wav && git commit && git push`.

## Repo = public (important)

Free unlimited Actions minutes need a **public** repository. Everything committed here is
first-party code (your own scripts), open fonts (Inter, Caladea — both OFL), and generated
audio — fine to publish. If an episode should stay private, delete its folder before pushing,
or render that one manually.

## Concept mapping (local machine → cloud)

| Local                        | GitHub Actions                                   |
|------------------------------|--------------------------------------------------|
| you run `capture.mjs video`  | matrix of N parallel runners, one per chunk      |
| 1 CPU core / chunk           | 4 cores / runner                                 |
| restart from chunk k         | re-run just the failed chunk job                 |
| MP4 sits in `renders/`       | `final.mp4` attached to a release (never expires)|
| contact sheet by hand        | `QC` artifact on every run                       |

## Cost accounting

- Public repo → unlimited Actions minutes; the run above uses 1 + N + 1 runner-jobs.
- Per episode worst case ≈ 45 min of total runner time → **$0**.
- Annual cap: none. Repo storage: your repo is < 50 MB (wav files are the only big blobs,
  and `mix.wav` is deliberately not committed — CI rebuilds it).
