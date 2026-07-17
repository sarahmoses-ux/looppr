import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useBusinessData } from '../../../context/BusinessDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import OrdersTable from '../../../components/business/OrdersTable'
import Button from '../../../components/Button'
import { ALL_STATUSES } from '../../../constants/orderStatus'

const FILTERS = [{ value: 'all', label: 'All' }, ...ALL_STATUSES]

export default function LaundryRequests() {
  const { pickups, status } = useBusinessData()
  const { openPickup } = useOutletContext()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? pickups : pickups.filter((p) => p.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Laundry Requests</h1>
          <p className="mt-1 text-sm text-ink/55">Every pickup you've requested, across all statuses.</p>
        </div>
        <Button onClick={openPickup} variant="primary" className="px-5! py-2.5! text-sm!">Request pickup</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-sky-500 text-white' : 'bg-white text-ink/60 ring-1 ring-inset ring-line hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DashboardCard>
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : (
          <OrdersTable pickups={filtered} emptyLabel="No requests match this filter." />
        )}
      </DashboardCard>
    </div>
  )
}
