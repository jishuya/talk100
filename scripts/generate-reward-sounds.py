"""Generate original, short reward chimes using only Python's standard library."""
import math
from pathlib import Path
import struct
import wave

RATE = 44100
ROOT = Path(__file__).resolve().parents[1] / 'backend/public/audio/effect/rewards'
ROOT.mkdir(parents=True, exist_ok=True)
MELODIES = {
    'streak-3': ([659.25, 783.99, 987.77], 0.10, 0.24),
    'streak-5': ([783.99, 987.77, 1174.66, 1318.51], 0.09, 0.27),
    'streak-10': ([987.77, 1174.66, 1318.51, 1567.98, 1975.53], 0.085, 0.32),
    'day-complete': ([523.25, 659.25, 783.99, 1046.50], 0.17, 0.48),
}
for name, (notes, spacing, decay) in MELODIES.items():
    samples = [0.0] * int(((len(notes) - 1) * spacing + decay) * RATE)
    for index, frequency in enumerate(notes):
        offset = round(index * spacing * RATE)
        for i in range(int(decay * RATE)):
            t = i / RATE
            envelope = min(1, t / 0.006) * math.exp(-5 * t / decay) * min(1, (decay - t) / 0.025)
            tone = math.sin(2 * math.pi * frequency * t) + 0.16 * math.sin(4 * math.pi * frequency * t)
            if offset + i < len(samples):
                samples[offset + i] += tone * envelope
    peak = max(abs(s) for s in samples)
    with wave.open(str(ROOT / f'{name}.wav'), 'wb') as audio:
        audio.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        audio.writeframes(b''.join(struct.pack('<h', round(s / peak * 0.65 * 32767)) for s in samples))
    print(f'{name}: {len(samples)/RATE:.3f}s')
