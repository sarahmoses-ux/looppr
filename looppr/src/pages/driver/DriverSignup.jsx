import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDriverAuth } from '../../context/DriverAuthContext'
import DriverAuthShell from '../../components/driver/DriverAuthShell'
import { VEHICLE_OPTIONS } from '../../components/driver/driverUi'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Button from '../../components/Button'
import { PUBLIC_PAGES } from '../../seo/publicPages'

const PAGE_META = PUBLIC_PAGES.find((p) => p.path === '/drive/signup')

const EMPTY = {
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  address: '', city: '', state: 'OK',
  vehicleType: '', vehicleName: '', licenseNumber: '', vehiclePlate: '',
}

const MAX_PHOTO_BYTES = 500 * 1024 // 500KB — kept small (stored as a data URL, MVP)

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SectionTitle({ children }) {
  return <h2 className="pt-2 text-xs font-bold uppercase tracking-[0.14em] text-ink/40">{children}</h2>
}

export default function DriverSignup() {
  const { register } = useDriverAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) return setErrors((x) => ({ ...x, photo: 'Photo must be under 500KB.' }))
    setErrors((x) => ({ ...x, photo: undefined }))
    setProfilePhoto(await fileToDataUrl(file))
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) next.password = 'At least 8 characters, with a letter and a number.'
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.'
    if (form.address.trim().length < 3) next.address = 'Enter your address.'
    if (form.city.trim().length < 2) next.city = 'Enter your city.'
    if (!form.vehicleType) next.vehicleType = 'Select your vehicle type.'
    if (form.vehicleName.trim().length < 2) next.vehicleName = 'Enter your vehicle name (e.g. Toyota Corolla).'
    if (!agreed) next.agreed = 'You must agree to continue.'
    return next
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
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: form.address,
        city: form.city,
        state: form.state,
        vehicleType: form.vehicleType,
        vehicleName: form.vehicleName,
        licenseNumber: form.licenseNumber,
        vehiclePlate: form.vehiclePlate,
        profilePhoto,
        agreedToTerms: 'true',
      })
      navigate('/drive/verify-email', { state: { email } })
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
    <DriverAuthShell
      title="Create your driver account"
      description={PAGE_META.description}
      keywords={PAGE_META.keywords}
      noindex={false}
      footer={
        <>
          Already a Driver?{' '}
          <Link to="/drive/login" className="font-semibold text-sky-600 hover:text-sky-700">Login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <SectionTitle>Your details</SectionTitle>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 text-lg font-semibold text-sky-700 ring-1 ring-line">
            {profilePhoto ? (
              <img src={profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              (form.name || 'D').charAt(0).toUpperCase()
            )}
          </span>
          <div>
            <span className="block text-sm font-medium text-ink/80">Profile picture (optional)</span>
            <input type="file" accept="image/*" onChange={handlePhoto} className="mt-1 text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
          </div>
        </div>
        {errors.photo && <p role="alert" className="text-sm font-medium text-red-600">{errors.photo}</p>}
        <Input id="name" name="name" label="Full name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Jamie Chen" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="email" name="email" type="email" label="Email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
          <Input id="phone" name="phone" type="tel" label="Phone number" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="(918) 555-0123" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="password" name="password" type="password" label="Password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} placeholder="At least 8 characters" />
          <Input id="confirmPassword" name="confirmPassword" type="password" label="Confirm password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Re-enter password" />
        </div>

        <SectionTitle>Where you're based</SectionTitle>
        <Input id="address" name="address" label="Address" value={form.address} onChange={handleChange} error={errors.address} placeholder="120 Main St" />
        <div className="grid grid-cols-2 gap-4">
          <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} error={errors.city} placeholder="Tulsa" />
          <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
        </div>

        <SectionTitle>Vehicle</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="vehicleType" name="vehicleType" label="Vehicle type" value={form.vehicleType} onChange={handleChange} error={errors.vehicleType}>
            <option value="">Select a vehicle…</option>
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </Select>
          <Input id="vehicleName" name="vehicleName" label="Vehicle name" value={form.vehicleName} onChange={handleChange} error={errors.vehicleName} placeholder="Toyota Corolla" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="licenseNumber" name="licenseNumber" label="License number (optional)" value={form.licenseNumber} onChange={handleChange} placeholder="Driver's license no." />
          <Input id="vehiclePlate" name="vehiclePlate" label="License plate (optional)" value={form.vehiclePlate} onChange={handleChange} placeholder="ABC-1234" />
        </div>

        <label className="flex items-start gap-2 pt-2 text-sm text-ink/70">
          <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((x) => ({ ...x, agreed: undefined })) }} className="mt-0.5 h-4 w-4 rounded border-line accent-periwinkle" />
          <span>
            I agree to the Looppr{' '}
            <Link to="/terms" className="font-semibold text-sky-600 hover:text-sky-700">Driver Terms</Link> and{' '}
            <Link to="/privacy" className="font-semibold text-sky-600 hover:text-sky-700">Privacy Policy</Link>.
          </span>
        </label>
        {errors.agreed && <p role="alert" className="text-sm font-medium text-red-600">{errors.agreed}</p>}

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={status === 'pending'}>
          {status === 'pending' ? 'Creating account…' : 'Create Driver Account'}
        </Button>
        <p className="text-center text-xs text-ink/45">We'll email a 6-digit code to verify your address.</p>
      </form>
    </DriverAuthShell>
  )
}
