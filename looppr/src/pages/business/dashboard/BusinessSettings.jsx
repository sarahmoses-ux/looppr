import { useState } from 'react'
import { useBusinessAuth } from '../../../context/BusinessAuthContext'
import DashboardCard from '../../../components/business/DashboardCard'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { BUSINESS_TYPE_LABELS } from '../../../components/business/businessUi'

export default function BusinessSettings() {
  const { business, updateProfile } = useBusinessAuth()
  const [form, setForm] = useState({
    businessName: business?.businessName || '',
    contactPerson: business?.contactPerson || '',
    phone: business?.phone || '',
    address: business?.address || '',
    city: business?.city || '',
    state: business?.state || 'OK',
    weeklyVolume: business?.weeklyVolume || '',
    registrationNumber: business?.registrationNumber || '',
  })
  const [status, setStatus] = useState('idle')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setNote('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('pending')
    setNote('')
    setError('')
    try {
      await updateProfile(form)
      setNote('Changes saved.')
    } catch (err) {
      setError(err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Could not save changes.')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/55">Manage your business profile and account details.</p>
      </div>

      <DashboardCard title="Business profile">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="businessName" name="businessName" label="Business name" value={form.businessName} onChange={handleChange} />
            <Input id="contactPerson" name="contactPerson" label="Contact person" value={form.contactPerson} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="phone" name="phone" type="tel" label="Phone" value={form.phone} onChange={handleChange} />
            <div>
              <span className="block text-base font-medium text-ink/80">Business type</span>
              <p className="mt-2 rounded-xl border border-line bg-linen px-4 py-3.5 text-base text-ink/60">
                {BUSINESS_TYPE_LABELS[business?.businessType] || '—'}
              </p>
            </div>
          </div>
          <Input id="address" name="address" label="Address" value={form.address} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="city" name="city" label="City" value={form.city} onChange={handleChange} />
            <Input id="state" name="state" label="State" value={form.state} onChange={handleChange} maxLength={2} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input id="weeklyVolume" name="weeklyVolume" label="Weekly volume" value={form.weeklyVolume} onChange={handleChange} placeholder="e.g. 300 lbs/week" />
            <Input id="registrationNumber" name="registrationNumber" label="Registration no." value={form.registrationNumber} onChange={handleChange} />
          </div>

          <div>
            <span className="block text-base font-medium text-ink/80">Email</span>
            <p className="mt-2 rounded-xl border border-line bg-linen px-4 py-3.5 text-base text-ink/60">
              {business?.email} <span className="ml-1 text-xs">(contact support to change)</span>
            </p>
          </div>

          {note && <p className="rounded-lg bg-success-soft px-4 py-3 text-sm font-medium text-success-dark">{note}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={status === 'pending'} className="px-6! py-2.5! text-sm!">
              {status === 'pending' ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DashboardCard>
    </div>
  )
}
