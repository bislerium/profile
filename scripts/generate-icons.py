#!/usr/bin/env python3
"""
Generate all favicons, app icons, and maskable icons
from the source logo-square.svg for bishalgc.info.np.

Does NOT touch og-image.png — that is managed separately.
"""

import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_SVG = ROOT / "design/logo/square/logo-square.svg"
ICONS_DIR = ROOT / "public/assets/icons"

# Brand colors
BG_PURPLE = "#512bd4"
BG_DARK = "#0a0a0f"
BG_LIGHT = "#f7f7f5"

def rsvg_to_png(svg_path: Path, png_path: Path, width: int, height: int | None = None):
    """Convert SVG to PNG via rsvg-convert."""
    if height is None:
        height = width
    cmd = [
        "rsvg-convert",
        "-w", str(width),
        "-h", str(height),
        "-o", str(png_path),
        str(svg_path),
    ]
    subprocess.run(cmd, check=True)

def create_favicon_svg():
    """Copy the source SVG as favicon.svg (optimized for favicon use)."""
    import shutil
    dest = ICONS_DIR / "favicon.svg"
    shutil.copy2(SOURCE_SVG, dest)
    print(f"✓ favicon.svg")

def create_favicon_png(name: str, size: int):
    """Create a single-size favicon PNG."""
    p = ICONS_DIR / name
    rsvg_to_png(SOURCE_SVG, p, size, size)
    print(f"✓ {name} ({size}×{size})")

def create_apple_touch_icons():
    """Create Apple touch icons at all recommended sizes."""
    sizes = {
        "apple-touch-icon-120x120.png": 120,
        "apple-touch-icon-152x152.png": 152,
        "apple-touch-icon-167x167.png": 167,
        "apple-touch-icon-180x180.png": 180,
    }
    for name, size in sizes.items():
        rsvg_to_png(SOURCE_SVG, ICONS_DIR / name, size, size)
        print(f"✓ {name} ({size}×{size})")

def create_app_icons():
    """Create PWA / Android Chrome icons."""
    sizes = {
        "icon-192x192.png": 192,
        "icon-384x384.png": 384,
        "icon-512x512.png": 512,
    }
    for name, size in sizes.items():
        rsvg_to_png(SOURCE_SVG, ICONS_DIR / name, size, size)
        print(f"✓ {name} ({size}×{size})")

def create_maskable_icon(size: int):
    """
    Create a maskable icon with safe-zone padding.
    Android adaptive icons use 108dp of 108dp as safe zone,
    but PWA maskable spec says 80% of the icon.
    We scale the logo to 80% of the canvas on a branded background.
    """
    tmp_full = ICONS_DIR / f"_tmp_full_{size}.png"
    rsvg_to_png(SOURCE_SVG, tmp_full, size, size)

    safe_scale = 0.8
    logo_size = int(size * safe_scale)
    tmp_logo = ICONS_DIR / f"_tmp_logo_{size}.png"
    rsvg_to_png(SOURCE_SVG, tmp_logo, logo_size, logo_size)

    canvas = Image.new("RGBA", (size, size), BG_PURPLE + "ff")
    logo = Image.open(tmp_logo).convert("RGBA")
    offset = (size - logo_size) // 2
    canvas.paste(logo, (offset, offset), logo)

    out = ICONS_DIR / f"maskable-icon-{size}x{size}.png"
    canvas.save(out, "PNG")
    tmp_full.unlink(missing_ok=True)
    tmp_logo.unlink(missing_ok=True)
    print(f"✓ maskable-icon-{size}x{size}.png (safe zone at {int(safe_scale*100)}%)")

def create_mstile():
    """Create Windows 8/10 tile icon."""
    rsvg_to_png(SOURCE_SVG, ICONS_DIR / "mstile-150x150.png", 150, 150)
    print(f"✓ mstile-150x150.png")

def main():
    print("Generating icons from logo-square.svg …\n")

    create_favicon_svg()
    create_favicon_png("favicon-16x16.png", 16)
    create_favicon_png("favicon-32x32.png", 32)
    create_favicon_png("favicon-96x96.png", 96)
    create_apple_touch_icons()
    create_app_icons()
    create_maskable_icon(192)
    create_maskable_icon(512)
    create_mstile()

    print(f"\n✅ All icons generated in {ICONS_DIR}")

if __name__ == "__main__":
    main()
