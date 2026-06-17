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
import { memo, useCallback, useRef, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { Code2, Eye, RotateCcw, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { JsonCodeEditor } from '@/components/json-code-editor'
import {
  SettingsForm,
  SettingsSwitchContent,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import {
  ModelRatioVisualEditor,
  type ModelRatioVisualEditorHandle,
} from './model-ratio-visual-editor'

type ModelFormValues = {
  ModelPrice: string
  ModelRatio: string
  CacheRatio: string
  CreateCacheRatio: string
  CompletionRatio: string
  ImageRatio: string
  AudioRatio: string
  AudioCompletionRatio: string
  ExposeRatioEnabled: boolean
  BillingMode: string
  BillingExpr: string
}

type ModelRatioFormProps = {
  form: UseFormReturn<ModelFormValues>
  savedValues: ModelFormValues
  onSave: (values: ModelFormValues) => Promise<void>
  onReset: () => void
  isSaving: boolean
  isResetting: boolean
}

type ModelJsonFieldName =
  | 'ModelPrice'
  | 'ModelRatio'
  | 'CacheRatio'
  | 'CreateCacheRatio'
  | 'CompletionRatio'
  | 'ImageRatio'
  | 'AudioRatio'
  | 'AudioCompletionRatio'

const modelJsonFields: Array<{
  name: ModelJsonFieldName
  labelKey: string
  descriptionKey: string
}> = [
  {
    name: 'ModelPrice',
    labelKey: 'Model fixed pricing',
    descriptionKey:
      'JSON map of model → USD cost per request. Takes precedence over ratio based billing.',
  },
  {
    name: 'ModelRatio',
    labelKey: 'Model ratio',
    descriptionKey: 'JSON map of model → multiplier applied to quota billing.',
  },
  {
    name: 'CacheRatio',
    labelKey: 'Prompt cache ratio',
    descriptionKey: 'Optional ratio used when upstream cache hits occur.',
  },
  {
    name: 'CreateCacheRatio',
    labelKey: 'Create cache ratio',
    descriptionKey:
      'Ratio applied when creating cache entries for supported models.',
  },
  {
    name: 'CompletionRatio',
    labelKey: 'Completion ratio',
    descriptionKey:
      'Applies to custom completion endpoints. JSON map of model → ratio.',
  },
  {
    name: 'ImageRatio',
    labelKey: 'Image ratio',
    descriptionKey: 'Configure per-model ratio for image inputs or outputs.',
  },
  {
    name: 'AudioRatio',
    labelKey: 'Audio ratio',
    descriptionKey:
      'Ratio applied to audio inputs where supported by the upstream model.',
  },
  {
    name: 'AudioCompletionRatio',
    labelKey: 'Audio completion ratio',
    descriptionKey: 'Ratio applied to audio completions for streaming models.',
  },
]

const actionButtonClassName =
  'h-8 rounded-lg border-stone-300 bg-stone-100/80 px-2.5 pr-3.5 font-medium text-stone-950 shadow-[0_1px_2px_rgba(28,25,23,0.06)] hover:border-stone-400 hover:bg-stone-200/70 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-100 dark:hover:bg-stone-800/80'

const actionIconClassName =
  'flex size-5 items-center justify-center rounded-md border border-stone-400/70 bg-stone-200/50 text-stone-950 dark:border-stone-600 dark:bg-stone-800/70 dark:text-stone-100'

const destructiveActionButtonClassName =
  'h-8 rounded-lg border-red-200 bg-red-50/80 px-2.5 pr-3.5 font-medium text-red-700 shadow-[0_1px_2px_rgba(127,29,29,0.06)] hover:border-red-300 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50'

const destructiveActionIconClassName =
  'flex size-5 items-center justify-center rounded-md border border-red-300/80 bg-red-100/70 text-red-700 dark:border-red-800 dark:bg-red-950/70 dark:text-red-300'

function ModelJsonTextareaField(props: {
  form: UseFormReturn<ModelFormValues>
  name: ModelJsonFieldName
  label: string
  description: string
}) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className='flex min-w-0 flex-col gap-2'>
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <JsonCodeEditor
              value={field.value}
              onChange={(value) => field.onChange(value)}
            />
          </FormControl>
          <FormDescription className='text-xs leading-5'>
            {props.description}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const ModelRatioForm = memo(function ModelRatioForm({
  form,
  savedValues,
  onSave,
  onReset,
  isSaving,
  isResetting,
}: ModelRatioFormProps) {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual')
  const visualEditorRef = useRef<ModelRatioVisualEditorHandle>(null)

  const handleFieldChange = useCallback(
    (field: keyof ModelFormValues, value: string) => {
      form.setValue(field, value, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [form]
  )

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => (prev === 'visual' ? 'json' : 'visual'))
  }, [])

  const handleSave = useCallback(async () => {
    if (editMode === 'visual') {
      const committed = await visualEditorRef.current?.commitOpenEditor()
      if (committed === false) return
    }

    await form.handleSubmit(onSave)()
  }, [editMode, form, onSave])

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className={destructiveActionButtonClassName}
          onClick={onReset}
          disabled={isResetting}
        >
          <span className={destructiveActionIconClassName}>
            <RotateCcw className='size-3.5 stroke-[2.2]' />
          </span>
          <span>{t('Reset prices')}</span>
        </Button>
        {editMode === 'json' && (
          <Button
            type='button'
            size='sm'
            variant='outline'
            className={actionButtonClassName}
            onClick={handleSave}
            disabled={isSaving}
          >
            <span className={actionIconClassName}>
              <Save className='size-3.5 stroke-[2.2]' />
            </span>
            <span>{isSaving ? t('Saving...') : t('Save model prices')}</span>
          </Button>
        )}
        <Button
          variant='outline'
          size='sm'
          className={actionButtonClassName}
          onClick={toggleEditMode}
        >
          {editMode === 'visual' ? (
            <>
              <span className={actionIconClassName}>
                <Code2 className='size-3.5 stroke-[2.2]' />
              </span>
              <span>{t('Switch to JSON')}</span>
            </>
          ) : (
            <>
              <span className={actionIconClassName}>
                <Eye className='size-3.5 stroke-[2.2]' />
              </span>
              <span>{t('Switch to Visual')}</span>
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        {editMode === 'visual' ? (
          <div className='space-y-6'>
            <ModelRatioVisualEditor
              ref={visualEditorRef}
              savedModelPrice={savedValues.ModelPrice}
              savedModelRatio={savedValues.ModelRatio}
              savedCacheRatio={savedValues.CacheRatio}
              savedCreateCacheRatio={savedValues.CreateCacheRatio}
              savedCompletionRatio={savedValues.CompletionRatio}
              savedImageRatio={savedValues.ImageRatio}
              savedAudioRatio={savedValues.AudioRatio}
              savedAudioCompletionRatio={savedValues.AudioCompletionRatio}
              savedBillingMode={savedValues.BillingMode}
              savedBillingExpr={savedValues.BillingExpr}
              modelPrice={form.watch('ModelPrice')}
              modelRatio={form.watch('ModelRatio')}
              cacheRatio={form.watch('CacheRatio')}
              createCacheRatio={form.watch('CreateCacheRatio')}
              completionRatio={form.watch('CompletionRatio')}
              imageRatio={form.watch('ImageRatio')}
              audioRatio={form.watch('AudioRatio')}
              audioCompletionRatio={form.watch('AudioCompletionRatio')}
              billingMode={form.watch('BillingMode')}
              billingExpr={form.watch('BillingExpr')}
              onSave={handleSave}
              isSaving={isSaving}
              onChange={(field, value) => {
                const fieldMap: Record<string, keyof ModelFormValues> = {
                  'billing_setting.billing_mode': 'BillingMode',
                  'billing_setting.billing_expr': 'BillingExpr',
                }
                const formField =
                  fieldMap[field] || (field as keyof ModelFormValues)
                handleFieldChange(formField, value)
              }}
            />

            <FormField
              control={form.control}
              name='ExposeRatioEnabled'
              render={({ field }) => (
                <SettingsSwitchItem>
                  <SettingsSwitchContent>
                    <FormLabel>
                      {t('Expose ratio API')}
                      <span className='text-muted-foreground font-normal'>
                        （
                        {t(
                          'Allow clients to query configured ratios via `/api/ratio`.'
                        )}
                        ）
                      </span>
                    </FormLabel>
                  </SettingsSwitchContent>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </SettingsSwitchItem>
              )}
            />
          </div>
        ) : (
          <SettingsForm onSubmit={form.handleSubmit(onSave)}>
            <div className='grid min-w-0 gap-x-5 gap-y-8 lg:grid-cols-2 2xl:grid-cols-3'>
              {modelJsonFields.map((config) => (
                <ModelJsonTextareaField
                  key={config.name}
                  form={form}
                  name={config.name}
                  label={t(config.labelKey)}
                  description={t(config.descriptionKey)}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name='ExposeRatioEnabled'
              render={({ field }) => (
                <SettingsSwitchItem>
                  <SettingsSwitchContent>
                    <FormLabel>
                      {t('Expose ratio API')}
                      <span className='text-muted-foreground font-normal'>
                        （
                        {t(
                          'Allow clients to query configured ratios via `/api/ratio`.'
                        )}
                        ）
                      </span>
                    </FormLabel>
                  </SettingsSwitchContent>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </SettingsSwitchItem>
              )}
            />
          </SettingsForm>
        )}
      </Form>
    </div>
  )
})
