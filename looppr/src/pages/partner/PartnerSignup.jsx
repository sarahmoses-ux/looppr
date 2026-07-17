import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePartnerAuth } from '../../context/PartnerAuthContext'
import PartnerAuthShell from '../../components/partner/PartnerAuthShell'
import { SERVICE_OPTIONS } from '../../components/partner/partnerUi'
import Input from '../../components/Input'
import Button from '../../components/Button'

const MAX_FILE_BYTES = 500 * 1024 // 500KB per image — kept small (stored as data URLs, MVP)
const MAX_IMAGES = 4

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const EMPTY = {
  businessName: '', ownerName: '', email: '', phone: '', password: '', confirmPassword: '',
  address: '', city: '', state: 'OK', yearsInBusiness: '', description: '',
  openTime: '08:00', closeTime: '19:00', openWeekends: true,
  maxDailyCapacity: '', employeeCount: '',
  pickupAvailable: true, deliveryAvailable: true,
}

function SectionTitle({ children }) {
  return <h2 className="pt-2 text-xs font-bold uppercase tracking-[0.14em] text-ink/40">{children}</h2>
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <div className="flex gap-1 rounded-full bg-linen p-0.5">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${value === v ? 'bg-sky-500 text-white' : 'text-ink/55'}`}
          >
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PartnerSignup() {
  const { register } = usePartnerAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [services, setServices] = useState([])
  const [logo, setLogo] = useState('')
  const [images, setImages] = useState([])
  const [document, setDocument] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function toggleService(value) {
    setServices((s) => (s.includes(value) ? s.filter((v) => v !== value) : [...s, value]))
  }

  async function handleLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_BYTES) return setErrors((x) => ({ ...x, logo: 'Logo must be under 500KB.' }))
    setErrors((x) => ({ ...x, logo: undefined }))
    setLogo(await fileToDataUrl(file))
  }

  async function handleImages(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES)
    if (files.some((f) => f.size > MAX_FILE_BYTES)) {
      return setErrors((x) => ({ ...x, images: 'Each image must be under 500KB.' }))
    }
    setErrors((x) => ({ ...x, images: undefined }))
    setImages(await Promise.all(files.map(fileToDataUrl)))
  }

  async function handleDocument(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) return setErrors((x) => ({ ...x, document: 'Document must be under 1MB.' }))
    setErrors((x) => ({ ...x, document: undefined }))
    setDocument(await fileToDataUrl(file))
  }

  function validate() {
    const next = {}
    if (form.businessName.trim().length < 2) next.businessName = 'Enter your business name.'
    if (form.ownerName.trim().length < 2) next.ownerName = 'Enter the owner name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid business email.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) next.password = 'At least 8 characters, with a letter and a number.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    if (form.address.trim().length < 3) next.address = 'Enter your business address.'
    if (form.city.trim().length < 2) next.city = 'Enter your city.'
    if (!agreed) next.agreed = 'You must agree to continue.'
    return next
  }

  function buildOperatingHours() {
    const days = form.openWeekends
      ? ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      : ['mon', 'tue', 'wed', 'thu', 'fri']
    return days.map((day) => ({ day, open: form.openTime, close: form.closeTime, closed: false }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors((x) => ({ ...x, ...next }))
    setFormError('')
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      const { email } = await register({
        businessName: form.businessName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
        city: form.city,
        state: form.state,
        description: form.description,
        yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : 0,
        employeeCount: form.employeeCount ? Number(form.employeeCount) : 0,
        maxDailyCapacity: form.maxDailyCapacity ? Number(form.maxDailyCapacity) : 20,
        servicesOffered: services,
        pickupAvailable: form.pickupAvailable,
        deliveryAvailable: form.deliveryAvailable,
        operatingHours: buildOperatingHours(),
        logo,
        images,
        businessDocument: document,
        agreedToTerms: 'true',
      })
      navigate('/partners/verify-email', { state: { email } })
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
    <PartnerAuthShell
      title="Create your partner account"
      footer={
        <>
          Already a Partner?{' '}
          <Link to="/partners/login" className="font-semibold text-sky-600 hover:text-sky-700">Login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <SectionTitle>Business details</SectionTitle>
        <Input id="businessName" name="businessName" label="Laundry business name" value={form.businessName} onChange={handleChange} error={errors.businessName} placeholder="Sparkle Wash Laundromat" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="ownerName" name="ownerName" label="Owner name" value={form.ownerName} onChange={handleChange} error={errors.ownerName} placeholder="Alex Rivera" />
          <Input id="phone" name="phone" type="tel" label="Phone number" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="(918) 555-0123" />
        </div>
        <Input id="email" name="email" type="email" label="Business email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="shop@yourlaundry.com" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="password" name="password" type="password" label="Password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} placeholder="At least 8 characters" />
          <Input id="confirmPassword" name="confirmPassword" type="password" label="Confirm password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Re-enter password" />
        </div>

        <SectionTitle>Location</SectionTitle>
        <Input id="address" name="address" label="Business address" value={form.address} onChange={handleChange} error={errors.address} placeholder="120 Main St" />
        <div className="grid grid-cols-2 gap-4">
          <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} error={errors.city} placeholder="Tulsa" />
          <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
        </div>

        <SectionTitle>About your shop</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Input id="yearsInBusiness" name="yearsInBusiness" type="number" min="0" label="Years in business" value={form.yearsInBusiness} onChange={handleChange} placeholder="5" />
          <Input id="employeeCount" name="employeeCount" type="number" min="0" label="Number of employees" value={form.employeeCount} onChange={handleChange} placeholder="8" />
        </div>
        <Input id="maxDailyCapacity" name="maxDailyCapacity" type="number" min="0" label="Maximum daily capacity (orders)" value={form.maxDailyCapacity} onChange={handleChange} placeholder="30" />
        <div>
          <label htmlFor="description" className="block text-base font-medium text-ink/80">Business description</label>
          <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Tell us about your laundromat…" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sky-400" />
        </div>

        <SectionTitle>Operating hours</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <Input id="openTime" name="openTime" type="time" label="Opens" value={form.openTime} onChange={handleChange} />
          <Input id="closeTime" name="closeTime" type="time" label="Closes" value={form.closeTime} onChange={handleChange} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.openWeekends} onChange={(e) => setForm((f) => ({ ...f, openWeekends: e.target.checked }))} className="h-4 w-4 rounded border-line accent-periwinkle" />
          Open on weekends (Sat & Sun)
        </label>

        <SectionTitle>Services offered</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {SERVICE_OPTIONS.map((s) => (
            <label key={s.value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${services.includes(s.value) ? 'border-sky-300 bg-sky-50 text-sky-800' : 'border-line text-ink/70 hover:border-sky-200'}`}>
              <input type="checkbox" checked={services.includes(s.value)} onChange={() => toggleService(s.value)} className="h-4 w-4 rounded border-line accent-periwinkle" />
              {s.label}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Toggle label="Pickup service available" value={form.pickupAvailable} onChange={(v) => setForm((f) => ({ ...f, pickupAvailable: v }))} />
          <Toggle label="Delivery service available" value={form.deliveryAvailable} onChange={(v) => setForm((f) => ({ ...f, deliveryAvailable: v }))} />
        </div>

        <SectionTitle>Uploads (optional)</SectionTitle>
        <div className="space-y-3">
          <div>
            <span className="block text-sm font-medium text-ink/80">Business logo</span>
            <div className="mt-2 flex items-center gap-3">
              {logo && <img src={logo} alt="Logo preview" className="h-12 w-12 rounded-lg object-cover ring-1 ring-line" />}
              <input type="file" accept="image/*" onChange={handleLogo} className="text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
            </div>
            {errors.logo && <p className="mt-1 text-sm font-medium text-red-600">{errors.logo}</p>}
          </div>
          <div>
            <span className="block text-sm font-medium text-ink/80">Shop images (up to {MAX_IMAGES})</span>
            <input type="file" accept="image/*" multiple onChange={handleImages} className="mt-2 text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((src, i) => <img key={i} src={src} alt={`Shop ${i + 1}`} className="h-14 w-14 rounded-lg object-cover ring-1 ring-line" />)}
              </div>
            )}
            {errors.images && <p className="mt-1 text-sm font-medium text-red-600">{errors.images}</p>}
          </div>
          <div>
            <span className="block text-sm font-medium text-ink/80">Valid business document</span>
            <input type="file" accept="image/*,.pdf" onChange={handleDocument} className="mt-2 text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
            {document && <p className="mt-1 text-xs font-medium text-success-dark">Document attached ✓</p>}
            {errors.document && <p className="mt-1 text-sm font-medium text-red-600">{errors.document}</p>}
          </div>
        </div>

        <label className="flex items-start gap-2 pt-2 text-sm text-ink/70">
          <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((x) => ({ ...x, agreed: undefined })) }} className="mt-0.5 h-4 w-4 rounded border-line accent-periwinkle" />
          <span>
            I agree to the Looppr{' '}
            <Link to="/terms" className="font-semibold text-sky-600 hover:text-sky-700">Partner Terms</Link> and{' '}
            <Link to="/privacy" className="font-semibold text-sky-600 hover:text-sky-700">Privacy Policy</Link>.
          </span>
        </label>
        {errors.agreed && <p role="alert" className="text-sm font-medium text-red-600">{errors.agreed}</p>}

        {formError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Creating account…' : 'Create Partner Account'}
        </Button>
        <p className="text-center text-xs text-ink/45">We'll email a 6-digit code to verify your address.</p>
      </form>
    </PartnerAuthShell>
  )
}
