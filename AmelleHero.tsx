/**
 * AmelleHero.tsx — Section Hero Premium pour Amelle Com
 *
 * À déposer dans votre projet Lovable / Vite-React.
 * Requiert : npm install framer-motion
 *
 * Usage :
 *   import AmelleHero from '@/components/AmelleHero'
 *   <AmelleHero />
 */

'use client' // supprimer si vous n'utilisez pas Next.js

import { useEffect, useRef, useCallback } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationControls,
} from 'framer-motion'

/* ─────────────────────────────────────────────────────────────
   TOKENS DE DESIGN
───────────────────────────────────────────────────────────── */
const C = {
  orange:      '#FF6521',
  orangeGlow:  'rgba(255,101,33,.45)',
  blue:        '#1A6EFF',
  blueGlow:    'rgba(26,110,255,.40)',
  bg:          '#060912',
  bg2:         '#0d1120',
  surface:     '#111827',
  border:      'rgba(255,255,255,.07)',
  text:        '#F0F2FF',
  muted:       '#6B7A99',
}

/* ─────────────────────────────────────────────────────────────
   HOOK FOG CANVAS
   Brume animée à base de dégradés radiaux superposés.
   fogAlphaRef.current est lu à chaque frame — aucun re-render.
───────────────────────────────────────────────────────────── */
function useFogCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  fogAlphaRef: React.RefObject<number>,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0
    let W = 0, H = 0

    type Blob = {
      x: number; y: number; r: number
      vx: number; vy: number; ph: number
      base: number; kind: number
    }
    let blobs: Blob[] = []

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      blobs = Array.from({ length: 14 }, (_, i) => ({
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    160 + Math.random() * 280,
        vx:   (Math.random() - .5) * .25,
        vy:   (Math.random() - .5) * .18,
        ph:   Math.random() * Math.PI * 2,
        base: .04 + Math.random() * .055,
        kind: i < 8 ? 0 : i < 11 ? 1 : 2,
      }))
    }

    const draw = () => {
      const fa = Math.max(0, Math.min(1, fogAlphaRef.current ?? 1))
      if (fa <= 0) { ctx.clearRect(0, 0, W, H); return }

      ctx.clearRect(0, 0, W, H)
      t += .0025

      ctx.fillStyle = `rgba(6,9,18,${.28 * fa})`
      ctx.fillRect(0, 0, W, H)

      blobs.forEach(b => {
        b.x += b.vx + Math.sin(t + b.ph) * .35
        b.y += b.vy + Math.cos(t * .65 + b.ph) * .25
        if (b.x < -b.r) b.x = W + b.r
        if (b.x > W + b.r) b.x = -b.r
        if (b.y < -b.r) b.y = H + b.r
        if (b.y > H + b.r) b.y = -b.r

        const op = b.base * fa * 2.2
        const color =
          b.kind === 1 ? `rgba(255,160,90,${op})`
          : b.kind === 2 ? `rgba(80,140,255,${op})`
          : `rgba(190,200,230,${op * 1.3})`

        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, color)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      })

      const vig = ctx.createLinearGradient(0, H * .65, 0, H)
      vig.addColorStop(0, 'transparent')
      vig.addColorStop(1, `rgba(6,9,18,${.25 * fa})`)
      ctx.fillStyle = vig
      ctx.fillRect(0, H * .65, W, H * .35)
    }

    const loop = () => { draw(); raf = requestAnimationFrame(loop) }

    resize()
    window.addEventListener('resize', resize)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, fogAlphaRef])
}

/* ─────────────────────────────────────────────────────────────
   HOOK PARTICLES CANVAS
   Poussière flottante + traînées lumineuses orange & bleu.
───────────────────────────────────────────────────────────── */
function useParticlesCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let W = 0, H = 0

    type Particle = {
      x: number; y: number; size: number
      vx: number; vy: number
      op: number; life: number
      streak: boolean; slen: number; warm: boolean
    }
    let pts: Particle[] = []

    const make = (): Particle => ({
      x:      Math.random() * W,
      y:      Math.random() * H,
      size:   .6 + Math.random() * 1.8,
      vx:     (Math.random() - .5) * .25,
      vy:     -.08 - Math.random() * .28,
      op:     .1 + Math.random() * .45,
      life:   Math.random(),
      streak: Math.random() > .75,
      slen:   10 + Math.random() * 22,
      warm:   Math.random() > .5,
    })

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      const n = Math.min(90, Math.floor(W / 14))
      pts = Array.from({ length: n }, make)
    }

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life += .004
        if (p.y < -10 || p.life >= 1) { Object.assign(p, make()); p.y = H + 5; p.life = 0 }
        const alpha = p.op * Math.sin(p.life * Math.PI)
        const rgb   = p.warm ? '255,101,33' : '26,110,255'
        if (p.streak) {
          const g = ctx.createLinearGradient(p.x, p.y + p.slen, p.x, p.y)
          g.addColorStop(0, 'transparent')
          g.addColorStop(1, `rgba(${rgb},${alpha * .55})`)
          ctx.strokeStyle = g; ctx.lineWidth = p.size
          ctx.beginPath(); ctx.moveTo(p.x, p.y + p.slen); ctx.lineTo(p.x, p.y); ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(${rgb},${alpha})`
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        }
      })
      raf = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [canvasRef])
}

/* ─────────────────────────────────────────────────────────────
   MACHINE GRAND FORMAT
   Traceur roll-to-roll avec bannière imprimée en sortie.
───────────────────────────────────────────────────────────── */
function PrintingMachine() {
  return (
    <>
      <style>{`
        @keyframes rtrShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes machinePulse{0%,100%{transform:translateX(0)}30%{transform:translateX(.35px)}70%{transform:translateX(-.35px)}}
        @keyframes rollSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes carriageMove{from{left:4%}to{left:70%}}
        @keyframes fillGrow{from{width:6%}to{width:76%}}
        @keyframes bannerEmerge{0%,8%{height:0;opacity:0}18%{opacity:1}45%,65%{height:72px;opacity:1}88%,100%{height:72px;opacity:0}}
        @keyframes textSlide{0%,10%{width:0}45%,65%{width:200px}88%,100%{width:200px;opacity:0}}
        @keyframes scanReveal{0%,8%{height:100%}45%,100%{height:0%}}
        @keyframes statusFill{0%{width:0%;opacity:0}5%{opacity:1}68%{width:100%;opacity:1}80%,100%{width:100%;opacity:0}}
        @keyframes blinkLed{0%,100%{opacity:1}50%{opacity:.25}}
        .led-g{animation:blinkLed 1.8s ease-in-out infinite}
        .led-o{animation:blinkLed 2.5s ease-in-out infinite .5s}
        .led-b{animation:blinkLed 2.1s ease-in-out infinite 1s}
        .roll-fwd{animation:rollSpin 1.8s linear infinite}
        .roll-rev{animation:rollSpin 2.2s linear infinite reverse}
        .carriage-blink{animation:blinkLed .4s linear infinite}
      `}</style>

      <div style={{
        background: 'linear-gradient(150deg,#18203a,#0d1120 60%,#111828)',
        border: `1px solid ${C.border}`,
        borderRadius: 22,
        padding: 22,
        position: 'relative',
        overflow: 'visible',
        boxShadow: '0 50px 100px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03),inset 0 1px 0 rgba(255,255,255,.05)',
        animation: 'machinePulse 2.4s ease-in-out infinite',
      }}>

        {/* Bande accent orange animée */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg,transparent,${C.orange} 25%,#FFB347 50%,${C.orange} 75%,transparent)`,
          backgroundSize: '200% 100%',
          borderRadius: '22px 22px 0 0',
          animation: 'rtrShimmer 3s linear infinite',
        }} />

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, paddingTop: 4 }}>
          <div>
            <div style={{
              fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800,
              fontSize: '.95rem', letterSpacing: '.16em',
              background: `linear-gradient(90deg,${C.orange},#FFB347)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>AMELLE COM</div>
            <div style={{ fontSize: '.52rem', color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>
              Traceur Grand Format — Série Pro
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 4 }}>
            {[['#00E676','led-g'],['#FF6521','led-o'],['#1A6EFF','led-b']].map(([color, cls]) => (
              <div key={cls} className={cls} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: color as string,
                boxShadow: `0 0 8px ${color}`,
              }} />
            ))}
          </div>
        </div>

        {/* Mécanisme roll-to-roll */}
        <div style={{
          display: 'grid', gridTemplateColumns: '52px 1fr 52px',
          alignItems: 'center', gap: 10,
          background: 'rgba(0,0,0,.25)',
          border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '12px 10px', marginBottom: 14,
        }}>

          {/* Rouleau alimentation */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className="roll-fwd" style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'conic-gradient(from 0deg,#2a3555,#1a2340,#2a3555,#1a2340,#3a4565,#1a2340)',
              border: '2px solid rgba(255,255,255,.08)',
              position: 'relative',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,.5)',
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 12, height: 12, borderRadius: '50%',
                background: '#0d1120', border: '1px solid rgba(255,255,255,.1)',
              }} />
            </div>
            <div style={{ fontSize: '.45rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.muted, textAlign: 'center' }}>
              Alimentation
            </div>
          </div>

          {/* Piste d'impression */}
          <div style={{
            position: 'relative', height: 46,
            background: '#090d1c',
            border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, overflow: 'hidden',
          }}>
            {/* Ligne du support */}
            <div style={{
              position: 'absolute', top: '50%', left: 0, right: 0, height: 2,
              background: 'linear-gradient(to right,rgba(255,255,255,.06),rgba(255,255,255,.12),rgba(255,255,255,.06))',
              transform: 'translateY(-50%)',
            }} />
            {/* Bande imprimée derrière le chariot */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 0,
              background: `linear-gradient(to right,rgba(255,101,33,.08),rgba(26,110,255,.08))`,
              animation: 'fillGrow 1.6s ease-in-out infinite alternate',
            }} />
            {/* Rail */}
            <div style={{
              position: 'absolute', top: 8, left: '4%', right: '4%', height: 3,
              background: 'rgba(255,255,255,.06)', borderRadius: 2,
            }} />
            {/* Chariot */}
            <div style={{
              position: 'absolute', top: 5, width: 28, height: 34,
              background: 'linear-gradient(to bottom,#1e2b4a,#141e36)',
              border: `1px solid rgba(26,110,255,.35)`, borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'carriageMove 1.6s ease-in-out infinite alternate',
              boxShadow: '0 0 12px rgba(26,110,255,.25)',
            }}>
              <div className="carriage-blink" style={{
                width: 6, height: 6, borderRadius: '50%',
                background: C.blue, boxShadow: `0 0 8px ${C.blue}`,
              }} />
              {/* Buses */}
              <div style={{
                position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                width: 12, height: 3,
                background: `repeating-linear-gradient(90deg,${C.orange} 0 2px,transparent 2px 4px)`,
                borderRadius: 1,
              }} />
            </div>
          </div>

          {/* Rouleau réception */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className="roll-rev" style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'conic-gradient(from 0deg,#2a3555,#1a2340,#2a3555,#1a2340,#3a4565,#1a2340)',
              border: '2px solid rgba(255,255,255,.08)',
              position: 'relative',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,.5)',
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 12, height: 12, borderRadius: '50%',
                background: '#0d1120', border: '1px solid rgba(255,255,255,.1)',
              }} />
            </div>
            <div style={{ fontSize: '.45rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.muted, textAlign: 'center' }}>
              Réception
            </div>
          </div>
        </div>

        {/* Statut d'impression + file d'attente */}
        <div style={{
          background: 'rgba(0,0,0,.2)', border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '10px 14px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: '.6rem', fontWeight: 600, letterSpacing: '.08em', color: C.text }}>
              Bannière 3m × 1m — En cours…
            </span>
            <span style={{ fontSize: '.6rem', fontWeight: 700, color: C.orange }}>73%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 9 }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg,${C.blue},${C.orange})`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${C.orangeGlow}`,
              animation: 'statusFill 5s ease-in-out infinite',
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Bannière grand format 3m×1m', active: true },
              { label: 'Kakémono 80×200cm — En file',     active: false },
              { label: 'Cartes de visite ×500 — En attente', active: false },
            ].map(({ label, active }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.52rem', letterSpacing: '.06em', color: C.muted }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: active ? C.orange : 'rgba(255,255,255,.15)',
                  boxShadow: active ? `0 0 5px ${C.orange}` : 'none',
                }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Fente de sortie + bannière imprimée */}
        <div style={{
          background: 'linear-gradient(to bottom,#070a14,#04060e)',
          border: `1px solid ${C.border}`, borderRadius: 10, height: 44,
          position: 'relative', overflow: 'visible',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: '.5rem', letterSpacing: '.18em', color: C.muted, textTransform: 'uppercase' as const }}>
            Sortie support
          </span>

          {/* Bannière qui émerge */}
          <div style={{
            position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
            width: '88%',
            borderRadius: '0 0 8px 8px', overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,.55)',
            animation: 'bannerEmerge 6s ease-in-out infinite',
          }}>
            {/* Fond dégradé de la bannière */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(110deg,${C.orange} 0%,#a84eff 45%,${C.blue} 100%)`,
            }} />
            {/* Texture bruit */}
            <div style={{
              position: 'absolute', inset: 0, opacity: .3,
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E\")",
            }} />
            {/* Volet de révélation (balayage haut → bas) */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: '#07090f',
              animation: 'scanReveal 6s ease-in-out infinite',
              zIndex: 2,
            }}>
              {/* Trait lumineux de scan */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(to right,transparent,rgba(26,110,255,.8),rgba(255,101,33,.8),transparent)`,
                boxShadow: '0 0 12px rgba(26,110,255,.6)',
              }} />
            </div>
            {/* Contenu de la bannière */}
            <div style={{
              position: 'relative', zIndex: 1,
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800,
                fontSize: '.65rem', color: '#fff', letterSpacing: '.05em',
              }}>AC</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800,
                  fontSize: '.68rem', letterSpacing: '.18em', color: '#fff',
                  overflow: 'hidden', whiteSpace: 'nowrap',
                  animation: 'textSlide 6s ease-in-out infinite',
                }}>AMELLE COM</div>
                <div style={{ fontSize: '.46rem', color: 'rgba(255,255,255,.7)', letterSpacing: '.08em', marginTop: 2 }}>
                  Impression · Communication · Branding
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons de commande */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['Imprimer', 'Pause', 'Paramètres'].map(label => (
            <button key={label} style={{
              flex: 1, height: 26, borderRadius: 7,
              border: `1px solid ${C.border}`,
              background: 'rgba(255,255,255,.02)',
              cursor: 'pointer',
              fontSize: '.5rem', letterSpacing: '.1em',
              color: C.muted, textTransform: 'uppercase' as const,
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all .2s',
            }}>
              {label}
            </button>
          ))}
        </div>

      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT HERO PRINCIPAL
───────────────────────────────────────────────────────────── */
export default function AmelleHero() {
  const heroRef      = useRef<HTMLElement>(null)
  const fogRef       = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<HTMLCanvasElement>(null)
  const fogAlphaRef  = useRef(1)
  const controls     = useAnimationControls()

  /* Progression du scroll → alpha de la brume */
  const { scrollYProgress } = useScroll({ target: heroRef })
  const fogMotion = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  const contentY  = useTransform(scrollYProgress, [0, 1], [0, -55])
  const machineY  = useTransform(scrollYProgress, [0, 1], [0, -35])
  const hintOp    = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  useEffect(() => {
    return fogMotion.on('change', v => { fogAlphaRef.current = v })
  }, [fogMotion])

  useFogCanvas(fogRef, fogAlphaRef)
  useParticlesCanvas(particlesRef)

  /* Parallaxe souris — MotionValues (zéro re-render) */
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 45, damping: 20 })
  const springY = useSpring(rawY, { stiffness: 45, damping: 20 })

  const sceneRotY     = useTransform(springX, [-1, 1], [-17, -3])
  const sceneRotX     = useTransform(springY, [-1, 1], [ 9,  -1])
  const orbOrangeX    = useTransform(springX, [-1, 1], [-22, 22])
  const orbOrangeY    = useTransform(springY, [-1, 1], [-15, 15])
  const orbBlueX      = useTransform(springX, [-1, 1], [ 32, -32])
  const orbBlueY      = useTransform(springY, [-1, 1], [ 20, -20])
  const contentX      = useTransform(springX, [-1, 1], [  7, -7])
  const contentYMouse = useTransform(springY, [-1, 1], [5, -5])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const hw = window.innerWidth / 2
    const hh = window.innerHeight / 2
    rawX.set((e.clientX - hw) / hw)
    rawY.set((e.clientY - hh) / hh)
  }, [rawX, rawY])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  useEffect(() => { controls.start('visible') }, [controls])

  const fadeUp = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: .8, ease: [.16,1,.3,1] } },
  }

  const staggerContainer = {
    hidden:  {},
    visible: { transition: { staggerChildren: .14, delayChildren: .7 } },
  }

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: C.bg,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes heroScan{0%{top:-1%;opacity:0}5%{opacity:.6}95%{opacity:.3}100%{top:101%;opacity:0}}
        @keyframes scrollPulse{0%{opacity:0;transform:scaleY(0);transform-origin:top}50%{opacity:1;transform:scaleY(1);transform-origin:top}100%{opacity:0;transform:scaleY(1);transform-origin:bottom}}
      `}</style>

      {/* Grille de fond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Radial bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 70% 80% at 75% 45%, rgba(26,110,255,.07) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 80% 85%, rgba(255,101,33,.05) 0%, transparent 70%)
        `,
        zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Ligne de scan hero */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(to right,transparent,${C.blueGlow} 40%,${C.orangeGlow} 60%,transparent)`,
        zIndex: 4, pointerEvents: 'none',
        animation: 'heroScan 6s ease-in-out infinite',
      }} />

      {/* Orbes lumineux */}
      <motion.div style={{
        position: 'absolute', zIndex: 1, pointerEvents: 'none',
        width: 560, height: 560, top: -80, right: '12%',
        borderRadius: '50%', filter: 'blur(90px)',
        background: `radial-gradient(circle,rgba(255,101,33,.38),transparent 70%)`,
        x: orbOrangeX, y: orbOrangeY,
      }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.2, delay: .2 }} />

      <motion.div style={{
        position: 'absolute', zIndex: 1, pointerEvents: 'none',
        width: 640, height: 640, bottom: -160, right: '2%',
        borderRadius: '50%', filter: 'blur(90px)',
        background: `radial-gradient(circle,rgba(26,110,255,.32),transparent 70%)`,
        x: orbBlueX, y: orbBlueY,
      }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.8, delay: .4 }} />

      {/* Canvas particules — z 3 */}
      <canvas ref={particlesRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 3, pointerEvents: 'none',
      }} />
      {/* Canvas brume — z 10, disparaît au scroll */}
      <canvas ref={fogRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        zIndex: 10, pointerEvents: 'none',
      }} />

      {/* ── Navbar ──────────────────────────────────────────── */}
      <motion.nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: '20px 8vw',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to bottom,rgba(6,9,18,.75),transparent)',
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}
      >
        <div style={{
          fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, fontSize: '1.05rem',
          letterSpacing: '.12em',
          background: `linear-gradient(90deg,${C.orange},#FFB347)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>AMELLE COM</div>

        <div style={{ display: 'flex', gap: 32 }}>
          {['Services', 'Portfolio', 'À Propos', 'Contact'].map(l => (
            <a key={l} href="#" style={{
              textDecoration: 'none', color: C.muted,
              fontSize: '.85rem', fontWeight: 500,
            }}>{l}</a>
          ))}
        </div>

        <a href="#" style={{
          padding: '10px 22px', background: C.orange, color: '#fff',
          borderRadius: 8, fontSize: '.85rem', fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          boxShadow: `0 0 20px ${C.orangeGlow}`,
        }}>Obtenir un Devis</a>
      </motion.nav>

      {/* ── Grille principale ───────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '80px 8vw 0',
        gap: 40,
      }}>

        {/* ── Contenu gauche ────────────────────────────────── */}
        <motion.div
          style={{ y: contentY, x: contentX, paddingBottom: 80 }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontSize: '.7rem', fontWeight: 600, letterSpacing: '.22em',
            textTransform: 'uppercase' as const, color: C.orange,
            marginBottom: 28,
          }}>
            <span style={{ width: 28, height: 2, background: C.orange, boxShadow: `0 0 8px ${C.orangeGlow}`, flexShrink: 0 }} />
            Studio d'Impression Premium
          </motion.div>

          {/* H1 */}
          <div style={{ marginBottom: 28, overflow: 'hidden' }}>
            {['Nous Imprimons', 'Votre Marque', 'Dans la Réalité'].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden' }}>
                <motion.div
                  style={{
                    fontFamily: 'Syne, system-ui, sans-serif',
                    fontSize: 'clamp(2.2rem, 4.4vw, 4.8rem)',
                    fontWeight: 800,
                    lineHeight: 1.0,
                    letterSpacing: '-.035em',
                    display: 'block',
                    ...(i === 1 ? {
                      background: `linear-gradient(90deg,${C.orange},#FFB347)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    } : { color: C.text }),
                  }}
                  initial={{ y: '115%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: [.16,1,.3,1], delay: .7 + i * .12 }}
                >
                  {line}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Sous-titre */}
          <motion.p variants={fadeUp} style={{
            fontSize: 'clamp(.88rem, 1.2vw, 1.05rem)',
            color: C.muted, lineHeight: 1.75,
            maxWidth: 420, marginBottom: 44,
          }}>
            Bannières, kakémonos, impressions professionnelles,
            supports de communication&nbsp;— livraison rapide, qualité premium.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
            <motion.button
              whileHover={{ y: -2, boxShadow: `0 0 55px ${C.orangeGlow},0 0 120px rgba(255,101,33,.18)` }}
              whileTap={{ scale: .97 }}
              style={{
                padding: '14px 32px', borderRadius: 10, border: 'none',
                background: C.orange, color: '#fff',
                fontSize: '.9rem', fontWeight: 600, cursor: 'pointer',
                boxShadow: `0 0 30px ${C.orangeGlow},inset 0 1px 0 rgba(255,255,255,.15)`,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >Obtenir un Devis &rarr;</motion.button>

            <motion.button
              whileHover={{ y: -2, borderColor: 'rgba(255,255,255,.3)' }}
              whileTap={{ scale: .97 }}
              style={{
                padding: '14px 32px', borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: 'transparent', color: C.text,
                fontSize: '.9rem', fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >Voir nos Services</motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} style={{
            display: 'flex', gap: 44, marginTop: 56, paddingTop: 32,
            borderTop: `1px solid ${C.border}`,
          }}>
            {[
              ['500+', 'Projets Réalisés'],
              ['48h',  'Délai de Livraison'],
              ['99%',  'Clients Satisfaits'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: 'Syne, system-ui, sans-serif',
                  fontSize: '1.75rem', fontWeight: 800, color: C.orange,
                }}>{n}</div>
                <div style={{ fontSize: '.7rem', color: C.muted, marginTop: 3, letterSpacing: '.06em', textTransform: 'uppercase' as const }}>
                  {l}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Machine droite ─────────────────────────────────── */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '80px 0', y: machineY }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, ease: [.16,1,.3,1], delay: .35 }}
        >
          <div style={{ perspective: 1400, width: '100%', maxWidth: 520 }}>
            <motion.div style={{
              transformStyle: 'preserve-3d',
              rotateY: sceneRotY,
              rotateX: sceneRotX,
              position: 'relative',
            }}>

              {/* Chips produits */}
              {[
                { label: 'Bannières',         top: '5%',  left: -4,   dot: C.orange, side: 'left' },
                { label: 'Kakémonos',         top: '18%', right: -16, dot: C.blue,   side: 'right' },
                { label: 'Cartes de visite',  bottom: '22%', right: -20, dot: '#00E676', side: 'right' },
                { label: 'Flyers & Roll-Up',  bottom: '8%',  left: 4,   dot: '#E91E8C', side: 'left' },
              ].map(({ label, top, bottom, left, right, dot }) => (
                <motion.div
                  key={label}
                  style={{
                    position: 'absolute', top, bottom, left, right,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 20, padding: '5px 12px',
                    fontSize: '.58rem', fontWeight: 600, letterSpacing: '.08em',
                    textTransform: 'uppercase' as const, color: C.muted,
                    backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
                  }}
                  initial={{ opacity: 0, scale: .8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + [0,.1,.2,.3][['Bannières','Kakémonos','Cartes de visite','Flyers & Roll-Up'].indexOf(label)], duration: .6 }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: dot, boxShadow: `0 0 6px ${dot}` }} />
                  {label}
                </motion.div>
              ))}

              {/* Étiquettes annotations */}
              {[
                { text: "Rouleau d'alimentation", top: '14%', right: -148, color: C.orange, glow: C.orangeGlow, dir: 'right' },
                { text: 'Zone de sortie',          bottom: '32%', right: -152, color: C.blue, glow: C.blueGlow, dir: 'right' },
              ].map(({ text, top, bottom, right, color, glow }, idx) => (
                <motion.div
                  key={text}
                  style={{
                    position: 'absolute', top, bottom, right,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: '.58rem', fontWeight: 600, letterSpacing: '.12em',
                    textTransform: 'uppercase' as const, color: C.muted, whiteSpace: 'nowrap',
                  }}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + idx * .15, duration: .7 }}
                >
                  <span style={{ display: 'block', height: 1, width: 22, background: color, boxShadow: `0 0 6px ${glow}`, flexShrink: 0 }} />
                  {text}
                </motion.div>
              ))}

              {/* Étiquette gauche — Tête d'impression */}
              <motion.div
                style={{
                  position: 'absolute', top: '56%', left: -152,
                  display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse',
                  fontSize: '.58rem', fontWeight: 600, letterSpacing: '.12em',
                  textTransform: 'uppercase' as const, color: C.muted, whiteSpace: 'nowrap',
                }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.65, duration: .7 }}
              >
                <span style={{ display: 'block', height: 1, width: 22, background: '#00E676', boxShadow: '0 0 6px rgba(0,230,118,.5)', flexShrink: 0 }} />
                Tête d'impression
              </motion.div>

              {/* Badge spec */}
              <motion.div
                style={{
                  position: 'absolute', bottom: '5%', left: -8,
                  background: 'rgba(26,110,255,.10)',
                  border: `1px solid rgba(26,110,255,.25)`,
                  borderRadius: 12, padding: '11px 16px',
                  backdropFilter: 'blur(12px)',
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: .7 }}
              >
                <div style={{ fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase' as const, color: C.blue, marginBottom: 3 }}>
                  Grand Format
                </div>
                <div style={{ fontFamily: 'Syne, system-ui, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: C.text }}>
                  2,5 m large
                </div>
              </motion.div>

              <PrintingMachine />

            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* ── Indicateur de scroll ────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          zIndex: 5, pointerEvents: 'none',
          opacity: hintOp,
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
      >
        <span style={{ fontSize: '.62rem', letterSpacing: '.22em', textTransform: 'uppercase' as const, color: C.muted }}>
          Défiler pour découvrir
        </span>
        <div style={{
          width: 1, height: 36,
          background: `linear-gradient(to bottom,${C.orange},transparent)`,
          animation: 'scrollPulse 2s ease-in-out infinite',
        }} />
      </motion.div>

    </section>
  )
}
