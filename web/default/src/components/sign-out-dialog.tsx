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
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/api'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const { t } = useTranslation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await logout()
    } catch {
      /* empty */
    }
    auth.reset()
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('uid')
      }
    } catch {
      /* empty */
    }
    toast.success(t('Signed out'))
    // Refresh the page to clear all state and update UI
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-stone-200/80 bg-stone-50/95 p-0 shadow-[0_18px_50px_rgba(28,25,23,0.14)] ring-stone-950/10 sm:max-w-md dark:border-stone-800/80 dark:bg-stone-950/95 dark:ring-white/10'>
        <div className='flex gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-300/80 bg-stone-100 text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'>
            <LogOut className='size-5' />
          </div>
          <AlertDialogHeader className='min-w-0 gap-2 text-left'>
            <AlertDialogTitle className='text-lg font-semibold tracking-normal text-stone-950 dark:text-stone-50'>
              {t('Sign out')}
            </AlertDialogTitle>
            <AlertDialogDescription className='max-w-sm text-sm leading-6 text-stone-600 dark:text-stone-400'>
              {t(
                'Are you sure you want to sign out? You will need to sign in again to access your account.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className='mx-0 mb-0 items-center justify-center gap-2 rounded-none border-stone-200/80 bg-stone-100/60 p-4 sm:justify-center dark:border-stone-800/80 dark:bg-stone-900/60'>
          <AlertDialogCancel className='h-8 rounded-lg border-stone-300 bg-stone-50/80 px-4 font-medium text-stone-700 shadow-[0_1px_2px_rgba(28,25,23,0.04)] hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800'>
            {t('Cancel')}
          </AlertDialogCancel>
          <Button
            className='h-8 rounded-lg border border-stone-900 bg-stone-950 px-4 font-medium text-stone-50 shadow-[0_6px_14px_rgba(28,25,23,0.18)] hover:bg-stone-800 dark:border-stone-200 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200'
            onClick={handleSignOut}
          >
            {t('Sign out')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
