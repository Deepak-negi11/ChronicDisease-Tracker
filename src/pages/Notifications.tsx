import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellOff, CheckCheck, CircleCheck, Eye, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge, Disclaimer, EmptyState, PageHeader, Skeleton } from '../components/ui'
import { useSession } from '../context/session'
import { useData } from '../lib/useData'
import { getAlerts, getRules, metricById, setAlertStatus } from '../data/api'
import { fmtDate, fmtTime } from '../lib/format'
import type { Alert } from '../data/fixtures'

const FILTERS: (Alert['status'] | 'all')[] = ['all', 'unread', 'read', 'resolved']

export default function Notifications() {
  const { session } = useSession()
  const pid = session!.patientId
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const { data } = useData(() => getAlerts(pid), [pid])
  const { data: rules } = useData(() => getRules(pid), [pid])
  const list = (data ?? []).filter((a) => filter === 'all' || a.status === filter)
  const unread = data?.filter((a) => a.status === 'unread') ?? []

  return (
    <>
      <PageHeader
        eyebrow="Module 10 · Rule-based alerts"
        title="Notifications"
        description="Alerts are created automatically when a reading falls outside a threshold your care team configured."
        actions={unread.length > 0 && (
          <button className="btn btn-ghost" onClick={() => unread.forEach((a) => setAlertStatus(a.alert_id, 'read'))}><CheckCheck className="size-4" /> Mark all read</button>
        )}
      />
      <div className="mb-5"><Disclaimer /></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex gap-1 rounded-xl border border-line bg-white p-1 sm:w-fit">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? 'bg-ink text-white' : 'text-ink-soft'}`}>
                {f}{f === 'unread' && unread.length ? ` (${unread.length})` : ''}
              </button>
            ))}
          </div>
          <div className="card divide-y divide-line">
            {!data ? (
              <div className="space-y-2 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : !list.length ? (
              <EmptyState icon={<BellOff className="size-5" />} title="Nothing here">No {filter === 'all' ? '' : filter} alerts.</EmptyState>
            ) : (
              list.map((a) => (
                <div key={a.alert_id} className={`flex gap-4 p-5 ${a.status === 'unread' ? 'bg-rose-soft/30' : ''}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${a.alert_type === 'above_threshold' ? 'bg-amber-soft text-amber-brand' : 'bg-blue-soft text-blue-brand'}`}>
                    {a.alert_type === 'above_threshold' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{a.alert_type === 'above_threshold' ? 'Above upper threshold' : 'Below lower threshold'}</p>
                      <Badge tone={a.status === 'unread' ? 'rose' : a.status === 'resolved' ? 'teal' : 'neutral'}>{a.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{a.message}</p>
                    <p className="mt-1 text-xs text-ink-mute">
                      {fmtDate(a.created_at)} · {fmtTime(a.created_at)}
                      {a.record_id ? <> · <Link to="/app/records" className="font-semibold text-teal-brand">record #{a.record_id}</Link></> : ' · source record deleted'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-start">
                    {a.status === 'unread' && (
                      <button className="btn btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => setAlertStatus(a.alert_id, 'read')}><Eye className="size-3.5" /> Read</button>
                    )}
                    {a.status !== 'resolved' && (
                      <button className="btn btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => setAlertStatus(a.alert_id, 'resolved')}><CircleCheck className="size-3.5" /> Resolve</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="font-display text-lg font-semibold">Active alert rules</h2>
          <p className="mt-1 text-xs text-ink-mute">Thresholds are configured per patient by the care team. There are no universal medical limits.</p>
          <ul className="mt-4 space-y-3">
            {rules?.map((r) => {
              const m = metricById(r.metric_id)
              return (
                <li key={r.rule_id} className="rounded-xl border border-line p-3">
                  <p className="text-sm font-semibold">{m.metric_name}</p>
                  <p className="num mt-0.5 text-sm text-ink-soft">{r.lower_threshold ?? '–'} to {r.upper_threshold ?? '–'} {m.unit}</p>
                  <p className="mt-1 text-[11px] text-ink-mute">{r.patient_id === null ? 'Applies to all patients' : 'Personal rule'} · {r.set_by}</p>
                </li>
              )
            })}
          </ul>
          {session!.role !== 'patient' && <p className="mt-4 text-xs text-ink-mute">Editing rules arrives with the alerts milestone.</p>}
        </aside>
      </div>
    </>
  )
}
