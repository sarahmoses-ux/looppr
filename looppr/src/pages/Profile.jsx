import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Input from '../components/Input'
import Button from '../components/Button'
import SEO from '../components/SEO'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^\+?[0-9\s()-]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      await updateProfile({ name: form.name, phone: form.phone })
      showToast('Profile updated.')
    } catch (err) {
      showToast(
        err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Something went wrong. Please try again.',
        'error',
      )
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Your profile" description="Manage your Looppr account details." noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Account</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Your profile
      </h1>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <label className="block text-base font-medium text-ink/80">Email</label>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              user?.isVerified ? 'bg-success-soft text-success-dark' : 'bg-ink/5 text-ink/50'
            }`}
          >
            {user?.isVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        <p className="mt-2 rounded-xl border border-line bg-linen-soft px-4 py-3.5 text-base text-ink/60">
          {user?.email}
        </p>
        <p className="mt-1.5 text-xs text-ink/45">
          Your email can't be changed here yet — contact support if you need it updated.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="name"
              name="name"
              label="Full name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              id="phone"
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

          <Button type="submit" variant="primary" disabled={status === 'pending'}>
            {status === 'pending' ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
