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
import type { ComponentProps } from 'react'
import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsForm } from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const _systemInfoSchema = z.object({
  SystemName: z.string().min(1),
  ServerAddress: z.string().optional(),
  Logo: z.string().url().optional().or(z.literal('')),
  Footer: z.string().optional(),
  About: z.string().optional(),
  HomePageContent: z.string().optional(),
  legal: z.object({
    user_agreement: z.string().optional(),
    privacy_policy: z.string().optional(),
  }),
})

type SystemInfoFormValues = z.infer<typeof _systemInfoSchema>

type SystemInfoSectionProps = {
  defaultValues: SystemInfoFormValues
}

function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : String(value)
}

type SystemInfoTextareaProps = ComponentProps<typeof Textarea> & {
  variant?: 'short' | 'long'
}

function SystemInfoTextarea({
  className,
  variant = 'long',
  ...props
}: SystemInfoTextareaProps) {
  return (
    <Textarea
      className={cn(
        '[field-sizing:fixed] resize-y overflow-auto',
        'font-mono text-xs leading-5',
        variant === 'short' ? 'h-24 min-h-20' : 'h-56 max-h-[60vh] min-h-36',
        className
      )}
      {...props}
    />
  )
}

export function SystemInfoSection({ defaultValues }: SystemInfoSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const normalizedDefaults: SystemInfoFormValues = {
    SystemName: normalizeValue(defaultValues.SystemName),
    ServerAddress: normalizeValue(defaultValues.ServerAddress),
    Logo: normalizeValue(defaultValues.Logo),
    Footer: normalizeValue(defaultValues.Footer),
    About: normalizeValue(defaultValues.About),
    HomePageContent: normalizeValue(defaultValues.HomePageContent),
    legal: {
      user_agreement: normalizeValue(defaultValues.legal?.user_agreement),
      privacy_policy: normalizeValue(defaultValues.legal?.privacy_policy),
    },
  }

  const systemInfoSchemaWithI18n = z.object({
    SystemName: z.string().min(1, {
      error: () => t('System name is required'),
    }),
    ServerAddress: z.string().optional(),
    Logo: z.string().url().optional().or(z.literal('')),
    Footer: z.string().optional(),
    About: z.string().optional(),
    HomePageContent: z.string().optional(),
    legal: z.object({
      user_agreement: z.string().optional(),
      privacy_policy: z.string().optional(),
    }),
  })

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<SystemInfoFormValues>({
      resolver: zodResolver(systemInfoSchemaWithI18n) as Resolver<
        SystemInfoFormValues,
        unknown,
        SystemInfoFormValues
      >,
      defaultValues: normalizedDefaults,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          let v = normalizeValue(value)
          if (key === 'ServerAddress') {
            v = v.replace(/\/+$/, '')
          }
          await updateOption.mutateAsync({
            key,
            value: v,
          })
        }
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('System Information')} className='w-full'>
        <Form {...form}>
          <SettingsForm className='w-full' onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={isSubmitting || updateOption.isPending}
              isResetDisabled={!isDirty}
            />
            <FormDirtyIndicator isDirty={isDirty} />
            <div
              data-settings-form-span='full'
              className='flex w-full min-w-0 flex-col gap-6'
            >
              <div className='flex w-full min-w-0 flex-wrap gap-6'>
                <FormField
                  control={form.control}
                  name='SystemName'
                  render={({ field }) => (
                    <FormItem className='min-w-[260px] flex-[1_1_320px] xl:max-w-[520px]'>
                      <FormLabel>{t('System Name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('New API')} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t('The name displayed across the application')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='ServerAddress'
                  render={({ field }) => (
                    <FormItem className='min-w-[260px] flex-[1_1_320px] xl:max-w-[520px]'>
                      <FormLabel>{t('Server Address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://yourdomain.com'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          'The public URL of your server, used for OAuth callbacks, webhooks, and other external integrations'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='Logo'
                  render={({ field }) => (
                    <FormItem className='min-w-[260px] flex-[1_1_320px] xl:max-w-[520px]'>
                      <FormLabel>{t('Logo URL')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('https://example.com/logo.png')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('URL to your logo image (optional)')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex w-full min-w-0 flex-wrap gap-6'>
                <FormField
                  control={form.control}
                  name='Footer'
                  render={({ field }) => (
                    <FormItem className='min-w-[320px] flex-[1_1_480px] md:max-w-[calc(50%-0.75rem)]'>
                      <FormLabel>{t('Footer')}</FormLabel>
                      <FormControl>
                        <SystemInfoTextarea
                          className='h-56'
                          placeholder={t(
                            '© 2025 Your Company. All rights reserved.'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('Footer text displayed at the bottom of pages')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='About'
                  render={({ field }) => (
                    <FormItem className='min-w-[320px] flex-[1_1_480px] md:max-w-[calc(50%-0.75rem)]'>
                      <FormLabel>{t('About')}</FormLabel>
                      <FormControl>
                        <SystemInfoTextarea
                          placeholder={t(
                            'Enter HTML code (e.g., <p>About us...</p>) or a URL (e.g., https://example.com) to embed as iframe'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          'Supports HTML markup or iframe embedding. Enter HTML code directly, or provide a complete URL to automatically embed it as an iframe.'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='HomePageContent'
                render={({ field }) => (
                  <FormItem className='w-full min-w-0'>
                    <FormLabel>{t('Home Page Content')}</FormLabel>
                    <FormControl>
                      <Textarea
                        className='[field-sizing:fixed] h-64 max-h-[60vh] min-h-40 w-full resize-y overflow-auto font-mono text-xs leading-5'
                        placeholder={t('Welcome to our New API...')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Content displayed on the home page (supports Markdown)'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex w-full min-w-0 flex-wrap gap-6'>
                <FormField
                  control={form.control}
                  name='legal.user_agreement'
                  render={({ field }) => (
                    <FormItem className='min-w-[320px] flex-[1_1_480px] md:max-w-[calc(50%-0.75rem)]'>
                      <FormLabel>{t('User Agreement')}</FormLabel>
                      <FormControl>
                        <SystemInfoTextarea
                          placeholder={t(
                            'Provide Markdown, HTML, or an external URL for the user agreement'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          'Leave empty to disable the agreement requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='legal.privacy_policy'
                  render={({ field }) => (
                    <FormItem className='min-w-[320px] flex-[1_1_480px] md:max-w-[calc(50%-0.75rem)]'>
                      <FormLabel>{t('Privacy Policy')}</FormLabel>
                      <FormControl>
                        <SystemInfoTextarea
                          placeholder={t(
                            'Provide Markdown, HTML, or an external URL for the privacy policy'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          'Leave empty to disable the privacy policy requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
