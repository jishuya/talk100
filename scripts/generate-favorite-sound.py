"""Generate an original, soft two-note heart pop using the standard library."""
import math
from pathlib import Path
import struct
import wave

RATE = 44100
output = Path(__file__).resolve().parents[1] / 'backend/public/audio/effect/rewards/favorite.wav'
output.parent.mkdir(parents=True, exist_ok=True)
samples = [0.0] * round(0.38 * RATE)
for start, frequency, duration, volume in [(0, 783.99, 0.22, 0.8), (0.085, 1046.50, 0.295, 1.0)]:
    for i in range(round(duration * RATE)):
        t = i / RATE
        # A small upward pitch scoop and a rounded attack give each note a bubble-like pop.
        phase = 2 * math.pi * frequency * (t - 0.18 * 0.012 * (1 - math.exp(-t / 0.012)))
        envelope = (1 - math.exp(-t / 0.004)) * math.exp(-t / 0.055)
        envelope *= min(1, (duration - t) / 0.025)
        tone = math.sin(phase) + 0.12 * math.sin(2 * phase)
        index = round(start * RATE) + i
        if index < len(samples):
            samples[index] += volume * envelope * tone
peak = max(abs(sample) for sample in samples)
with wave.open(str(output), 'wb') as audio:
    audio.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    audio.writeframes(b''.join(struct.pack('<h', round(sample / peak * 0.55 * 32767)) for sample in samples))
print(f'{output.name}: {len(samples) / RATE:.3f}s')
