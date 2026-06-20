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
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { getUserGroups } from '@/lib/api'
import { formatQuota, formatTimestampToDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GroupBadge } from '@/components/group-badge'
import { StatusBadge } from '@/components/status-badge'
import { API_KEY_STATUSES } from '../constants'
import { type ApiKey } from '../types'
import {
  ApiKeyCell,
  ModelLimitsCell,
  IpRestrictionsCell,
} from './api-keys-cells'
import { DataTableRowActions } from './data-table-row-actions'

function useGroupRatios(): Record<string, number> {
  const { data } = useQuery({
    queryKey: ['user-self-groups'],
    queryFn: getUserGroups,
    staleTime: 5 * 60 * 1000,
    select: (res) => {
      if (!res.success || !res.data) return {}
      const ratios: Record<string, number> = {}
      for (const [group, info] of Object.entries(res.data)) {
        if (typeof info.ratio === 'number') {
          ratios[group] = info.ratio
        }
      }
      return ratios
    },
  })

  return data ?? {}
}

export function useApiKeysColumns(): ColumnDef<ApiKey>[] {
  const { t } = useTranslation()
  const groupRatios = useGroupRatios()
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'name',
      header: t('Name'),
      cell: ({ row }) => (
        <div className='max-w-[200px] truncate font-medium'>
          {row.getValue('name')}
        </div>
      ),
      size: 180,
      meta: { mobileTitle: true },
    },
    {
      accessorKey: 'status',
      header: t('Status'),
      cell: ({ row }) => {
        const statusConfig = API_KEY_STATUSES[row.getValue('status') as number]
        if (!statusConfig) return null
        return (
          <StatusBadge
            label={t(statusConfig.label)}
            variant={statusConfig.variant}
            copyable={false}
            className='-ml-1.5'
          />
        )
      },
      filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
      size: 120,
      meta: { mobileBadge: true },
    },
    {
      id: 'key',
      accessorKey: 'key',
      header: 'Key',
      cell: ({ row }) => <ApiKeyCell apiKey={row.original} />,
      enableSorting: false,
      size: 260,
    },
    {
      id: 'quota',
      accessorKey: 'remain_quota',
      header: t('Used / Remaining'),
      cell: ({ row }) => {
        const apiKey = row.original
        const used = apiKey.used_quota
        const remaining = apiKey.remain_quota
        const total = used + remaining
        const usedDisplay = formatQuota(used)
        const remainingDisplay = apiKey.unlimited_quota
          ? t('Unlimited')
          : formatQuota(remaining)
        const usedLabel = `${t('Used:')} ${usedDisplay}`
        const remainingLabel = `${t('Remaining:')} ${remainingDisplay}`
        const valueBadgeClassName =
          'rounded-none bg-transparent px-0 !font-mono !text-[13px] !font-medium tabular-nums shadow-none'
        const renderQuotaValue = (value: string) => (
          <span className='min-w-0 truncate !font-mono !text-[13px] leading-normal !font-medium tabular-nums'>
            {value}
          </span>
        )

        return (
          <TooltipProvider>
            <div className='flex min-w-0 items-center justify-start gap-2 whitespace-nowrap'>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <StatusBadge
                      variant='neutral'
                      size='sm'
                      copyable={false}
                      showDot={false}
                      className={`cursor-help font-mono ${valueBadgeClassName}`}
                    >
                      {renderQuotaValue(usedDisplay)}
                    </StatusBadge>
                  }
                />
                <TooltipContent>
                  <p>{usedLabel}</p>
                </TooltipContent>
              </Tooltip>
              <span className='text-muted-foreground/70 px-0.5 font-mono text-[13px]'>
                /
              </span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <StatusBadge
                      variant={apiKey.unlimited_quota ? 'neutral' : 'success'}
                      size='sm'
                      copyable={false}
                      showDot={false}
                      className={`cursor-help font-mono ${valueBadgeClassName}`}
                    >
                      {renderQuotaValue(remainingDisplay)}
                    </StatusBadge>
                  }
                />
                <TooltipContent>
                  <div className='space-y-1 text-xs'>
                    <p>{remainingLabel}</p>
                    {!apiKey.unlimited_quota && (
                      <p>
                        {t('Total:')} {formatQuota(total)}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )
      },
      size: 190,
    },
    {
      accessorKey: 'group',
      header: t('Group'),
      cell: ({ row }) => {
        const apiKey = row.original
        const group = row.getValue('group') as string
        const ratio = group && group !== 'auto' ? groupRatios[group] : undefined

        if (group === 'auto') {
          return (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className='inline-flex items-center gap-1.5 text-xs' />
                }
              >
                <GroupBadge group='auto' />
                {apiKey.cross_group_retry && (
                  <StatusBadge
                    label={t('Cross-group')}
                    variant='info'
                    copyable={false}
                  />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <span className='text-xs'>
                  {t(
                    'Automatically selects the best available group with circuit breaker mechanism'
                  )}
                </span>
              </TooltipContent>
            </Tooltip>
          )
        }
        return <GroupBadge group={group} ratio={ratio} />
      },
      size: 160,
      meta: { mobileHidden: true },
    },
    {
      id: 'model_limits',
      accessorKey: 'model_limits',
      header: t('Models'),
      cell: ({ row }) => <ModelLimitsCell apiKey={row.original} />,
      enableSorting: false,
      size: 160,
      meta: { mobileHidden: true },
    },
    {
      id: 'allow_ips',
      accessorKey: 'allow_ips',
      header: t('IP Restriction'),
      cell: ({ row }) => <IpRestrictionsCell apiKey={row.original} />,
      enableSorting: false,
      size: 160,
      meta: { mobileHidden: true },
    },
    {
      accessorKey: 'created_time',
      header: t('Created'),
      cell: ({ row }) => (
        <span className='text-muted-foreground block truncate font-mono text-xs tabular-nums'>
          {formatTimestampToDate(row.getValue('created_time'))}
        </span>
      ),
      size: 180,
      meta: { mobileHidden: true },
    },
    {
      accessorKey: 'accessed_time',
      header: t('Last Used'),
      cell: ({ row }) => {
        const accessedTime = row.getValue('accessed_time') as number
        if (!accessedTime) {
          return <span className='text-muted-foreground text-xs'>-</span>
        }
        return (
          <span className='text-muted-foreground block truncate font-mono text-xs tabular-nums'>
            {formatTimestampToDate(accessedTime)}
          </span>
        )
      },
      size: 180,
      meta: { mobileHidden: true },
    },
    {
      accessorKey: 'expired_time',
      header: t('Expires'),
      cell: ({ row }) => {
        const expiredTime = row.getValue('expired_time') as number
        if (expiredTime === -1) {
          return (
            <StatusBadge
              label={t('Never')}
              variant='neutral'
              copyable={false}
              className='-ml-1.5'
            />
          )
        }
        const isExpired = expiredTime * 1000 < Date.now()
        return (
          <span
            className={cn(
              'block truncate font-mono text-xs tabular-nums',
              isExpired ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {formatTimestampToDate(expiredTime)}
          </span>
        )
      },
      size: 180,
      meta: { mobileHidden: true },
    },
    {
      id: 'actions',
      header: () => t('Actions'),
      cell: ({ row }) => <DataTableRowActions row={row} />,
      meta: { pinned: 'right' as const },
      size: 88,
    },
  ]
}
