/**
 * STUB DATA MODULE — Milestone 1
 * ---------------------------------------------------------------
 * Every screen reads its data from this file (via src/data/api.ts).
 * The shapes deliberately mirror the relational tables planned in
 * PLAN.md (USERS, PATIENT, DISEASE, PATIENT_DISEASES, HEALTH_METRICS,
 * HEALTH_RECORD, SYMPTOM, RECORD_SYMPTOMS, MEDICATION, PRESCRIPTION,
 * DOCTOR, APPOINTMENT, ALERTS, ALERT_RULES) so that a later milestone
 * can swap this module for real REST calls without touching the UI.
 *
 * Measurements are generated with a seeded PRNG, so the numbers are
 * stable between reloads and look like real, slightly noisy readings.
 */

export type Role = 'patient' | 'doctor' | 'admin'

export interface Patient {
  patient_id: number
  user_id: number
  name: string
  age: number
  gender: 'Female' | 'Male' | 'Other'
  email: string
  phone: string
  address: string
}

export interface Disease {
  disease_id: number
  name: string
  description: string
  category: string
}

export interface PatientDisease {
  patient_disease_id: number
  patient_id: number
  disease_id: number
  diagnosis_date: string
  status: 'active' | 'managed' | 'in_remission'
}

export type MetricKey =
  | 'heart_rate'
  | 'bp_systolic'
  | 'bp_diastolic'
  | 'glucose'
  | 'weight'
  | 'sleep'
  | 'steps'

export interface HealthMetric {
  metric_id: number
  key: MetricKey
  metric_name: string
  unit: string
  normal_range_description: string
  decimals: number
}

export interface HealthRecord {
  record_id: number
  patient_id: number
  metric_id: number
  patient_disease_id: number | null
  recorded_value: number
  recorded_at: string // ISO timestamp
  notes: string
  symptom_ids: number[]
}

export interface Symptom {
  symptom_id: number
  name: string
  description: string
  severity_level: 'mild' | 'moderate' | 'severe'
}

export interface Medication {
  med_id: number
  name: string
  dosage: string
  frequency: string
  description: string
}

export interface Prescription {
  presc_id: number
  patient_id: number
  med_id: number
  doctor_id: number
  start_date: string
  end_date: string | null
  notes: string
}

export interface Doctor {
  doctor_id: number
  name: string
  specialization: string
  phone: string
  email: string
}

export interface Appointment {
  appt_id: number
  patient_id: number
  doctor_id: number
  date: string
  time: string
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
}

/** Configurable threshold rule — set per patient (or globally) by a doctor/admin. */
export interface AlertRule {
  rule_id: number
  patient_id: number | null
  metric_id: number
  lower_threshold: number | null
  upper_threshold: number | null
  set_by: string
}

export interface Alert {
  alert_id: number
  patient_id: number
  record_id: number | null
  alert_type: 'above_threshold' | 'below_threshold' | 'missed_reading'
  message: string
  created_at: string
  status: 'unread' | 'read' | 'resolved'
}

/* ------------------------------------------------------------------ */
/* Reference date — the stub "today"                                   */
/* ------------------------------------------------------------------ */
export const TODAY = new Date('2026-11-16T09:30:00')

const dayOffset = (days: number, hour = 8, minute = 0) => {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

/* ------------------------------------------------------------------ */
/* Master data                                                         */
/* ------------------------------------------------------------------ */
export const patients: Patient[] = [
  { patient_id: 1, user_id: 4, name: 'Meera Raghunathan', age: 54, gender: 'Female', email: 'meera.r@example.in', phone: '+91 98450 31267', address: '14 Lavelle Road, Bengaluru' },
  { patient_id: 2, user_id: 5, name: 'Tobias Okonkwo-Hale', age: 61, gender: 'Male', email: 'tobias.oh@example.com', phone: '+44 7700 914 382', address: '3 Ferncliff Mews, Leeds' },
  { patient_id: 3, user_id: 6, name: 'Arjun Bhatnagar', age: 47, gender: 'Male', email: 'arjun.b@example.in', phone: '+91 99672 08814', address: '221 Sector 17, Chandigarh' },
  { patient_id: 4, user_id: 7, name: 'Lucía Ferrándiz', age: 38, gender: 'Female', email: 'lucia.f@example.es', phone: '+34 612 448 093', address: 'Calle Moratín 9, Valencia' },
  { patient_id: 5, user_id: 8, name: 'Haruto Ishikawa', age: 69, gender: 'Male', email: 'haruto.i@example.jp', phone: '+81 90 3381 2746', address: '2-7 Kamiyamacho, Shibuya' },
  { patient_id: 6, user_id: 9, name: 'Priyanka Deshmukh', age: 42, gender: 'Female', email: 'priyanka.d@example.in', phone: '+91 97302 55190', address: '7 Prabhat Road, Pune' },
]

export const diseases: Disease[] = [
  { disease_id: 1, name: 'Type 2 Diabetes Mellitus', description: 'Chronic condition affecting how the body regulates blood glucose.', category: 'Endocrine' },
  { disease_id: 2, name: 'Essential Hypertension', description: 'Persistently elevated arterial blood pressure without a single identifiable cause.', category: 'Cardiovascular' },
  { disease_id: 3, name: 'Asthma', description: 'Chronic inflammatory disease of the airways with episodic breathlessness.', category: 'Respiratory' },
  { disease_id: 4, name: 'Hypothyroidism', description: 'Under-active thyroid gland producing insufficient thyroid hormone.', category: 'Endocrine' },
  { disease_id: 5, name: 'Chronic Kidney Disease (Stage 2)', description: 'Mildly reduced kidney function persisting for more than three months.', category: 'Renal' },
  { disease_id: 6, name: 'Rheumatoid Arthritis', description: 'Autoimmune disorder causing joint inflammation and stiffness.', category: 'Musculoskeletal' },
]

export const patientDiseases: PatientDisease[] = [
  { patient_disease_id: 1, patient_id: 1, disease_id: 1, diagnosis_date: '2019-03-11', status: 'active' },
  { patient_disease_id: 2, patient_id: 1, disease_id: 2, diagnosis_date: '2021-08-02', status: 'managed' },
  { patient_disease_id: 3, patient_id: 2, disease_id: 2, diagnosis_date: '2017-05-23', status: 'active' },
  { patient_disease_id: 4, patient_id: 2, disease_id: 5, diagnosis_date: '2023-01-17', status: 'active' },
  { patient_disease_id: 5, patient_id: 3, disease_id: 1, diagnosis_date: '2022-10-04', status: 'active' },
  { patient_disease_id: 6, patient_id: 4, disease_id: 3, diagnosis_date: '2009-06-29', status: 'managed' },
  { patient_disease_id: 7, patient_id: 4, disease_id: 4, diagnosis_date: '2024-02-13', status: 'active' },
  { patient_disease_id: 8, patient_id: 5, disease_id: 2, diagnosis_date: '2014-09-08', status: 'managed' },
  { patient_disease_id: 9, patient_id: 5, disease_id: 6, diagnosis_date: '2020-12-01', status: 'active' },
  { patient_disease_id: 10, patient_id: 6, disease_id: 4, diagnosis_date: '2018-04-19', status: 'in_remission' },
]

export const metrics: HealthMetric[] = [
  { metric_id: 1, key: 'heart_rate', metric_name: 'Heart rate', unit: 'bpm', normal_range_description: 'Resting range is set by your care team', decimals: 0 },
  { metric_id: 2, key: 'bp_systolic', metric_name: 'Blood pressure (systolic)', unit: 'mmHg', normal_range_description: 'Upper number of a BP reading', decimals: 0 },
  { metric_id: 3, key: 'bp_diastolic', metric_name: 'Blood pressure (diastolic)', unit: 'mmHg', normal_range_description: 'Lower number of a BP reading', decimals: 0 },
  { metric_id: 4, key: 'glucose', metric_name: 'Blood glucose (fasting)', unit: 'mg/dL', normal_range_description: 'Fasting target agreed with your doctor', decimals: 0 },
  { metric_id: 5, key: 'weight', metric_name: 'Weight', unit: 'kg', normal_range_description: 'Track direction over time', decimals: 1 },
  { metric_id: 6, key: 'sleep', metric_name: 'Sleep duration', unit: 'hours', normal_range_description: 'Total sleep the previous night', decimals: 1 },
  { metric_id: 7, key: 'steps', metric_name: 'Daily steps', unit: 'steps', normal_range_description: 'Step count for the full day', decimals: 0 },
]

export const symptoms: Symptom[] = [
  { symptom_id: 1, name: 'Fatigue', description: 'Unusual tiredness or low energy', severity_level: 'mild' },
  { symptom_id: 2, name: 'Headache', description: 'Pain or pressure in the head', severity_level: 'moderate' },
  { symptom_id: 3, name: 'Dizziness', description: 'Light-headedness or unsteadiness', severity_level: 'moderate' },
  { symptom_id: 4, name: 'Excessive thirst', description: 'Persistent need to drink fluids', severity_level: 'mild' },
  { symptom_id: 5, name: 'Blurred vision', description: 'Temporary loss of visual sharpness', severity_level: 'severe' },
  { symptom_id: 6, name: 'Nausea', description: 'Feeling of sickness or queasiness', severity_level: 'moderate' },
  { symptom_id: 7, name: 'Shortness of breath', description: 'Difficulty breathing during light activity', severity_level: 'severe' },
]

export const medications: Medication[] = [
  { med_id: 1, name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily with meals', description: 'Biguanide used in type 2 diabetes management' },
  { med_id: 2, name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily', description: 'Calcium-channel blocker for blood pressure' },
  { med_id: 3, name: 'Levothyroxine', dosage: '50 mcg', frequency: 'Once daily, before breakfast', description: 'Thyroid hormone replacement' },
  { med_id: 4, name: 'Salbutamol inhaler', dosage: '100 mcg / puff', frequency: 'As needed', description: 'Short-acting bronchodilator' },
  { med_id: 5, name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily', description: 'Angiotensin receptor blocker' },
]

export const doctors: Doctor[] = [
  { doctor_id: 1, name: 'Dr. Kavitha Subramaniam', specialization: 'Endocrinology', phone: '+91 80 4127 6630', email: 'k.subramaniam@clinic.example' },
  { doctor_id: 2, name: 'Dr. Ewan Marchetti', specialization: 'Cardiology', phone: '+44 113 496 0712', email: 'e.marchetti@clinic.example' },
  { doctor_id: 3, name: 'Dr. Noor Al-Hashimi', specialization: 'Internal Medicine', phone: '+971 4 388 2219', email: 'n.alhashimi@clinic.example' },
  { doctor_id: 4, name: 'Dr. Sébastien Roux', specialization: 'Pulmonology', phone: '+33 1 84 88 31 07', email: 's.roux@clinic.example' },
]

export const prescriptions: Prescription[] = [
  { presc_id: 1, patient_id: 1, med_id: 1, doctor_id: 1, start_date: '2025-02-01', end_date: null, notes: 'Take with breakfast and dinner' },
  { presc_id: 2, patient_id: 1, med_id: 2, doctor_id: 2, start_date: '2025-09-14', end_date: null, notes: 'Review at next cardiology visit' },
  { presc_id: 3, patient_id: 1, med_id: 5, doctor_id: 2, start_date: '2024-03-10', end_date: '2025-09-13', notes: 'Switched to amlodipine' },
  { presc_id: 4, patient_id: 2, med_id: 5, doctor_id: 2, start_date: '2024-11-20', end_date: null, notes: '' },
  { presc_id: 5, patient_id: 4, med_id: 3, doctor_id: 3, start_date: '2024-02-20', end_date: null, notes: '' },
  { presc_id: 6, patient_id: 4, med_id: 4, doctor_id: 4, start_date: '2023-07-01', end_date: null, notes: 'Carry at all times' },
  { presc_id: 7, patient_id: 3, med_id: 1, doctor_id: 1, start_date: '2026-01-05', end_date: null, notes: '' },
]

export const appointments: Appointment[] = [
  { appt_id: 1, patient_id: 1, doctor_id: 1, date: '2026-11-19', time: '10:15', notes: 'Quarterly HbA1c review', status: 'scheduled' },
  { appt_id: 2, patient_id: 1, doctor_id: 2, date: '2026-12-03', time: '16:40', notes: 'BP follow-up after medication change', status: 'rescheduled' },
  { appt_id: 3, patient_id: 2, doctor_id: 2, date: '2026-11-21', time: '09:00', notes: 'Echo results', status: 'scheduled' },
  { appt_id: 4, patient_id: 4, doctor_id: 4, date: '2026-11-25', time: '11:30', notes: 'Spirometry', status: 'scheduled' },
  { appt_id: 5, patient_id: 1, doctor_id: 1, date: '2026-08-20', time: '10:00', notes: 'Routine review', status: 'completed' },
  { appt_id: 6, patient_id: 5, doctor_id: 3, date: '2026-11-18', time: '14:20', notes: 'Joint pain assessment', status: 'scheduled' },
]

export const alertRules: AlertRule[] = [
  { rule_id: 1, patient_id: 1, metric_id: 4, lower_threshold: 75, upper_threshold: 140, set_by: 'Dr. Kavitha Subramaniam' },
  { rule_id: 2, patient_id: 1, metric_id: 2, lower_threshold: 95, upper_threshold: 140, set_by: 'Dr. Ewan Marchetti' },
  { rule_id: 3, patient_id: 1, metric_id: 3, lower_threshold: 60, upper_threshold: 90, set_by: 'Dr. Ewan Marchetti' },
  { rule_id: 4, patient_id: 1, metric_id: 1, lower_threshold: 50, upper_threshold: 100, set_by: 'Dr. Ewan Marchetti' },
  { rule_id: 5, patient_id: null, metric_id: 6, lower_threshold: 5, upper_threshold: null, set_by: 'System default (admin)' },
]

/* ------------------------------------------------------------------ */
/* Generated measurement history (patient 1, ~120 days)                */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateHistory(): HealthRecord[] {
  const rand = mulberry32(20261116)
  const noise = (amp: number) => (rand() - 0.5) * 2 * amp
  const out: HealthRecord[] = []
  let id = 1
  const DAYS = 120

  for (let d = DAYS; d >= 0; d--) {
    const progress = (DAYS - d) / DAYS // 0 → 1 over the period
    const weekend = new Date(dayOffset(d)).getDay() % 6 === 0
    const push = (metric_id: number, value: number, hour: number, pd: number | null, notes = '', symptom_ids: number[] = []) =>
      out.push({ record_id: id++, patient_id: 1, metric_id, patient_disease_id: pd, recorded_value: value, recorded_at: dayOffset(d, hour, Math.floor(rand() * 50)), notes, symptom_ids })

    // Fasting glucose: slowly improving after medication adherence, with a spike cluster ~day 40
    let glucose = 152 - progress * 34 + noise(11)
    if (d >= 38 && d <= 42) glucose += 26
    push(4, Math.round(glucose), 7, 1, d === 40 ? 'Festival week — skipped evening walk' : '', d === 40 ? [4, 1] : [])

    // BP: drops after amlodipine (switch ~60 days ago)
    const sys = (d > 60 ? 142 : 131) + noise(7)
    const dia = (d > 60 ? 91 : 84) + noise(4)
    push(2, Math.round(sys), 8, 2, d === 72 ? 'Morning headache' : '', d === 72 ? [2] : [])
    push(3, Math.round(dia), 8, 2)

    push(1, Math.round(74 - progress * 4 + noise(6)), 8, null)
    push(6, Math.round((6.6 + noise(1.1) + (weekend ? 0.8 : 0)) * 10) / 10, 7, null, '', rand() > 0.94 ? [1] : [])
    push(7, Math.round(5200 + progress * 2600 + noise(1800) + (weekend ? 1500 : 0)), 22, null)
    if (d % 3 === 0) push(5, Math.round((78.4 - progress * 2.6 + noise(0.4)) * 10) / 10, 7, 1)
  }
  return out.reverse() // newest first
}

export const healthRecords: HealthRecord[] = generateHistory()

/* ------------------------------------------------------------------ */
/* Alerts derived from the rules above (mirrors the rule engine later) */
/* ------------------------------------------------------------------ */
function deriveAlerts(): Alert[] {
  const out: Alert[] = []
  let id = 1
  const recent = healthRecords.filter((r) => r.patient_id === 1 && new Date(r.recorded_at) > new Date(dayOffset(75)))
  for (const r of recent) {
    const rule = alertRules.find((x) => x.metric_id === r.metric_id && (x.patient_id === r.patient_id || x.patient_id === null))
    if (!rule) continue
    const m = metrics.find((x) => x.metric_id === r.metric_id)!
    if (rule.upper_threshold !== null && r.recorded_value > rule.upper_threshold) {
      out.push({ alert_id: id++, patient_id: 1, record_id: r.record_id, alert_type: 'above_threshold', created_at: r.recorded_at, status: 'unread',
        message: `${m.metric_name} of ${r.recorded_value} ${m.unit} is above your configured upper limit of ${rule.upper_threshold} ${m.unit}.` })
    } else if (rule.lower_threshold !== null && r.recorded_value < rule.lower_threshold) {
      out.push({ alert_id: id++, patient_id: 1, record_id: r.record_id, alert_type: 'below_threshold', created_at: r.recorded_at, status: 'unread',
        message: `${m.metric_name} of ${r.recorded_value} ${m.unit} is below your configured lower limit of ${rule.lower_threshold} ${m.unit}.` })
    }
  }
  out.sort((a, b) => b.created_at.localeCompare(a.created_at))
  // Older alerts have already been reviewed
  return out.map((a, i) => ({ ...a, status: i < 4 ? 'unread' : i < 9 ? 'read' : 'resolved' }))
}

export const alerts: Alert[] = deriveAlerts()

/** Platform-wide counters used by the doctor/admin dashboard view. */
export const platformTotals = {
  registeredPatients: patients.length,
  recordedDiseases: diseases.length,
  healthRecords: healthRecords.length,
}
