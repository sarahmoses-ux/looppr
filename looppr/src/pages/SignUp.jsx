import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

// Same checks as validate() below, factored out so the progress meter and
// the actual submit validation can never drift apart from each other.
const FIELD_CHECKS = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^\S+@\S+\.\S+$/.test(v),
  phone: (v) => /^\+?[0-9\s()-]{7,}$/.test(v),
  password: (v) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v),
}
const FIELD_ORDER = ['name', 'email', 'phone', 'password']

export default function SignUp() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  const completedCount = FIELD_ORDER.filter((f) => FIELD_CHECKS[f](form[f])).length
  const progress = Math.round((completedCount / FIELD_ORDER.length) * 100)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) {
      next.password = 'At least 8 characters, with a letter and a number.'
    }
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
      await register(form)
      navigate('/verify-email')
    } catch (err) {
      const message =
        err.response?.data?.details?.[0]?.message ||
        err.response?.data?.message ||
        (err.response
          ? 'Something went wrong creating your account. Please try again.'
          : 'Could not reach the server. Check your connection and try again.')
      setFormError(message)
      setStatus('idle')
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Sign up"
      subtitle="Book your first pickup in a couple of minutes."
    >
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium text-ink/50">
          <span>Profile completeness</span>
          <span className="font-semibold text-periwinkle-text">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Sign-up progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-periwinkle-soft"
        >
          <div
            className="h-full rounded-full bg-periwinkle transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Jane Doe"
        />
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
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone number"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+1 (555) 123-4567"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="At least 8 characters"
        />

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
          {status === 'pending' ? 'Signing up…' : 'Sign up'}
        </Button>

        <p className="text-center text-sm leading-relaxed text-ink/50">
          By continuing you agree to Looppr’s{' '}
          <Link to="/terms" className="underline hover:text-ink">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-8 text-center text-base text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
