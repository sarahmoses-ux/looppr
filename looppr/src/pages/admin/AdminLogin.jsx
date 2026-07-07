import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'
import Input from '../../components/Input'
import Button from '../../components/Button'

// Deliberately not linked from anywhere in the public site or the customer
// AuthContext flows — reachable only by navigating to /admin/login directly.
// No "create an account" link either: admin accounts only come from
// scripts/seedAdmin.js.
export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
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
      const { challengeToken, email } = await adminLogin(form)
      navigate('/admin/login/verify', { state: { challengeToken, email } })
    } catch (err) {
      const message =
        err.response?.status === 429
          ? 'Too many attempts. Please wait a bit and try again.'
          : err.response?.data?.details?.[0]?.message ||
            err.response?.data?.message ||
            (err.response
              ? 'Incorrect email or password.'
              : 'Could not reach the server. Check your connection and try again.')
      setFormError(message)
      setStatus('idle')
    }
  }

  return (
    <AuthLayout
      eyebrow="Admin"
      title="Sign in to Looppr Admin"
      subtitle="Restricted to Looppr staff."
      noindex
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@getlooppr.com"
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

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
