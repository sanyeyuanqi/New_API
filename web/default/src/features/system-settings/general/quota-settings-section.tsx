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
import type { ChangeEvent } from 'react'
import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsEnableDisableButton } from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const quotaSchema = z.object({
  QuotaForNewUser: z.coerce.number().min(0),
  PreConsumedQuota: z.coerce.number().min(0),
  QuotaForInviter: z.coerce.number().min(0),
  QuotaForInvitee: z.coerce.number().min(0),
  TopUpLink: z.string(),
  general_setting: z.object({
    docs_link: z.string(),
  }),
  quota_setting: z.object({
    enable_free_model_pre_consume: z.boolean(),
  }),
})

type QuotaFormValues = z.infer<typeof quotaSchema>

type QuotaSettingsSectionProps = {
  defaultValues: QuotaFormValues
  complianceConfirmed?: boolean
}

const quotaFieldCardClassName =
  'min-w-[280px] max-w-[520px] flex-1 rounded-lg border border-zinc-200/80 bg-background/80 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-950/40'

const linkFieldCardClassName =
  'min-w-[320px] max-w-[720px] flex-1 rounded-lg border border-zinc-200/80 bg-background/80 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-950/40'

export function QuotaSettingsSection({
  defaultValues,
  complianceConfirmed = true,
}: QuotaSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const handleNumberChange =
    (onChange: (value: number | string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(
        event.target.value === '' ? '' : event.currentTarget.valueAsNumber
      )
    }

  const { form, handleSubmit, isDirty, isSubmitting } =
    useSettingsForm<QuotaFormValues>({
      resolver: zodResolver(quotaSchema) as Resolver<
        QuotaFormValues,
        unknown,
        QuotaFormValues
      >,
      defaultValues,
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          await updateOption.mutateAsync({
            key,
            value: value as string | number | boolean,
          })
        }
      },
    })

  return (
    <SettingsSection title={t('Quota Settings')}>
      <FormNavigationGuard when={isDirty} />

      {!complianceConfirmed ? (
        <Alert variant='destructive'>
          <AlertDescription>
            {t(
              'Non-zero invitation rewards require compliance confirmation in Payment Gateway settings.'
            )}
          </AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          className='grid min-w-0 gap-4 xl:grid-cols-2'
          onSubmit={handleSubmit}
        >
          <SettingsPageFormActions
            onSave={handleSubmit}
            isSaving={updateOption.isPending || isSubmitting}
          />
          <FormDirtyIndicator isDirty={isDirty} />

          <Card className='rounded-lg border-zinc-200/80 bg-zinc-50/50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20'>
            <CardHeader className='border-b'>
              <CardTitle>{t('Quota Allocation')}</CardTitle>
              <CardDescription>
                {t('Set the initial and pre-consumed quota amounts.')}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap items-start gap-3'>
              <FormField
                control={form.control}
                name='QuotaForNewUser'
                render={({ field }) => (
                  <FormItem className={quotaFieldCardClassName}>
                    <FormLabel>{t('New User Quota')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={handleNumberChange(field.onChange)}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Initial quota given to new users')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='PreConsumedQuota'
                render={({ field }) => (
                  <FormItem className={quotaFieldCardClassName}>
                    <FormLabel>{t('Pre-Consumed Quota')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={handleNumberChange(field.onChange)}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Quota consumed before charging users')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className='rounded-lg border-zinc-200/80 bg-zinc-50/50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/20'>
            <CardHeader className='border-b'>
              <CardTitle>{t('Invitation Rewards')}</CardTitle>
              <CardDescription>
                {t('Configure quota rewards for referral relationships.')}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap items-start gap-3'>
              <FormField
                control={form.control}
                name='QuotaForInviter'
                render={({ field }) => (
                  <FormItem className={quotaFieldCardClassName}>
                    <FormLabel>{t('Inviter Reward')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={handleNumberChange(field.onChange)}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Quota given to users who invite others')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='QuotaForInvitee'
                render={({ field }) => (
                  <FormItem className={quotaFieldCardClassName}>
                    <FormLabel>{t('Invitee Reward')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={handleNumberChange(field.onChange)}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Quota given to invited users')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className='rounded-lg border-zinc-200/80 bg-zinc-50/60 shadow-sm xl:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/30'>
            <CardHeader>
              <CardTitle>{t('Pre-Consume for Free Models')}</CardTitle>
              <CardDescription>
                {t(
                  'When enabled, zero-cost models also pre-consume quota before final settlement.'
                )}
              </CardDescription>
              <FormField
                control={form.control}
                name='quota_setting.enable_free_model_pre_consume'
                render={({ field }) => (
                  <CardAction className='self-center'>
                    <FormControl>
                      <SettingsEnableDisableButton
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={updateOption.isPending}
                      />
                    </FormControl>
                  </CardAction>
                )}
              />
            </CardHeader>
          </Card>

          <Card className='rounded-lg border-zinc-200/80 bg-zinc-50/50 shadow-sm xl:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/20'>
            <CardHeader className='border-b'>
              <CardTitle>{t('External Links')}</CardTitle>
              <CardDescription>
                {t('Configure purchase and documentation destinations.')}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap items-start gap-3'>
              <FormField
                control={form.control}
                name='TopUpLink'
                render={({ field }) => (
                  <FormItem className={linkFieldCardClassName}>
                    <FormLabel>{t('Top-Up Link')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('https://example.com/topup')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('External link for users to purchase quota')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='general_setting.docs_link'
                render={({ field }) => (
                  <FormItem className={linkFieldCardClassName}>
                    <FormLabel>{t('Documentation Link')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('https://docs.example.com')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Link to your documentation site')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </SettingsSection>
  )
}
