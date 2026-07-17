import { useState } from 'react'
import { usePartnerAuth } from '../../../context/PartnerAuthContext'
import DashboardCard from '../../../components/business/DashboardCard'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { SERVICE_OPTIONS } from '../../../components/partner/partnerUi'
import { updatePartnerProfile } from '../../../services/partnerDashboardApi'

const MAX_LOGO_BYTES = 500 * 1024

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function BusinessProfile() {
  const { partner, setPartner } = usePartnerAuth()
  const [form, setForm] = useState({
    businessName: partner?.businessName || '',
    ownerName: partner?.ownerName || '',
    phone: partner?.phone || '',
    address: partner?.address || '',
    city: partner?.city || '',
    state: partner?.state || 'OK',
    description: partner?.description || '',
    yearsInBusiness: partner?.yearsInBusiness ?? '',
    employeeCount: partner?.employeeCount ?? '',
    maxDailyCapacity: partner?.maxDailyCapacity ?? '',
    pickupAvailable: partner?.pickupAvailable ?? true,
    deliveryAvailable: partner?.deliveryAvailable ?? true,
  })
  const [services, setServices] = useState(partner?.servicesOffered || [])
  const [logo, setLogo] = useState(partner?.logo || '')
  const [status, setStatus] = useState('idle')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setNote('')
  }

  function toggleService(v) {
    setServices((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))
  }

  async function handleLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_LOGO_BYTES) return setError('Logo must be under 500KB.')
    setError('')
    setLogo(await fileToDataUrl(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('pending'); setNote(''); setError('')
    try {
      const { partner: updated } = await updatePartnerProfile({
        ...form,
        yearsInBusiness: form.yearsInBusiness === '' ? undefined : Number(form.yearsInBusiness),
        employeeCount: form.employeeCount === '' ? undefined : Number(form.employeeCount),
        maxDailyCapacity: form.maxDailyCapacity === '' ? undefined : Number(form.maxDailyCapacity),
        servicesOffered: services,
        logo,
      })
      setPartner(updated)
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
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Business Profile</h1>
        <p className="mt-1 text-sm text-ink/55">Keep your shop details, services and capacity up to date.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <DashboardCard title="Shop details">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-50 text-xl font-semibold text-sky-700 ring-1 ring-line">
                {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : (form.businessName || 'P').charAt(0).toUpperCase()}
              </span>
              <div>
                <span className="block text-sm font-medium text-ink/80">Business logo</span>
                <input type="file" accept="image/*" onChange={handleLogo} className="mt-1 text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="businessName" name="businessName" label="Business name" value={form.businessName} onChange={handleChange} />
              <Input id="ownerName" name="ownerName" label="Owner name" value={form.ownerName} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input id="phone" name="phone" type="tel" label="Phone" value={form.phone} onChange={handleChange} />
              <div>
                <span className="block text-base font-medium text-ink/80">Email</span>
                <p className="mt-2 rounded-xl border border-line bg-linen px-4 py-3.5 text-base text-ink/60">{partner?.email}</p>
              </div>
            </div>
            <Input id="address" name="address" label="Address" value={form.address} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} />
              <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
            </div>
            <div>
              <label htmlFor="description" className="block text-base font-medium text-ink/80">Description</label>
              <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sky-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Capacity & services">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input id="maxDailyCapacity" name="maxDailyCapacity" type="number" min="0" label="Max daily capacity" value={form.maxDailyCapacity} onChange={handleChange} />
              <Input id="yearsInBusiness" name="yearsInBusiness" type="number" min="0" label="Years in business" value={form.yearsInBusiness} onChange={handleChange} />
              <Input id="employeeCount" name="employeeCount" type="number" min="0" label="Employees" value={form.employeeCount} onChange={handleChange} />
            </div>
            <div>
              <span className="block text-sm font-medium text-ink/80">Services offered</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SERVICE_OPTIONS.map((s) => (
                  <label key={s.value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${services.includes(s.value) ? 'border-sky-300 bg-sky-50 text-sky-800' : 'border-line text-ink/70 hover:border-sky-200'}`}>
                    <input type="checkbox" checked={services.includes(s.value)} onChange={() => toggleService(s.value)} className="h-4 w-4 rounded border-line accent-periwinkle" />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={form.pickupAvailable} onChange={(e) => setForm((f) => ({ ...f, pickupAvailable: e.target.checked }))} className="h-4 w-4 rounded border-line accent-periwinkle" />
                Pickup service available
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" checked={form.deliveryAvailable} onChange={(e) => setForm((f) => ({ ...f, deliveryAvailable: e.target.checked }))} className="h-4 w-4 rounded border-line accent-periwinkle" />
                Delivery service available
              </label>
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
