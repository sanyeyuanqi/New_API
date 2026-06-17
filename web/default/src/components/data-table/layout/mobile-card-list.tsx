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
import * as React from 'react'
import {
  flexRender,
  type Cell,
  type Column,
  type Row,
  type Table,
} from '@tanstack/react-table'
import { Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadgeTypeContext } from '@/components/status-badge'

interface MobileCardListProps<TData> {
  table: Table<TData>
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  getRowKey?: (row: Row<TData>) => string | number
  getRowClassName?: (row: Row<TData>) => string | undefined
}

function getColumnLabel<TData>(column: Column<TData, unknown>) {
  const { header, meta } = column.columnDef
  if (typeof header === 'string') return header
  if (meta?.label) return meta.label
  return column.id
}

function getMobileColumnWidth<TData>(column: Column<TData, unknown>) {
  if (column.id === 'actions') return 96

  const size = column.getSize()
  if (!Number.isFinite(size) || size <= 0) return 140

  return Math.min(Math.max(size, 96), 240)
}

function renderCellContent<TData>(cell: Cell<TData, unknown>) {
  const cellRenderer = cell.column.columnDef.cell
  if (cellRenderer) {
    return flexRender(cellRenderer, cell.getContext())
  }
  return cell.getValue() as React.ReactNode
}

function MobileTableSkeleton() {
  return (
    <div className='border-border/50 bg-card overflow-hidden rounded-lg border'>
      <div className='bg-muted/30 grid grid-cols-[120px_140px_140px] border-b'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='px-3 py-2'>
            <Skeleton className='h-3 w-14 rounded' />
          </div>
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className='grid grid-cols-[120px_140px_140px] border-b last:border-b-0'
        >
          {[1, 2, 3].map((j) => (
            <div key={j} className='px-3 py-2.5'>
              <Skeleton className='h-4 w-full rounded' />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Mobile table view.
 *
 * The mobile presentation intentionally mirrors the desktop table: it renders
 * the current visible columns in one horizontal row per record and lets the
 * container scroll sideways when the selected fields exceed the viewport.
 */
export function MobileCardList<TData>(props: MobileCardListProps<TData>) {
  const {
    table,
    isLoading = false,
    emptyTitle,
    emptyDescription,
    getRowKey,
    getRowClassName,
  } = props
  const { t } = useTranslation()

  const resolvedEmptyTitle = emptyTitle ?? t('No Data')
  const resolvedEmptyDescription = emptyDescription ?? t('No data available')

  const columns = table
    .getVisibleLeafColumns()
    .filter((column) => column.id !== 'select')

  const gridTemplateColumns = columns
    .map((column) => `${getMobileColumnWidth(column)}px`)
    .join(' ')

  if (isLoading) {
    return <MobileTableSkeleton />
  }

  const rows = table.getRowModel().rows

  if (!rows || rows.length === 0) {
    return (
      <div className='rounded-lg border p-6'>
        <Empty className='border-none p-0'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Database className='size-6' />
            </EmptyMedia>
            <EmptyTitle>{resolvedEmptyTitle}</EmptyTitle>
            <EmptyDescription>{resolvedEmptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className='border-border/50 bg-card overflow-x-auto rounded-lg border'>
      <div className='min-w-max'>
        <div
          style={{ gridTemplateColumns }}
          className='bg-muted/30 border-border/50 grid border-b'
        >
          {columns.map((column) => (
            <div
              key={column.id}
              className='text-muted-foreground px-3 py-2 text-[12px] leading-none font-medium'
            >
              {t(getColumnLabel(column))}
            </div>
          ))}
        </div>

        {rows.map((row) => {
          const key = getRowKey ? getRowKey(row) : row.id
          const cellByColumnId = new Map(
            row.getVisibleCells().map((cell) => [cell.column.id, cell])
          )

          return (
            <div
              key={key}
              style={{ gridTemplateColumns }}
              className={cn(
                'border-border/40 grid border-b last:border-b-0',
                getRowClassName?.(row)
              )}
            >
              {columns.map((column) => {
                const cell = cellByColumnId.get(column.id)

                return (
                  <div
                    key={column.id}
                    className='min-w-0 px-3 py-2.5 text-[12px] leading-tight [&_button]:max-w-full [&_span]:max-w-full'
                  >
                    <StatusBadgeTypeContext.Provider value='text'>
                      <div className='min-w-0 truncate [&_*]:truncate'>
                        {cell ? renderCellContent(cell) : '-'}
                      </div>
                    </StatusBadgeTypeContext.Provider>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
