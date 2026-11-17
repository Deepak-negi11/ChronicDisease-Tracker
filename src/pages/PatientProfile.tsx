import { Link } from 'react-router-dom'
import { CalendarClock, ClipboardList, HeartPulse, Mail, MapPin, Phone, Pill } from 'lucide-react'
import { Badge, PageHeader, Skeleton } from '../components/ui'
import { TrendChart } from '../components/charts'
import { useSession } from '../context/session'
import { useData } from '../lib/useData'
import { getPatient, getRecords, metricById, seriesFor, TODAY } from '../data/api'
import { fmtDate, fmtTime, fmtValue, isoDaysAgo } from '../lib/format'

const statusTone = { active: 'rose', managed: 'blue', in_remission: 'teal' } as const

export default function PatientProfile() {
  const { session } = useSession()
  const pid = session!.patientId
  const { data } = useData(() => getPatient(pid), [pid])
  const { data: history } = useData(() => getRecords({ patientId: pid, from: isoDaysAgo(TODAY, 90), order: 'asc' }), [pid])

  if (!data) return <Skeleton className="h-[520px]" />
  const { patient, conditions, prescriptions, appointments } = data
  const glucose = history ? seriesFor(history, 4).map((p) => ({ date: p.date, v: p.value })) : []
  const initials = patient.name.split(' ').map((p) => p[0]).slice(0, 2).join('')

  return (
    <>
      <PageHeader eyebrow="Module 2 · Patient profile" title={patient.name} description={`Patient #${String(patient.patient_id).padStart(5, '0')} · ${patient.age} years · ${patient.gender}`} />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-6">
          <div className="card p-6 animate-rise">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-brand to-blue-brand font-display text-xl font-semibold text-white">{initials}</span>
              <div>
                <p className="font-display text-lg font-semibold">{patient.name}</p>
                <p className="text-sm text-ink-mute">{conditions.length} tracked conditions</p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-ink-soft"><Mail className="size-4 text-ink-mute" /> {patient.email}</div>
              <div className="flex items-center gap-3 text-ink-soft"><Phone className="size-4 text-ink-mute" /> <span className="num">{patient.phone}</span></div>
              <div className="flex items-center gap-3 text-ink-soft"><MapPin className="size-4 text-ink-mute" /> {patient.address}</div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><ClipboardList className="size-4 text-teal-brand" /> Conditions</h2>
            <ul className="mt-4 space-y-4">
              {conditions.map((c) => (
                <li key={c.patient_disease_id}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-snug">{c.disease.name}</p>
                    <Badge tone={statusTone[c.status]}>{c.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-mute">{c.disease.category} · diagnosed {fmtDate(c.diagnosis_date)}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="card p-6 animate-rise [animation-delay:60ms]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Fasting glucose · 90 days</h2>
              <Link to="/app/analytics?metric=glucose" className="text-xs font-semibold text-teal-brand">Open in analytics</Link>
            </div>
            <div className="mt-3">
              {glucose.length ? <TrendChart data={glucose} series={[{ key: 'v', label: 'Glucose' }]} unit="mg/dL" height={220} /> : <Skeleton className="h-[220px]" />}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Pill className="size-4 text-teal-brand" /> Prescriptions</h2>
              <ul className="mt-4 divide-y divide-line">
                {prescriptions.map((p) => (
                  <li key={p.presc_id} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{p.medication.name} <span className="num font-normal text-ink-mute">{p.medication.dosage}</span></p>
                      <Badge tone={p.active ? 'teal' : 'neutral'}>{p.active ? 'active' : 'completed'}</Badge>
                    </div>
                    <p className="text-xs text-ink-mute">{p.medication.frequency} · {p.doctor.name}</p>
                    <p className="num mt-0.5 text-xs text-ink-mute">{fmtDate(p.start_date)} → {p.end_date ? fmtDate(p.end_date) : 'ongoing'}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><CalendarClock className="size-4 text-teal-brand" /> Appointments</h2>
              <ul className="mt-4 divide-y divide-line">
                {appointments.map((a) => (
                  <li key={a.appt_id} className="flex items-center justify-between gap-2 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{a.doctor.name}</p>
                      <p className="num text-xs text-ink-mute">{fmtDate(a.date)} · {a.time} · {a.doctor.specialization}</p>
                    </div>
                    <Badge tone={a.status === 'completed' ? 'neutral' : a.status === 'rescheduled' ? 'amber' : a.status === 'cancelled' ? 'rose' : 'teal'}>{a.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><HeartPulse className="size-4 text-teal-brand" /> Health history</h2>
              <Link to="/app/records" className="text-xs font-semibold text-teal-brand">Full history</Link>
            </div>
            <ol className="mt-4 space-y-0">
              {[...(history ?? [])].reverse().filter((r) => r.notes || r.symptom_ids.length).slice(0, 6).map((r) => {
                const m = metricById(r.metric_id)
                return (
                  <li key={r.record_id} className="relative border-l border-line pb-4 pl-5 last:pb-0">
                    <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-white bg-violet-brand" />
                    <p className="text-xs text-ink-mute">{fmtDate(r.recorded_at)} · {fmtTime(r.recorded_at)}</p>
                    <p className="text-sm"><span className="font-semibold">{m.metric_name}</span> <span className="num">{fmtValue(r.metric_id, r.recorded_value)} {m.unit}</span>{r.notes && <span className="text-ink-soft"> · {r.notes}</span>}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}
