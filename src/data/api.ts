/**
 * Data access layer — the ONLY place the UI gets data from.
 *
 * Milestone 1: functions resolve against the in-browser stub store
 * (src/data/fixtures.ts). Each function's name and return shape
 * matches a REST endpoint planned in PLAN.md (shown in the comment),
 * so Milestone 2+ replaces the bodies with `fetch('/api/...')`.
 */
import {
  alertRules,
  alerts as seedAlerts,
  appointments,
  diseases,
  doctors,
  healthRecords as seedRecords,
  medications,
  metrics,
  patientDiseases,
  patients,
  platformTotals,
  prescriptions,
  symptoms,
  TODAY,
  type Alert,
  type HealthRecord,
  type MetricKey,
} from './fixtures'

// Mutable session copies so add / edit / delete feel real during the demo.
let records: HealthRecord[] = [...seedRecords]
let alerts: Alert[] = [...seedAlerts]
let nextRecordId = Math.max(...records.map((r) => r.record_id)) + 1
let nextAlertId = Math.max(0, ...alerts.map((a) => a.alert_id)) + 1

const listeners = new Set<() => void>()
export const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
const emit = () => listeners.forEach((fn) => fn())

const delay = <T,>(value: T, ms = 220) => new Promise<T>((res) => setTimeout(() => res(value), ms))

export const metricByKey = (key: MetricKey) => metrics.find((m) => m.key === key)!
export const metricById = (id: number) => metrics.find((m) => m.metric_id === id)!

/* ---------- reference data ---------- */
export const getMetrics = () => delay(metrics, 0) // GET /api/metrics
export const getSymptoms = () => delay(symptoms, 0) // GET /api/symptoms
export const getRules = (patientId: number) => // GET /api/patients/:id/alert-rules
  delay(alertRules.filter((r) => r.patient_id === patientId || r.patient_id === null), 0)

/* ---------- patients ---------- */
export function getPatient(patientId: number) { // GET /api/patients/:id
  const patient = patients.find((p) => p.patient_id === patientId)!
  const conditions = patientDiseases
    .filter((pd) => pd.patient_id === patientId)
    .map((pd) => ({ ...pd, disease: diseases.find((d) => d.disease_id === pd.disease_id)! }))
  const rx = prescriptions
    .filter((p) => p.patient_id === patientId)
    .map((p) => ({
      ...p,
      medication: medications.find((m) => m.med_id === p.med_id)!,
      doctor: doctors.find((d) => d.doctor_id === p.doctor_id)!,
      active: !p.end_date || new Date(p.end_date) >= TODAY,
    }))
  const appts = appointments
    .filter((a) => a.patient_id === patientId)
    .map((a) => ({ ...a, doctor: doctors.find((d) => d.doctor_id === a.doctor_id)! }))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  return delay({ patient, conditions, prescriptions: rx, appointments: appts })
}

/* ---------- health records ---------- */
export interface RecordQuery {
  patientId: number
  metricId?: number | 'all'
  from?: string // yyyy-mm-dd
  to?: string
  order?: 'desc' | 'asc'
}

export function getRecords(q: RecordQuery) { // GET /api/patients/:id/records?metric=&from=&to=&order=
  let rows = records.filter((r) => r.patient_id === q.patientId)
  if (q.metricId && q.metricId !== 'all') rows = rows.filter((r) => r.metric_id === q.metricId)
  if (q.from) rows = rows.filter((r) => r.recorded_at.slice(0, 10) >= q.from!)
  if (q.to) rows = rows.filter((r) => r.recorded_at.slice(0, 10) <= q.to!)
  rows = [...rows].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
  if (q.order === 'asc') rows.reverse()
  return delay(rows)
}

export interface RecordInput {
  patient_id: number
  metric_id: number
  recorded_value: number
  recorded_at: string
  patient_disease_id: number | null
  notes: string
  symptom_ids: number[]
}

/**
 * POST /api/records — later this runs inside a single DB transaction:
 * INSERT health_record → INSERT record_symptoms → evaluate alert_rules
 * → INSERT alerts (all-or-nothing).
 */
export function createRecord(input: RecordInput) {
  const record: HealthRecord = { ...input, record_id: nextRecordId++ }
  records = [record, ...records]
  const created = evaluateRules(record)
  emit()
  return delay({ record, alerts: created })
}

export function updateRecord(id: number, input: RecordInput) { // PUT /api/records/:id
  records = records.map((r) => (r.record_id === id ? { ...input, record_id: id } : r))
  emit()
  return delay(true)
}

export function deleteRecord(id: number) { // DELETE /api/records/:id
  records = records.filter((r) => r.record_id !== id)
  alerts = alerts.map((a) => (a.record_id === id ? { ...a, record_id: null } : a)) // ON DELETE SET NULL
  emit()
  return delay(true)
}

function evaluateRules(r: HealthRecord): Alert[] {
  const rule = alertRules.find((x) => x.metric_id === r.metric_id && (x.patient_id === r.patient_id || x.patient_id === null))
  if (!rule) return []
  const m = metricById(r.metric_id)
  let alert: Alert | null = null
  const base = { alert_id: nextAlertId, patient_id: r.patient_id, record_id: r.record_id, created_at: r.recorded_at, status: 'unread' as const }
  if (rule.upper_threshold !== null && r.recorded_value > rule.upper_threshold)
    alert = { ...base, alert_type: 'above_threshold', message: `${m.metric_name} of ${r.recorded_value} ${m.unit} is above your configured upper limit of ${rule.upper_threshold} ${m.unit}.` }
  else if (rule.lower_threshold !== null && r.recorded_value < rule.lower_threshold)
    alert = { ...base, alert_type: 'below_threshold', message: `${m.metric_name} of ${r.recorded_value} ${m.unit} is below your configured lower limit of ${rule.lower_threshold} ${m.unit}.` }
  if (!alert) return []
  nextAlertId++
  alerts = [alert, ...alerts]
  return [alert]
}

/* ---------- alerts ---------- */
export const getAlerts = (patientId: number) => delay(alerts.filter((a) => a.patient_id === patientId)) // GET /api/alerts
export function setAlertStatus(id: number, status: Alert['status']) { // PATCH /api/alerts/:id
  alerts = alerts.map((a) => (a.alert_id === id ? { ...a, status } : a))
  emit()
  return delay(true, 80)
}

/* ---------- dashboard ---------- */
export async function getDashboard(patientId: number) { // GET /api/dashboard
  const [profile, recent, patientAlerts] = await Promise.all([
    getPatient(patientId),
    getRecords({ patientId }),
    getAlerts(patientId),
  ])
  const todayStr = TODAY.toISOString().slice(0, 10)
  return {
    totals: {
      ...platformTotals,
      healthRecords: records.length,
      activePrescriptions: profile.prescriptions.filter((p) => p.active).length,
      upcomingAppointments: profile.appointments.filter((a) => a.date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed').length,
      unreadAlerts: patientAlerts.filter((a) => a.status === 'unread').length,
    },
    profile,
    recentRecords: recent.slice(0, 8),
    recentAlerts: patientAlerts.slice(0, 5),
  }
}

/* ---------- analytics (later: SQL AVG/MIN/MAX … GROUP BY) ---------- */
export interface Point { date: string; value: number }

/** Daily series for one metric between two dates (averaged per day). */
export function seriesFor(rows: HealthRecord[], metricId: number): Point[] {
  const byDay = new Map<string, number[]>()
  for (const r of rows) {
    if (r.metric_id !== metricId) continue
    const k = r.recorded_at.slice(0, 10)
    byDay.set(k, [...(byDay.get(k) ?? []), r.recorded_value])
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, value: vals.reduce((s, v) => s + v, 0) / vals.length }))
}

export interface Summary { count: number; avg: number; min: number; max: number; first: number; last: number; changePct: number }

export function summarize(points: Point[]): Summary | null {
  if (!points.length) return null
  const vals = points.map((p) => p.value)
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length
  // Compare the average of the first and last quarter of the window → trend direction
  const q = Math.max(1, Math.floor(vals.length / 4))
  const head = vals.slice(0, q).reduce((s, v) => s + v, 0) / q
  const tail = vals.slice(-q).reduce((s, v) => s + v, 0) / q
  return { count: vals.length, avg, min: Math.min(...vals), max: Math.max(...vals), first: head, last: tail, changePct: ((tail - head) / head) * 100 }
}

/** Group a daily series into weekly or monthly buckets (AVG per bucket). */
export function bucket(points: Point[], by: 'week' | 'month'): Point[] {
  const groups = new Map<string, number[]>()
  for (const p of points) {
    const d = new Date(p.date + 'T00:00:00')
    let key: string
    if (by === 'month') key = p.date.slice(0, 7)
    else {
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      key = monday.toISOString().slice(0, 10)
    }
    groups.set(key, [...(groups.get(key) ?? []), p.value])
  }
  return [...groups.entries()].map(([date, vals]) => ({ date, value: vals.reduce((s, v) => s + v, 0) / vals.length }))
}

export { TODAY }
