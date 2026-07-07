import { useState } from 'react'
import Input from './Input'
import Button from './Button'
import { submitPartnerLead } from '../services/partnerLeadApi'

// Shared by Laundromats.jsx and Drive.jsx — same shape either way, just a
// different `type` and copy. `businessName` only applies to laundromat
// leads (kept blank/unused for driver applicants).
export default function PartnerLeadForm({ type, submitLabel }) {
  const isLaundromat = type === 'laundromat'
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '', message: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
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
      await submitPartnerLead({ type, ...form })
      setSent(true)
    } catch (err) {
      setFormError(
        err.response?.status === 429
          ? 'Too many attempts. Please try again later.'
          : err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.',
      )
    } finally {
      setStatus('idle')
    }
  }

  if (sent) {
    return (
      <div className="py-6 text-center">
        <p className="font-medium text-ink">Thanks — we've got it!</p>
        <p className="mt-1 text-sm text-ink/55">
          Check your email for confirmation. Our team will be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        id="name"
        name="name"
        label="Full name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="you@example.com"
      />
      <Input
        id="phone"
        name="phone"
        label="Phone"
        value={form.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder="(405) 555-0100"
      />
      {isLaundromat && (
        <Input
          id="businessName"
          name="businessName"
          label="Business name (optional)"
          value={form.businessName}
          onChange={handleChange}
        />
      )}
      <div>
        <label htmlFor="message" className="block text-base font-medium text-ink/80">
          {isLaundromat ? 'Tell us about your laundromat (optional)' : 'Anything we should know? (optional)'}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-periwinkle"
        />
      </div>

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {formError}
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
        {status === 'pending' ? 'Submitting…' : submitLabel}
      </Button>
    </form>
  )
}
