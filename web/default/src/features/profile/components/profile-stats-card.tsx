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
import { Activity, BarChart3, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCompactNumber, formatQuota } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '../types'

type ProfileStatsCardProps = {
  profile: UserProfile | null
  loading: boolean
}

export function ProfileStatsCard({ profile, loading }: ProfileStatsCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <Card className='gap-0 overflow-hidden py-0'>
        <CardContent className='divide-border/60 grid grid-cols-3 divide-x p-0'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='px-3 py-3 sm:px-5 sm:py-4'>
              <Skeleton className='h-3.5 w-20' />
              <Skeleton className='mt-2 h-7 w-24' />
              <Skeleton className='mt-1.5 h-3.5 w-20' />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  const stats = [
    {
      label: t('Current Balance'),
      value: formatQuota(profile.quota),
      description: t('Remaining quota'),
      icon: WalletCards,
    },
    {
      label: t('Total Usage'),
      value: formatQuota(profile.used_quota),
      description: t('Total consumed quota'),
      icon: BarChart3,
    },
    {
      label: t('API Requests'),
      value: formatCompactNumber(profile.request_count),
      description: t('Total requests made'),
      icon: Activity,
    },
  ]

  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardContent className='divide-border/60 grid grid-cols-3 divide-x p-0'>
        {stats.map((item) => (
          <div key={item.label} className='min-w-0 px-3 py-3 sm:px-5 sm:py-4'>
            <div className='flex items-center gap-2'>
              <item.icon className='text-muted-foreground/60 size-3.5 shrink-0' />
              <div className='text-muted-foreground truncate text-xs font-medium tracking-wider uppercase'>
                {item.label}
              </div>
            </div>

            <div className='text-foreground mt-1.5 truncate font-mono text-lg font-bold tracking-tight tabular-nums sm:mt-2 sm:text-2xl'>
              {item.value}
            </div>
            <div className='text-muted-foreground/60 mt-1 hidden text-xs md:block'>
              {item.description}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
