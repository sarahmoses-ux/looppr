import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LOGIN_PATH = { client: '/login', admin: '/admin/login' }
const DASHBOARD_PATH = { client: '/home', admin: '/admin/dashboard' }

// `role` is the role required to view this route ('client' by default).
// Signed-out users go to that role's login page; signed-in users of the
// *wrong* role are bounced to their own dashboard rather than seeing a
// blank/forbidden screen — e.g. an admin hitting a customer route lands on
// /admin/dashboard, and vice versa.
export default function ProtectedRoute({ children, role = 'client', requireVerified = true }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-periwinkle-soft" />
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to={LOGIN_PATH[role]} state={{ from: location.pathname }} replace />
  }

  if (user?.role !== role) {
    return <Navigate to={DASHBOARD_PATH[user?.role] || LOGIN_PATH[role]} replace />
  }

  if (requireVerified && role === 'client' && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}
