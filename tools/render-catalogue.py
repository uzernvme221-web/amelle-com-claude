"""
Render catalogue.pdf into web-optimized WebP page images + thumbnails.

Outputs:
  catalogue-pages/p001.webp ... p266.webp   (~1400px wide, q=75)
  catalogue-pages/t001.webp ... t266.webp   (~280px wide thumbs, q=70)
  catalogue-pages/manifest.json             (page count + dimensions)
"""
import fitz  # PyMuPDF
import os, json, time
from PIL import Image
from io import BytesIO

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "catalogue.pdf")
OUT_DIR = os.path.join(ROOT, "catalogue-pages")
os.makedirs(OUT_DIR, exist_ok=True)

# Render configuration
PAGE_WIDTH_PX = 1400      # high-quality flipbook display
THUMB_WIDTH_PX = 280      # sidebar thumbnails
PAGE_QUALITY = 75         # WebP quality (sweet spot for photo+vector)
THUMB_QUALITY = 65

doc = fitz.open(PDF_PATH)
total = doc.page_count
print(f"PDF opened: {total} pages")

manifest = {"pages": total, "items": []}
start = time.time()

for i in range(total):
    page = doc.load_page(i)
    rect = page.rect
    # Scale matrix so output width == PAGE_WIDTH_PX
    zoom = PAGE_WIDTH_PX / rect.width
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)

    # Save full page
    page_path = os.path.join(OUT_DIR, f"p{i+1:03d}.webp")
    img.save(page_path, "WEBP", quality=PAGE_QUALITY, method=6)

    # Thumbnail
    thumb_zoom = THUMB_WIDTH_PX / pix.width
    thumb = img.resize(
        (THUMB_WIDTH_PX, int(pix.height * thumb_zoom)),
        Image.Resampling.LANCZOS,
    )
    thumb_path = os.path.join(OUT_DIR, f"t{i+1:03d}.webp")
    thumb.save(thumb_path, "WEBP", quality=THUMB_QUALITY, method=6)

    manifest["items"].append({
        "i": i + 1,
        "w": pix.width,
        "h": pix.height,
    })

    if (i + 1) % 20 == 0 or i == total - 1:
        elapsed = time.time() - start
        rate = (i + 1) / elapsed
        eta = (total - i - 1) / rate
        print(f"  page {i+1:3d}/{total}  ({rate:.1f}/s  eta {eta:.0f}s)")

# Aspect ratio for the flipbook (use page 1 dims)
first = manifest["items"][0]
manifest["aspect"] = round(first["w"] / first["h"], 4)
manifest["pageWidth"] = PAGE_WIDTH_PX
manifest["thumbWidth"] = THUMB_WIDTH_PX

with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

# Summary
total_size = sum(
    os.path.getsize(os.path.join(OUT_DIR, n))
    for n in os.listdir(OUT_DIR)
)
print()
print(f"Done in {time.time()-start:.1f}s")
print(f"Total output: {total_size/1024/1024:.2f} MB across {total*2 + 1} files")
print(f"Aspect ratio: {manifest['aspect']}")
