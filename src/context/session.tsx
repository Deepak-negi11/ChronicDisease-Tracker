/**
 * Demo session (Milestone 1). Real JWT auth replaces this in Milestone 3:
 * `login()` becomes POST /api/auth/login and the token lives in memory
 * with a refresh cookie. The shape of `Session` is kept intentionally close.
 */
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '../data/fixtures'

export interface Session {
  name: string
  email: string
  role: Role
  /** Patient whose data is in view. Patients only ever see their own. */
  patientId: number
}

const DEMO: Record<Role, Session> = {
  patient: { name: 'Meera Raghunathan', email: 'meera.r@example.in', role: 'patient', patientId: 1 },
  doctor: { name: 'Dr. Kavitha Subramaniam', email: 'k.subramaniam@clinic.example', role: 'doctor', patientId: 1 },
  admin: { name: 'Farhan Qureshi', email: 'admin@cdt.example', role: 'admin', patientId: 1 },
}

interface Ctx {
  session: Session | null
  login: (role: Role, overrides?: Partial<Session>) => void
  logout: () => void
}

const SessionContext = createContext<Ctx | null>(null)
const KEY = 'cdt.session'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const raw = sessionStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Session) : null
    } catch {
      return null
    }
  })
  const login = (role: Role, overrides: Partial<Session> = {}) => {
    const s = { ...DEMO[role], ...overrides }
    sessionStorage.setItem(KEY, JSON.stringify(s))
    setSession(s)
  }
  const logout = () => {
    sessionStorage.removeItem(KEY)
    setSession(null)
  }
  return <SessionContext.Provider value={{ session, login, logout }}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
