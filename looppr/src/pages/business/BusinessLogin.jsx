import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBusinessAuth } from '../../context/BusinessAuthContext'
import BusinessAuthShell from '../../components/business/BusinessAuthShell'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function BusinessLogin() {
  const { login } = useBusinessAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/business/dashboard'

  const [form, setForm] = useState({ email: '', password: '', rememberMe: true })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function validate() {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid business email.'
    if (!form.password) next.password = 'Enter your password.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      const result = await login(form)
      if (result.requiresVerification) {
        navigate('/business/verify-email', { state: { email: result.email } })
        return
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setFormError(
        err.response?.status === 429
          ? 'Too many attempts. Please wait a bit and try again.'
          : err.response?.data?.message ||
              (err.response
                ? 'Incorrect email or password.'
                : 'Could not reach the server. Check your connection and try again.'),
      )
      setStatus('idle')
    }
  }

  return (
    <BusinessAuthShell
      title="Sign in to your business account"
      subtitle="Manage pickups, orders and invoices in one place."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/business/signup" className="font-semibold text-sky-600 hover:text-sky-700">
            Create Business Account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="email"
          name="email"
          type="email"
          label="Business Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ops@yourbusiness.com"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-line accent-periwinkle"
            />
            Remember me
          </label>
          <Link to="/business/forgot-password" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </BusinessAuthShell>
  )
}
