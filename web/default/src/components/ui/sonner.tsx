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
'use client'

import type { CSSProperties } from 'react'
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-provider'

const Toaster = (props: ToasterProps) => {
  const { resolvedTheme } = useTheme()
  const { toastOptions, ...sonnerProps } = props

  return (
    <Sonner
      theme={resolvedTheme}
      className='toaster group'
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            'min-h-12 w-[min(340px,calc(100vw-2rem))] rounded-xl border px-4 py-3 pr-10 !shadow-[0_14px_34px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:!shadow-[0_16px_42px_rgba(0,0,0,0.45)]',
          error:
            'border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-100',
          success:
            'border-emerald-200 bg-white text-emerald-600 dark:border-emerald-500/25 dark:bg-zinc-950 dark:text-emerald-300',
          warning:
            'border-amber-200 bg-white text-amber-600 dark:border-amber-500/25 dark:bg-zinc-950 dark:text-amber-300',
          info: 'border-sky-200 bg-white text-sky-600 dark:border-sky-500/25 dark:bg-zinc-950 dark:text-sky-300',
          title: 'text-sm font-medium leading-5',
          description: 'text-muted-foreground text-xs leading-5',
          icon: 'mt-0.5',
          closeButton:
            '!top-3 !right-3 !left-auto !translate-x-0 !translate-y-0 border-transparent bg-transparent text-slate-400 shadow-none transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200',
          ...toastOptions?.classNames,
        },
      }}
      icons={{
        success: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            className='size-4'
          />
        ),
        error: null,
        loading: (
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className='size-4 animate-spin'
          />
        ),
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg':
            'color-mix(in oklch, var(--success) 16%, var(--popover))',
          '--success-border':
            'color-mix(in oklch, var(--success) 35%, var(--border))',
          '--success-text': 'var(--success)',
          '--info-bg': 'color-mix(in oklch, var(--info) 16%, var(--popover))',
          '--info-border':
            'color-mix(in oklch, var(--info) 35%, var(--border))',
          '--info-text': 'var(--info)',
          '--warning-bg':
            'color-mix(in oklch, var(--warning) 18%, var(--popover))',
          '--warning-border':
            'color-mix(in oklch, var(--warning) 38%, var(--border))',
          '--warning-text': 'var(--warning)',
          '--error-bg': 'color-mix(in oklch, var(--destructive) 4%, white)',
          '--error-border':
            'color-mix(in oklch, var(--destructive) 24%, var(--border))',
          '--error-text': 'var(--destructive)',
          '--border-radius': '12px',
          '--width': '340px',
        } as CSSProperties
      }
      {...sonnerProps}
    />
  )
}

export { Toaster }
