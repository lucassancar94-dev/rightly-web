"""Erzeugt die PWA-/iOS-Icons in public/icons (benötigt Pillow: pip install pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)
GREEN = (34, 197, 94)


def font(size):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf", "DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make(size, maskable=False):
    scale = 4
    s = size * scale
    img = Image.new("RGB", (s, s), (0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(s * (0.2 if maskable else 0.12))
    d.rounded_rectangle([pad, pad, s - pad, s - pad], radius=int((s - 2 * pad) * 0.28), fill=GREEN)
    # Schallwellen-Bogen (Telefon/Coach) rechts oben
    w = int(s * 0.035)
    cx, cy = s - pad - int(s * 0.16), pad + int(s * 0.16)
    for r in (int(s * 0.06), int(s * 0.11)):
        d.arc([cx - r, cy - r, cx + r, cy + r], start=-80, end=-10, fill=(0, 0, 0), width=w)
    f = font(int(s * (0.42 if maskable else 0.5)))
    text = "A"
    bbox = d.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((s - tw) / 2 - bbox[0], (s - th) / 2 - bbox[1] + s * 0.02), text, font=f, fill=(0, 0, 0))
    return img.resize((size, size), Image.LANCZOS)


make(192).save(OUT / "icon-192.png")
make(512).save(OUT / "icon-512.png")
make(512, maskable=True).save(OUT / "icon-maskable-512.png")
make(180).save(OUT / "apple-touch-icon.png")
make(180).save(OUT.parent / "apple-touch-icon.png")
make(32).save(OUT.parent / "favicon.ico")
print("Icons erzeugt in", OUT)
