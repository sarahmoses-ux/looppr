import { useState } from 'react'
import { useDriverData } from '../../../context/DriverDataContext'
import DeliveryCard from '../../../components/driver/DeliveryCard'
import RejectReasonModal from '../../../components/driver/RejectReasonModal'
import ConfirmWeightModal from '../../../components/driver/ConfirmWeightModal'
import { useDriverOrders } from '../../../components/driver/useDriverOrders'
import { STAGE_META, stageOf } from '../../../components/driver/driverUi'

// Shows every delivery this driver has claimed, at ANY stage (assigned
// through delivered) with the stage-appropriate action button — one list
// rather than splitting "accepted" from "in progress", so there's always a
// page with the right advance button no matter how far along a delivery is.
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: STAGE_META.assigned.label },
  { value: 'pickup_completed', label: STAGE_META.pickup_completed.label },
  { value: 'at_laundromat', label: STAGE_META.at_laundromat.label },
  { value: 'out_for_delivery', label: STAGE_META.out_for_delivery.label },
  { value: 'delivered', label: STAGE_META.delivered.label },
]

export default function MyDeliveries() {
  const { myDeliveries, status } = useDriverData()
  const {
    advance,
    requestReject,
    rejectTarget,
    confirmReject,
    cancelReject,
    requestWeightConfirm,
    weightTarget,
    confirmWeight,
    cancelWeightConfirm,
  } = useDriverOrders()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? myDeliveries : myDeliveries.filter((d) => stageOf(d) === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">My Deliveries</h1>
        <p className="mt-1 text-sm text-ink/55">Every delivery you've claimed. Advance each one as you complete each leg.</p>
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

      {status === 'loading' ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/60" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-ink/55">
          {myDeliveries.length === 0
            ? 'No claimed deliveries yet. Accept one from Incoming Deliveries to get started.'
            : 'No deliveries match this filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((delivery) => (
            <DeliveryCard
              key={delivery._id}
              delivery={delivery}
              onAdvance={advance}
              onReject={requestReject}
              onConfirmWeight={requestWeightConfirm}
            />
          ))}
        </div>
      )}

      <RejectReasonModal delivery={rejectTarget} onConfirm={confirmReject} onClose={cancelReject} />
      <ConfirmWeightModal
        key={weightTarget?._id || 'closed'}
        delivery={weightTarget}
        onConfirm={confirmWeight}
        onClose={cancelWeightConfirm}
      />
    </div>
  )
}
