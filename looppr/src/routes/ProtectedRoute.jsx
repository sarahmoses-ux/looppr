import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireVerified = true }) {
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
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requireVerified && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}
