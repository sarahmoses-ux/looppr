import { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { PUBLIC_PAGES } from '../seo/publicPages'
import { submitContactMessage } from '../services/contactApi'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/contact')

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
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
    if (form.message.trim().length < 10) next.message = 'Tell us a bit more (at least 10 characters).'
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
      setForm({ name: '', email: '', message: '' })
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
      <SEO title={PAGE_META.title} description={PAGE_META.description} />
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
            <div>
              <label htmlFor="message" className="block text-base font-medium text-ink/80">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/35 ${
                  errors.message ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-periwinkle'
                }`}
              />
              {errors.message && (
                <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
                  {errors.message}
                </p>
              )}
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
