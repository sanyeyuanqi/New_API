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
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  sideDrawerContentClassName,
  sideDrawerFormClassName,
  sideDrawerHeaderClassName,
} from '@/components/drawer-layout'
import { StatusBadge } from '@/components/status-badge'
import {
  getAdminPlans,
  getUserSubscriptions,
  createUserSubscription,
  activateUserSubscription,
  invalidateUserSubscription,
  deleteUserSubscription,
} from '../../api'
import { formatTimestamp } from '../../lib'
import type { PlanRecord, UserSubscriptionRecord } from '../../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: number; username?: string } | null
  onSuccess?: () => void
}

function SubscriptionStatusBadge(props: {
  sub: UserSubscriptionRecord['subscription']
  t: (key: string) => string
}) {
  const now = Date.now() / 1000
  const isExpired = (props.sub.end_time || 0) > 0 && props.sub.end_time < now
  const isActive = props.sub.status === 'active' && !isExpired
  if (isActive)
    return (
      <StatusBadge
        label={props.t('Active')}
        variant='success'
        copyable={false}
      />
    )
  if (props.sub.status === 'cancelled')
    return (
      <StatusBadge
        label={props.t('Invalidated')}
        variant='neutral'
        copyable={false}
      />
    )
  return (
    <StatusBadge
      label={props.t('Expired')}
      variant='neutral'
      copyable={false}
    />
  )
}

function formatSubscriptionPaymentMethod(
  source: string | undefined,
  t: (key: string) => string
) {
  const normalized = source?.trim()
  if (!normalized) return '-'

  const labelMap: Record<string, string> = {
    admin: 'Admin',
    balance: 'Balance',
    order: 'Order',
  }

  return t(labelMap[normalized] || normalized)
}

function isSubscriptionActive(sub: UserSubscriptionRecord['subscription']) {
  const now = Date.now() / 1000
  const isExpired = (sub.end_time || 0) > 0 && sub.end_time < now
  return sub.status === 'active' && !isExpired
}

export function UserSubscriptionsDialog(props: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [plans, setPlans] = useState<PlanRecord[]>([])
  const [subs, setSubs] = useState<UserSubscriptionRecord[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'invalidate' | 'delete'
    subId: number
  } | null>(null)

  const planTitleMap = useMemo(() => {
    const map = new Map<number, string>()
    plans.forEach((p) => {
      if (p.plan.id) map.set(p.plan.id, p.plan.title || `#${p.plan.id}`)
    })
    return map
  }, [plans])

  const activeCount = useMemo(
    () =>
      subs.filter((record) => isSubscriptionActive(record.subscription)).length,
    [subs]
  )

  const loadData = useCallback(async () => {
    if (!props.user?.id) return
    setLoading(true)
    try {
      const [plansRes, subsRes] = await Promise.all([
        getAdminPlans(),
        getUserSubscriptions(props.user.id),
      ])
      if (plansRes.success) setPlans(plansRes.data || [])
      if (subsRes.success) setSubs(subsRes.data || [])
    } catch {
      toast.error(t('Loading failed'))
    } finally {
      setLoading(false)
    }
  }, [props.user?.id, t])

  useEffect(() => {
    if (props.open && props.user?.id) {
      setSelectedPlanId('')
      loadData()
    }
  }, [props.open, props.user?.id, loadData])

  const handleCreate = async () => {
    if (!props.user?.id || !selectedPlanId) {
      toast.error(t('Please select a subscription plan'))
      return
    }
    setCreating(true)
    try {
      const res = await createUserSubscription(props.user.id, {
        plan_id: Number(selectedPlanId),
      })
      if (res.success) {
        toast.success(res.data?.message || t('Added successfully'))
        setSelectedPlanId('')
        await loadData()
        props.onSuccess?.()
      }
    } catch {
      toast.error(t('Request failed'))
    } finally {
      setCreating(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    try {
      if (confirmAction.type === 'activate') {
        const res = await activateUserSubscription(confirmAction.subId)
        if (res.success) {
          toast.success(res.data?.message || t('Has been activated'))
          await loadData()
          props.onSuccess?.()
        }
      } else if (confirmAction.type === 'invalidate') {
        const res = await invalidateUserSubscription(confirmAction.subId)
        if (res.success) {
          toast.success(res.data?.message || t('Has been invalidated'))
          await loadData()
          props.onSuccess?.()
        }
      } else {
        const res = await deleteUserSubscription(confirmAction.subId)
        if (res.success) {
          toast.success(t('Deleted'))
          await loadData()
          props.onSuccess?.()
        }
      }
    } catch {
      toast.error(t('Operation failed'))
    } finally {
      setConfirmAction(null)
    }
  }

  return (
    <>
      <Sheet open={props.open} onOpenChange={props.onOpenChange}>
        <SheetContent className={sideDrawerContentClassName()}>
          <SheetHeader className={sideDrawerHeaderClassName('gap-3')}>
            <SheetTitle>{t('User Subscription Management')}</SheetTitle>
          </SheetHeader>

          <div className={sideDrawerFormClassName('bg-muted/15 gap-4')}>
            <div className='bg-background/90 rounded-2xl border p-4 shadow-sm'>
              <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.35fr)] lg:items-center'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex h-10 min-w-0 items-center gap-2'>
                    <span className='truncate text-base font-semibold'>
                      {props.user?.username || '-'}
                    </span>
                    <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs'>
                      ID: {props.user?.id || '-'}
                    </span>
                  </div>
                  <div className='flex h-10 items-center justify-start gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 text-left text-emerald-700 shadow-sm shadow-emerald-500/5 dark:bg-emerald-500/12 dark:text-emerald-300'>
                    <span className='relative flex size-2'>
                      <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-35' />
                      <span className='relative inline-flex size-2 rounded-full bg-emerald-500' />
                    </span>
                    <span className='text-muted-foreground text-xs font-medium'>
                      {t('Active')}
                    </span>
                    <span className='text-base leading-none font-semibold'>
                      {activeCount}
                    </span>
                  </div>
                </div>

                <div className='flex flex-col gap-2 sm:flex-row'>
                  <Select
                    items={[
                      ...plans.map((p) => ({
                        value: String(p.plan.id),
                        label: (
                          <>
                            {p.plan.title}($
                            {Number(p.plan.price_amount || 0).toFixed(2)})
                          </>
                        ),
                      })),
                    ]}
                    value={selectedPlanId}
                    onValueChange={(v) => v !== null && setSelectedPlanId(v)}
                  >
                    <SelectTrigger className='h-10 flex-1 rounded-xl'>
                      <SelectValue
                        placeholder={t('Select subscription plan')}
                      />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {plans.map((p) => (
                          <SelectItem key={p.plan.id} value={String(p.plan.id)}>
                            {p.plan.title} ($
                            {Number(p.plan.price_amount || 0).toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    className='h-10 rounded-xl px-4'
                    onClick={handleCreate}
                    disabled={creating || !selectedPlanId}
                  >
                    <Plus className='mr-1 h-4 w-4' />
                    {t('Add subscription')}
                  </Button>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between px-1'>
                <h3 className='text-sm font-semibold'>
                  {t('Subscription Records')}
                </h3>
                <span className='text-muted-foreground text-xs'>
                  {loading ? t('Loading...') : `${subs.length} 条记录`}
                </span>
              </div>

              {loading ? (
                <div className='text-muted-foreground bg-background/85 rounded-2xl border py-10 text-center text-sm shadow-sm'>
                  {t('Loading...')}
                </div>
              ) : subs.length === 0 ? (
                <div className='text-muted-foreground bg-background/85 rounded-2xl border py-10 text-center text-sm shadow-sm'>
                  {t('No subscription records')}
                </div>
              ) : (
                <div className='grid gap-3 xl:grid-cols-2'>
                  {subs.map((record) => {
                    const sub = record.subscription
                    const total = Number(sub.amount_total || 0)
                    const used = Number(sub.amount_used || 0)
                    const isActive = isSubscriptionActive(sub)
                    const isCancelled = sub.status === 'cancelled'
                    const paymentMethod = formatSubscriptionPaymentMethod(
                      sub.source,
                      t
                    )

                    return (
                      <div
                        key={sub.id}
                        className='group bg-background/90 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
                      >
                        <div className='flex flex-col gap-4'>
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <div className='flex flex-wrap items-center gap-2'>
                                <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-xs'>
                                  #{sub.id}
                                </span>
                                <div className='truncate text-sm font-semibold'>
                                  {planTitleMap.get(sub.plan_id) ||
                                    `#${sub.plan_id}`}
                                </div>
                                <SubscriptionStatusBadge
                                  sub={record.subscription}
                                  t={t}
                                />
                              </div>
                              <div className='bg-muted/45 text-muted-foreground mt-2 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs'>
                                <CreditCard className='size-3.5' />
                                <span className='text-foreground font-medium'>
                                  {t('Payment Method')}
                                </span>
                                <span>{paymentMethod}</span>
                              </div>
                            </div>
                            <div className='flex shrink-0 items-center gap-1'>
                              {isCancelled ? (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='h-8 rounded-full border-emerald-500/35 px-3 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200'
                                  onClick={() =>
                                    setConfirmAction({
                                      type: 'activate',
                                      subId: sub.id,
                                    })
                                  }
                                >
                                  <CheckCircle2 className='mr-1 size-3.5' />
                                  {t('Activate')}
                                </Button>
                              ) : (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='h-8 rounded-full px-3'
                                  disabled={!isActive}
                                  onClick={() =>
                                    setConfirmAction({
                                      type: 'invalidate',
                                      subId: sub.id,
                                    })
                                  }
                                >
                                  <Ban className='mr-1 size-3.5' />
                                  {t('Invalidate')}
                                </Button>
                              )}
                              <Button
                                size='sm'
                                variant='destructive'
                                className='h-8 rounded-full px-3'
                                onClick={() =>
                                  setConfirmAction({
                                    type: 'delete',
                                    subId: sub.id,
                                  })
                                }
                              >
                                <Trash2 className='mr-1 size-3.5' />
                                {t('Delete')}
                              </Button>
                            </div>
                          </div>

                          <div className='grid gap-3 text-xs sm:grid-cols-2'>
                            <div className='bg-muted/35 flex items-start gap-2 rounded-xl px-3 py-2'>
                              <CalendarDays className='text-muted-foreground mt-0.5 size-3.5' />
                              <div className='min-w-0'>
                                <div className='font-medium'>
                                  {t('Start / End')}
                                </div>
                                <div className='text-muted-foreground mt-0.5'>
                                  {formatTimestamp(sub.start_time)}
                                </div>
                                <div className='text-muted-foreground'>
                                  {formatTimestamp(sub.end_time)}
                                </div>
                              </div>
                            </div>
                            <div className='bg-muted/35 flex items-start gap-2 rounded-xl px-3 py-2'>
                              <CreditCard className='text-muted-foreground mt-0.5 size-3.5' />
                              <div>
                                <div className='font-medium'>
                                  {t('Total Quota')}
                                </div>
                                <div className='text-muted-foreground mt-0.5'>
                                  {total > 0
                                    ? `${used}/${total}`
                                    : t('Unlimited')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {confirmAction && (
        <ConfirmDialog
          open
          onOpenChange={(v) => !v && setConfirmAction(null)}
          title={
            confirmAction.type === 'activate'
              ? t('Confirm activate')
              : confirmAction.type === 'invalidate'
                ? t('Confirm invalidate')
                : t('Confirm delete')
          }
          desc={
            confirmAction.type === 'activate'
              ? t(
                  'After activating, this subscription will become available again if its original period has not ended. Continue?'
                )
              : confirmAction.type === 'invalidate'
                ? t(
                    'After invalidating, this subscription will be immediately deactivated. Historical records are not affected. Continue?'
                  )
                : t(
                    'Deleting will permanently remove this subscription record (including benefit details). Continue?'
                  )
          }
          handleConfirm={handleConfirmAction}
          destructive={confirmAction.type === 'delete'}
        />
      )}
    </>
  )
}
