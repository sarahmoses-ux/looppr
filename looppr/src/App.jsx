import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Landing from './pages/Landing'

// Landing (the "/" route, by far the highest-traffic page) stays in the
// main bundle so the marketing homepage has no extra chunk round-trip
// before first paint. Everything else code-splits per route.
const SignIn = lazy(() => import('./pages/SignIn'))
const LoginVerify = lazy(() => import('./pages/LoginVerify'))
const SignUp = lazy(() => import('./pages/SignUp'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Home = lazy(() => import('./pages/Home'))
const Orders = lazy(() => import('./pages/Orders'))
const Book = lazy(() => import('./pages/Book'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const About = lazy(() => import('./pages/About'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Contact = lazy(() => import('./pages/Contact'))
const Laundromats = lazy(() => import('./pages/Laundromats'))
const LaundromatsForm = lazy(() => import('./pages/LaundromatsForm'))
const Drive = lazy(() => import('./pages/Drive'))
const DriveForm = lazy(() => import('./pages/DriveForm'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Business = lazy(() => import('./pages/Business'))
const BusinessForm = lazy(() => import('./pages/BusinessForm'))
const Cities = lazy(() => import('./pages/Cities'))
const Faq = lazy(() => import('./pages/Faq'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLoginVerify = lazy(() => import('./pages/admin/AdminLoginVerify'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'))
const GuestBook = lazy(() => import('./pages/guest/GuestBook'))
const GuestRequestStatus = lazy(() => import('./pages/guest/GuestRequestStatus'))

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/laundromats" element={<Laundromats />} />
          <Route path="/laundromats/apply" element={<LaundromatsForm />} />
          <Route path="/drive" element={<Drive />} />
          <Route path="/drive/apply" element={<DriveForm />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/business" element={<Business />} />
          <Route path="/business/apply" element={<BusinessForm />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/faq" element={<Faq />} />

          {/* Guest booking: no account required, ever — admin manages
              guest orders directly by contact info. */}
          <Route path="/guest/book" element={<GuestBook />} />
          <Route path="/guest/request/:id" element={<GuestRequestStatus />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/book" element={<Book />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/login/verify" element={<LoginVerify />} />
        <Route
          path="/verify-email"
          element={
            <ProtectedRoute requireVerified={false}>
              <VerifyEmail />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin: separate login (no public sign-up) + role-gated dashboard.
            Not linked from anywhere in the public site or customer nav. */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/login/verify" element={<AdminLoginVerify />} />
        <Route
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
