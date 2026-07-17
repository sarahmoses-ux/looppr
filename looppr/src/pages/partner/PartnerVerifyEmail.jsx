import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePartnerAuth } from '../../context/PartnerAuthContext'
import PartnerAuthShell from '../../components/partner/PartnerAuthShell'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function PartnerVerifyEmail() {
  const { verifyEmail, resendVerification } = usePartnerAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [resendNote, setResendNote] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter your business email.'
    if (!/^\d{6}$/.test(code)) next.code = 'Enter the 6-digit code.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      await verifyEmail(email, code)
      navigate('/partners/dashboard', { replace: true })
    } catch (err) {
      setFormError(err.response?.data?.message || 'That code is invalid or expired.')
      setStatus('idle')
    }
  }

  async function handleResend() {
    setResendNote('')
    setFormError('')
    try {
      await resendVerification(email)
      setResendNote('If that account exists, a new code is on its way.')
    } catch {
      setResendNote('Could not resend right now. Try again shortly.')
    }
  }

  return (
    <PartnerAuthShell
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent${email ? ` to ${email}` : ''}.`}
      footer={<Link to="/partners/login" className="font-semibold text-sky-600 hover:text-sky-700">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {!location.state?.email && (
          <Input id="email" name="email" type="email" label="Business email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="shop@yourlaundry.com" />
        )}
        <Input id="code" name="code" label="Verification code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} error={errors.code} placeholder="123456" />

        {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>}
        {resendNote && <p className="rounded-lg bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">{resendNote}</p>}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Verifying…' : 'Verify & continue'}
        </Button>
        <button type="button" onClick={handleResend} className="w-full text-center text-sm font-medium text-ink/55 hover:text-ink">
          Didn't get it? Resend code
        </button>
      </form>
    </PartnerAuthShell>
  )
}
