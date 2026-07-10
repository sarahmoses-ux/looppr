import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { submitPartnerLead } from '../services/partnerLeadApi'

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  dob: '',
  year: '',
  make: '',
  model: '',
  vehicleType: '',
  plateState: '',
  hoursPerWeek: '',
  shift: '',
  hasLicenseInsurance: false,
  isEligible: false,
  consentsBackgroundCheck: false,
  notes: '',
}

function buildMessage(form) {
  return [
    `City: ${form.city}`,
    `Date of birth: ${form.dob}`,
    `Vehicle: ${form.year} ${form.make} ${form.model} (${form.vehicleType})`,
    `License plate state: ${form.plateState}`,
    `Hours available per week: ${form.hoursPerWeek}`,
    `Preferred shift: ${form.shift}`,
    `Has valid license & insurance: ${form.hasLicenseInsurance ? 'Yes' : 'No'}`,
    `18+ and eligible to work: ${form.isEligible ? 'Yes' : 'No'}`,
    `Consents to background check: ${form.consentsBackgroundCheck ? 'Yes' : 'No'}`,
    form.notes ? `Why they want to drive: ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function DriveForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function validate() {
    const next = {}
    if (form.firstName.trim().length < 2) next.firstName = 'Enter your first name.'
    if (form.lastName.trim().length < 2) next.lastName = 'Enter your last name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (!form.city) next.city = 'Select the city you’ll drive in.'
    if (!form.dob) next.dob = 'Enter your date of birth.'
    if (!form.year || Number(form.year) < 2005) next.year = 'Enter a valid vehicle year.'
    if (form.make.trim().length < 2) next.make = 'Enter your vehicle make.'
    if (form.model.trim().length < 1) next.model = 'Enter your vehicle model.'
    if (!form.vehicleType) next.vehicleType = 'Select a vehicle type.'
    if (form.plateState.trim().length !== 2) next.plateState = 'Enter a 2-letter state code.'
    if (!form.hoursPerWeek) next.hoursPerWeek = 'Select your availability.'
    if (!form.shift) next.shift = 'Select a preferred shift.'
    if (!form.hasLicenseInsurance) next.hasLicenseInsurance = 'Required to apply.'
    if (!form.isEligible) next.isEligible = 'Required to apply.'
    if (!form.consentsBackgroundCheck) next.consentsBackgroundCheck = 'Required to apply.'
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
        type: 'driver',
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: form.phone,
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
      <SEO title="Apply to drive with Looppr" description="Apply to become a Looppr driver." noindex />

      <section className="bg-ink-footer px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/drive"
            className="inline-flex items-center gap-2 text-sm text-periwinkle-muted transition-colors hover:text-white"
          >
            ← Back to Drive with us
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#EF9F27]">
            Driver application
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Apply to drive with Looppr.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-periwinkle-muted">
            Takes about 3 minutes. Background check is free and runs after approval. We'll be in
            touch within 24 hours.
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
                Application received.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
                We'll review your application and reach out within 24 hours. Once approved, your
                background check will be initiated — totally free.
              </p>
              <p className="mt-2 text-xs text-ink/45">
                Keep an eye on your email and texts from{' '}
                <strong className="text-periwinkle-text">drivers@getlooppr.com</strong>.
              </p>
              <Button to="/drive" variant="ghost" className="mt-6">
                Back to Drive with us
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Personal information</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="firstName"
                      name="firstName"
                      label="First name"
                      value={form.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      placeholder="Jamie"
                    />
                    <Input
                      id="lastName"
                      name="lastName"
                      label="Last name"
                      value={form.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      placeholder="Rivera"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email address"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="jamie@email.com"
                    />
                    <Input
                      id="phone"
                      name="phone"
                      label="Mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="(405) 555-0100"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="city"
                      name="city"
                      label="City you'll drive in"
                      value={form.city}
                      onChange={handleChange}
                      error={errors.city}
                    >
                      <option value="" disabled>
                        Select city…
                      </option>
                      <optgroup label="Oklahoma — Launching July 12, 2026">
                        <option>Oklahoma City, OK</option>
                        <option>Edmond, OK</option>
                        <option>Norman, OK</option>
                        <option>Moore, OK</option>
                      </optgroup>
                      <optgroup label="Texas — Launching Feb 2027">
                        <option>Dallas, TX</option>
                        <option>Fort Worth, TX</option>
                        <option>Plano, TX</option>
                        <option>Frisco, TX</option>
                        <option>Denton, TX</option>
                        <option>McKinney, TX</option>
                        <option>Houston, TX</option>
                        <option>Austin, TX</option>
                        <option>San Antonio, TX</option>
                        <option>Amarillo, TX</option>
                      </optgroup>
                      <optgroup label="Georgia — Launching Feb 2027">
                        <option>Atlanta, GA</option>
                        <option>Alpharetta, GA</option>
                        <option>Roswell, GA</option>
                        <option>Sandy Springs, GA</option>
                        <option>Marietta, GA</option>
                        <option>Savannah, GA</option>
                        <option>Augusta, GA</option>
                      </optgroup>
                      <option>Other</option>
                    </Select>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      label="Date of birth"
                      value={form.dob}
                      onChange={handleChange}
                      error={errors.dob}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">Vehicle information</h2>
                <div className="mt-5 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      min="2005"
                      max="2026"
                      label="Year"
                      value={form.year}
                      onChange={handleChange}
                      error={errors.year}
                      placeholder="2019"
                    />
                    <Input
                      id="make"
                      name="make"
                      label="Make"
                      value={form.make}
                      onChange={handleChange}
                      error={errors.make}
                      placeholder="Toyota"
                    />
                    <Input
                      id="model"
                      name="model"
                      label="Model"
                      value={form.model}
                      onChange={handleChange}
                      error={errors.model}
                      placeholder="Camry"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="vehicleType"
                      name="vehicleType"
                      label="Vehicle type"
                      value={form.vehicleType}
                      onChange={handleChange}
                      error={errors.vehicleType}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Car / Sedan</option>
                      <option>SUV</option>
                      <option>Truck</option>
                      <option>Van / Minivan</option>
                    </Select>
                    <Input
                      id="plateState"
                      name="plateState"
                      label="License plate state"
                      value={form.plateState}
                      onChange={handleChange}
                      error={errors.plateState}
                      maxLength={2}
                      placeholder="OK"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <h2 className="font-display text-base font-semibold text-ink">
                  Availability &amp; eligibility
                </h2>
                <div className="mt-5 flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="hoursPerWeek"
                      name="hoursPerWeek"
                      label="Hours available per week"
                      value={form.hoursPerWeek}
                      onChange={handleChange}
                      error={errors.hoursPerWeek}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>1–5 hrs</option>
                      <option>5–10 hrs</option>
                      <option>10–20 hrs</option>
                      <option>20–30 hrs</option>
                      <option>30+ hrs (full time)</option>
                    </Select>
                    <Select
                      id="shift"
                      name="shift"
                      label="Preferred shift"
                      value={form.shift}
                      onChange={handleChange}
                      error={errors.shift}
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      <option>Morning (6 AM–12 PM)</option>
                      <option>Afternoon (12–6 PM)</option>
                      <option>Evening (6–10 PM)</option>
                      <option>Flexible / any time</option>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        name="hasLicenseInsurance"
                        checked={form.hasLicenseInsurance}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-line accent-periwinkle focus:ring-periwinkle"
                      />
                      <span className="text-sm leading-relaxed text-ink">
                        I have a valid driver's license and auto insurance in good standing.
                      </span>
                    </label>
                    {errors.hasLicenseInsurance && (
                      <p role="alert" className="-mt-2 text-sm font-medium text-red-600">
                        {errors.hasLicenseInsurance}
                      </p>
                    )}
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        name="isEligible"
                        checked={form.isEligible}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-line accent-periwinkle focus:ring-periwinkle"
                      />
                      <span className="text-sm leading-relaxed text-ink">
                        I am 18 years or older and legally eligible to work in the United States.
                      </span>
                    </label>
                    {errors.isEligible && (
                      <p role="alert" className="-mt-2 text-sm font-medium text-red-600">
                        {errors.isEligible}
                      </p>
                    )}
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        name="consentsBackgroundCheck"
                        checked={form.consentsBackgroundCheck}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-line accent-periwinkle focus:ring-periwinkle"
                      />
                      <span className="text-sm leading-relaxed text-ink">
                        I consent to a background check being run after my application is approved.
                      </span>
                    </label>
                    {errors.consentsBackgroundCheck && (
                      <p role="alert" className="-mt-2 text-sm font-medium text-red-600">
                        {errors.consentsBackgroundCheck}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-base font-medium text-ink/80">
                      Why do you want to drive with Looppr?{' '}
                      <span className="text-ink/40">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Tell us a bit about yourself and why this fits your schedule…"
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
                  Applications go to <strong className="text-periwinkle-text">drivers@getlooppr.com</strong>.
                  We reply within 24 hours.
                </p>
                <Button type="submit" variant="primary" disabled={status === 'pending'}>
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
