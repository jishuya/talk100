"""Generate opaque install icons: python3 -m pip install Pillow, then run this file.

Keep the in-app logo transparent; Android launch icons need an opaque canvas.
Version manifest URLs when changing these images so installed apps can refresh them.
"""
from pathlib import Path

from PIL import Image

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
BACKGROUND = '#F1F8E8'  # manifest.webmanifest background_color
logo = Image.open(PUBLIC / 'logo.png').convert('RGBA')


def render(size, scale):
    canvas = Image.new('RGBA', (size, size), BACKGROUND)
    mascot = logo.resize((round(size * scale),) * 2, Image.Resampling.LANCZOS)
    offset = (size - mascot.width) // 2
    canvas.alpha_composite(mascot, (offset, offset))
    return canvas.convert('RGB')


for name, size, scale in [
    ('pwa-install-v3-192x192.png', 192, .84),
    ('pwa-install-v3-512x512.png', 512, .84),
    # Keep the mascot within the central safe circle for launcher masks.
    ('pwa-install-v3-maskable-512x512.png', 512, .68),
    ('apple-touch-icon-v3.png', 180, .84),
]:
    render(size, scale).save(PUBLIC / 'icons' / name)

# Older installed manifests can still request these URLs.
for name, size, scale in [
    ('pwa-192x192.png', 192, .84),
    ('pwa-512x512.png', 512, .84),
    ('pwa-maskable-512x512.png', 512, .68),
    ('pwa-install-192x192.png', 192, .84),
    ('pwa-install-512x512.png', 512, .84),
    ('pwa-install-maskable-512x512.png', 512, .68),
    ('apple-touch-icon.png', 180, .84),
    ('apple-touch-icon-v2.png', 180, .84),
]:
    render(size, scale).save(PUBLIC / 'icons' / name)
