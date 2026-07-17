import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBusinessAuth } from '../../context/BusinessAuthContext'
import BusinessAuthShell from '../../components/business/BusinessAuthShell'
import Input from '../../components/Input'
import Button from '../../components/Button'

// Two-step reset on one screen: request a code, then enter code + new
// password. Mirrors the customer forgot-password flow.
export default function BusinessForgotPassword() {
  const { forgotPassword, resetPassword } = useBusinessAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState('request') // request | reset
  const [form, setForm] = useState({ email: '', code: '', newPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'code' ? value.replace(/\D/g, '') : value }))
  }

  async function handleRequest(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setErrors({ email: 'Enter your business email.' })
      return
    }
    setErrors({})
    setFormError('')
    setStatus('pending')
    try {
      await forgotPassword(form.email)
      setStep('reset')
      setStatus('idle')
    } catch {
      setFormError('Could not send a code right now. Please try again.')
      setStatus('idle')
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    const next = {}
    if (!/^\d{6}$/.test(form.code)) next.code = 'Enter the 6-digit code.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.newPassword))
      next.newPassword = 'At least 8 characters, with a letter and a number.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      await resetPassword(form)
      navigate('/business/dashboard', { replace: true })
    } catch (err) {
      setFormError(err.response?.data?.message || 'That code is invalid or expired.')
      setStatus('idle')
    }
  }

  return (
    <BusinessAuthShell
      title={step === 'request' ? 'Reset your password' : 'Enter your reset code'}
      subtitle={
        step === 'request'
          ? "We'll email you a 6-digit code to reset it."
          : `Enter the code sent to ${form.email} and choose a new password.`
      }
      footer={
        <Link to="/business/login" className="font-semibold text-sky-600 hover:text-sky-700">
          Back to sign in
        </Link>
      }
    >
      {step === 'request' ? (
        <form onSubmit={handleRequest} noValidate className="space-y-5">
          <Input id="email" name="email" type="email" label="Business email" value={form.email} onChange={handleChange} error={errors.email} placeholder="ops@yourbusiness.com" />
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
            {status === 'pending' ? 'Sending…' : 'Send reset code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} noValidate className="space-y-5">
          <Input id="code" name="code" label="Reset code" inputMode="numeric" maxLength={6} value={form.code} onChange={handleChange} error={errors.code} placeholder="123456" />
          <Input id="newPassword" name="newPassword" type="password" label="New password" autoComplete="new-password" value={form.newPassword} onChange={handleChange} error={errors.newPassword} placeholder="At least 8 characters" />
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
            {status === 'pending' ? 'Updating…' : 'Reset password & sign in'}
          </Button>
        </form>
      )}
    </BusinessAuthShell>
  )
}
