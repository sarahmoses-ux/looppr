import { Navigate, useLocation } from 'react-router-dom'
import { useDriverAuth } from '../context/DriverAuthContext'

// Gate for /drive/dashboard/*. Signed-out drivers go to the driver login.
export default function DriverProtectedRoute({ children }) {
  const { status } = useDriverAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-linen">
        <div className="h-8 w-8 animate-pulse rounded-full bg-sky-300" />
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/drive/login" state={{ from: location.pathname }} replace />
  }

  return children
}
