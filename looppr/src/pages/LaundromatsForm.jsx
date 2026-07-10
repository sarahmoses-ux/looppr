import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { submitPartnerLead } from '../services/partnerLeadApi'

const INITIAL_FORM = {
  laundromatName: '',
  contactName: '',
  role: '',
  email: '',
  phone: '',
  address: '',
  yearsInOperation: '',
  offersWashFold: 'Yes, regularly',
  washers: '',
  dryers: '',
  maxLbsPerDay: '',
  processingTime: '~1 hour',
  openingTime: '',
  closingTime: '',
  slowestHours: '',
  hearAbout: 'Word of mouth / referral',
  notes: '',
}

function buildMessage(form) {
  return [
    `Role: ${form.role}`,
    `Business address: ${form.address}`,
    `Years in operation: ${form.yearsInOperation}`,
    `Currently offers wash & fold: ${form.offersWashFold}`,
    `Washers: ${form.washers}`,
    `Dryers: ${form.dryers}`,
    `Max lbs/day: ${form.maxLbsPerDay}`,
    `Avg. processing time per load: ${form.processingTime}`,
    `Hours: ${form.openingTime}–${form.closingTime}`,
    `Slowest hours (preferred order times): ${form.slowestHours}`,
    `Heard about Looppr via: ${form.hearAbout}`,
    form.notes ? `Notes: ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function LaundromatsForm() {
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
    if (form.laundromatName.trim().length < 2) next.laundromatName = 'Enter your laundromat name.'
    if (form.contactName.trim().length < 2) next.contactName = 'Enter your name.'
    if (form.role.trim().length < 2) next.role = 'Enter your role.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (form.address.trim().length < 5) next.address = 'Enter your business address.'
    if (!form.yearsInOperation) next.yearsInOperation = 'Select years in operation.'
    if (!form.washers || Number(form.washers) < 1) next.washers = 'Enter number of washers.'
    if (!form.dryers || Number(form.dryers) < 1) next.dryers = 'Enter number of dryers.'
    if (!form.maxLbsPerDay) next.maxLbsPerDay = 'Select max lbs you can handle per day.'
    if (!form.openingTime) next.openingTime = 'Enter your opening time.'
    if (!form.closingTime) next.closingTime = 'Enter your closing time.'
    if (form.slowestHours.trim().length < 3) next.slowestHours = 'Tell us your slowest hours.'
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
        type: 'laundromat',
        name: form.contactName,
        email: form.email,
        phone: form.phone,
        businessName: form.laundromatName,
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
      <SEO title="Apply to become a partner laundromat" description="Apply to partner your laundromat with Looppr." noindex />

      <section className="bg-success-dark px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/laundromats"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            ← Back to Laundromat partners
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-success-soft">
            Partner application
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Apply to become a Looppr partner laundromat.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/75">
            Zero cost to join. We'll match your capacity to orders during your slowest hours and
            pay you every Friday.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {sent ? (
            <div className="rounded-3xl border border-line bg-white p-10 text-center sm:p-14">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-success-dark" fill="none" aria-hidden="true">
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
                Application submitted!
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
                Our partnerships team will review your application and reach out within 2 business
                days to schedule an onboarding call.
              </p>
              <p className="mt-2 text-xs text-ink/45">
                Questions? Email <strong className="text-periwinkle-text">partners@getlooppr.com</strong>
              </p>
              <Button to="/laundromats" variant="ghost" className="mt-6">
                Back to Partners
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Business information</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <Input
                    id="laundromatName"
                    name="laundromatName"
                    label="Laundromat name"
                    value={form.laundromatName}
                    onChange={handleChange}
                    error={errors.laundromatName}
                    placeholder="Suds & Fold Laundry"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="contactName"
                      name="contactName"
                      label="Owner / contact name"
                      value={form.contactName}
                      onChange={handleChange}
                      error={errors.contactName}
                      placeholder="Rosa Martinez"
                    />
                    <Input
                      id="role"
                      name="role"
                      label="Your role"
                      value={form.role}
                      onChange={handleChange}
                      error={errors.role}
                      placeholder="Owner / Manager"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="rosa@sudsandfold.com"
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
                  <Input
                    id="address"
                    name="address"
                    label="Business address"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="123 Main St, Oklahoma City, OK 73102"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="yearsInOperation"
                      name="yearsInOperation"
                      label="Years in operation"
                      value={form.yearsInOperation}
                      onChange={handleChange}
                      error={errors.yearsInOperation}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Less than 1 year</option>
                      <option>1–3 years</option>
                      <option>3–5 years</option>
                      <option>5–10 years</option>
                      <option>10–20 years</option>
                      <option>20+ years</option>
                    </Select>
                    <Select
                      id="offersWashFold"
                      name="offersWashFold"
                      label="Do you currently offer wash & fold?"
                      value={form.offersWashFold}
                      onChange={handleChange}
                    >
                      <option>Yes, regularly</option>
                      <option>Sometimes / on request</option>
                      <option>No, but open to it</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Capacity &amp; hours</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="washers"
                      name="washers"
                      type="number"
                      min="1"
                      label="Number of washers"
                      value={form.washers}
                      onChange={handleChange}
                      error={errors.washers}
                      placeholder="12"
                    />
                    <Input
                      id="dryers"
                      name="dryers"
                      type="number"
                      min="1"
                      label="Number of dryers"
                      value={form.dryers}
                      onChange={handleChange}
                      error={errors.dryers}
                      placeholder="10"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="maxLbsPerDay"
                      name="maxLbsPerDay"
                      label="Max lbs you can handle per day"
                      value={form.maxLbsPerDay}
                      onChange={handleChange}
                      error={errors.maxLbsPerDay}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Up to 50 lbs</option>
                      <option>50–100 lbs</option>
                      <option>100–200 lbs</option>
                      <option>200–500 lbs</option>
                      <option>500+ lbs</option>
                    </Select>
                    <Select
                      id="processingTime"
                      name="processingTime"
                      label="Avg. processing time per load"
                      value={form.processingTime}
                      onChange={handleChange}
                    >
                      <option>~1 hour</option>
                      <option>1–2 hours</option>
                      <option>2–3 hours</option>
                      <option>3+ hours</option>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="openingTime"
                      name="openingTime"
                      type="time"
                      label="Opening time"
                      value={form.openingTime}
                      onChange={handleChange}
                      error={errors.openingTime}
                    />
                    <Input
                      id="closingTime"
                      name="closingTime"
                      type="time"
                      label="Closing time"
                      value={form.closingTime}
                      onChange={handleChange}
                      error={errors.closingTime}
                    />
                  </div>
                  <Input
                    id="slowestHours"
                    name="slowestHours"
                    label="Slowest hours (when you'd prefer orders)"
                    value={form.slowestHours}
                    onChange={handleChange}
                    error={errors.slowestHours}
                    placeholder="e.g. Mon–Thu 8 AM–11 AM"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Final questions</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <Select
                    id="hearAbout"
                    name="hearAbout"
                    label="How did you hear about Looppr?"
                    value={form.hearAbout}
                    onChange={handleChange}
                  >
                    <option>Word of mouth / referral</option>
                    <option>Social media</option>
                    <option>Google search</option>
                    <option>A Looppr driver mentioned it</option>
                    <option>Laundry industry group / association</option>
                    <option>Other</option>
                  </Select>
                  <div>
                    <label htmlFor="notes" className="block text-base font-medium text-ink/80">
                      Anything else we should know? <span className="text-ink/40">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Special equipment, certifications, questions about the partnership…"
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
                  Applications reviewed within 2 business days.{' '}
                  <strong className="text-periwinkle-text">partners@getlooppr.com</strong>
                </p>
                <Button
                  type="submit"
                  variant="accent"
                  className="bg-success-dark! hover:bg-success-dark/90!"
                  disabled={status === 'pending'}
                >
                  {status === 'pending' ? 'Submitting…' : 'Submit application'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
