import { useState } from 'react'
import { useDriverAuth } from '../../../context/DriverAuthContext'
import DashboardCard from '../../../components/business/DashboardCard'
import Input from '../../../components/Input'
import Select from '../../../components/Select'
import Button from '../../../components/Button'
import { VEHICLE_OPTIONS } from '../../../components/driver/driverUi'
import { updateDriverProfile } from '../../../services/driverDashboardApi'

const MAX_PHOTO_BYTES = 500 * 1024 // 500KB — kept small (stored as a data URL, MVP)

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function DriverProfile() {
  const { driver, setDriver } = useDriverAuth()
  const [form, setForm] = useState({
    name: driver?.name || '',
    phone: driver?.phone || '',
    address: driver?.address || '',
    city: driver?.city || '',
    state: driver?.state || 'OK',
    vehicleType: driver?.vehicleType || '',
    vehicleName: driver?.vehicleName || '',
    licenseNumber: driver?.licenseNumber || '',
    vehiclePlate: driver?.vehiclePlate || '',
  })
  const [profilePhoto, setProfilePhoto] = useState(driver?.profilePhoto || '')
  const [status, setStatus] = useState('idle')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setNote('')
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) return setError('Photo must be under 500KB.')
    setError('')
    setProfilePhoto(await fileToDataUrl(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('pending'); setNote(''); setError('')
    try {
      const { driver: updated } = await updateDriverProfile({ ...form, profilePhoto })
      setDriver(updated)
      setNote('Profile saved.')
    } catch (err) {
      setError(err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Could not save changes.')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="mt-1 text-sm text-ink/55">Keep your contact and vehicle details up to date.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <DashboardCard title="Your details">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 text-xl font-semibold text-sky-700 ring-1 ring-line">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="" className="h-full w-full object-cover" />
                ) : (
                  (form.name || 'D').charAt(0).toUpperCase()
                )}
              </span>
              <div>
                <span className="block text-sm font-medium text-ink/80">Profile picture</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="mt-1 text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
              </div>
            </div>
            <Input id="name" name="name" label="Full name" value={form.name} onChange={handleChange} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="phone" name="phone" type="tel" label="Phone" value={form.phone} onChange={handleChange} />
              <div>
                <span className="block text-base font-medium text-ink/80">Email</span>
                <p className="mt-2 rounded-xl border border-line bg-linen px-4 py-3.5 text-base text-ink/60">{driver?.email}</p>
              </div>
            </div>
            <Input id="address" name="address" label="Address" value={form.address} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} />
              <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Vehicle">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select id="vehicleType" name="vehicleType" label="Vehicle type" value={form.vehicleType} onChange={handleChange}>
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </Select>
              <Input id="vehicleName" name="vehicleName" label="Vehicle name" value={form.vehicleName} onChange={handleChange} placeholder="Toyota Corolla" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="licenseNumber" name="licenseNumber" label="License number" value={form.licenseNumber} onChange={handleChange} />
              <Input id="vehiclePlate" name="vehiclePlate" label="License plate" value={form.vehiclePlate} onChange={handleChange} />
            </div>
          </div>
        </DashboardCard>

        {note && <p className="rounded-lg bg-success-soft px-4 py-3 text-sm font-medium text-success-dark">{note}</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={status === 'pending'} className="px-6! py-2.5! text-sm!">
            {status === 'pending' ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
