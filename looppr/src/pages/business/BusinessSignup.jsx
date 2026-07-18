import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBusinessAuth } from '../../context/BusinessAuthContext'
import BusinessAuthShell from '../../components/business/BusinessAuthShell'
import { BUSINESS_TYPE_OPTIONS } from '../../components/business/businessUi'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Button from '../../components/Button'
import { PUBLIC_PAGES } from '../../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/business/signup')

const EMPTY = {
  businessName: '',
  businessType: '',
  contactPerson: '',
  email: '',
  phone: '',
  password: '',
  address: '',
  city: '',
  state: 'OK',
  weeklyVolume: '',
  registrationNumber: '',
}

export default function BusinessSignup() {
  const { register } = useBusinessAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (form.businessName.trim().length < 2) next.businessName = 'Enter your business name.'
    if (!form.businessType) next.businessType = 'Select your business type.'
    if (form.contactPerson.trim().length < 2) next.contactPerson = 'Enter a contact name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid business email.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password))
      next.password = 'At least 8 characters, with a letter and a number.'
    if (form.address.trim().length < 3) next.address = 'Enter your business address.'
    if (form.city.trim().length < 2) next.city = 'Enter your city.'
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
      const { email } = await register(form)
      navigate('/business/verify-email', { state: { email } })
    } catch (err) {
      setFormError(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.message ||
          'Could not create your account. Please try again.',
      )
      setStatus('idle')
    }
  }

  return (
    <BusinessAuthShell
      title="Create your business account"
      description={PAGE_META.description}
      keywords={PAGE_META.keywords}
      noindex={false}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/business/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input id="businessName" name="businessName" label="Business name" value={form.businessName} onChange={handleChange} error={errors.businessName} placeholder="Riverside Hotel" />
        <Select id="businessType" name="businessType" label="Business type" value={form.businessType} onChange={handleChange} error={errors.businessType}>
          <option value="">Select a type…</option>
          {BUSINESS_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="contactPerson" name="contactPerson" label="Contact person" value={form.contactPerson} onChange={handleChange} error={errors.contactPerson} placeholder="Jordan Lee" />
          <Input id="phone" name="phone" type="tel" label="Phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="(918) 555-0123" />
        </div>
        <Input id="email" name="email" type="email" label="Business email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="ops@yourbusiness.com" />
        <Input id="password" name="password" type="password" label="Password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} placeholder="At least 8 characters" />
        <Input id="address" name="address" label="Business address" value={form.address} onChange={handleChange} error={errors.address} placeholder="500 Riverside Dr" />
        <div className="grid grid-cols-2 gap-4">
          <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} error={errors.city} placeholder="Tulsa" />
          <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="weeklyVolume" name="weeklyVolume" label="Weekly volume (optional)" value={form.weeklyVolume} onChange={handleChange} placeholder="e.g. 300 lbs/week" />
          <Input id="registrationNumber" name="registrationNumber" label="Registration no. (optional)" value={form.registrationNumber} onChange={handleChange} placeholder="EIN / business no." />
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Creating account…' : 'Create Business Account'}
        </Button>
        <p className="text-center text-xs text-ink/45">
          We'll email a 6-digit code to verify your address.
        </p>
      </form>
    </BusinessAuthShell>
  )
}
