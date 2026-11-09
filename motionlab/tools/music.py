#!/usr/bin/env python3
"""music.py — the viral music generator. No files, no samples: everything synthesized.

Why: a channel with one static bed sounds templated (audience hears the repetition
before they see it). This engine makes every episode's track DIFFERENT from a seed:
chords, bass pattern, arp figure, drum groove, risers/fills and the build-drop shape
all vary, while staying in a recognizable "shorts energy" lane.

Presets (script.json "music"):
  hype    — driving four-on-the-floor + arp, drop at the story twist
  bouncy  — playful plucks + rim claps (bean-cartoon comedy)
  dark    — tense minor drone + heartbeat kick (those-were-banned explainers)
  glow    — dreamy pads + soft hats (calm informative)
  troll   — quirky waltz-ish mischievous motif (twist endings)

Usage:
  python music.py <preset> <duration_s> <out.wav> [--seed 7] [--stems]
  or import: from music import render; render('hype', 65.0, wav, seed=seed)
Returns (and writes) 44.1 kHz mono float WAV.
"""
import sys, wave, math, json
import numpy as np

SR = 44100

def _tt(dur): return np.arange(int(dur * SR)) / SR

def _env(n, a, d, shape=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape * d)
    return e

def _lp(x, hz):
    # one-pole lowpass per-sample (cheap, stable at any rate)
    a = 1 - math.exp(-2 * math.pi * hz / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y

def _pluck(f, dur, shape=9):
    t = _tt(dur)
    x = (np.sin(2*np.pi*f*t) + 0.4*np.sin(2*np.pi*2.01*f*t) + 0.2*np.sin(2*np.pi*3*f*t))
    hi = np.sin(2*np.pi*4*f*t) * np.exp(-t*40)
    return (x + 0.3*hi) * _env(len(t), 0.004, shape)

def _kick(dur=0.22):
    t = _tt(dur); f = 105*np.exp(-t*36) + 44
    return np.sin(2*np.pi*np.cumsum(f)/SR) * _env(len(t), 0.002, 26) * 1.1

def _hat(dur=0.06, open_=False):
    n = int(dur*SR); t = np.arange(n)/SR
    rng = np.random.default_rng(int(t[0]*1e6))
    ns = rng.standard_normal(n) * np.exp(-t*(30 if not open_ else 9))
    return ns - _lp(ns, 9000)

def _clap(dur=0.18):
    n = int(dur*SR); t = np.arange(n)/SR
    rng = np.random.default_rng(1717)
    ns = rng.standard_normal(n)
    hands = sum(np.exp(-((t-o)/0.012)**2) * 0.5 for o in [0.0, 0.011, 0.023, 0.034])
    return _lp(ns*hands, 5200) * np.exp(-t*16)

def _riser(dur):
    t = _tt(dur)
    f = 220 * 2**(t*2.2)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * (t/dur)**2
    n = np.sqrt(np.abs(x)) * 0.2
    return 0.5*x + 0.25*n

def _sub(x):
    """parallel octave-down shimmer for weight"""
    return x + 0.3*np.roll(x, int(SR*0.012))

# ── seeded variation helpers ───────────────────────────────────────────────
SCALE = dict(minor=[0,2,3,5,7,8,10], major=[0,2,4,5,7,9,11], dorian=[0,2,3,5,7,9,10])
ROOTS = dict(hype=55.0, bouncy=65.4, dark=49.0, glow=58.3, troll=61.7)

def _chords(rng, mode, bars):
    """4-chord loop, varied voicings + borrowed color per seed."""
    pool = {
      'minor': [[0,3,7,10],[8,12,15,20],[5,9,12,17],[7,10,14,17]],       # i · VI mix · iv · v
      'major': [[0,4,7,11],[9,12,16,21],[5,9,12,16],[7,11,14,17]],       # I · vi · IV · V
      'dorian': [[0,3,7,10],[10,14,17,22],[7,10,14,17],[5,9,12,17]],
    }[mode]
    chs = pool[:]
    if rng.random() < 0.5: chs[2], chs[3] = chs[3], chs[2]              # variation
    if rng.random() < 0.35: chs[1] = pool[(1 + rng.integers(1,4)) % 4]  # borrowed swap
    return chs

def _arp_fig(rng):
    base = [[0,1,2,1,2,0,1,2], [0,2,1,3,0,2,1,3], [0,1,2,3,2,1,0,1], [2,0,1,0,2,1,3,1]]
    fig = base[rng.integers(len(base))].copy()
    if rng.random() < 0.4: fig[6], fig[7] = fig[7], fig[6]
    return fig

def _groove(rng, preset):
    G = {  # dict beat-index (0-15, 16ths) -> instrument, per 1 bar, varied per seed
      'hype':   {0:'k',4:'k',8:'k',12:'k',6:'h',10:'h',14:'h',2:'h', 5:'cl',13:'h',15:'h'},
      'bouncy': {0:'k',8:'k',4:'rc',12:'rc',2:'h',6:'h',10:'h',14:'ho',11:'h'},
      'dark':   {0:'k',6:'k',8:'h',12:'h',14:'h'},
      'glow':   {0:'k',4:'h',6:'h',8:'k',12:'h',14:'ho'},
      'troll':  {0:'k',3:'rc',4:'h',8:'k',11:'rc',12:'h',14:'h'},
    }
    g = dict(G[preset])
    if rng.random() < 0.6:                                   # vary kick placement + add syncopations
        ks = [b for b,v in g.items() if v=='k']
        if rng.random()<0.5 and len(ks)>2: g[min(ks)+2] = 'k'
        else: g[ks[-1]] = 'h'
        for _ in range(rng.integers(1,3)):
            b = int(rng.integers(0,16))
            if b not in g: g[b] = ['h','h','rc'][rng.integers(3)]
    return g

def _structure(dur, preset):
    """section curve: intro / build / drop / groove / outro → per-bar energy 0..1."""
    bars = max(1, int(dur / (60/ (100 if preset not in ('dark','troll') else 84) * 4)))
    e = np.zeros(bars + 1)
    for b in range(bars):
        r = b / bars
        e[b] = 0.35 + 0.3*min(1, b/2) + (0.35 if 0.2 < r < 0.85 else 0) + (0.15 if 0.45 < r < 0.8 else 0)
        if preset == 'dark': e[b] *= 0.75
        if preset == 'glow': e[b] = min(e[b], 0.8)
    e[bars-1] = max(0.3, e[bars-2]*0.6)                      # outro tail
    return e[:bars]

def render(preset, dur, out, seed=7, stems=False):
    rng = np.random.default_rng(seed)
    N = int(dur * SR); bpm = dict(hype=104, bouncy=112, dark=84, glow=96, troll=120)[preset]
    mode = dict(hype='minor', bouncy='major', dark='minor', glow='dorian', troll='major')[preset]
    beat = 60/bpm; bar = beat*4; b16 = beat/4
    root = ROOTS[preset]
    chs = _chords(rng, mode, 4); fig = _arp_fig(rng); groove = _groove(rng, preset)
    energy = _structure(dur, preset)
    x = np.zeros(N); stems_out = {} if stems else None

    scale = SCALE[mode]
    def hz(deg, oct_=0): return root * 2**((scale[deg % 7] + 12*(deg//7 + oct_)) / 12)

    nb = int(math.ceil(dur/bar))
    for b in range(nb):
        e = energy[min(b, len(energy)-1)]
        st = int(b*bar*SR); ch = [hz(f % 7, f//7) for f in chs[b % 4]]   # chord tones
        ch[3] = ch[3]/2                                                  # deepen top
        # pad / drone per preset
        if preset in ('glow', 'dark'):
            t = _tt(bar); e2 = np.minimum(1, t/0.5)*np.minimum(1,(bar-t)/0.5)
            pad = sum(np.sin(2*np.pi*f*t + 0.4*np.sin(t)) for f in ch[:3]) * e2 * 0.09 * (0.6+0.5*e)
            _mix(x, st, pad, stems_out, 'pad', b)
        else:
            t = _tt(bar); e2 = np.minimum(1, t/0.25)*np.minimum(1,(bar-t)/0.5)
            pad = sum(np.sin(2*np.pi*f/2*t) + 0.2*np.sin(2*np.pi*f*t) for f in ch[:3]) * e2 * 0.07 * (0.5+0.6*e)
            _mix(x, st, pad, stems_out, 'pad', b)
        # bass: pattern varies seed (root / fifth / octave bounce)
        bp = rng.integers(0,3) if b % 4 == 0 else None
        patt = ['R','R','R/o','R','R','R','R','R5','R','R/o','R','R5','R','R','R/o','R']
        for k in range(16):
            s = patt[(k + (bp or 0)*7) % 16].replace('/o','')
            f = (ch[0]/2 if s=='R' else ch[0]/2*1.5 if s=='5' else ch[0]/2*2)
            if k in groove and 'k' in groove[k]: f = f*1.0
            n = int(b16*SR*0.9); tloc = np.arange(n)/SR
            w = np.sin(2*np.pi*f*tloc) * _env(n, 0.005, 14) * 0.16 * (0.6+0.5*e)
            _mix(x, st+int(k*b16*SR), w, stems_out, 'bass', b)
        # arp/pluck figure on 8ths (or 16ths when energy high)
        div = 2 if e < 0.7 else 1
        for k in range(0, 16//div):
            f = ch[fig[(k*div//2 + b) % len(fig)]] * (2 if (k+b) % 4 == 2 else 1)
            if preset=='troll' and rng.random() < 0.25: f *= 1.5          # mischievous grace notes
            n = int(b16*div*SR*0.8)
            _mix(x, st+int(k*div*b16*SR), _pluck(f, n/SR)*0.14*(0.5+0.7*e), stems_out, 'arp', b)
        # drums from groove
        for k, el in groove.items():
            tloc = st + int(k*b16*SR); n = int(b16*SR*2)
            if el=='k': _mix(x, tloc, _kick()* (0.5+0.6*e), stems_out, 'drums', b)
            elif el=='h': _mix(x, tloc, _hat()*0.35*(0.4+0.7*e), stems_out, 'drums', b)
            elif el=='ho': _mix(x, tloc, _hat(0.18, True)*0.3*(0.4+0.7*e), stems_out, 'drums', b)
            elif el=='cl': _mix(x, tloc, _clap()*0.5*(0.5+0.6*e), stems_out, 'drums', b)
            elif el=='rc': _mix(x, tloc, _lp(_hat(0.03)*2.2, 3200)*0.5*(0.5+0.6*e), stems_out, 'drums', b)
        # pre-drop riser + impact
        if b == nb//2 - 1 and preset in ('hype','bouncy','glow'):
            _mix(x, st + int(bar*SR*0.25), _riser(bar*0.75)*0.5, stems_out, 'fx', b)
            di = st + nb//2*int(bar*SR)
            _mix(x, di, _kick(0.5)*1.4, stems_out, 'fx', b)
        # seeded bar-fills every 8 bars
        if b % 8 == 7:
            for k in range(rng.integers(6, 13)):
                _mix(x, st+int(k*b16/1.5*SR), _hat()*0.5*np.exp(-k*2)*10, stems_out, 'fx', b)
    x = _lp(x, 7000)
    x = x/(np.abs(x).max()+1e-9) * 0.82
    # global IN/OUT fades
    fi = int(0.6*SR)*x[:int(0.6*SR)]; x[:int(0.6*SR)] = np.linspace(0,1,int(0.6*SR))*x[:int(0.6*SR)]
    fo = int(1.0*SR); x[-fo:] = np.linspace(1,0,fo)*x[-fo:]
    if out:
        _wav(out, x)
    return x

def _mix(dst, start, src, stems=None, name='', b=0):
    s = max(0, start); e = min(len(dst), start+len(src))
    if e <= s: return
    dst[s:e] += src[:e-s]
    if stems is not None: stems_out = stems; stems.setdefault(name, np.zeros(len(dst))); stems[name][s:e] += src[:e-s]

def _wav(path, x):
    y = (np.clip(x, -1, 1)*32767).astype(np.int16)
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())

if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('preset'); ap.add_argument('dur', type=float); ap.add_argument('out')
    ap.add_argument('--seed', type=int, default=7); ap.add_argument('--stems', action='store_true')
    a = ap.parse_args()
    render(a.preset, a.dur, a.out, a.seed, a.stems)
    print(f"{a.out}: {a.preset} seed={a.seed} {a.dur}s")
