import { useState } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { breadcrumbJsonLd } from '../seo/structuredData'
import { submitContactMessage } from '../services/contactApi'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/contact')
const BREADCRUMB_JSON_LD = breadcrumbJsonLd([{ name: 'Contact', path: '/contact' }])

const PURPOSES = [
  { value: 'general', label: 'General question' },
  { value: 'order_support', label: 'Order support' },
  { value: 'business', label: 'Business inquiry' },
  { value: 'partnership', label: 'Partnership inquiry' },
  { value: 'press', label: 'Press / media' },
  { value: 'other', label: 'Other' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', purpose: '', message: '' })
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
    if (!form.purpose) next.purpose = 'Choose a reason for contacting us.'
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
      await submitContactMessage(form)
      setSent(true)
      setForm({ name: '', email: '', phone: '', purpose: '', message: '' })
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <SEO title={PAGE_META.title} description={PAGE_META.description} jsonLd={BREADCRUMB_JSON_LD} />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Get in touch
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink/60">
        Questions about an order, a partnership, or the press? Send us a message and we'll get back
        to you.
      </p>

      <div className="mt-10 rounded-3xl border border-line bg-white p-6 sm:p-8">
        {sent ? (
          <div className="py-6 text-center">
            <p className="font-medium text-ink">Message sent!</p>
            <p className="mt-1 text-sm text-ink/55">
              We've emailed you a confirmation — someone from Looppr will follow up soon.
            </p>
            <Button variant="ghost" className="mt-5" onClick={() => setSent(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              id="name"
              name="name"
              label="Full name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <div className="grid gap-5 sm:grid-cols-2">
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
            </div>
            <Select
              id="purpose"
              name="purpose"
              label="How can we help you?"
              value={form.purpose}
              onChange={handleChange}
              error={errors.purpose}
            >
              <option value="" disabled>
                Choose a reason
              </option>
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <div>
              <label htmlFor="message" className="block text-base font-medium text-ink/80">
                Message <span className="text-ink/40">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Share any additional details…"
                className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-periwinkle"
              />
            </div>

            {formError && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {formError}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
              {status === 'pending' ? 'Sending…' : 'Send message'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
