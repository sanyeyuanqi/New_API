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
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { cn } from '@/lib/utils'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { useDashboardContentVisibility } from '../../hooks/use-status-data'
import { AnnouncementsPanel } from './announcements-panel'
import { ApiInfoPanel } from './api-info-panel'
import { FAQPanel } from './faq-panel'
import { PerformanceHealthPanel } from './performance-health-panel'
import { SummaryCards } from './summary-cards'
import { UptimePanel } from './uptime-panel'

export function OverviewDashboard() {
  const user = useAuthStore((state) => state.auth.user)
  const {
    apiInfo: showApiInfoPanel,
    announcements: showAnnouncementsPanel,
    faq: showFAQPanel,
    uptimeKuma: showUptimePanel,
  } = useDashboardContentVisibility()

  const isAdmin = Boolean(user?.role && user.role >= ROLE.ADMIN)
  const showLeftContentPanels =
    showApiInfoPanel || showAnnouncementsPanel || showFAQPanel
  const showContentPanels = showLeftContentPanels || showUptimePanel

  return (
    <div className='flex w-full flex-col gap-4'>
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          isAdmin && 'xl:grid-cols-[minmax(0,1fr)_clamp(28rem,31vw,36rem)]'
        )}
      >
        <div className='min-w-0'>
          <SummaryCards />
        </div>
        {isAdmin && (
          <div className='min-w-0'>
            <PerformanceHealthPanel />
          </div>
        )}
      </div>

      {showContentPanels && (
        <CardStaggerContainer className='grid grid-cols-1 gap-4'>
          <div
            className={cn(
              'grid min-w-0 grid-cols-1 gap-4',
              (showLeftContentPanels || showUptimePanel) && 'lg:grid-cols-2'
            )}
          >
            {showApiInfoPanel && (
              <CardStaggerItem>
                <ApiInfoPanel />
              </CardStaggerItem>
            )}
            {showAnnouncementsPanel && (
              <CardStaggerItem>
                <AnnouncementsPanel />
              </CardStaggerItem>
            )}
            {showFAQPanel && (
              <CardStaggerItem>
                <FAQPanel />
              </CardStaggerItem>
            )}
            {showUptimePanel && (
              <CardStaggerItem>
                <UptimePanel />
              </CardStaggerItem>
            )}
          </div>
        </CardStaggerContainer>
      )}
    </div>
  )
}
