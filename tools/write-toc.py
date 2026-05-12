"""Write the curated French TOC for the Amelle catalogue into manifest.json."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "catalogue-pages", "manifest.json")

# Curated from visual inspection of pages 3 & 4 (the Index spread)
toc = [
    {"title": "Cadeaux Tech Innovants",            "page": 6,   "end": 19,  "color": "#34A4D6"},
    {"title": "Clés USB Promotionnelles",          "page": 20,  "end": 39,  "color": "#34A4D6"},
    {"title": "Power Banks Promotionnels",          "page": 40,  "end": 51,  "color": "#2D8896"},
    {"title": "Organiseur Smart Charge sans Fil",   "page": 52,  "end": 63,  "color": "#2DA88A"},
    {"title": "Câbles USB de Charge",               "page": 64,  "end": 65,  "color": "#5BBB5D"},
    {"title": "Enceintes Bluetooth",                "page": 66,  "end": 73,  "color": "#8E72BB"},
    {"title": "Adaptateurs de Voyage",              "page": 74,  "end": 77,  "color": "#75688C"},
    {"title": "Chargeurs USB Voiture",              "page": 78,  "end": 79,  "color": "#7C68A4"},
    {"title": "Supports de Téléphone",              "page": 80,  "end": 83,  "color": "#A56E7E"},
    {"title": "Supports Mobile en Bois",            "page": 84,  "end": 85,  "color": "#C95669"},
    {"title": "Humidificateurs & Vaporisateurs",    "page": 86,  "end": 89,  "color": "#E8B7C5"},
    {"title": "Souris & Tapis Sans Fil",            "page": 90,  "end": 91,  "color": "#E26B49"},
    {"title": "Organiseurs & Carnets",              "page": 92,  "end": 101, "color": "#E58156"},
    {"title": "Stylos & Instruments d'Écriture",    "page": 102, "end": 121, "color": "#CC4955"},
    {"title": "Sacs de Voyage Multi-fonctions",     "page": 122, "end": 125, "color": "#F0B14C"},
    {"title": "Porte-Cartes & Porte-Clés",          "page": 126, "end": 129, "color": "#3399B3"},
    {"title": "Bouteilles & Mugs",                  "page": 130, "end": 139, "color": "#3787B0"},
    {"title": "Coffrets Cadeaux",                   "page": 140, "end": 155, "color": "#34809F"},
    {"title": "Tour de Cou & Balles Anti-Stress",   "page": 156, "end": 157, "color": "#3DA48F"},
    {"title": "Pare-Soleil, T-Shirts & Casquettes", "page": 158, "end": 159, "color": "#3DA48F"},
]

with open(MANIFEST, "r", encoding="utf-8") as f:
    manifest = json.load(f)

manifest["toc"] = toc
manifest["indexPage"] = 3   # The actual Index page in the catalogue

with open(MANIFEST, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"Wrote {len(toc)} TOC entries + indexPage=3 into manifest.json")
