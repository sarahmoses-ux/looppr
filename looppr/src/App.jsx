import { lazy, Suspense } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import { BusinessAuthProvider } from './context/BusinessAuthContext'
import BusinessProtectedRoute from './routes/BusinessProtectedRoute'
import { PartnerAuthProvider } from './context/PartnerAuthContext'
import PartnerProtectedRoute from './routes/PartnerProtectedRoute'
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

// Business Portal — separate auth context (BusinessAuthProvider) from the
// customer/admin app. Its own login/signup/verify/forgot + gated dashboard.
const BusinessLayout = lazy(() => import('./layouts/BusinessLayout'))
const BusinessLogin = lazy(() => import('./pages/business/BusinessLogin'))
const BusinessSignup = lazy(() => import('./pages/business/BusinessSignup'))
const BusinessVerifyEmail = lazy(() => import('./pages/business/BusinessVerifyEmail'))
const BusinessForgotPassword = lazy(() => import('./pages/business/BusinessForgotPassword'))
const BusinessOverview = lazy(() => import('./pages/business/dashboard/Overview'))
const BusinessRequests = lazy(() => import('./pages/business/dashboard/LaundryRequests'))
const BusinessPickupSchedule = lazy(() => import('./pages/business/dashboard/PickupSchedule'))
const BusinessInvoices = lazy(() => import('./pages/business/dashboard/Invoices'))
const BusinessNotifications = lazy(() => import('./pages/business/dashboard/Notifications'))
const BusinessSettings = lazy(() => import('./pages/business/dashboard/BusinessSettings'))

// Partner Portal — its own auth context, isolated from customer/business.
const PartnerLayout = lazy(() => import('./layouts/PartnerLayout'))
const PartnerLogin = lazy(() => import('./pages/partner/PartnerLogin'))
const PartnerSignup = lazy(() => import('./pages/partner/PartnerSignup'))
const PartnerVerifyEmail = lazy(() => import('./pages/partner/PartnerVerifyEmail'))
const PartnerForgotPassword = lazy(() => import('./pages/partner/PartnerForgotPassword'))
const PartnerOverview = lazy(() => import('./pages/partner/dashboard/PartnerOverview'))
const PartnerIncoming = lazy(() => import('./pages/partner/dashboard/IncomingOrders'))
const PartnerAccepted = lazy(() => import('./pages/partner/dashboard/AcceptedOrders'))
const PartnerSchedule = lazy(() => import('./pages/partner/dashboard/PartnerPickupSchedule'))
const PartnerDrivers = lazy(() => import('./pages/partner/dashboard/PartnerDrivers'))
const PartnerEarnings = lazy(() => import('./pages/partner/dashboard/PartnerEarnings'))
const PartnerReviews = lazy(() => import('./pages/partner/dashboard/CustomerReviews'))
const PartnerNotifications = lazy(() => import('./pages/partner/dashboard/PartnerNotifications'))
const PartnerProfile = lazy(() => import('./pages/partner/dashboard/BusinessProfile'))
const PartnerSettings = lazy(() => import('./pages/partner/dashboard/PartnerSettings'))

function App() {
  return (
    <Suspense fallback={null}>
      <ScrollToTop />
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

        {/* Business Portal: its own auth context so a business session is
            fully isolated from the customer/admin one. The marketing pages
            /business and /business/apply stay in PublicLayout above. */}
        <Route
          element={
            <BusinessAuthProvider>
              <Outlet />
            </BusinessAuthProvider>
          }
        >
          <Route path="/business/login" element={<BusinessLogin />} />
          <Route path="/business/signup" element={<BusinessSignup />} />
          <Route path="/business/verify-email" element={<BusinessVerifyEmail />} />
          <Route path="/business/forgot-password" element={<BusinessForgotPassword />} />

          <Route
            element={
              <BusinessProtectedRoute>
                <BusinessLayout />
              </BusinessProtectedRoute>
            }
          >
            <Route path="/business/dashboard" element={<BusinessOverview />} />
            <Route path="/business/dashboard/requests" element={<BusinessRequests />} />
            <Route path="/business/dashboard/schedule" element={<BusinessPickupSchedule />} />
            <Route path="/business/dashboard/invoices" element={<BusinessInvoices />} />
            <Route path="/business/dashboard/notifications" element={<BusinessNotifications />} />
            <Route path="/business/dashboard/settings" element={<BusinessSettings />} />
          </Route>
        </Route>

        {/* Partner Portal — separate auth context, isolated from all others.
            The marketing page /laundromats stays in PublicLayout above. */}
        <Route
          element={
            <PartnerAuthProvider>
              <Outlet />
            </PartnerAuthProvider>
          }
        >
          <Route path="/partners/login" element={<PartnerLogin />} />
          <Route path="/partners/signup" element={<PartnerSignup />} />
          <Route path="/partners/verify-email" element={<PartnerVerifyEmail />} />
          <Route path="/partners/forgot-password" element={<PartnerForgotPassword />} />

          <Route
            element={
              <PartnerProtectedRoute>
                <PartnerLayout />
              </PartnerProtectedRoute>
            }
          >
            <Route path="/partners/dashboard" element={<PartnerOverview />} />
            <Route path="/partners/dashboard/incoming" element={<PartnerIncoming />} />
            <Route path="/partners/dashboard/accepted" element={<PartnerAccepted />} />
            <Route path="/partners/dashboard/schedule" element={<PartnerSchedule />} />
            <Route path="/partners/dashboard/drivers" element={<PartnerDrivers />} />
            <Route path="/partners/dashboard/earnings" element={<PartnerEarnings />} />
            <Route path="/partners/dashboard/reviews" element={<PartnerReviews />} />
            <Route path="/partners/dashboard/notifications" element={<PartnerNotifications />} />
            <Route path="/partners/dashboard/profile" element={<PartnerProfile />} />
            <Route path="/partners/dashboard/settings" element={<PartnerSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
