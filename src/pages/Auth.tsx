import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Stethoscope, UserCog, UserRound } from 'lucide-react'
import { Label, Logo } from '../components/ui'
import { useSession } from '../context/session'
import type { Role } from '../data/fixtures'

const roles: { id: Role; label: string; icon: typeof UserRound; email: string }[] = [
  { id: 'patient', label: 'Patient', icon: UserRound, email: 'meera.r@example.in' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, email: 'k.subramaniam@clinic.example' },
  { id: 'admin', label: 'Admin', icon: UserCog, email: 'admin@cdt.example' },
]

function Shell({ children, side }: { children: ReactNode; side: ReactNode }) {
  return (
    <div className="grain grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-6 md:px-12">
        <Link to="/"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-rise">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-teal-brand lg:block">
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
          <defs>
            <pattern id="ekg" width="220" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 60h60l12-30 18 60 14-44 10 14h106" fill="none" stroke="#fff" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ekg)" />
        </svg>
        <div className="relative flex h-full flex-col justify-end p-14 text-white">{side}</div>
      </div>
    </div>
  )
}

export function Login() {
  const { login } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<Role>('patient')
  const [email, setEmail] = useState(roles[0].email)
  const [password, setPassword] = useState('demo-password')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setError(null)
    setBusy(true)
    setTimeout(() => {
      login(role)
      navigate((location.state as { from?: string } | null)?.from ?? '/app')
    }, 450)
  }

  return (
    <Shell
      side={
        <>
          <p className="font-display text-4xl font-semibold leading-tight">“I stopped keeping three notebooks. My endocrinologist now sees the same chart I do.”</p>
          <p className="mt-4 text-sm text-white/75">Meera R., living with type 2 diabetes and hypertension</p>
        </>
      }
    >
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Sign in to your health record.</p>

      <div className="mt-7 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Sign in as">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={role === r.id}
            onClick={() => {
              setRole(r.id)
              setEmail(r.email)
            }}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition ${
              role === r.id ? 'border-teal-brand bg-teal-soft text-teal-brand' : 'border-line bg-white text-ink-soft hover:text-ink'
            }`}
          >
            <r.icon className="size-4" /> {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <input id="password" className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="text-sm font-medium text-rose-brand">{error}</p>}
        <button className="btn btn-primary w-full !py-3" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'} {!busy && <ArrowRight className="size-4" />}
        </button>
      </form>
      <p className="mt-4 rounded-xl bg-blue-soft px-3 py-2 text-xs text-blue-brand">Demo accounts are pre-filled. Choose a role to see what that user can access.</p>
      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link to="/register" className="font-semibold text-teal-brand">Create a patient account</Link>
      </p>
    </Shell>
  )
}

export function Register() {
  const { login } = useSession()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', age: '', gender: 'Female', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.'
    const age = Number(form.age)
    if (!Number.isInteger(age) || age < 1 || age > 120) errs.age = 'Age must be between 1 and 120.'
    if (form.password.length < 8) errs.password = 'Use at least 8 characters.'
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    // Milestone 3: POST /api/auth/register creates USERS + PATIENT rows in one transaction.
    login('patient', { name: form.name.trim(), email: form.email.trim() })
    navigate('/app')
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs font-medium text-rose-brand">{errors[k]}</p>

  return (
    <Shell
      side={
        <>
          <p className="font-display text-4xl font-semibold leading-tight">Your data stays yours.</p>
          <p className="mt-4 max-w-md text-white/80">Passwords are hashed, every request is checked against your role, and doctors only see records you have authorised them to see.</p>
        </>
      }
    >
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Patient registration. Doctor and admin accounts are created by an administrator.</p>
      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Full name</Label>
          <input id="name" className="field" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
          {err('name')}
        </div>
        <div>
          <Label htmlFor="remail">Email</Label>
          <input id="remail" className="field" type="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} />
          {err('email')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="age">Age</Label>
            <input id="age" className="field num" inputMode="numeric" value={form.age} onChange={set('age')} aria-invalid={!!errors.age} />
            {err('age')}
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" className="field" value={form.gender} onChange={set('gender')}>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="rpw">Password</Label>
          <input id="rpw" className="field" type="password" value={form.password} onChange={set('password')} aria-invalid={!!errors.password} autoComplete="new-password" />
          {err('password')}
        </div>
        <div>
          <Label htmlFor="rpw2">Confirm password</Label>
          <input id="rpw2" className="field" type="password" value={form.confirm} onChange={set('confirm')} aria-invalid={!!errors.confirm} autoComplete="new-password" />
          {err('confirm')}
        </div>
        <button className="btn btn-primary w-full !py-3">Create account <ArrowRight className="size-4" /></button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already registered? <Link to="/login" className="font-semibold text-teal-brand">Sign in</Link>
      </p>
    </Shell>
  )
}
