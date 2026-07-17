import { usePartnerData } from '../../../context/PartnerDataContext'
import OrderCard from '../../../components/partner/OrderCard'
import RejectReasonModal from '../../../components/partner/RejectReasonModal'
import { usePartnerOrders } from '../../../components/partner/usePartnerOrders'

export default function IncomingOrders() {
  const { incoming, status } = usePartnerData()
  const { accept, requestReject, rejectTarget, confirmReject, cancelReject } = usePartnerOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Incoming Orders</h1>
        <p className="mt-1 text-sm text-ink/55">New requests available to claim. Accept to add them to your jobs.</p>
      </div>

      {status === 'loading' ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/60" />
      ) : incoming.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <p className="text-sm text-ink/55">No incoming orders right now.</p>
          <p className="mt-1 text-xs text-ink/40">Make sure you're set to Online to receive new orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {incoming.map((order) => (
            <OrderCard key={order._id} order={order} onAccept={accept} onReject={requestReject} />
          ))}
        </div>
      )}

      <RejectReasonModal order={rejectTarget} onConfirm={confirmReject} onClose={cancelReject} />
    </div>
  )
}
