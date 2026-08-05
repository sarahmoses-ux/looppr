import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { effectiveAdminRole } from '../constants/adminRoles'

const LOGIN_PATH = { client: '/login', admin: '/admin/login' }
const DASHBOARD_PATH = { client: '/home', admin: '/admin/dashboard' }

// Gates an already-admin-authenticated page to a subset of admin sub-roles.
// Used *inside* the outer <ProtectedRoute role="admin"> layout route (see
// App.jsx) rather than replacing it — this only adds the sub-role check.
// super_admin always passes, regardless of `roles`.
export function AdminRoleGate({ roles, children }) {
  const { user } = useAuth()
  const adminRole = effectiveAdminRole(user)
  if (adminRole !== 'super_admin' && !roles.includes(adminRole)) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

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
