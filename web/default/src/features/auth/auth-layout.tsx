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

type GlobeNode = {
  lat: number
  lng: number
  name?: string
  label?: boolean
}

type BrandIntroProps = {
  isDark: boolean
  compact?: boolean
  chipStyle: React.CSSProperties
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
      globeStart: isDark ? 'rgba(255,255,255,0.105)' : 'rgba(219,234,254,0.48)',
      globeEnd: isDark ? 'rgba(255,255,255,0.018)' : 'rgba(191,219,254,0.16)',
      globeStroke: isDark ? 'rgba(226,232,240,0.28)' : 'rgba(147,197,253,0.58)',
      grid: isDark ? 'rgba(226,232,240,0.10)' : 'rgba(147,197,253,0.28)',
      meridian: isDark ? 'rgba(226,232,240,0.075)' : 'rgba(147,197,253,0.20)',
      dot: isDark ? [226, 232, 240] : [96, 165, 250],
      dotBase: isDark ? 0.22 : 0.2,
      dotBoost: isDark ? 0.46 : 0.48,
      arc: isDark ? 'rgba(226,232,240,0.50)' : 'rgba(79,70,229,0.58)',
      node: isDark ? [248, 250, 252] : [99, 102, 241],
      labelText: isDark ? 'rgba(248,250,252,0.82)' : 'rgba(49,46,129,0.86)',
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
    const R = () => Math.min(W(), H()) * 0.46

    const DOTS: { lat: number; lng: number }[] = []
    for (let lat = -80; lat <= 80; lat += 8) {
      const r = Math.cos((lat * Math.PI) / 180)
      const count = Math.max(1, Math.round(r * 30))
      for (let i = 0; i < count; i++) {
        DOTS.push({ lat, lng: (i / count) * 360 })
      }
    }

    const NODES: GlobeNode[] = [
      { lat: 40, lng: -74, name: 'New York' },
      { lat: 51, lng: 0, name: 'London' },
      { lat: 35, lng: 139, name: 'Tokyo' },
      { lat: 31, lng: 121, name: 'Shanghai' },
      { lat: 37, lng: -122, name: 'San Francisco' },
      { lat: 1, lng: 103, name: 'Singapore' },
      { lat: -33, lng: 151, name: 'Sydney' },
      { lat: 48, lng: 2, name: 'Paris' },
      { lat: 52, lng: 13, name: 'Berlin' },
      { lat: 25, lng: 55, name: 'Dubai' },
      { lat: 19, lng: 72, name: 'Mumbai' },
      { lat: 37, lng: 127, name: 'Seoul' },
      { lat: 22, lng: 114, name: 'Hong Kong' },
      { lat: 25, lng: 121, name: 'Taipei' },
      { lat: 13, lng: 100, name: 'Bangkok' },
      { lat: -6, lng: 106, name: 'Jakarta' },
      { lat: 49, lng: -123, name: 'Vancouver' },
      { lat: 43, lng: -79, name: 'Toronto' },
      { lat: 34, lng: -118, name: 'Los Angeles' },
      { lat: 19, lng: -99, name: 'Mexico City' },
      { lat: -23, lng: -46, name: 'Sao Paulo' },
      { lat: -34, lng: -58, name: 'Buenos Aires' },
      { lat: 59, lng: 18, name: 'Stockholm' },
      { lat: 41, lng: 29, name: 'Istanbul' },
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
      [1, 8],
      [8, 15],
      [15, 9],
      [9, 2],
      [2, 11],
      [11, 3],
      [3, 12],
      [12, 5],
      [5, 14],
      [14, 7],
      [4, 16],
      [16, 10],
      [10, 0],
      [0, 17],
      [17, 18],
      [18, 19],
      [19, 6],
      [7, 23],
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

      NODES.forEach(({ lat, lng, name, label = true }) => {
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

        if (!name || !label || s.b < 0.63) return
        const labelY = s.sy + 15
        ctx.font = '600 11px "Public Sans", Inter, system-ui, sans-serif'
        const metrics = ctx.measureText(name)
        const labelX = s.sx - metrics.width / 2
        ctx.save()
        ctx.shadowColor = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.95)'
        ctx.shadowBlur = 5
        ctx.lineWidth = 3
        ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.42)' : 'rgba(255,255,255,0.88)'
        ctx.strokeText(name, labelX, labelY)
        ctx.fillStyle = colors.labelText
        ctx.fillText(name, labelX, labelY)
        ctx.restore()
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

function BrandIntro({ isDark, compact = false, chipStyle }: BrandIntroProps) {
  const { t } = useTranslation()

  return (
    <>
      {isDark && !compact && (
        <div className='absolute -inset-x-8 -inset-y-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.08),rgba(255,255,255,0)_58%)]' />
      )}
      <p
        className='mb-2 max-w-full text-xs tracking-[0.18em] uppercase sm:mb-3 sm:tracking-[0.2em]'
        style={{ color: isDark ? '#e5e7eb' : '#818cf8', fontWeight: 700 }}
      >
        {t('Global AI API Platform')}
      </p>
      <h2
        className={
          compact
            ? 'mb-2 max-w-[min(100%,36rem)] break-words sm:mb-3'
            : 'mb-3 max-w-[38rem]'
        }
        style={{
          fontSize: compact
            ? 'clamp(1.85rem, 8.5vw, 2.55rem)'
            : 'clamp(2.1rem, 5.4vw, 3rem)',
          fontWeight: 800,
          color: isDark ? '#f8fafc' : '#1e1b4b',
          lineHeight: compact ? 1.12 : 1.2,
          textShadow: isDark
            ? '0 0 28px rgba(255,255,255,0.18)'
            : undefined,
        }}
      >
        {t('Unified API, Connected World')}
      </h2>
      <p
        className={
          compact
            ? 'max-w-[42rem] text-sm leading-relaxed sm:text-[15px]'
            : 'hidden max-w-[42rem] text-sm leading-relaxed sm:block sm:text-[15px]'
        }
        style={{ color: isDark ? '#aeb7c6' : '#6b7280' }}
      >
        {t(
          'Aggregate DeepSeek, OpenAI, Anthropic and other mainstream providers. One key connects global leading AI models.'
        )}
      </p>
      {!compact && (
        <div className='mt-5 hidden max-w-2xl flex-wrap gap-2 sm:flex'>
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
      )}
    </>
  )
}

/* ── AuthLayout ──────────────────────────────────────────────── */

export function AuthLayout({ children }: AuthLayoutProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const pageBackground = isDark
    ? 'radial-gradient(circle at 82% 43%,rgba(255,255,255,0.045),rgba(255,255,255,0) 22%),linear-gradient(180deg,#030303 0%,#070707 48%,#030303 100%)'
    : 'radial-gradient(circle at 78% 36%,rgba(255,255,255,0.82),rgba(255,255,255,0) 28%),linear-gradient(135deg,#edf6ff 0%,#f3f6ff 46%,#f6f2ff 100%)'
  const navPanelClass = isDark
    ? 'border-white/12 bg-zinc-950/72 shadow-[0_14px_38px_rgba(0,0,0,0.84),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.08)] [&_[data-slot=button]]:text-zinc-500 [&_[data-slot=button]]:hover:bg-zinc-800/70 [&_[data-slot=button]]:hover:text-zinc-200'
    : 'border-indigo-200/45 bg-white/45 shadow-[0_10px_30px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.72)] [&_[data-slot=button]]:text-slate-600 [&_[data-slot=button]]:hover:bg-white/70 [&_[data-slot=button]]:hover:text-indigo-950'
  const chipStyle = isDark
    ? {
        borderColor: 'rgba(255,255,255,0.22)',
        color: '#d4d4d8',
        background: 'rgba(255,255,255,0.08)',
      }
    : {
        borderColor: 'rgba(99,102,241,0.25)',
        color: '#6366f1',
        background: 'rgba(99,102,241,0.06)',
      }
  const authCardSurfaceClass = isDark
    ? 'border-white/12 bg-[#18181b]/95 shadow-[0_28px_96px_rgba(0,0,0,0.86),0_10px_34px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.026),inset_0_1px_0_rgba(255,255,255,0.085),inset_0_-1px_0_rgba(0,0,0,0.52)] lg:bg-[#18181b]/94 lg:shadow-[0_36px_128px_rgba(0,0,0,0.92),0_12px_46px_rgba(0,0,0,0.68),0_0_64px_rgba(255,255,255,0.042),inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-1px_0_rgba(0,0,0,0.54)] lg:hover:bg-[#1b1b1f] lg:hover:shadow-[0_44px_150px_rgba(0,0,0,0.96),0_14px_54px_rgba(0,0,0,0.72),0_0_82px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.56)]'
    : 'border-white/70 bg-white/92 shadow-[0_22px_70px_rgba(79,70,229,0.14),0_14px_42px_rgba(30,41,59,0.10),inset_0_1px_0_rgba(255,255,255,0.92)] lg:bg-white/88 lg:shadow-[0_28px_90px_rgba(79,70,229,0.16),0_18px_54px_rgba(30,41,59,0.12),0_0_60px_rgba(255,255,255,0.78),inset_0_1px_0_rgba(255,255,255,0.92)] lg:hover:bg-white/94 lg:hover:shadow-[0_36px_104px_rgba(79,70,229,0.18),0_22px_62px_rgba(30,41,59,0.15),0_0_86px_rgba(255,255,255,0.88),inset_0_1px_0_rgba(255,255,255,0.98)]'

  return (
    <div
      className='flex min-h-screen flex-col overflow-x-hidden'
      style={{ background: pageBackground }}
    >
      {/* Top bar */}
      <header className='z-30 flex h-12 flex-shrink-0 items-center justify-end bg-transparent px-4 sm:px-6 lg:h-16 lg:px-10'>
        <div
          className={`flex items-center gap-1 rounded-full border p-1 backdrop-blur-xl [&_[data-slot=button]]:rounded-full ${navPanelClass}`}
        >
          <ThemeSwitch />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Body */}
      <div className='relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto lg:min-h-0 lg:flex-row lg:overflow-hidden'>
        <div
          className='pointer-events-none absolute z-0 hidden opacity-60 lg:block lg:opacity-100'
          style={{
            width: 'clamp(850px, calc(96vw + 120px), 2050px)',
            height: 'clamp(700px, calc(108vh + 18vh - 44px), 1320px)',
            left: 'clamp(-565px, calc(-20vw - 165px), -245px)',
            top: 'clamp(142px, 18vh, 250px)',
          }}
        >
          <GlobeCanvas tone={resolvedTheme} />
        </div>

        {/* Left — overlay text */}
        <div className='relative z-10 hidden min-w-0 shrink-0 overflow-visible lg:block lg:flex-1 lg:overflow-hidden'>
          <div className='pointer-events-none relative max-w-3xl px-6 pt-7 select-none sm:px-10 sm:pt-9 lg:px-14 lg:pt-8 xl:px-16'>
            <BrandIntro isDark={isDark} chipStyle={chipStyle} />
          </div>
        </div>

        <div className='relative z-10 px-4 pt-1 pb-5 select-none sm:px-8 sm:pt-3 sm:pb-6 md:px-10 lg:hidden'>
          <BrandIntro isDark={isDark} compact chipStyle={chipStyle} />
        </div>

        {/* Right — auth card */}
        <div
          className='relative z-10 flex w-full flex-1 items-start justify-center px-4 pt-0 pb-8 sm:px-6 md:px-10 lg:mr-[clamp(24px,6vw,128px)] lg:w-[clamp(340px,38vw,480px)] lg:flex-none lg:items-center lg:px-[clamp(12px,2vw,24px)] lg:pt-8 lg:pb-8 lg:[transform:translate(clamp(-56px,-5vw,-12px),clamp(-72px,-6vw,-32px))]'
        >
          <div
            className={`w-full max-w-[min(420px,100%)] rounded-xl border p-5 backdrop-blur-xl transition-all duration-300 ease-out sm:p-7 md:p-8 lg:max-w-[min(410px,100%)] lg:hover:-translate-y-1 ${authCardSurfaceClass}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
