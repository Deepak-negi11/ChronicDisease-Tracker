import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, ArrowRight, Bell, CalendarClock, ClipboardList, FileText, HeartPulse, LineChart, Pill, Plus, Stethoscope, Users,
} from 'lucide-react'
import { Badge, Disclaimer, Modal, PageHeader, Skeleton, StatCard, Toast } from '../components/ui'
import RecordForm from '../components/RecordForm'
import { TrendChart, Legend } from '../components/charts'
import { useSession } from '../context/session'
import { useData } from '../lib/useData'
import { getDashboard, getRecords, getRules, metricById, seriesFor, summarize, TODAY } from '../data/api'
import { fmtDate, fmtTime, fmtValue, isoDaysAgo, relative } from '../lib/format'
import { metrics } from '../data/fixtures'

export default function Dashboard() {
  const { session } = useSession()
  const pid = session!.patientId
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; alert: boolean } | null>(null)
  const { data, loading } = useData(() => getDashboard(pid), [pid])
  const { data: window30 } = useData(() => getRecords({ patientId: pid, from: isoDaysAgo(TODAY, 30), order: 'asc' }), [pid])
  const { data: rules } = useData(() => getRules(pid), [pid])

  const bp = useMemo(() => {
    if (!window30) return []
    const s = seriesFor(window30, 2)
    const d = new Map(seriesFor(window30, 3).map((p) => [p.date, p.value]))
    return s.map((p) => ({ date: p.date, sys: p.value, dia: d.get(p.date) ?? NaN }))
  }, [window30])

  // Compact per-metric snapshot (latest value + 30-day average)
  const snapshot = useMemo(() => {
    if (!window30) return []
    return metrics
      .filter((m) => m.key !== 'bp_diastolic')
      .map((m) => {
        const pts = seriesFor(window30, m.metric_id)
        const s = summarize(pts)
        return { m, latest: pts[pts.length - 1]?.value, s }
      })
  }, [window30])

  const isPatient = session!.role === 'patient'
  const firstName = session!.name.replace(/^Dr\.\s*/, '').split(' ')[0]
  const upcoming = data?.profile.appointments.filter((a) => a.date >= TODAY.toISOString().slice(0, 10) && a.status !== 'cancelled' && a.status !== 'completed') ?? []
  const bpRule = rules?.find((r) => r.metric_id === 2)

  return (
    <>
      <PageHeader
        eyebrow={TODAY.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        title={isPatient ? `Good morning, ${firstName}` : `Dashboard`}
        description={isPatient ? 'Here is how your readings have moved over the last 30 days.' : `Overview of the platform, with Meera Raghunathan's record in focus.`}
        actions={
          <>
            <Link to="/app/analytics" className="btn btn-ghost"><LineChart className="size-4" /> Analytics</Link>
            <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus className="size-4" /> Log reading</button>
          </>
        }
      />

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {loading || !data ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[132px]" />)
        ) : (
          <>
            <StatCard label={isPatient ? 'My conditions' : 'Registered patients'} value={isPatient ? data.profile.conditions.length : data.totals.registeredPatients} icon={<Users className="size-4" />} tone="teal" hint={isPatient ? 'Tracked diagnoses' : 'All patient accounts'} />
            <StatCard label="Diseases on file" value={data.totals.recordedDiseases} icon={<ClipboardList className="size-4" />} tone="blue" hint="Master disease list" delay={40} />
            <StatCard label="Health records" value={data.totals.healthRecords.toLocaleString()} icon={<HeartPulse className="size-4" />} tone="violet" hint="Timestamped readings" delay={80} />
            <StatCard label="Active prescriptions" value={data.totals.activePrescriptions} icon={<Pill className="size-4" />} tone="teal" hint="No end date passed" delay={120} />
            <StatCard label="Upcoming visits" value={data.totals.upcomingAppointments} icon={<CalendarClock className="size-4" />} tone="blue" hint={upcoming[0] ? `Next: ${fmtDate(upcoming[0].date)}` : 'None booked'} delay={160} />
            <StatCard label="Unread alerts" value={data.totals.unreadAlerts} icon={<Bell className="size-4" />} tone={data.totals.unreadAlerts ? 'rose' : 'teal'} hint="Threshold-based" delay={200} />
          </>
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* BP chart */}
        <div className="card p-6 animate-rise">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Blood pressure · last 30 days</h2>
              <p className="text-sm text-ink-mute">Daily average, mmHg</p>
            </div>
            <Legend series={[{ key: 'sys', label: 'Systolic' }, { key: 'dia', label: 'Diastolic' }]} />
          </div>
          <div className="mt-4">
            {bp.length ? (
              <TrendChart
                data={bp}
                series={[{ key: 'sys', label: 'Systolic' }, { key: 'dia', label: 'Diastolic' }]}
                unit="mmHg"
                limits={bpRule?.upper_threshold ? [{ y: bpRule.upper_threshold, label: `Limit ${bpRule.upper_threshold}` }] : []}
              />
            ) : (
              <Skeleton className="h-[260px]" />
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="card flex flex-col p-6 animate-rise [animation-delay:80ms]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent alerts</h2>
            <Link to="/app/notifications" className="text-xs font-semibold text-teal-brand">View all</Link>
          </div>
          <ul className="mt-4 flex-1 space-y-3">
            {!data
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)
              : data.recentAlerts.map((a) => (
                  <li key={a.alert_id} className="flex gap-3">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${a.status === 'unread' ? 'bg-rose-brand' : 'bg-line'}`} />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-snug text-ink">{a.message}</p>
                      <p className="mt-0.5 text-[11px] text-ink-mute">{relative(a.created_at, TODAY)} · {a.status}</p>
                    </div>
                  </li>
                ))}
          </ul>
          <div className="mt-4"><Disclaimer /></div>
        </div>
      </section>

      {/* Metric snapshot */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {snapshot.map(({ m, latest, s }, i) => (
          <Link key={m.metric_id} to={`/app/analytics?metric=${m.key}`} className="card group p-4 transition hover:-translate-y-0.5 animate-rise" style={{ animationDelay: `${i * 30}ms` }}>
            <p className="truncate text-xs font-medium text-ink-soft">{m.metric_id === 2 ? 'Systolic BP' : m.metric_name}</p>
            <p className="num mt-2 text-xl font-semibold">
              {latest !== undefined ? fmtValue(m.metric_id, latest) : '–'} <span className="text-xs font-medium text-ink-mute">{m.unit}</span>
            </p>
            {s && (
              <p className={`mt-1 text-[11px] font-semibold ${Math.abs(s.changePct) < 1.5 ? 'text-ink-mute' : 'text-ink-soft'}`}>
                {Math.abs(s.changePct) < 1.5 ? '→ steady' : s.changePct > 0 ? `↑ ${s.changePct.toFixed(1)}%` : `↓ ${Math.abs(s.changePct).toFixed(1)}%`}
                <span className="font-normal text-ink-mute"> · avg {fmtValue(m.metric_id, s.avg)}</span>
              </p>
            )}
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Recent records */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 className="font-display text-lg font-semibold">Recent health records</h2>
            <Link to="/app/records" className="text-xs font-semibold text-teal-brand">All records</Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-ink-mute">
                <tr><th className="px-6 py-2 font-semibold">Metric</th><th className="px-3 py-2 font-semibold">Value</th><th className="px-3 py-2 font-semibold">Recorded</th></tr>
              </thead>
              <tbody>
                {data?.recentRecords.map((r) => {
                  const m = metricById(r.metric_id)
                  return (
                    <tr key={r.record_id} className="border-t border-line">
                      <td className="px-6 py-2.5 font-medium">{m.metric_name}</td>
                      <td className="num px-3 py-2.5">{fmtValue(r.metric_id, r.recorded_value)} <span className="text-ink-mute">{m.unit}</span></td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{fmtDate(r.recorded_at)} · {fmtTime(r.recorded_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments + quick links */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold">Upcoming appointments</h2>
            <ul className="mt-4 space-y-3">
              {upcoming.map((a) => (
                <li key={a.appt_id} className="flex items-center gap-3">
                  <div className="grid w-12 shrink-0 place-items-center rounded-xl bg-blue-soft py-1.5 text-blue-brand">
                    <span className="text-[10px] font-semibold uppercase">{new Date(a.date + 'T00:00').toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className="num text-lg font-semibold leading-none">{a.date.slice(8)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.doctor.name}</p>
                    <p className="truncate text-xs text-ink-mute">{a.time} · {a.notes}</p>
                  </div>
                  <Badge tone={a.status === 'rescheduled' ? 'amber' : 'teal'}>{a.status}</Badge>
                </li>
              ))}
              {data && !upcoming.length && <p className="text-sm text-ink-mute">No upcoming appointments.</p>}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold">Quick navigation</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { to: '/app/records', label: 'Records', icon: HeartPulse },
                { to: '/app/analytics', label: 'Analytics', icon: LineChart },
                { to: '/app/prescriptions', label: 'Prescriptions', icon: FileText },
                { to: '/app/appointments', label: 'Appointments', icon: CalendarClock },
                { to: '/app/doctors', label: 'Doctors', icon: Stethoscope },
                { to: '/app/reports', label: 'Reports', icon: Activity },
              ].map((q) => (
                <Link key={q.to} to={q.to} className="group flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-ink-soft hover:border-teal-brand hover:text-ink">
                  <q.icon className="size-4 text-teal-brand" /> {q.label}
                  <ArrowRight className="ml-auto size-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Log a health reading">
        <RecordForm
          patientId={pid}
          onDone={(r) => {
            setOpen(false)
            setToast(r)
          }}
        />
      </Modal>
      <Toast message={toast?.message ?? null} tone={toast?.alert ? 'amber' : 'teal'} onDone={() => setToast(null)} />
    </>
  )
}
