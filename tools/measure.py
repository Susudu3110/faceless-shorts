#!/usr/bin/env python3
"""measure.py — the faceless-shorts quality instrument (v1).

Usage:  py measure.py <video.mp4> [--sheet out_dir]
Reports the playbook measures (see CRAFT-PLAYBOOK.md):
  duration, avg camera motion, still-frame %, longest hold,
  fine detail (edge energy), contrast (luma std), body movement,
  cut candidates, and optional contact sheets of sampled frames.

Implementation: ffmpeg dumps 10 fps downscaled raw grayscale frames into
numpy; all metrics are computed frame-to-frame. Zero downloads, zero deps
beyond ffmpeg + numpy.
"""
import subprocess, sys, os, tempfile, json
import numpy as np

SAMPLE_FPS = 10
SCALE = (114, 202)  # w,h — keeps 9:16, fast

def probe(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,duration,nb_frames",
         "-of", "json", path], capture_output=True, text=True)
    st = json.loads(r.stdout or "{}")["streams"][0]
    return float(st.get("duration") or 0), int(st.get("width") or 0), int(st.get("height") or 0)

def frames(path):
    """Yield numpy grayscale frames at SAMPLE_FPS."""
    out = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path,
         "-vf", f"fps={SAMPLE_FPS},scale={SCALE[0]}:{SCALE[1]}",
         "-pix_fmt", "gray", "-f", "rawvideo", "-"],
        stdout=subprocess.PIPE, bufsize=10**8)
    n = SCALE[0] * SCALE[1]
    while True:
        buf = out.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, np.uint8).astype(np.float32).reshape(SCALE[1], SCALE[0])
    out.stdout.close(); out.wait()

def grad_mag(f):
    gx = np.abs(np.diff(f, axis=1)); gy = np.abs(np.diff(f, axis=0))
    return float(gx.mean() + gy.mean())

def center_band(f):
    return f[int(SCALE[1]*0.28):int(SCALE[1]*0.78), int(SCALE[0]*0.18):int(SCALE[0]*0.82)]

def run(path, sheet_dir=None):
    dur, w, h = probe(path)
    prev, diffs, band_diffs, lasts, details, luma, times = None, [], [], [], [], [], []
    i = 0
    for f in frames(path):
        luma.append(float(f.mean())); details.append(grad_mag(f)); lasts.append(f)
        band_diffs.append(float(np.abs(center_band(f) - center_band(prev)).mean()) if prev is not None else 0.0)
        diffs.append(float(np.abs(f - prev).mean()) if prev is not None else 0.0)
        times.append(i / SAMPLE_FPS)
        prev = f; i += 1
        # contact sheet sampling
        if sheet_dir and i % max(1, int(len(luma) * 0.05)) == 0:
            pass
    n = len(luma)
    if n < 3:
        return {"error": "too few frames", "duration": dur}
    diffs = np.array(diffs[1:]); band = np.array(band_diffs[1:])
    det = np.array(details); lum = np.array(luma)
    still_thr = 0.35          # tuned: mean-diff below this ≈ camera hold
    cut_thr = max(3.5, diffs.mean() + 3 * diffs.std())
    cuts = [times[x + 1] for x in np.where(diffs > cut_thr)[0]]
    # longest hold: run of consecutive near-still frames
    still = diffs < still_thr
    hold = best = 0
    for s in still:
        hold = hold + 1 if s else 0
        best = max(best, hold)
    out = {
        "file": os.path.basename(path), "duration_s": round(dur, 2), "size": f"{w}x{h}",
        "sampled_frames": n,
        "camera_motion_mean": round(float(diffs.mean()), 3),
        "camera_motion_p90": round(float(np.percentile(diffs, 90)), 3),
        "still_frames_pct": round(float(still.mean()) * 100, 1),
        "longest_hold_s": round(best / SAMPLE_FPS, 2),
        "fine_detail": round(float(det.mean()), 2),
        "contrast": round(float(lum.std()), 1),
        "body_movement": round(float(band.mean()), 3),
        "cut_candidates": len(cuts), "cut_times": [round(c, 2) for c in cuts[:20]],
        "cut_interval_mean_s": round(float(np.mean(np.diff(cuts))), 2) if len(cuts) > 2 else None,
    }
    if sheet_dir:
        os.makedirs(sheet_dir, exist_ok=True)
        tmp = tempfile.mkdtemp(dir="/tmp/opencode")
        subprocess.run(["ffmpeg", "-v", "error", "-i", path,
                        "-vf", f"fps=1,scale=180:320,tile=8x{'8' if n > 60 else '4'}:padding=4:color=black,"
                        "-frames:v", "1", "-q:v", "3", os.path.join(sheet_dir, "sheet.jpg")], check=False)
    return out

if __name__ == "__main__":
    names = sys.argv[1:]
    args = [a for a in names if not a.startswith("-")]
    sheet = "--sheet" in names
    print(json.dumps(run(args[0], args[1] if sheet and len(args) > 1 else None), indent=1))
