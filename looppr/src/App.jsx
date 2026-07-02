import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Book from './pages/Book'
import ComingSoon from './pages/ComingSoon'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<ComingSoon title="About Looppr" />} />
        <Route path="/contact" element={<ComingSoon title="Contact us" />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy policy" />} />
        <Route path="/terms" element={<ComingSoon title="Terms of service" />} />
        <Route
          path="/laundromats"
          element={<ComingSoon title="Laundromat partner sign-up" />}
        />
        <Route path="/drive" element={<ComingSoon title="Drive with Looppr" />} />
        <Route path="/cities" element={<ComingSoon title="Cities & coverage" />} />
        <Route path="/faq" element={<ComingSoon title="Help & FAQ" />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/settings" element={<ComingSoon title="Edit profile" />} />
      </Route>

      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />
      <Route
        path="/forgot-password"
        element={<ComingSoon title="Password reset" />}
      />
    </Routes>
  )
}

export default App
