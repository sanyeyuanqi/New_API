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
import { MessageSquare } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useChatPresets } from '@/features/chat/hooks/use-chat-presets'

export const Route = createFileRoute('/_authenticated/chat/')({
  component: ChatIndexPage,
})

function ChatIndexPage() {
  const { t } = useTranslation()
  const { chatPresets } = useChatPresets()
  const hasPresets = chatPresets.some((preset) => preset.type !== 'fluent')

  return (
    <div className='flex h-full flex-col items-center justify-center gap-3 p-6 text-center'>
      <MessageSquare className='text-muted-foreground h-12 w-12' />
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold'>{t('Chat Presets')}</h2>
        <p className='text-muted-foreground'>
          {hasPresets
            ? t('Select a chat preset from the sidebar.')
            : t('No available Web chat links')}
        </p>
      </div>
    </div>
  )
}
