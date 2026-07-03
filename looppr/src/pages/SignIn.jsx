import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

export default function SignIn() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
      const { challengeToken, email } = await login(form)
      navigate('/login/verify', { state: { challengeToken, email, from: location.state?.from } })
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
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Track your orders and book your next pickup."
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
          placeholder="you@example.com"
        />
        <div>
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
          <div className="mt-2.5 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-periwinkle hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={status === 'pending'}
        >
          {status === 'pending' ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-8 text-center text-base text-ink/60">
        New to Looppr?{' '}
        <Link to="/signup" className="font-semibold text-ink hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
