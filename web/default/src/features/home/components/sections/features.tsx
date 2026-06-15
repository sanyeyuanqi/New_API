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
import {
  Zap,
  Shield,
  Globe,
  Code,
  Gauge,
  DollarSign,
  Users,
  HeartHandshake,
} from 'lucide-react'
import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const features = [
    {
      id: 'fast',
      num: '01',
      title: '统一模型接入',
      desc: '把多家服务商收敛为统一协议，业务侧只维护一套调用方式。',
      span: 'md:col-span-2',
      icon: <Zap className='size-4 text-blue-400' />,
      visual: (
        <div className='mt-4 grid grid-cols-3 gap-2'>
          {['OpenAI', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'Llama'].map(
            (name) => (
              <div
                key={name}
                className='border-border/30 bg-muted/20 text-muted-foreground flex items-center justify-center rounded-lg border px-3 py-2 text-xs transition-colors duration-300 hover:border-blue-500/30 hover:bg-blue-500/5'
              >
                {name}
              </div>
            )
          )}
        </div>
      ),
    },
    {
      id: 'secure',
      num: '02',
      title: '权限与密钥治理',
      desc: '按用户、分组和场景控制访问范围，让密钥流转更清晰。',
      span: 'md:col-span-1',
      icon: <Shield className='size-4 text-emerald-400' />,
      visual: (
        <div className='mt-4 flex items-center justify-center'>
          <div className='relative'>
            <div className='flex size-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5'>
              <Shield
                className='size-7 text-emerald-500/70'
                strokeWidth={1.5}
              />
            </div>
            <div className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500'>
              <svg
                className='size-2.5 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={3}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m4.5 12.75 6 6 9-13.5'
                />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'global',
      num: '03',
      title: '智能路由策略',
      desc: '围绕延迟、可用率和成本自动分配请求，保持服务稳定。',
      span: 'md:col-span-1',
      icon: <Globe className='size-4 text-violet-400' />,
      visual: (
        <div className='mt-4 space-y-2'>
          {['负载均衡', '速率限制', '成本跟踪'].map(
            (step, i) => (
              <div key={step} className='flex items-center gap-2'>
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 1
                      ? 'border border-blue-500/30 bg-blue-500/20 text-blue-500'
                      : 'border-border/40 bg-muted text-muted-foreground border'
                  }`}
                >
                  {i + 1}
                </div>
                <div className='bg-border/40 h-px flex-1' />
                <span className='text-muted-foreground text-xs'>{step}</span>
              </div>
            )
          )}
        </div>
      ),
    },
    {
      id: 'developer',
      num: '04',
      title: '调用观测闭环',
      desc: '记录用量、成本、错误和性能数据，为运营决策提供依据。',
      span: 'md:col-span-2',
      icon: <Code className='size-4 text-amber-400' />,
      visual: (
        <div className='mt-4 flex items-center gap-3'>
          <div className='flex -space-x-2'>
            {['API', 'SDK', 'CLI', '日志'].map((n) => (
              <div
                key={n}
                className='border-background from-muted to-muted/60 text-muted-foreground flex size-8 items-center justify-center rounded-full border-2 bg-gradient-to-br text-[9px] font-bold'
              >
                {n}
              </div>
            ))}
          </div>
          <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
            <Code className='size-3.5 text-blue-500' />
            多协议兼容
          </div>
        </div>
      ),
    },
  ]

  const additionalFeatures = [
    {
      icon: <Gauge className='size-5' strokeWidth={1.5} />,
      title: '高并发承载',
      desc: '面向真实生产流量设计，支持队列、重试与熔断策略。',
    },
    {
      icon: <DollarSign className='size-5' strokeWidth={1.5} />,
      title: '精细化计费',
      desc: '按模型、分组、渠道统计成本，额度消耗实时可见。',
    },
    {
      icon: <Users className='size-5' strokeWidth={1.5} />,
      title: '团队协作',
      desc: '支持多角色、多分组管理，降低组织级接入成本。',
    },
    {
      icon: <HeartHandshake className='size-5' strokeWidth={1.5} />,
      title: '自托管可控',
      desc: '核心链路掌握在自己手中，方便扩展和私有化部署。',
    },
  ]

  return (
    <section className='relative z-10 px-6 py-20 md:px-8 md:py-28'>
      <div className='mx-auto max-w-[1480px]'>
        <AnimateInView className='mb-12 max-w-2xl'>
          <p className='mb-3 text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500'>
            核心能力
          </p>
          <h2 className='text-3xl leading-tight font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-white'>
            从接入到治理，
            <br />
            让 AI 调用进入可运营状态
          </h2>
        </AnimateInView>

        {/* Bento grid */}
        <div className='grid gap-5 md:grid-cols-3'>
          {features.map((f, i) => (
            <AnimateInView
              key={f.id}
              delay={i * 100}
              animation='scale-in'
              className={`group rounded-[1.5rem] border border-white/70 bg-white/68 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.075)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_30px_95px_rgba(15,23,42,0.12)] md:p-8 dark:border-white/10 dark:bg-white/[0.055] dark:shadow-[0_22px_70px_rgba(0,0,0,0.34)] dark:hover:bg-white/[0.075] ${f.span}`}
            >
              <div className='mb-3 flex items-center gap-3'>
                <span className='flex size-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500 tabular-nums dark:border-white/10 dark:bg-black/20 dark:text-slate-400'>
                  {f.num}
                </span>
                <h3 className='text-sm font-semibold text-slate-950 dark:text-slate-100'>
                  {f.title}
                </h3>
              </div>
              <p className='text-sm leading-relaxed text-slate-500 dark:text-slate-400'>
                {f.desc}
              </p>
              {f.visual}
            </AnimateInView>
          ))}
        </div>

        {/* Additional features row */}
        <div className='mt-10 grid grid-cols-2 gap-5 md:grid-cols-4'>
          {additionalFeatures.map((f, i) => (
            <AnimateInView
              key={f.title}
              delay={i * 100}
              animation='fade-up'
              className='rounded-[1.25rem] border border-white/70 bg-white/52 px-5 py-7 text-center shadow-[0_18px_58px_rgba(15,23,42,0.055)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]'
            >
              <div className='mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors dark:border-white/10 dark:bg-black/20 dark:text-slate-400'>
                {f.icon}
              </div>
              <h3 className='mb-1.5 text-sm font-semibold text-slate-950 dark:text-slate-100'>
                {f.title}
              </h3>
              <p className='mx-auto max-w-[200px] text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                {f.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
