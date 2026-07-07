import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import Button from '../components/Button'

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()

  // email -> reset
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState('idle')

  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetErrors, setResetErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [resendMessage, setResendMessage] = useState('')

  async function handleEmailSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Enter a valid email address.')
      return
    }
    setEmailError('')
    setStatus('pending')
    try {
      await forgotPassword(email)
    } finally {
      // Always proceed — the backend never reveals whether the email is
      // registered, so there's nothing else to branch on here.
      setStatus('idle')
      setStep('reset')
    }
  }

  async function handleResend() {
    setResendMessage('')
    try {
      await forgotPassword(email)
      setResendMessage("If that email is registered, a new code is on its way.")
    } catch {
      setResendMessage('Something went wrong. Please try again.')
    }
  }

  function validateReset() {
    const next = {}
    if (!/^\d{6}$/.test(code)) next.code = 'Enter the 6-digit code.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      next.newPassword = 'Must be at least 8 characters and include a letter and a number.'
    }
    if (confirmPassword !== newPassword) next.confirmPassword = 'Passwords do not match.'
    return next
  }

  async function handleResetSubmit(e) {
    e.preventDefault()
    const next = validateReset()
    setResetErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      await resetPassword({ email, code, newPassword })
      navigate('/home')
    } catch (err) {
      setFormError(
        err.response?.status === 429
          ? 'Too many attempts. Please wait a bit and try again.'
          : err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.',
      )
      setStatus('idle')
    }
  }

  if (step === 'reset') {
    return (
      <AuthLayout
        eyebrow="Reset your password"
        title="Enter your code"
        subtitle={`If ${email} is registered, we've sent a 6-digit code.`}
        noindex
      >
        <form onSubmit={handleResetSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="code" className="block text-base font-medium text-ink/80">
              Verification code
            </label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] text-ink outline-none transition-colors ${
                resetErrors.code ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-periwinkle'
              }`}
            />
            {resetErrors.code && (
              <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
                {resetErrors.code}
              </p>
            )}
          </div>

          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={resetErrors.newPassword}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={resetErrors.confirmPassword}
          />

          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
            {status === 'pending' ? 'Resetting…' : 'Reset password'}
          </Button>

          <div className="text-center text-base">
            <p className="text-ink/50">{resendMessage}</p>
            <button
              type="button"
              onClick={handleResend}
              className="mt-1 font-semibold text-periwinkle-text hover:underline"
            >
              Resend code
            </button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Forgot password"
      title="Reset your password"
      subtitle="Enter your email and we'll send you a code to reset it."
      noindex
    >
      <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          placeholder="you@example.com"
        />

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Sending…' : 'Send reset code'}
        </Button>
      </form>
    </AuthLayout>
  )
}
