import { Navigate, useLocation } from 'react-router-dom'
import { usePartnerAuth } from '../context/PartnerAuthContext'

// Gate for /partners/dashboard/*. Signed-out partners go to the partner login.
export default function PartnerProtectedRoute({ children }) {
  const { status } = usePartnerAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-linen">
        <div className="h-8 w-8 animate-pulse rounded-full bg-sky-300" />
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/partners/login" state={{ from: location.pathname }} replace />
  }

  return children
}
