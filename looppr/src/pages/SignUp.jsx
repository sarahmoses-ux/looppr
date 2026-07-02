import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

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
      navigate('/home')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong creating your account. Please try again.'
      setFormError(message)
      setStatus('idle')
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Book your first pickup in a couple of minutes."
    >
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
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={status === 'pending'}
        >
          {status === 'pending' ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink/50">
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

      <p className="mt-8 text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
