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
import { getRollingDateRange, type TimeGranularity } from '@/lib/time'
import {
  DASHBOARD_CHART_PREFERENCES_STORAGE_KEY,
  DASHBOARD_MODEL_FILTERS_STORAGE_KEY,
  DEFAULT_DASHBOARD_CHART_PREFERENCES,
  DEFAULT_TIME_GRANULARITY,
  EMPTY_DASHBOARD_FILTERS,
  TIME_GRANULARITY_STORAGE_KEY,
  TIME_RANGE_PRESETS,
  TIME_RANGE_BY_GRANULARITY,
} from '@/features/dashboard/constants'
import type {
  ConsumptionDistributionChartType,
  DashboardChartPreferences,
  DashboardFilters,
  ModelAnalyticsChartTab,
} from '@/features/dashboard/types'

function isTimeGranularity(value: unknown): value is TimeGranularity {
  return value === 'hour' || value === 'day' || value === 'week'
}

function getLegacySavedGranularity(): TimeGranularity {
  if (typeof window === 'undefined') return DEFAULT_TIME_GRANULARITY
  const saved = localStorage.getItem(TIME_GRANULARITY_STORAGE_KEY)
  return isTimeGranularity(saved) ? saved : DEFAULT_TIME_GRANULARITY
}

function isConsumptionDistributionChartType(
  value: unknown
): value is ConsumptionDistributionChartType {
  return value === 'bar' || value === 'area'
}

function isModelAnalyticsChartTab(
  value: unknown
): value is ModelAnalyticsChartTab {
  return value === 'trend' || value === 'proportion' || value === 'top'
}

function isTimeRangePresetDays(value: unknown): value is number {
  return TIME_RANGE_PRESETS.some((preset) => preset.days === value)
}

function parseSavedDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function cleanFilters<T extends Record<string, unknown>>(
  filters: T
): Partial<T> {
  const cleaned: Partial<T> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) cleaned[key as keyof T] = trimmed as T[keyof T]
      continue
    }
    cleaned[key as keyof T] = value as T[keyof T]
  }
  return cleaned
}

export function getSavedGranularity(
  override?: TimeGranularity
): TimeGranularity {
  if (override) return override
  return getSavedChartPreferences().defaultTimeGranularity
}

export function saveGranularity(granularity: TimeGranularity): void {
  if (typeof window === 'undefined') return
  saveChartPreferences({
    ...getSavedChartPreferences(),
    defaultTimeGranularity: granularity,
  })
  localStorage.setItem(TIME_GRANULARITY_STORAGE_KEY, granularity)
}

export function getSavedChartPreferences(): DashboardChartPreferences {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_CHART_PREFERENCES

  const fallbackPreferences = {
    ...DEFAULT_DASHBOARD_CHART_PREFERENCES,
    defaultTimeGranularity: getLegacySavedGranularity(),
  }

  try {
    const raw = localStorage.getItem(DASHBOARD_CHART_PREFERENCES_STORAGE_KEY)
    if (!raw) return fallbackPreferences

    const parsed = JSON.parse(raw) as Partial<DashboardChartPreferences>
    return {
      consumptionDistributionChart: isConsumptionDistributionChartType(
        parsed.consumptionDistributionChart
      )
        ? parsed.consumptionDistributionChart
        : fallbackPreferences.consumptionDistributionChart,
      modelAnalyticsChart: isModelAnalyticsChartTab(parsed.modelAnalyticsChart)
        ? parsed.modelAnalyticsChart
        : fallbackPreferences.modelAnalyticsChart,
      defaultTimeRangeDays: isTimeRangePresetDays(parsed.defaultTimeRangeDays)
        ? parsed.defaultTimeRangeDays
        : fallbackPreferences.defaultTimeRangeDays,
      defaultTimeGranularity: isTimeGranularity(parsed.defaultTimeGranularity)
        ? parsed.defaultTimeGranularity
        : fallbackPreferences.defaultTimeGranularity,
    }
  } catch {
    return fallbackPreferences
  }
}

export function saveChartPreferences(
  preferences: DashboardChartPreferences
): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    DASHBOARD_CHART_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences)
  )
}

export function getSavedDashboardFilters(
  preferences: DashboardChartPreferences = getSavedChartPreferences()
): DashboardFilters {
  if (typeof window === 'undefined')
    return buildDefaultDashboardFilters(preferences)

  try {
    const raw = localStorage.getItem(DASHBOARD_MODEL_FILTERS_STORAGE_KEY)
    if (!raw) return buildDefaultDashboardFilters(preferences)

    const parsed = JSON.parse(raw) as Partial<{
      start_timestamp: string
      end_timestamp: string
      time_granularity: TimeGranularity
      username: string
      quick_range_days: number | null
    }>
    const timeGranularity = isTimeGranularity(parsed.time_granularity)
      ? parsed.time_granularity
      : preferences.defaultTimeGranularity
    const username = typeof parsed.username === 'string' ? parsed.username : ''
    const quickRangeDays = isTimeRangePresetDays(parsed.quick_range_days)
      ? parsed.quick_range_days
      : null

    if (quickRangeDays) {
      const { start, end } = getRollingDateRange(quickRangeDays)
      return {
        ...EMPTY_DASHBOARD_FILTERS,
        start_timestamp: start,
        end_timestamp: end,
        time_granularity: timeGranularity,
        username,
        quick_range_days: quickRangeDays,
      }
    }

    return {
      ...EMPTY_DASHBOARD_FILTERS,
      start_timestamp: parseSavedDate(parsed.start_timestamp),
      end_timestamp: parseSavedDate(parsed.end_timestamp),
      time_granularity: timeGranularity,
      username,
      quick_range_days: null,
    }
  } catch {
    return buildDefaultDashboardFilters(preferences)
  }
}

export function saveDashboardFilters(filters: DashboardFilters): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    DASHBOARD_MODEL_FILTERS_STORAGE_KEY,
    JSON.stringify({
      start_timestamp: filters.start_timestamp?.toISOString(),
      end_timestamp: filters.end_timestamp?.toISOString(),
      time_granularity: isTimeGranularity(filters.time_granularity)
        ? filters.time_granularity
        : DEFAULT_TIME_GRANULARITY,
      username: filters.username ?? '',
      quick_range_days: isTimeRangePresetDays(filters.quick_range_days)
        ? filters.quick_range_days
        : null,
    })
  )
}

export function getDefaultDays(granularity?: TimeGranularity): number {
  if (!granularity) return getSavedChartPreferences().defaultTimeRangeDays
  return TIME_RANGE_BY_GRANULARITY[getSavedGranularity(granularity)]
}

export function buildDefaultDashboardFilters(
  preferences: DashboardChartPreferences = getSavedChartPreferences()
): DashboardFilters {
  const { start, end } = getRollingDateRange(preferences.defaultTimeRangeDays)
  return {
    ...EMPTY_DASHBOARD_FILTERS,
    start_timestamp: start,
    end_timestamp: end,
    time_granularity: preferences.defaultTimeGranularity,
    quick_range_days: preferences.defaultTimeRangeDays,
  }
}

export function buildQueryParams(
  timeRange: { start_timestamp: number; end_timestamp: number },
  filters?: { time_granularity?: TimeGranularity; username?: string }
): {
  start_timestamp: number
  end_timestamp: number
  default_time: string
  username?: string
} {
  return {
    ...timeRange,
    default_time: getSavedGranularity(filters?.time_granularity),
    ...(filters?.username && { username: filters.username }),
  }
}
