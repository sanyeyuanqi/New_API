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
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ROLE } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updateUserSettings } from '../api'
import { DEFAULT_QUOTA_WARNING_THRESHOLD } from '../constants'
import { parseUserSettings } from '../lib'
import type { NotifyType, UserProfile, UserSettings } from '../types'

type ProfilePreferencesCardProps = {
  profile: UserProfile | null
  onProfileUpdate: () => void
}

function getSettings(profile: UserProfile | null): UserSettings {
  const parsed = parseUserSettings(profile?.setting)
  return {
    notify_type: parsed.notify_type || 'email',
    quota_warning_threshold:
      parsed.quota_warning_threshold ?? DEFAULT_QUOTA_WARNING_THRESHOLD,
    notification_email: parsed.notification_email ?? '',
    webhook_url: parsed.webhook_url ?? '',
    webhook_secret: parsed.webhook_secret ?? '',
    bark_url: parsed.bark_url ?? '',
    gotify_url: parsed.gotify_url ?? '',
    gotify_token: parsed.gotify_token ?? '',
    gotify_priority: parsed.gotify_priority ?? 5,
    accept_unset_model_ratio_model:
      parsed.accept_unset_model_ratio_model || false,
    record_ip_log: parsed.record_ip_log || false,
    upstream_model_update_notify_enabled:
      parsed.upstream_model_update_notify_enabled || false,
  }
}

export function ProfilePreferencesCard(props: ProfilePreferencesCardProps) {
  const { t } = useTranslation()
  const isAdmin = (props.profile?.role ?? 0) >= ROLE.ADMIN
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>(() =>
    getSettings(props.profile)
  )

  useEffect(() => {
    setSettings(getSettings(props.profile))
  }, [props.profile])

  const updateField = <K extends keyof UserSettings>(
    field: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await updateUserSettings({
        ...settings,
        notify_type: (settings.notify_type || 'email') as NotifyType,
        quota_warning_threshold:
          settings.quota_warning_threshold ?? DEFAULT_QUOTA_WARNING_THRESHOLD,
      })

      if (response.success) {
        toast.success(t('Settings updated successfully'))
        props.onProfileUpdate()
      } else {
        toast.error(response.message || t('Failed to update settings'))
      }
    } catch (_error) {
      toast.error(t('Failed to update settings'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardContent className='p-3 sm:p-5'>
        <div className='space-y-3'>
          <div className='grid gap-2.5 sm:grid-cols-3'>
            {isAdmin && (
              <div className='flex min-h-28 items-start justify-between gap-2.5 rounded-lg border p-3'>
                <div className='min-w-0 space-y-1'>
                  <Label htmlFor='upstreamModelUpdateNotify'>
                    {t('Receive Upstream Model Update Notifications')}
                  </Label>
                  <p className='text-muted-foreground line-clamp-3 text-xs leading-relaxed'>
                    {t(
                      'Only available for admins. When enabled, you will receive a summary notification via your selected method when the scheduled model check detects upstream model changes or check failures.'
                    )}
                  </p>
                </div>
                <Switch
                  id='upstreamModelUpdateNotify'
                  className='mt-0.5 shrink-0'
                  checked={settings.upstream_model_update_notify_enabled}
                  onCheckedChange={(checked) =>
                    updateField('upstream_model_update_notify_enabled', checked)
                  }
                />
              </div>
            )}

            <div className='flex min-h-28 items-start justify-between gap-2.5 rounded-lg border p-3'>
              <div className='min-w-0 space-y-1'>
                <Label htmlFor='acceptUnsetPrice'>
                  {t('Accept Unpriced Models')}
                </Label>
                <p className='text-muted-foreground line-clamp-3 text-xs leading-relaxed'>
                  {t('Allow using models without price configuration')}
                </p>
              </div>
              <Switch
                id='acceptUnsetPrice'
                className='mt-0.5 shrink-0'
                checked={settings.accept_unset_model_ratio_model}
                onCheckedChange={(checked) =>
                  updateField('accept_unset_model_ratio_model', checked)
                }
              />
            </div>

            <div className='flex min-h-28 items-start justify-between gap-2.5 rounded-lg border p-3'>
              <div className='min-w-0 space-y-1'>
                <Label htmlFor='recordIp'>{t('Record IP Address')}</Label>
                <p className='text-muted-foreground line-clamp-3 text-xs leading-relaxed'>
                  {t('Log IP address for usage and error logs')}
                </p>
              </div>
              <Switch
                id='recordIp'
                className='mt-0.5 shrink-0'
                checked={settings.record_ip_log}
                onCheckedChange={(checked) =>
                  updateField('record_ip_log', checked)
                }
              />
            </div>
          </div>

          <div className='flex justify-center pt-1 sm:justify-end'>
            <Button onClick={handleSave} disabled={saving} size='sm'>
              {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {saving ? t('Saving...') : t('Save Settings')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
