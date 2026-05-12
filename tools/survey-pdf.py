"""Survey the catalogue PDF — print extractable text from every page to find chapter starts."""
import fitz, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "catalogue.pdf")
doc = fitz.open(PDF_PATH)

for i in range(doc.page_count):
    text = doc.load_page(i).get_text("text").strip()
    # Keep only short lines (likely titles)
    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
    headings = [ln for ln in lines if 3 <= len(ln) <= 50 and not re.match(r"^\d+$", ln)]
    if headings:
        print(f"p{i+1:3d}: {' | '.join(headings[:6])}")
