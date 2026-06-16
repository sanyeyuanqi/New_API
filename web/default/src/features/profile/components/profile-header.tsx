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
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getRoleLabel } from '@/lib/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/status-badge'
import { getUserInitials, getDisplayName } from '../lib'
import type { UserProfile } from '../types'
import { EmailBindDialog } from './dialogs/email-bind-dialog'

// ============================================================================
// Profile Header Component
// ============================================================================

interface ProfileHeaderProps {
  profile: UserProfile | null
  loading: boolean
  onProfileUpdate: () => void
}

export function ProfileHeader({
  profile,
  loading,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const { t } = useTranslation()
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  if (loading) {
    return (
      <div className='bg-card overflow-hidden rounded-lg border'>
        <div className='p-4 sm:p-5'>
          <div className='flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left'>
            <Skeleton className='h-16 w-16 rounded-2xl' />
            <div className='space-y-3'>
              <div className='flex flex-col items-center gap-2 sm:flex-row sm:justify-start'>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-5 w-16' />
              </div>
              <div className='flex flex-col items-center gap-1 sm:flex-row sm:justify-start sm:gap-4'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-4 w-20' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const initials = getUserInitials(profile)
  const roleLabel = getRoleLabel(profile.role)

  return (
    <div className='bg-card overflow-hidden rounded-lg border'>
      <div className='p-3 sm:p-5'>
        <div className='flex flex-col gap-4 text-left lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex min-w-0 items-center gap-3 sm:gap-4'>
          <Avatar className='ring-background h-12 w-12 rounded-xl text-sm ring-2 sm:h-16 sm:w-16 sm:rounded-2xl sm:text-lg sm:ring-4'>
            <AvatarFallback className='bg-primary/10 text-primary rounded-xl sm:rounded-2xl'>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1 space-y-1.5 sm:space-y-3'>
            <div className='flex min-w-0 items-center gap-2'>
              <h1 className='truncate text-xl font-semibold tracking-tight sm:text-2xl'>
                {displayName}
              </h1>
              <StatusBadge
                label={roleLabel}
                variant='neutral'
                copyable={false}
              />
              <StatusBadge
                label={`${t('User ID')} ${profile.id}`}
                variant='info'
                copyText={String(profile.id)}
              />
            </div>

            <div className='text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:gap-x-4 sm:text-sm'>
              <span className='truncate'>@{profile.username}</span>
              {profile.email && (
                <>
                  <span>•</span>
                  <span className='truncate'>{profile.email}</span>
                </>
              )}
              {profile.group && (
                <>
                  <span>•</span>
                  <span className='truncate'>{profile.group}</span>
                </>
              )}
            </div>
          </div>
          </div>

          <div className='flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 lg:w-[min(24rem,34vw)] lg:self-center'>
            <div className='flex min-w-0 items-center gap-2.5'>
              <div className='bg-muted shrink-0 rounded-md p-2'>
                <Mail className='h-4 w-4' />
              </div>
              <div className='min-w-0'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-sm font-medium'>{t('Email')}</p>
                  {profile.email && (
                    <StatusBadge
                      label={t('Bound')}
                      variant='success'
                      copyable={false}
                    />
                  )}
                </div>
                <p className='text-muted-foreground truncate text-xs'>
                  {profile.email || t('Not bound')}
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='h-7 shrink-0 px-2.5 text-xs'
              onClick={() => setEmailDialogOpen(true)}
            >
              {profile.email ? t('Change') : t('Bind')}
            </Button>
          </div>
        </div>
      </div>
      <EmailBindDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        currentEmail={profile.email}
        onSuccess={onProfileUpdate}
      />
    </div>
  )
}
