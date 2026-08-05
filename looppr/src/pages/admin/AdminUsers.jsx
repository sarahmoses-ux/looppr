import { useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createAdminUser, fetchAdminUsers, updateAdminUserRole } from '../../services/adminApi'

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'ops', label: 'Ops' },
  { value: 'support', label: 'Support' },
]

const ROLE_BADGE = {
  super_admin: 'bg-periwinkle-soft text-periwinkle-text',
  ops: 'bg-sky-50 text-sky-700',
  support: 'bg-amber-50 text-amber-700',
}

const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]))

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function AdminUserRow({ admin, isSelf, onRoleChange }) {
  const { showToast } = useToast()
  const [busy, setBusy] = useState(false)

  async function handleChange(e) {
    const adminRole = e.target.value
    setBusy(true)
    try {
      await onRoleChange(admin.id, adminRole)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update this admin role. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-ink">
          {admin.name}
          {isSelf && <span className="ml-2 text-xs font-normal text-ink/40">(you)</span>}
        </p>
        <p className="mt-0.5 text-sm text-ink/55">
          {admin.email} · {admin.phone}
        </p>
        <p className="mt-0.5 text-xs text-ink/45">Joined {formatDate(admin.createdAt)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isSelf ? (
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${ROLE_BADGE[admin.adminRole] || 'bg-ink/5 text-ink/60'}`}>
            {ROLE_LABEL[admin.adminRole] || admin.adminRole}
          </span>
        ) : (
          <select
            value={admin.adminRole}
            onChange={handleChange}
            disabled={busy}
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-periwinkle disabled:opacity-50"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

function NewAdminForm({ onCreated, onCancel }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', adminRole: 'ops' })
  const [busy, setBusy] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { admin } = await createAdminUser(form)
      onCreated(admin)
      showToast(`${admin.name} added as ${ROLE_LABEL[admin.adminRole]}.`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not create this admin account. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-3 rounded-3xl border border-line bg-white p-6 sm:grid-cols-2 sm:p-10"
    >
      <input
        type="text"
        required
        placeholder="Full name"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        className="rounded-xl border border-line bg-linen px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
      />
      <input
        type="email"
        required
        placeholder="Email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        className="rounded-xl border border-line bg-linen px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
      />
      <input
        type="tel"
        required
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => update('phone', e.target.value)}
        className="rounded-xl border border-line bg-linen px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="Temporary password"
        value={form.password}
        onChange={(e) => update('password', e.target.value)}
        className="rounded-xl border border-line bg-linen px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
      />
      <select
        value={form.adminRole}
        onChange={(e) => update('adminRole', e.target.value)}
        className="rounded-xl border border-line bg-linen px-4 py-2.5 text-sm text-ink outline-none focus:border-periwinkle"
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-periwinkle px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create admin account'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-linen"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminUsers() {
  const { user } = useAuth()
  const [admins, setAdmins] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAdminUsers()
      .then(({ admins: list }) => {
        if (!cancelled) setAdmins(list)
      })
      .catch(() => {
        if (!cancelled) setAdmins([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleCreated(admin) {
    setAdmins((list) => [admin, ...(list || [])])
    setShowForm(false)
  }

  async function handleRoleChange(id, adminRole) {
    const { admin } = await updateAdminUserRole(id, adminRole)
    setAdmins((list) => list.map((a) => (a.id === admin.id ? admin : a)))
  }

  return (
    <>
      <SEO title="Admin Users" description="Manage admin accounts and access levels." noindex />

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/55">
          Super Admin sees everything. Ops handles bookings, orders, applications, and CRM. Support handles
          Customer Care with read-only orders and CRM.
        </p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-full bg-periwinkle px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Add admin
          </button>
        )}
      </div>

      {showForm && <NewAdminForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      <div className="mt-6 rounded-3xl border border-line bg-white p-6 sm:p-10">
        {admins === null ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
            <div className="h-16 animate-pulse rounded-2xl bg-linen-soft" />
          </div>
        ) : admins.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">No admin accounts yet.</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <AdminUserRow key={admin.id} admin={admin} isSelf={admin.id === user?.id} onRoleChange={handleRoleChange} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
