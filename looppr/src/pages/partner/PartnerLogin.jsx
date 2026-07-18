import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePartnerAuth } from '../../context/PartnerAuthContext'
import PartnerAuthShell from '../../components/partner/PartnerAuthShell'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { PUBLIC_PAGES } from '../../seo/publicPages'
import { breadcrumbJsonLd } from '../../seo/structuredData'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/partners/login')
const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Laundromat partners', path: '/laundromats' }, { name: 'Partner login', path: '/partners/login' }])

export default function PartnerLogin() {
  const { login } = usePartnerAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/partners/dashboard'

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
        navigate('/partners/verify-email', { state: { email: result.email } })
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
    <PartnerAuthShell
      title="Sign in to your partner account"
      subtitle="Manage incoming orders, jobs and earnings."
      description={PAGE_META.description}
      keywords={PAGE_META.keywords}
      noindex={false}
      jsonLd={BREADCRUMB_JSON_LD}
      footer={
        <>
          Don't have a Partner Account?{' '}
          <Link to="/partners/signup" className="font-semibold text-sky-600 hover:text-sky-700">
            Become a Partner
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input id="email" name="email" type="email" label="Business Email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="shop@yourlaundry.com" />
        <Input id="password" name="password" type="password" label="Password" autoComplete="current-password" value={form.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} className="h-4 w-4 rounded border-line accent-periwinkle" />
            Remember me
          </label>
          <Link to="/partners/forgot-password" className="text-sm font-semibold text-sky-600 hover:text-sky-700">Forgot password?</Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Signing in…' : 'Login'}
        </Button>
      </form>
    </PartnerAuthShell>
  )
}
