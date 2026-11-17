import {
  Activity, Bell, CalendarClock, ClipboardList, FileText, HeartPulse, LayoutDashboard, LineChart,
  Pill, Settings, ShieldAlert, Stethoscope, Thermometer, UserRound, Users,
} from 'lucide-react'
import type { Role } from '../data/fixtures'

export interface NavItem {
  to: string
  label: string
  icon: typeof Activity
  roles: Role[]
  /** Roadmap milestone that delivers the screen (1 = live now). */
  milestone: number
  blurb: string
}

const ALL: Role[] = ['patient', 'doctor', 'admin']

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, roles: ALL, milestone: 1, blurb: '' },
      { to: '/app/notifications', label: 'Notifications', icon: Bell, roles: ALL, milestone: 1, blurb: '' },
    ],
  },
  {
    title: 'Care',
    items: [
      { to: '/app/patients', label: 'Patients', icon: Users, roles: ['doctor', 'admin'], milestone: 4, blurb: 'Add, edit, search and safely remove patients, with each patient’s conditions and full health history on one profile.' },
      { to: '/app/profile', label: 'Patient profile', icon: UserRound, roles: ALL, milestone: 1, blurb: '' },
      { to: '/app/diseases', label: 'Diseases', icon: ClipboardList, roles: ALL, milestone: 4, blurb: 'Disease master data with categories, plus assigning several conditions to a patient through the PATIENT_DISEASES junction table.' },
      { to: '/app/records', label: 'Health records', icon: HeartPulse, roles: ALL, milestone: 1, blurb: '' },
      { to: '/app/symptoms', label: 'Symptoms', icon: Thermometer, roles: ALL, milestone: 4, blurb: 'Symptom master list with severity levels, and a history of symptoms logged alongside each health record.' },
    ],
  },
  {
    title: 'Treatment',
    items: [
      { to: '/app/medications', label: 'Medications', icon: Pill, roles: ALL, milestone: 5, blurb: 'Medication catalogue with dosage and frequency, linked to diseases through DISEASE_MEDICATIONS. Nothing is recommended automatically.' },
      { to: '/app/prescriptions', label: 'Prescriptions', icon: FileText, roles: ALL, milestone: 5, blurb: 'Active and completed prescriptions with start and end dates and the prescribing doctor.' },
      { to: '/app/side-effects', label: 'Side effects', icon: ShieldAlert, roles: ALL, milestone: 5, blurb: 'Patient-reported side effects with severity, linked to symptoms. Reported effects are kept separate from confirmed adverse reactions.' },
      { to: '/app/doctors', label: 'Doctors', icon: Stethoscope, roles: ALL, milestone: 5, blurb: 'Doctor directory with specialisations and contact details.' },
      { to: '/app/appointments', label: 'Appointments', icon: CalendarClock, roles: ALL, milestone: 5, blurb: 'Book, reschedule and cancel appointments, with calendar and table views plus full history.' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/app/analytics', label: 'Analytics', icon: LineChart, roles: ALL, milestone: 1, blurb: '' },
      { to: '/app/reports', label: 'Analysis reports', icon: Activity, roles: ALL, milestone: 6, blurb: 'Saved period reports: averages, highs and lows, trends and observations to discuss with a clinician. An optional AI-written summary stays separate from the rule-based figures.' },
    ],
  },
  {
    title: 'Account',
    items: [{ to: '/app/settings', label: 'Settings', icon: Settings, roles: ALL, milestone: 3, blurb: 'Profile details, password change, and (for admins) user and role management plus system-level settings.' }],
  },
]

export const allNavItems = navGroups.flatMap((g) => g.items)
