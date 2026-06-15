/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/theme-provider'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

/* ── Globe Canvas ──────────────────────────────────────────────── */

function GlobeCanvas({ tone }: { tone: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const isDark = tone === 'dark'
    const colors = {
      globeStart: isDark ? 'rgba(203,213,225,0.18)' : 'rgba(219,234,254,0.35)',
      globeEnd: isDark ? 'rgba(203,213,225,0.045)' : 'rgba(191,219,254,0.10)',
      globeStroke: isDark ? 'rgba(226,232,240,0.30)' : 'rgba(147,197,253,0.5)',
      grid: isDark ? 'rgba(226,232,240,0.13)' : 'rgba(147,197,253,0.25)',
      meridian: isDark ? 'rgba(226,232,240,0.10)' : 'rgba(147,197,253,0.18)',
      dot: isDark ? [226, 232, 240] : [96, 165, 250],
      dotBase: isDark ? 0.28 : 0.18,
      dotBoost: isDark ? 0.56 : 0.45,
      arc: isDark ? 'rgba(226,232,240,0.62)' : 'rgba(99,102,241,0.55)',
      node: isDark ? [248, 250, 252] : [99, 102, 241],
    }

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight
    const R = () => Math.min(W(), H()) * 0.42

    const DOTS: { lat: number; lng: number }[] = []
    for (let lat = -80; lat <= 80; lat += 8) {
      const r = Math.cos((lat * Math.PI) / 180)
      const count = Math.max(1, Math.round(r * 30))
      for (let i = 0; i < count; i++) {
        DOTS.push({ lat, lng: (i / count) * 360 })
      }
    }

    const NODES = [
      { lat: 40, lng: -74 },
      { lat: 51, lng: 0 },
      { lat: 35, lng: 139 },
      { lat: 31, lng: 121 },
      { lat: 37, lng: -122 },
      { lat: 1, lng: 103 },
      { lat: -33, lng: 151 },
      { lat: 48, lng: 2 },
    ]
    const ARCS: [number, number][] = [
      [0, 1],
      [0, 4],
      [1, 7],
      [2, 3],
      [3, 5],
      [4, 5],
      [6, 2],
      [7, 3],
    ]
    const arcProgress = ARCS.map(() => Math.random())

    function project(lat: number, lng: number, rot: number) {
      const phi = (lat * Math.PI) / 180
      const theta = ((lng + rot) * Math.PI) / 180
      return {
        x: Math.cos(phi) * Math.sin(theta),
        y: Math.sin(phi),
        z: Math.cos(phi) * Math.cos(theta),
      }
    }
    function toScreen(p: { x: number; y: number; z: number }) {
      return {
        sx: W() / 2 + p.x * R(),
        sy: H() / 2 - p.y * R(),
        visible: p.z > -0.15,
        b: (p.z + 1) / 2,
      }
    }
    function arcPt(
      la1: number,
      lo1: number,
      la2: number,
      lo2: number,
      f: number,
      rot: number
    ) {
      const p1 = project(la1, lo1, rot),
        p2 = project(la2, lo2, rot)
      const dot = p1.x * p2.x + p1.y * p2.y + p1.z * p2.z
      const omega = Math.acos(Math.min(1, Math.max(-1, dot)))
      if (Math.abs(omega) < 0.001) return p1
      const s = Math.sin(omega)
      const f1 = Math.sin((1 - f) * omega) / s,
        f2 = Math.sin(f * omega) / s
      return {
        x: f1 * p1.x + f2 * p2.x,
        y: f1 * p1.y + f2 * p2.y,
        z: f1 * p1.z + f2 * p2.z,
      }
    }

    let rot = 0,
      t = 0

    function draw() {
      ctx.clearRect(0, 0, W(), H())
      const cx = W() / 2,
        cy = H() / 2

      const fill = ctx.createRadialGradient(
        cx - R() * 0.2,
        cy - R() * 0.2,
        0,
        cx,
        cy,
        R()
      )
      fill.addColorStop(0, colors.globeStart)
      fill.addColorStop(1, colors.globeEnd)
      ctx.beginPath()
      ctx.arc(cx, cy, R(), 0, Math.PI * 2)
      ctx.fillStyle = fill
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, R(), 0, Math.PI * 2)
      ctx.strokeStyle = colors.globeStroke
      ctx.lineWidth = 1
      ctx.stroke()
      ;[-60, -30, 0, 30, 60].forEach((lat) => {
        const phi = (lat * Math.PI) / 180
        const ry = Math.cos(phi) * R(),
          oy = Math.sin(phi) * R()
        ctx.beginPath()
        ctx.ellipse(cx, cy - oy, ry, ry * 0.14, 0, 0, Math.PI * 2)
        ctx.strokeStyle = colors.grid
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      for (let lng = 0; lng < 180; lng += 30) {
        const theta = ((lng + rot) * Math.PI) / 180
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(theta)
        ctx.beginPath()
        ctx.ellipse(0, 0, R() * 0.14, R(), 0, 0, Math.PI * 2)
        ctx.strokeStyle = colors.meridian
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.restore()
      }

      DOTS.forEach(({ lat, lng }) => {
        const p = project(lat, lng, rot)
        const s = toScreen(p)
        if (!s.visible) return
        ctx.beginPath()
        ctx.arc(s.sx, s.sy, 0.9 + s.b * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colors.dot.join(',')},${colors.dotBase + s.b * colors.dotBoost})`
        ctx.fill()
      })

      ARCS.forEach(([a, b], i) => {
        arcProgress[i] = (arcProgress[i] + 0.0025) % 1
        const n1 = NODES[a],
          n2 = NODES[b]
        const prog = arcProgress[i],
          trail = 0.22
        const start = Math.max(0, prog - trail)
        ctx.beginPath()
        let first = true
        for (let s = 0; s <= 50; s++) {
          const f = start + (s / 50) * (prog - start)
          if (f < 0 || f > 1) continue
          const ap = arcPt(n1.lat, n1.lng, n2.lat, n2.lng, f, rot)
          const sc = toScreen(ap)
          if (!sc.visible) {
            first = true
            continue
          }
          if (first) {
            ctx.moveTo(sc.sx, sc.sy)
            first = false
          } else ctx.lineTo(sc.sx, sc.sy)
        }
        ctx.strokeStyle = colors.arc
        ctx.lineWidth = 1.2
        ctx.stroke()
        const head = arcPt(n1.lat, n1.lng, n2.lat, n2.lng, prog, rot)
        const hs = toScreen(head)
        if (hs.visible) {
          ctx.beginPath()
          ctx.arc(hs.sx, hs.sy, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${colors.node.join(',')},0.92)`
          ctx.fill()
        }
      })

      NODES.forEach(({ lat, lng }) => {
        const p = project(lat, lng, rot)
        const s = toScreen(p)
        if (!s.visible || s.b < 0.5) return
        const pulse = (Math.sin(t * 0.05 + lat) + 1) / 2
        ctx.beginPath()
        ctx.arc(s.sx, s.sy, 3 + pulse * 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${colors.node.join(',')},${0.28 * s.b})`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(s.sx, s.sy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colors.node.join(',')},${0.9 * s.b})`
        ctx.fill()
      })

      rot = (rot + 0.1) % 360
      t++
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [tone])

  return <canvas ref={canvasRef} className='h-full w-full' />
}

/* ── AuthLayout ──────────────────────────────────────────────── */

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const pageBackground = isDark
    ? 'linear-gradient(135deg,#020202 0%,#060606 48%,#0a0a0a 100%)'
    : 'linear-gradient(135deg,#eff6ff 0%,#f0f4ff 40%,#f5f3ff 100%)'
  const navPanelClass = isDark
    ? 'border-white/15 bg-zinc-950/92 shadow-[0_16px_42px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.12)] [&_[data-slot=button]]:text-zinc-500 [&_[data-slot=button]]:hover:bg-zinc-800/70 [&_[data-slot=button]]:hover:text-zinc-200'
    : 'border-indigo-200/45 bg-white/45 shadow-[0_10px_30px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.72)] [&_[data-slot=button]]:text-slate-600 [&_[data-slot=button]]:hover:bg-white/70 [&_[data-slot=button]]:hover:text-indigo-950'
  const chipStyle = isDark
    ? {
        borderColor: 'rgba(255,255,255,0.26)',
        color: '#f4f4f5',
        background: 'rgba(255,255,255,0.10)',
      }
    : {
        borderColor: 'rgba(99,102,241,0.25)',
        color: '#6366f1',
        background: 'rgba(99,102,241,0.06)',
      }

  return (
    <div
      className='flex min-h-screen flex-col overflow-x-hidden'
      style={{ background: pageBackground }}
    >
      {/* Top bar */}
      <header className='z-30 flex h-14 flex-shrink-0 items-center justify-end bg-transparent px-5 sm:px-8 lg:px-10'>
        <div
          className={`flex items-center gap-1 rounded-full border p-1 backdrop-blur-xl [&_[data-slot=button]]:rounded-full ${navPanelClass}`}
        >
          <ThemeSwitch />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Body */}
      <div className='relative flex flex-1 flex-col overflow-hidden lg:min-h-0 lg:flex-row'>
        <div
          className='pointer-events-none absolute z-0 opacity-55 lg:opacity-100'
          style={{
            width: 'clamp(760px, calc(91vw + 5px), 1870px)',
            height: 'clamp(620px, calc(100vh + 16vh - 48px), 1200px)',
            left: 'clamp(-545px, calc(-18vw - 175px), -245px)',
            top: 'clamp(154px, 19.5vh, 260px)',
          }}
        >
          <GlobeCanvas tone={resolvedTheme} />
        </div>

        {/* Left — overlay text */}
        <div className='relative z-10 min-w-0 shrink-0 overflow-visible lg:flex-1 lg:overflow-hidden'>
          <div className='pointer-events-none relative max-w-3xl px-6 pt-8 select-none sm:px-10 sm:pt-10 lg:px-14'>
            {isDark && (
              <div className='absolute -inset-x-8 -inset-y-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.08),rgba(255,255,255,0)_58%)]' />
            )}
            <p
              className='mb-3 max-w-[12rem] text-xs tracking-[0.2em] uppercase sm:max-w-none'
              style={{ color: isDark ? '#f4f4f5' : '#818cf8', fontWeight: 700 }}
            >
              {t('Global AI API Platform')}
            </p>
            <h2
              className='mb-3 max-w-[38rem]'
              style={{
                fontSize: 'clamp(2rem, 6.5vw, 2.1rem)',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#1e1b4b',
                lineHeight: 1.2,
                textShadow: isDark
                  ? '0 0 28px rgba(255,255,255,0.18)'
                  : undefined,
              }}
            >
              {t('Unified API, Connected World')}
            </h2>
            <p
              className='max-w-2xl text-sm leading-relaxed'
              style={{ color: isDark ? '#cbd5e1' : '#6b7280' }}
            >
              {t(
                'Aggregate DeepSeek, OpenAI, Anthropic and other mainstream providers. One key connects global leading AI models.'
              )}
            </p>
            <div className='mt-5 flex max-w-2xl flex-wrap gap-2'>
              {[
                'OpenAI Compatible',
                'Low Latency Routing',
                'Pay Per Use',
                'Global Nodes',
              ].map((f) => (
                <span
                  key={f}
                  className='rounded-full border px-3 py-1 text-xs'
                  style={chipStyle}
                >
                  {t(f)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right — auth card */}
        <div className='relative z-10 flex w-full flex-1 items-start justify-center px-4 pt-8 pb-10 sm:px-8 md:pt-12 lg:w-[460px] lg:flex-none lg:-translate-x-[55px] lg:-translate-y-[25px] lg:items-center lg:px-6 lg:pt-10 xl:mr-20'>
          <div className='w-full max-w-[360px] rounded-lg bg-white/95 p-7 shadow-[0_24px_76px_rgba(30,41,59,0.18),0_0_58px_rgba(255,255,255,0.74),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_34px_92px_rgba(30,41,59,0.22),0_0_84px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.95)] sm:max-w-[420px] sm:p-8 lg:max-w-[420px] dark:bg-zinc-900/92 dark:shadow-[0_34px_110px_rgba(0,0,0,0.9),0_0_72px_rgba(255,255,255,0.10),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.42)] dark:hover:bg-zinc-900 dark:hover:shadow-[0_46px_132px_rgba(0,0,0,0.96),0_0_98px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.46)]'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
