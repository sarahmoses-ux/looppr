import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import { sendOtp, verifyOtp } from '../services/otpApi'

export default function VerifyEmail() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const [resendState, setResendState] = useState('idle')
  const [resendMessage, setResendMessage] = useState('A code was sent to your email when you signed up.')

  if (user?.isVerified) {
    return <Navigate to="/home" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.')
      return
    }

    setError('')
    setStatus('pending')
    try {
      const { user: verifiedUser } = await verifyOtp(code)
      setUser(verifiedUser)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  async function handleResend() {
    setResendState('pending')
    setResendMessage('')
    try {
      await sendOtp()
      setResendMessage('A new code is on its way — check your inbox.')
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Could not resend the code. Try again shortly.')
    } finally {
      setResendState('idle')
    }
  }

  return (
    <AuthLayout
      eyebrow="One more step"
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${user?.email || 'your email'}.`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="code" className="block text-base font-medium text-ink/80">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-center text-2xl font-semibold tracking-[0.5em] text-ink outline-none transition-colors ${
              error ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-periwinkle'
            }`}
          />
          {error && (
            <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Verifying…' : 'Verify email'}
        </Button>

        <div className="text-center text-base">
          <p className="text-ink/50">{resendMessage}</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === 'pending'}
            className="mt-1 font-semibold text-periwinkle-text hover:underline disabled:opacity-50"
          >
            {resendState === 'pending' ? 'Sending…' : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
