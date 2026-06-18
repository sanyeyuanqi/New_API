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
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicLayout } from '@/components/layout'
import { getAboutContent } from './api'

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const aboutStats = [
  { value: '118ms', labelKey: 'about.stats.latency' },
  { value: '99.9%', labelKey: 'about.stats.availability' },
  { value: '24/7', labelKey: 'about.stats.monitoring' },
]

const aboutFeatures = [
  {
    titleKey: 'about.features.unified.title',
    descriptionKey: 'about.features.unified.description',
  },
  {
    titleKey: 'about.features.routing.title',
    descriptionKey: 'about.features.routing.description',
  },
  {
    titleKey: 'about.features.usage.title',
    descriptionKey: 'about.features.usage.description',
  },
  {
    titleKey: 'about.features.security.title',
    descriptionKey: 'about.features.security.description',
  },
]

const workflowSteps = [
  {
    titleKey: 'about.workflow.create.title',
    descriptionKey: 'about.workflow.create.description',
  },
  {
    titleKey: 'about.workflow.choose.title',
    descriptionKey: 'about.workflow.choose.description',
  },
  {
    titleKey: 'about.workflow.call.title',
    descriptionKey: 'about.workflow.call.description',
  },
]

function AboutShowcase() {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const ctx = gsap.context(() => {
      gsap.set('.about-gsap-in', {
        autoAlpha: prefersReducedMotion ? 1 : 0,
        filter: 'blur(0px)',
        y: 0,
      })

      if (prefersReducedMotion) {
        return
      }

      gsap.fromTo(
        '.about-gsap-in',
        { autoAlpha: 0, filter: 'blur(10px)', y: 26 },
        {
          autoAlpha: 1,
          duration: 0.85,
          ease: 'power3.out',
          filter: 'blur(0px)',
          stagger: 0.12,
          y: 0,
        }
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className='relative min-h-svh overflow-hidden bg-[#f6f8fb] text-slate-950 dark:bg-[#050608] dark:text-white'
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,251,0.9)_52%,rgba(255,255,255,0.98))] dark:bg-[radial-gradient(circle_at_14%_10%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(45,212,191,0.12),transparent_28%),linear-gradient(180deg,rgba(5,6,8,0.98),rgba(8,12,18,0.94)_54%,rgba(5,6,8,1))]'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black_0%,transparent_68%)] bg-[size:76px_76px] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]'
      />

      <section className='relative mx-auto flex w-full max-w-[1480px] flex-col px-6 pt-28 pb-12 sm:pt-32 md:px-8'>
        <div className='about-gsap-in grid min-h-[390px] w-full items-center gap-12 border-b border-slate-950/10 pb-16 opacity-0 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-20 dark:border-white/10'>
          <div>
            <div className='inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-200'>
              <Sparkles className='size-3.5' />
              {t('about.hero.eyebrow')}
            </div>
            <h1 className='mt-7 max-w-3xl text-5xl leading-[0.96] font-semibold tracking-normal text-slate-950 sm:text-6xl lg:text-7xl dark:text-white'>
              {t('about.hero.title')}
            </h1>
            <p className='mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300'>
              {t('about.hero.description')}
            </p>
          </div>

          <div className='border-y border-slate-950/10 dark:border-white/10'>
            {aboutFeatures.slice(0, 3).map((feature) => (
              <div
                key={feature.titleKey}
                className='grid gap-4 border-b border-slate-950/10 py-7 last:border-b-0 sm:grid-cols-[150px_1fr] dark:border-white/10'
              >
                <h2 className='text-base font-semibold text-slate-950 dark:text-white'>
                  {t(feature.titleKey)}
                </h2>
                <p className='text-sm leading-7 text-slate-600 dark:text-slate-400'>
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='about-gsap-in mx-auto mt-12 grid w-full grid-cols-3 gap-4 opacity-0 sm:gap-8'>
          {aboutStats.map((stat) => (
            <div key={stat.labelKey} className='px-3 py-5 text-center sm:py-6'>
              <div className='text-xl font-semibold text-slate-950 sm:text-3xl dark:text-white'>
                {stat.value}
              </div>
              <div className='mt-2 text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400'>
                {t(stat.labelKey)}
              </div>
            </div>
          ))}
        </div>

        <div className='about-gsap-in mx-auto mt-16 grid w-full gap-10 border-b border-slate-950/10 pb-14 opacity-0 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 xl:gap-20 dark:border-white/10'>
          <div className='flex flex-col justify-center'>
            <div className='inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-200'>
              <Sparkles className='size-3.5' />
              {t('about.value.eyebrow')}
            </div>
            <h1 className='mt-5 max-w-xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl dark:text-white'>
              {t('about.value.title')}
            </h1>
            <p className='mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300'>
              {t('about.value.description')}
            </p>
          </div>

          <div className='grid gap-x-10 gap-y-8 sm:grid-cols-2'>
            {aboutFeatures.slice(1).map((feature) => (
              <div
                key={feature.titleKey}
                className='border-t border-slate-950/10 pt-5 dark:border-white/10'
              >
                <h2 className='text-base font-semibold text-slate-950 dark:text-white'>
                  {t(feature.titleKey)}
                </h2>
                <p className='mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400'>
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='about-gsap-in mx-auto mt-14 grid w-full gap-8 opacity-0 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14 xl:gap-20'>
          <div>
            <p className='text-xs font-semibold text-cyan-700 uppercase dark:text-cyan-200'>
              {t('about.quickStart.eyebrow')}
            </p>
            <h2 className='mt-3 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white'>
              {t('about.quickStart.title')}
            </h2>
          </div>

          <div className='divide-y divide-slate-950/10 dark:divide-white/10'>
            {workflowSteps.map((step, index) => (
              <div
                key={step.titleKey}
                className='grid gap-3 py-5 sm:grid-cols-[64px_1fr] sm:items-start'
              >
                <span className='text-sm font-semibold text-cyan-600 dark:text-cyan-200'>
                  0{index + 1}
                </span>
                <div>
                  <h3 className='text-base font-semibold text-slate-950 dark:text-white'>
                    {t(step.titleKey)}
                  </h3>
                  <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400'>
                    {t(step.descriptionKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='about-gsap-in mx-auto mt-12 mb-6 flex w-full flex-col gap-4 border-t border-slate-950/10 pt-8 opacity-0 sm:flex-row sm:items-center sm:justify-between dark:border-white/10'>
          <p className='max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300'>
            {t('about.footer.description')}
          </p>
          <div className='flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 uppercase dark:text-slate-400'>
            <span>{t('about.footer.tag.lowLatency')}</span>
            <span>{t('about.footer.tag.highAvailability')}</span>
            <span>{t('about.footer.tag.scalable')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidUrl(rawContent)

  if (isLoading) {
    return (
      <PublicLayout showMainContainer={false}>
        <div className='mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-3 pt-20 pb-10 sm:px-5 sm:pt-24 sm:pb-12 xl:px-6'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return (
      <PublicLayout showMainContainer={false}>
        <AboutShowcase />
      </PublicLayout>
    )
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <AboutShowcase />
    </PublicLayout>
  )
}
