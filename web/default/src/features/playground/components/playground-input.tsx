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
import {
  PaperclipIcon,
  FileIcon,
  ImageIcon,
  ScreenShareIcon,
  CameraIcon,
  GlobeIcon,
  SendIcon,
  SquareIcon,
  NotepadTextIcon,
  Trash2Icon,
  Maximize2Icon,
  Minimize2Icon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { ModelGroupSelector } from '@/components/model-group-selector'
import type { ModelOption, GroupOption } from '../types'

interface PlaygroundInputProps {
  onSubmit: (text: string) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  models: ModelOption[]
  modelValue: string
  onModelChange: (value: string) => void
  isModelLoading?: boolean
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
  onClearLocalMessages?: () => void
  hasMessages?: boolean
}

const suggestions = [
  { icon: NotepadTextIcon, labelKey: 'Summarize text', color: '#ea8444' },
  { icon: null, labelKey: 'More' },
]

const attachmentActions = [
  { action: 'upload-file', icon: FileIcon, labelKey: 'Upload file' },
  { action: 'upload-photo', icon: ImageIcon, labelKey: 'Upload photo' },
  {
    action: 'take-screenshot',
    icon: ScreenShareIcon,
    labelKey: 'Take screenshot',
  },
  { action: 'take-photo', icon: CameraIcon, labelKey: 'Take photo' },
]

const composerToolButtonClass =
  'h-9 w-9 gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-0 text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] sm:w-auto sm:px-3 dark:border-white/10 dark:bg-white/7 dark:text-slate-200 dark:hover:border-white/18 dark:hover:bg-white/12 dark:hover:text-white'

const suggestionButtonClass =
  'h-8 shrink-0 rounded-full border border-slate-200/80 bg-white/90 px-3.5 text-xs font-medium text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-[0_8px_22px_rgba(15,23,42,0.10)] sm:h-8 sm:text-sm dark:border-white/10 dark:bg-white/7 dark:text-slate-200 dark:hover:border-white/18 dark:hover:bg-white/12 dark:hover:text-white'

const composerShellClass =
  'relative h-[6.625rem] overflow-hidden rounded-[1.35rem] shadow-[0_16px_42px_rgba(15,23,42,0.13),0_1px_0_rgba(255,255,255,0.9)_inset] transition-[height,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:shadow-none dark:focus-within:shadow-[0_18px_70px_rgba(255,255,255,0.12),0_0_44px_rgba(255,255,255,0.06)]'

const composerExpandedClass = 'h-[min(11.75rem,calc(100vh-14rem))]'

const composerGroupClass =
  'flex !h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 !bg-white/95 backdrop-blur-xl has-disabled:opacity-100 has-[[data-slot=input-group-control]:focus-visible]:border-slate-200 has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:border-transparent dark:!bg-zinc-950/80 dark:has-[[data-slot=input-group-control]:focus-visible]:border-transparent dark:has-[[data-slot=input-group-control]:focus-visible]:ring-0'

const composerTextareaClass =
  'absolute inset-x-0 top-0 bottom-[3.75rem] h-auto min-h-0 max-h-none overflow-y-auto px-4 pt-4 text-[15px] [field-sizing:fixed] md:px-5 md:text-base'

const composerFooterClass =
  'absolute inset-x-px bottom-px shrink-0 flex-nowrap gap-2 rounded-b-[1.25rem] border-t border-slate-100/90 bg-white/95 p-2.5 dark:border-transparent dark:bg-zinc-950/80 dark:shadow-[0_-14px_32px_rgba(255,255,255,0.025)]'

export function PlaygroundInput({
  onSubmit,
  onStop,
  disabled,
  isGenerating,
  models,
  modelValue,
  onModelChange,
  isModelLoading = false,
  groups,
  groupValue,
  onGroupChange,
  onClearLocalMessages,
  hasMessages = false,
}: PlaygroundInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const isSelectorDisabled =
    disabled || isModelLoading || models.length === 0 || groups.length === 0
  const hasPromptText = text.trim().length > 0
  const expandLabel = t(isExpanded ? 'Collapse' : 'Expand')
  const ExpandIcon = isExpanded ? Minimize2Icon : Maximize2Icon

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() || disabled) return
    onSubmit(message.text)
    setText('')
  }

  const handleFileAction = (action: string) => {
    toast.info(t('Feature in development'), {
      description: action,
    })
  }

  return (
    <div className='grid shrink-0 gap-2.5 md:gap-4 md:pb-4'>
      <div
        className={cn(composerShellClass, isExpanded && composerExpandedClass)}
      >
        <PromptInput
          className='h-full'
          groupClassName={composerGroupClass}
          onSubmit={handleSubmit}
        >
          <PromptInputTextarea
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
            className={composerTextareaClass}
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('Ask anything')}
            value={text}
          />

          <PromptInputFooter className={composerFooterClass}>
            <PromptInputTools className='shrink-0 gap-1.5'>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <PromptInputButton
                      className={composerToolButtonClass}
                      disabled={disabled}
                      variant='outline'
                    />
                  }
                >
                  <PaperclipIcon size={16} />
                  <span className='hidden sm:inline'>{t('Attach')}</span>
                  <span className='sr-only sm:hidden'>{t('Attach')}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  {attachmentActions.map(
                    ({ action, icon: ActionIcon, labelKey }) => (
                      <DropdownMenuItem
                        key={action}
                        onClick={() => handleFileAction(action)}
                      >
                        <ActionIcon className='mr-2' size={16} />
                        {t(labelKey)}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <PromptInputButton
                className={composerToolButtonClass}
                disabled={disabled}
                onClick={() => toast.info(t('Search feature in development'))}
                variant='outline'
              >
                <GlobeIcon size={16} />
                <span className='hidden sm:inline'>{t('Search')}</span>
                <span className='sr-only sm:hidden'>{t('Search')}</span>
              </PromptInputButton>
            </PromptInputTools>

            <div className='ml-auto flex shrink-0 items-center gap-1.5 md:gap-2'>
              <ModelGroupSelector
                selectedModel={modelValue}
                models={models}
                onModelChange={onModelChange}
                selectedGroup={groupValue}
                groups={groups}
                onGroupChange={onGroupChange}
                disabled={isSelectorDisabled}
              />

              {isGenerating && onStop ? (
                <PromptInputButton
                  className='h-9 w-9 gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-0 text-amber-700 shadow-[0_6px_18px_rgba(180,83,9,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-100 sm:w-auto sm:px-3 dark:border-amber-300/20 dark:bg-amber-300/12 dark:text-amber-200 dark:hover:bg-amber-300/18'
                  onClick={onStop}
                  variant='secondary'
                >
                  <SquareIcon className='fill-current' size={16} />
                  <span className='hidden sm:inline'>{t('Stop')}</span>
                  <span className='sr-only sm:hidden'>{t('Stop')}</span>
                </PromptInputButton>
              ) : (
                <PromptInputButton
                  className={cn(
                    'h-9 w-9 gap-1.5 rounded-full p-0 font-medium transition-all duration-300 disabled:opacity-100 sm:w-auto sm:px-3',
                    hasPromptText && !disabled
                      ? 'bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_26px_rgba(15,23,42,0.26)] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                      : 'bg-slate-100 text-slate-400 shadow-none hover:bg-slate-100 dark:bg-white/7 dark:text-slate-500 dark:hover:bg-white/7'
                  )}
                  disabled={disabled || !hasPromptText}
                  type='submit'
                  variant='secondary'
                >
                  <SendIcon size={16} />
                  <span className='hidden sm:inline'>{t('Send')}</span>
                  <span className='sr-only sm:hidden'>{t('Send')}</span>
                </PromptInputButton>
              )}
            </div>
          </PromptInputFooter>
        </PromptInput>
      </div>

      <div className='min-w-0 overflow-hidden'>
        <Suggestions className='mx-auto gap-2 px-3 pb-0.5 md:px-0'>
          {suggestions.map(({ icon: Icon, labelKey, color }) => {
            const label = t(labelKey)

            return (
              <Suggestion
                className={`${suggestionButtonClass} ${
                  labelKey === 'More' ? 'hidden sm:flex' : ''
                }`}
                key={labelKey}
                onClick={() => onSubmit(label)}
                suggestion={label}
              >
                {Icon && <Icon size={16} style={{ color }} />}
                {label}
              </Suggestion>
            )
          })}
          <Suggestion
            className={suggestionButtonClass}
            onClick={() => setIsExpanded((value) => !value)}
            suggestion={expandLabel}
          >
            <ExpandIcon size={16} />
            {expandLabel}
          </Suggestion>
          {onClearLocalMessages ? (
            <Suggestion
              className='text-destructive h-8 shrink-0 rounded-full border border-red-200/70 bg-red-50/80 px-3.5 text-xs font-medium shadow-[0_4px_14px_rgba(239,68,68,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-600 sm:h-8 sm:text-sm dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200 dark:hover:bg-red-400/15'
              disabled={!hasMessages}
              onClick={onClearLocalMessages}
              suggestion={t('Clear')}
            >
              <Trash2Icon size={16} />
              {t('Clear')}
            </Suggestion>
          ) : null}
        </Suggestions>
      </div>
    </div>
  )
}
