import { usePartnerData } from '../../../context/PartnerDataContext'
import OrderCard from '../../../components/partner/OrderCard'
import RejectReasonModal from '../../../components/partner/RejectReasonModal'
import { usePartnerOrders } from '../../../components/partner/usePartnerOrders'
import { stageOf } from '../../../components/partner/partnerUi'

export default function AcceptedOrders() {
  const { myOrders, status } = usePartnerData()
  const { advance, requestReject, rejectTarget, confirmReject, cancelReject } = usePartnerOrders()

  const accepted = myOrders.filter((o) => stageOf(o) === 'accepted')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Accepted Orders</h1>
        <p className="mt-1 text-sm text-ink/55">Orders you've claimed and are ready to start.</p>
      </div>

      {status === 'loading' ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/60" />
      ) : accepted.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-ink/55">
          No accepted orders. Claim one from Incoming Orders to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {accepted.map((order) => (
            <OrderCard key={order._id} order={order} onAdvance={advance} onReject={requestReject} />
          ))}
        </div>
      )}

      <RejectReasonModal order={rejectTarget} onConfirm={confirmReject} onClose={cancelReject} />
    </div>
  )
}
