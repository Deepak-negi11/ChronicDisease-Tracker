import { Link } from 'react-router-dom'
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts'
import { ArrowRight, BellRing, CalendarClock, Database, HeartPulse, LineChart, Lock, Pill, ShieldCheck, Stethoscope, UserCog, Users } from 'lucide-react'
import { Logo } from '../components/ui'
import { healthRecords } from '../data/fixtures'
import { seriesFor } from '../data/api'

const glucose = seriesFor(healthRecords, 4).slice(-60)

const modules = [
  { icon: HeartPulse, title: 'Health records', text: 'Heart rate, blood pressure, glucose, weight, sleep and steps, each timestamped and linked to a condition.' },
  { icon: LineChart, title: 'Trend analytics', text: 'Daily, weekly and monthly views with averages, highs, lows and direction of change.' },
  { icon: BellRing, title: 'Threshold alerts', text: 'Limits your care team sets per patient. Readings outside them raise an alert you can mark read or resolved.' },
  { icon: Pill, title: 'Medications & side effects', text: 'Prescriptions with start and end dates, plus reported side effects kept apart from confirmed reactions.' },
  { icon: CalendarClock, title: 'Appointments', text: 'Book, reschedule and cancel visits with the doctors who are authorised to see your records.' },
  { icon: Database, title: 'Relational core', text: '17 normalised tables with foreign keys, CHECK constraints, indexes and transactional writes.' },
]

const flow = ['Patient signs in', 'Logs a measurement', 'API validates it', 'Stored in a transaction', 'Threshold rules run', 'Charts and reports update', 'Doctor reviews']

export default function Landing() {
  return (
    <div className="grain min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 md:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link to="/login" className="btn btn-ghost !py-2">Sign in</Link>
          <Link to="/register" className="btn btn-primary !py-2">Create account</Link>
        </nav>
      </header>

      {/* Hero — asymmetric split */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-20 pt-10 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div className="animate-rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink-soft">
            <span className="size-1.5 rounded-full bg-teal-brand" /> For patients with long-term conditions and the doctors who follow them
          </p>
          <h1 className="font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-ink md:text-[4.1rem]">
            Every reading,
            <br />
            <span className="text-teal-brand">in context.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            The AI-Based Chronic Disease Tracker keeps your conditions, measurements, symptoms, medications and appointments in one record. It shows how they change over time and flags readings that fall outside limits your doctor set.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn btn-primary !px-5 !py-3 text-[15px]">
              Open the demo <ArrowRight className="size-4" />
            </Link>
            <a href="#how" className="btn btn-ghost !px-5 !py-3 text-[15px]">See how it works</a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-ink-mute">
            <ShieldCheck className="size-4 text-teal-brand" /> A tracking and analytics tool, not a diagnostic service.
          </p>
        </div>

        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="absolute -left-10 -top-10 size-72 rounded-full bg-teal-soft blur-3xl" aria-hidden />
          <div className="absolute -bottom-10 right-0 size-60 rounded-full bg-violet-soft blur-3xl" aria-hidden />
          <div className="card relative rotate-[-1.2deg] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">Fasting glucose · 60 days</p>
                <p className="num mt-1 text-4xl font-semibold">
                  {Math.round(glucose[glucose.length - 1].value)} <span className="text-base font-medium text-ink-mute">mg/dL</span>
                </p>
              </div>
              <span className="rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-brand">↓ trending down</span>
            </div>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={glucose} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="hero" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={[80, 180]} />
                  <ReferenceLine y={140} stroke="#b4434f" strokeDasharray="4 4" strokeOpacity={0.6} />
                  <Area dataKey="value" type="monotone" stroke="#0f766e" strokeWidth={2} fill="url(#hero)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] text-ink-mute">Dashed line: upper limit of 140 mg/dL, set by Dr. Subramaniam</p>
          </div>
          <div className="card absolute -bottom-8 -left-4 hidden w-64 rotate-[2deg] p-4 sm:block">
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-brand">
              <BellRing className="size-3.5" /> Threshold alert · informational
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink-soft">Systolic BP of 147 mmHg is above your configured upper limit of 140 mmHg.</p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 md:px-8 lg:grid-cols-[320px_1fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Eleven modules, one record.</h2>
            <p className="mt-3 text-ink-soft">Every screen reads from and writes to the same relational database, so a reading logged in the morning appears on the dashboard, in the charts, in alerts and in the report.</p>
          </div>
          <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {modules.map((m) => (
              <div key={m.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-soft text-teal-brand"><m.icon className="size-5" /></span>
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="how" className="mx-auto max-w-[1200px] px-5 py-20 md:px-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight">From one measurement to a reviewed trend</h2>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {flow.map((step, i) => (
            <li key={step} className="card relative p-4">
              <span className="num text-xs font-semibold text-teal-brand">0{i + 1}</span>
              <p className="mt-2 text-sm font-semibold leading-snug">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-[1200px] px-5 pb-24 md:px-8">
        <div className="card grid overflow-hidden md:grid-cols-3">
          {[
            { icon: Users, role: 'Patients', text: 'Log readings and symptoms, follow trends, manage appointments and receive alerts. You only ever see your own record.' },
            { icon: Stethoscope, role: 'Doctors', text: 'Review records, trends and reports for patients who have authorised you, and set their alert thresholds.' },
            { icon: UserCog, role: 'Admins', text: 'Manage users, roles and master data such as diseases and symptoms, and configure system-wide defaults.' },
          ].map((r, i) => (
            <div key={r.role} className={`p-7 ${i ? 'border-t border-line md:border-l md:border-t-0' : ''}`}>
              <r.icon className="size-5 text-violet-brand" />
              <h3 className="mt-3 font-display text-xl font-semibold">{r.role}</h3>
              <p className="mt-2 text-sm text-ink-soft">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-8 text-xs text-ink-mute md:flex-row md:items-center md:justify-between md:px-8">
          <Logo compact />
          <p className="flex items-center gap-1.5"><Lock className="size-3.5" /> Passwords hashed with bcrypt · role-based access · parameterised SQL</p>
          <p>Not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  )
}
