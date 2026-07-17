import { Navigate, useLocation } from 'react-router-dom'
import { useBusinessAuth } from '../context/BusinessAuthContext'

// Gate for /business/dashboard/*. Signed-out businesses go to the business
// login (never the customer login); the loading state matches the customer
// ProtectedRoute so there's no flash of the login page during the initial
// refresh check.
export default function BusinessProtectedRoute({ children }) {
  const { status } = useBusinessAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-linen">
        <div className="h-8 w-8 animate-pulse rounded-full bg-sky-300" />
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/business/login" state={{ from: location.pathname }} replace />
  }

  return children
}
