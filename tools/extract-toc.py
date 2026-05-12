"""
Find the catalogue's SOMMAIRE page(s) and parse the visible TOC.
Save TOC + indexPage into catalogue-pages/manifest.json.

Strategy:
  1. Scan first 20 pages for "SOMMAIRE" / "INDEX" / "TABLE DES MATIERES".
  2. From that page (and the next 1-2 pages if needed), pull every text line that
     looks like a TOC entry — a category name followed by a page number.
"""
import fitz, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(ROOT, "catalogue.pdf")
MANIFEST = os.path.join(ROOT, "catalogue-pages", "manifest.json")

doc = fitz.open(PDF_PATH)
TOTAL = doc.page_count
print(f"PDF: {TOTAL} pages")

# 1) Locate the SOMMAIRE page(s)
index_page = None
sommaire_keywords = ("sommaire", "table des mati", "table des matières")

for i in range(min(20, TOTAL)):
    text = doc.load_page(i).get_text("text").lower()
    if any(k in text for k in sommaire_keywords):
        index_page = i + 1
        print(f"Sommaire detected at page {index_page}")
        break

if index_page is None:
    # Fallback: assume page 2 is the index
    index_page = 2
    print(f"No sommaire keyword found — fallback to page {index_page}")

# 2) Parse text from index_page and maybe the next 1-2 pages.
toc = []
seen_titles = set()

def parse_lines_with_pages(text):
    """Return list of (title, page) extracted from lines that end with a digit."""
    results = []
    for line in text.split("\n"):
        line = line.strip()
        if len(line) < 4 or len(line) > 80:
            continue
        # Match "Some Title ... 12" or "Some Title 12" (page number 1-999, max 3 digits)
        m = re.search(r"^(.+?)[\s.\-…·]+(\d{1,3})\s*$", line)
        if not m:
            continue
        title = m.group(1).strip(" .-…·\t")
        page = int(m.group(2))
        if not title or len(title) < 3:
            continue
        if 1 <= page <= TOTAL:
            results.append((title, page))
    return results

# Read the sommaire page and the next one (often a two-page TOC spread)
pages_to_read = [index_page - 1]
if index_page < TOTAL:
    pages_to_read.append(index_page)  # 0-indexed of next page
if index_page + 1 <= TOTAL:
    pages_to_read.append(index_page + 1 - 1)

for p in pages_to_read:
    if p < 0 or p >= TOTAL:
        continue
    text = doc.load_page(p).get_text("text")
    print(f"\n--- Text from page {p+1} ---")
    print(text[:1500])
    print("--- end ---")
    for title, page in parse_lines_with_pages(text):
        key = title.upper()
        if key in seen_titles:
            continue
        seen_titles.add(key)
        toc.append({"level": 1, "title": title, "page": page})

# Sort by page number
toc.sort(key=lambda e: e["page"])

print(f"\nFound {len(toc)} TOC entries")
for e in toc[:40]:
    print(f"  p{e['page']:3d}  {e['title']}")

# Save
with open(MANIFEST, "r", encoding="utf-8") as f:
    manifest = json.load(f)
manifest["toc"] = toc
manifest["indexPage"] = index_page

with open(MANIFEST, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(toc)} TOC entries + indexPage={index_page} into manifest.json")
