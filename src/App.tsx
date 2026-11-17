import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from './context/session'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import { Login, Register } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import HealthRecords from './pages/HealthRecords'
import Analytics from './pages/Analytics'
import PatientProfile from './pages/PatientProfile'
import Notifications from './pages/Notifications'
import Roadmap from './pages/Roadmap'
import { allNavItems } from './lib/nav'

/** Client-side guard. Milestone 3 backs this with JWT checks on every API route. */
function Protected({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="records" element={<HealthRecords />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="notifications" element={<Notifications />} />
        {allNavItems
          .filter((i) => i.milestone > 1)
          .map((i) => (
            <Route key={i.to} path={i.to.replace('/app/', '')} element={<Roadmap item={i} />} />
          ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
