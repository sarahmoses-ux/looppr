import StatusBadge from './StatusBadge'
import { formatCurrency, formatDate, LOAD_SIZE_LABELS, orderRef, WINDOW_LABELS } from './businessUi'

// Shared table used by Laundry Requests and Active Orders. `emptyLabel`
// tailors the empty state per section.
export default function OrdersTable({ pickups, emptyLabel = 'No orders to show.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/45">
            <th className="px-4 py-3 font-semibold">Order</th>
            <th className="px-4 py-3 font-semibold">Pickup</th>
            <th className="px-4 py-3 font-semibold">Load</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {pickups.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink/45">{emptyLabel}</td>
            </tr>
          ) : (
            pickups.map((p) => (
              <tr key={p._id} className="transition-colors hover:bg-linen/60">
                <td className="px-4 py-3 font-semibold text-ink">{orderRef(p._id)}</td>
                <td className="px-4 py-3 text-ink/70">
                  <div>{formatDate(p.preferredDate)}</div>
                  <div className="text-xs text-ink/45">{WINDOW_LABELS[p.window]}</div>
                </td>
                <td className="px-4 py-3 text-ink/70">{LOAD_SIZE_LABELS[p.loadSize] || p.loadSize}</td>
                <td className="px-4 py-3 text-ink/70">{p.address?.city}, {p.address?.state}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-right font-medium text-ink/80">{formatCurrency(p.pricing?.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
