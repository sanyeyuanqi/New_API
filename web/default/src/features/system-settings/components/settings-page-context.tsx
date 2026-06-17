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
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

type SettingsPageContextValue = {
  actionsContainer: HTMLDivElement | null
  titleStatusContainer: HTMLSpanElement | null
  suppressSectionHeader: boolean
}

const SettingsPageContext = createContext<SettingsPageContextValue>({
  actionsContainer: null,
  titleStatusContainer: null,
  suppressSectionHeader: false,
})

type SettingsPageProviderProps = {
  actionsContainer: HTMLDivElement | null
  titleStatusContainer?: HTMLSpanElement | null
  children: ReactNode
  suppressSectionHeader?: boolean
}

export function SettingsPageProvider(props: SettingsPageProviderProps) {
  return (
    <SettingsPageContext.Provider
      value={{
        actionsContainer: props.actionsContainer,
        titleStatusContainer: props.titleStatusContainer ?? null,
        suppressSectionHeader: props.suppressSectionHeader ?? true,
      }}
    >
      {props.children}
    </SettingsPageContext.Provider>
  )
}

export function useSuppressSettingsSectionHeader() {
  return useContext(SettingsPageContext).suppressSectionHeader
}

type SettingsPageTitleStatusPortalProps = {
  children: ReactNode
}

export function SettingsPageTitleStatusPortal(
  props: SettingsPageTitleStatusPortalProps
) {
  const { titleStatusContainer } = useContext(SettingsPageContext)

  if (!titleStatusContainer) return null

  return createPortal(props.children, titleStatusContainer)
}

type SettingsPageActionsPortalProps = {
  children: ReactNode
}

export function SettingsPageActionsPortal(
  props: SettingsPageActionsPortalProps
) {
  const { actionsContainer } = useContext(SettingsPageContext)

  if (!actionsContainer) return null

  return createPortal(
    <div className='flex flex-wrap items-center justify-end gap-2'>
      {props.children}
    </div>,
    actionsContainer
  )
}

type SettingsPageFormActionsProps = {
  onSave: () => void
  onReset?: () => void
  isSaving?: boolean
  isSaveDisabled?: boolean
  isResetDisabled?: boolean
  saveLabel?: string
  savingLabel?: string
  resetLabel?: string
  resetVariant?: ComponentProps<typeof Button>['variant']
  saveButtonRef?: RefObject<HTMLButtonElement | null>
}

export function SettingsPageFormActions(props: SettingsPageFormActionsProps) {
  const { t } = useTranslation()
  const saveLabel = props.isSaving
    ? (props.savingLabel ?? 'Saving...')
    : (props.saveLabel ?? 'Save Changes')

  return (
    <SettingsPageActionsPortal>
      <div className='flex items-center justify-end gap-2'>
        {props.onReset && (
          <Button
            type='button'
            size='sm'
            variant={props.resetVariant ?? 'outline'}
            className='text-muted-foreground hover:text-foreground bg-background/95 h-8 rounded-full px-3 shadow-sm ring-1 ring-black/5 backdrop-blur dark:ring-white/10'
            onClick={props.onReset}
            disabled={props.isResetDisabled || props.isSaving}
          >
            <RotateCcw data-icon='inline-start' />
            <span>{t(props.resetLabel ?? 'Reset')}</span>
          </Button>
        )}
        <Button
          ref={props.saveButtonRef}
          type='button'
          size='sm'
          variant='outline'
          className='h-8 rounded-lg border-stone-300 bg-stone-100/80 px-2.5 pr-3.5 font-medium text-stone-950 shadow-[0_1px_2px_rgba(28,25,23,0.06)] hover:border-stone-400 hover:bg-stone-200/70 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-100 dark:hover:bg-stone-800/80'
          onClick={props.onSave}
          disabled={props.isSaving || props.isSaveDisabled}
        >
          <span className='flex size-5 items-center justify-center rounded-md border border-stone-400/70 bg-stone-200/50 text-stone-950 dark:border-stone-600 dark:bg-stone-800/70 dark:text-stone-100'>
            <Save className='size-3.5 stroke-[2.2]' />
          </span>
          <span>{t(saveLabel)}</span>
        </Button>
      </div>
    </SettingsPageActionsPortal>
  )
}
