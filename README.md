# Amelle Com — Site Web

Site officiel d'**Amelle Com**, agence dakaroise de communication visuelle depuis 2005.
Impression grand format, signalétique, goodies, web design, vidéo, événementiel et branding.

🌐 Production : [amellecom.lovable.app](https://amellecom.lovable.app/)

## Stack

Site statique zéro-build avec animations premium :

- **HTML / CSS / Vanilla JS** — un seul fichier `index.html` auto-suffisant
- **GSAP 3.12** + **ScrollTrigger** — animations scroll-driven (CDN)
- **Lenis 1.1** — smooth scroll avec inertie (CDN)
- **Canvas 2D** — moteurs de brume + particules custom (FogEngine, ParticlesEngine)
- **Pas de dépendances npm** — fonctionne en ouvrant `index.html` directement ou avec n'importe quel serveur statique

## Sections

1. **Hero** — Machine grand format roll-to-roll animée + parallaxe souris + brume canvas
2. **Trust Bar** — Marquee infini de 18 logos clients (Sonatel, Orange, UEMOA, Senelec, etc.)
3. **Services** — 8 cartes 3D tilt avec hover glow
4. **Stats** — Compteurs animés "20+ années · 200+ clients · 500+ projets"
5. **Process** — Timeline 4 étapes avec ligne progressive (Brief → Devis → Production → Livraison)
6. **Mid-CTA** — Bloc devis
7. **Testimonials** — Sticky stack 3D
8. **FAQ** — Accordéon 8 questions
9. **Contact** — Formulaire + infos
10. **Footer** — Réseaux sociaux + liens

## Effets dynamiques

- Curseur custom magnétique avec lerp + mix-blend-mode
- Scroll progress bar
- SVG dividers qui se dessinent au scroll
- Marquee à vélocité (accélère quand on scrolle)
- 3D tilt cards (mouse-controlled rotateX/rotateY)
- Sticky stacking testimonials
- Tous les effets respectent `prefers-reduced-motion`

## Lancer en local

Aucun build nécessaire. Trois options :

**Option 1 — Python (le plus simple) :**
```bash
python -m http.server 3001
# → http://localhost:3001
```

**Option 2 — Node :**
```bash
npx serve .
```

**Option 3 — Ouvrir directement :**
Double-clic sur `index.html` (certaines features de scroll peuvent ne pas fonctionner sans serveur).

## Structure

```
amelle-com/
├── index.html              # Site complet (HTML + CSS + JS inline)
├── AmelleHero.tsx          # Composant React du hero (pour port Lovable)
├── clients/                # 18 logos clients (PNG/SVG/WebP)
│   ├── sonatel.png
│   ├── orange.svg
│   ├── senelec.png
│   └── ...
├── README.md
└── .gitignore
```

## SEO

- Meta tags complets (Open Graph, Twitter Cards)
- JSON-LD `LocalBusiness` (nom, adresse Dakar, GPS, horaires, catalogue services)
- Favicon SVG inline
- Theme color orange #FF6521
- Lang `fr`, locale `fr_SN`

## Brand

| Token | Valeur |
|-------|--------|
| Orange primaire | `#FF6521` |
| Orange clair | `#FF9A5C` |
| Bleu accent | `#1A6EFF` |
| BG navy | `#060912` |
| Surface | `#111827` |
| Texte | `#F0F2FF` |
| Texte muted | `#6B7A99` |
| Typo headline | Syne 700/800 |
| Typo body | Inter 400/500/600 |

---

Conçu et développé avec passion à Dakar 🇸🇳
