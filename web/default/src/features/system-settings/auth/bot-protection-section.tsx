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
import { useEffect } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
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
import {
  SettingsEnableDisableButton,
  SettingsForm,
  SettingsSwitchContent,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'

const botProtectionSchema = z.object({
  TurnstileCheckEnabled: z.boolean(),
  TurnstileSiteKey: z.string().optional(),
  TurnstileSecretKey: z.string().optional(),
  ImageCaptchaEnabled: z.boolean(),
  CaptchaRateLimitEnabled: z.boolean(),
  CaptchaRateLimitNum: z.number().int().min(1).max(1000000),
  CaptchaRateLimitDuration: z.number().int().min(1).max(86400),
  CriticalRateLimitEnabled: z.boolean(),
  CriticalRateLimitNum: z.number().int().min(1).max(1000000),
  CriticalRateLimitDuration: z.number().int().min(1).max(86400),
})

type BotProtectionFormValues = z.infer<typeof botProtectionSchema>

type BotProtectionSectionProps = {
  defaultValues: BotProtectionFormValues
}

export function BotProtectionSection({
  defaultValues,
}: BotProtectionSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const form = useForm<BotProtectionFormValues>({
    resolver: zodResolver(botProtectionSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const onSubmit = async (data: BotProtectionFormValues) => {
    const updates = Object.entries(data).filter(
      ([key, value]) =>
        value !== defaultValues[key as keyof BotProtectionFormValues]
    )

    for (const [key, value] of updates) {
      await updateOption.mutateAsync({ key, value: value ?? '' })
    }
  }

  return (
    <SettingsSection title={t('Bot Protection')}>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)} autoComplete='off'>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            isSaving={updateOption.isPending}
          />
          <FormField
            control={form.control}
            name='ImageCaptchaEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>{t('Enable image CAPTCHA')}</FormLabel>
                  <FormDescription>
                    {t(
                      'Require a self-hosted click CAPTCHA before password sign-in or registration'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <SettingsEnableDisableButton
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />

          <FormField
            control={form.control}
            name='CaptchaRateLimitEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>{t('Enable CAPTCHA request rate limit')}</FormLabel>
                  <FormDescription>
                    {t(
                      'Limit how often one IP can load or verify image CAPTCHA challenges'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <SettingsEnableDisableButton
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />

          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='CaptchaRateLimitNum'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('CAPTCHA max requests')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      placeholder='60'
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Maximum CAPTCHA requests allowed per time window.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='CaptchaRateLimitDuration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('CAPTCHA time window seconds')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      placeholder='60'
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Time window for CAPTCHA request frequency, in seconds.')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='CriticalRateLimitEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>
                    {t('Enable sensitive request rate limit')}
                  </FormLabel>
                  <FormDescription>
                    {t(
                      'Limit login, registration, password reset, OAuth, and other sensitive API requests by IP'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <SettingsEnableDisableButton
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />

          <div className='grid gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='CriticalRateLimitNum'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Sensitive request max requests')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      placeholder='20'
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Maximum sensitive requests allowed per time window.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='CriticalRateLimitDuration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('Sensitive request time window seconds')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      placeholder='1200'
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.target.value, 10) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Time window for sensitive request frequency, in seconds.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='TurnstileCheckEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>{t('Enable Turnstile')}</FormLabel>
                  <FormDescription>
                    {t(
                      'Protect login and registration with Cloudflare Turnstile'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <SettingsEnableDisableButton
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />

          <FormField
            control={form.control}
            name='TurnstileSiteKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Site Key')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('Your Turnstile site key')}
                    autoComplete='off'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='TurnstileSecretKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Secret Key')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('Your Turnstile secret key')}
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
