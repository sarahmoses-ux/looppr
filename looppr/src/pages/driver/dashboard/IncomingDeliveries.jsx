import { useDriverData } from '../../../context/DriverDataContext'
import DeliveryCard from '../../../components/driver/DeliveryCard'
import RejectReasonModal from '../../../components/driver/RejectReasonModal'
import { useDriverOrders } from '../../../components/driver/useDriverOrders'

export default function IncomingDeliveries() {
  const { incoming, status } = useDriverData()
  const { accept, requestReject, rejectTarget, confirmReject, cancelReject } = useDriverOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Incoming Deliveries</h1>
        <p className="mt-1 text-sm text-ink/55">New requests available to claim. Accept to add them to your route.</p>
      </div>

      {status === 'loading' ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/60" />
      ) : incoming.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <p className="text-sm text-ink/55">No incoming deliveries right now.</p>
          <p className="mt-1 text-xs text-ink/40">Make sure you're set to Online to receive new deliveries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {incoming.map((delivery) => (
            <DeliveryCard key={delivery._id} delivery={delivery} onAccept={accept} onReject={requestReject} />
          ))}
        </div>
      )}

      <RejectReasonModal delivery={rejectTarget} onConfirm={confirmReject} onClose={cancelReject} />
    </div>
  )
}
