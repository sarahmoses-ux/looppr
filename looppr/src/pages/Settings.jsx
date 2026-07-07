import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Input from '../components/Input'
import Button from '../components/Button'
import SEO from '../components/SEO'
import { deleteAddress, fetchAddresses } from '../services/addressApi'

function NotificationsSection() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const [checked, setChecked] = useState(user?.emailNotifications ?? true)
  const [status, setStatus] = useState('idle')

  async function handleToggle() {
    const next = !checked
    setChecked(next)
    setStatus('pending')
    try {
      await updateProfile({ emailNotifications: next })
    } catch {
      setChecked(!next)
      showToast('Could not save that change. Please try again.', 'error')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">Notifications</h2>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-ink">Email updates</p>
          <p className="mt-0.5 text-sm text-ink/55">
            Payment request emails when your order is ready to pay for.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={handleToggle}
          disabled={status === 'pending'}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            checked ? 'bg-ink' : 'bg-line'
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <p className="mt-3 text-xs text-ink/40">
        Security emails (sign-in codes, password resets) always send regardless of this setting.
      </p>
    </div>
  )
}

function AddressesSection() {
  const { showToast } = useToast()
  const [addresses, setAddresses] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let cancelled = false
    fetchAddresses()
      .then(({ addresses: list }) => {
        if (!cancelled) setAddresses(list)
      })
      .catch(() => {
        if (!cancelled) setAddresses([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      const { addresses: updated } = await deleteAddress(id)
      setAddresses(updated)
    } catch {
      showToast('Could not remove that address. Please try again.', 'error')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">Saved addresses</h2>
      <p className="mt-1 text-sm text-ink/55">Addresses you've saved from booking a pickup.</p>

      <div className="mt-4 space-y-2">
        {addresses === null ? (
          <div className="h-14 animate-pulse rounded-xl bg-linen-soft" />
        ) : addresses.length === 0 ? (
          <p className="text-sm text-ink/45">No saved addresses yet.</p>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{address.label}</p>
                <p className="text-sm text-ink/55">
                  {address.street}, {address.city}, {address.state} {address.zip}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(address._id)}
                disabled={deletingId === address._id}
                className="shrink-0 text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                {deletingId === address._id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ChangePasswordSection() {
  const { changePassword } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function validate() {
    const next = {}
    if (!form.currentPassword) next.currentPassword = 'Enter your current password.'
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.newPassword)) {
      next.newPassword = 'Must be at least 8 characters and include a letter and a number.'
    }
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = 'Passwords do not match.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStatus('pending')
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password updated.')
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
    <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">Password</h2>
      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-5">
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          label="Current password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="New password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>

        <Button type="submit" variant="primary" disabled={status === 'pending'}>
          {status === 'pending' ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Settings" description="Manage your Looppr account settings." noindex />
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">Account</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Settings
      </h1>

      <div className="mt-8">
        <NotificationsSection />
        <AddressesSection />
        <ChangePasswordSection />

        <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">Session</h2>
          <p className="mt-2 text-sm text-ink/55">Sign out of Looppr on this device.</p>
          <Button onClick={handleLogout} variant="ghost" className="mt-4">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
