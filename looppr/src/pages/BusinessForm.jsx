import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { submitPartnerLead } from '../services/partnerLeadApi'

const INITIAL_FORM = {
  businessName: '',
  contactName: '',
  title: '',
  email: '',
  phone: '',
  businessType: '',
  locations: '1',
  address: '',
  volume: '',
  turnaround: '4 hours (express)',
  frequency: 'Daily',
  currentSolution: 'In-house / on-site',
  itemTypes: '',
  hearAbout: 'Word of mouth',
  notes: '',
}

function buildMessage(form) {
  return [
    `Title: ${form.title}`,
    `Business type: ${form.businessType}`,
    `Locations: ${form.locations}`,
    `Primary service address: ${form.address}`,
    `Estimated weekly volume: ${form.volume}`,
    `Turnaround needed: ${form.turnaround}`,
    `Pickup frequency: ${form.frequency}`,
    `Current laundry solution: ${form.currentSolution}`,
    `Item types: ${form.itemTypes}`,
    `Heard about Looppr via: ${form.hearAbout}`,
    form.notes ? `Notes: ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function BusinessForm() {
  const [form, setForm] = useState(INITIAL_FORM)
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
    if (form.businessName.trim().length < 2) next.businessName = 'Enter your business name.'
    if (form.contactName.trim().length < 2) next.contactName = 'Enter your name.'
    if (form.title.trim().length < 2) next.title = 'Enter your title.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (!form.businessType) next.businessType = 'Select a business type.'
    if (form.address.trim().length < 5) next.address = 'Enter your primary service address.'
    if (!form.volume) next.volume = 'Select your estimated weekly volume.'
    if (form.itemTypes.trim().length < 3) next.itemTypes = 'Tell us what needs laundering.'
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
      await submitPartnerLead({
        type: 'business',
        name: form.contactName,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        message: buildMessage(form),
      })
      setSent(true)
      window.scrollTo(0, 0)
    } catch (err) {
      setFormError(
        err.response?.status === 429
          ? 'Too many attempts. Please try again later.'
          : err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.',
      )
      setStatus('idle')
    }
  }

  return (
    <div>
      <SEO title="Talk to our business team" description="Tell us about your business laundry needs." noindex />

      <section className="bg-ink px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/business"
            className="inline-flex items-center gap-2 text-sm text-periwinkle-muted transition-colors hover:text-white"
          >
            ← Back to For business
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle-muted">
            LoopprBiz inquiry
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tell us about your business.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-periwinkle-muted">
            We'll match you with a dedicated account manager and have you running within the
            week — first week free, no contract.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {sent ? (
            <div className="rounded-3xl border border-line bg-white p-10 text-center sm:p-14">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-periwinkle-soft">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-periwinkle-text" fill="none" aria-hidden="true">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                We'll be in touch shortly.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
                Our business team will reach out within 4 business hours to set up your onboarding
                call and match you with a laundromat partner near you.
              </p>
              <p className="mt-2 text-xs text-ink/45">
                Email: <strong className="text-periwinkle-text">biz@getlooppr.com</strong>
              </p>
              <Button to="/business" variant="ghost" className="mt-6">
                Back to For business
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Business details</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <Input
                    id="businessName"
                    name="businessName"
                    label="Business name"
                    value={form.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    placeholder="The Grand Hotel OKC"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="contactName"
                      name="contactName"
                      label="Your name"
                      value={form.contactName}
                      onChange={handleChange}
                      error={errors.contactName}
                      placeholder="Jordan Smith"
                    />
                    <Input
                      id="title"
                      name="title"
                      label="Your title"
                      value={form.title}
                      onChange={handleChange}
                      error={errors.title}
                      placeholder="Operations Manager"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Work email"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="jordan@grandhotelokc.com"
                    />
                    <Input
                      id="phone"
                      name="phone"
                      label="Phone"
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="(405) 555-0200"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="businessType"
                      name="businessType"
                      label="Business type"
                      value={form.businessType}
                      onChange={handleChange}
                      error={errors.businessType}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Hotel / motel</option>
                      <option>Boutique hotel / B&amp;B</option>
                      <option>Airbnb / short-term rental</option>
                      <option>Gym / fitness studio</option>
                      <option>Med spa / salon</option>
                      <option>Restaurant / hospitality</option>
                      <option>Corporate office</option>
                      <option>Other</option>
                    </Select>
                    <Select
                      id="locations"
                      name="locations"
                      label="Number of locations"
                      value={form.locations}
                      onChange={handleChange}
                    >
                      <option value="1">1</option>
                      <option value="2–3">2–3</option>
                      <option value="4–10">4–10</option>
                      <option value="10+">10+</option>
                    </Select>
                  </div>
                  <Input
                    id="address"
                    name="address"
                    label="Primary service address"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="123 Main St, Oklahoma City, OK 73102"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Laundry needs</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="volume"
                      name="volume"
                      label="Estimated weekly volume"
                      value={form.volume}
                      onChange={handleChange}
                      error={errors.volume}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Under 50 lbs/wk</option>
                      <option>50–150 lbs/wk</option>
                      <option>150–500 lbs/wk</option>
                      <option>500–1,000 lbs/wk</option>
                      <option>1,000+ lbs/wk</option>
                    </Select>
                    <Select
                      id="turnaround"
                      name="turnaround"
                      label="Turnaround needed"
                      value={form.turnaround}
                      onChange={handleChange}
                    >
                      <option>4 hours (express)</option>
                      <option>8 hours (same day)</option>
                      <option>Next morning</option>
                      <option>Flexible</option>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="frequency"
                      name="frequency"
                      label="Pickup frequency"
                      value={form.frequency}
                      onChange={handleChange}
                    >
                      <option>Daily</option>
                      <option>Several times a week</option>
                      <option>Weekly</option>
                      <option>On-demand / as needed</option>
                    </Select>
                    <Select
                      id="currentSolution"
                      name="currentSolution"
                      label="Current laundry solution"
                      value={form.currentSolution}
                      onChange={handleChange}
                    >
                      <option>In-house / on-site</option>
                      <option>Another laundry service</option>
                      <option>Taking it to a laundromat</option>
                      <option>Staff doing it themselves</option>
                      <option>No solution yet</option>
                    </Select>
                  </div>
                  <Input
                    id="itemTypes"
                    name="itemTypes"
                    label="What types of items need laundering?"
                    value={form.itemTypes}
                    onChange={handleChange}
                    error={errors.itemTypes}
                    placeholder="e.g. Bed linens, towels, robes, uniforms, tablecloths"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Anything else?</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <Select
                    id="hearAbout"
                    name="hearAbout"
                    label="How did you hear about Looppr?"
                    value={form.hearAbout}
                    onChange={handleChange}
                  >
                    <option>Word of mouth</option>
                    <option>Social media</option>
                    <option>Google search</option>
                    <option>Industry event / association</option>
                    <option>A Looppr driver or partner</option>
                    <option>Other</option>
                  </Select>
                  <div>
                    <label htmlFor="notes" className="block text-base font-medium text-ink/80">
                      Any questions or special requirements?{' '}
                      <span className="text-ink/40">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Tell us about any special needs — fragrance-free, particular fold styles, rush situations, etc."
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-periwinkle"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink/45">
                  We reply within 4 business hours.{' '}
                  <strong className="text-periwinkle-text">biz@getlooppr.com</strong>
                </p>
                <Button type="submit" variant="primary" disabled={status === 'pending'}>
                  {status === 'pending' ? 'Submitting…' : 'Submit inquiry'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
