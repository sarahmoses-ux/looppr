import { useBusinessData } from '../../../context/BusinessDataContext'
import DashboardCard from '../../../components/business/DashboardCard'
import { formatCurrency, formatDate, orderRef } from '../../../components/business/businessUi'

export default function Invoices() {
  const { pickups, status } = useBusinessData()

  const paid = pickups.filter((p) => p.paymentStatus === 'paid')
  const pending = pickups.filter((p) => p.paymentStatus === 'pending' || p.paymentStatus === 'unpaid')
  const totalPaid = paid.reduce((sum, p) => sum + (p.pricing?.amount || 0), 0)

  const rows = [...pending, ...paid]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Invoices</h1>
        <p className="mt-1 text-sm text-ink/55">Billing history for your account. One consolidated statement, always.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-medium text-ink/55">Total paid</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-medium text-ink/55">Paid invoices</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{paid.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-medium text-ink/55">Awaiting payment</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{pending.length}</p>
        </div>
      </div>

      <DashboardCard title="All invoices">
        {status === 'loading' ? (
          <div className="h-32 animate-pulse rounded-xl bg-linen" />
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/45">No invoices yet. They'll appear here as orders are billed.</p>
        ) : (
          <div className="-mx-5 -my-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-5 py-3 font-semibold">Invoice</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p._id} className="transition-colors hover:bg-linen/60">
                    <td className="px-5 py-3 font-semibold text-ink">{orderRef(p._id)}</td>
                    <td className="px-5 py-3 text-ink/70">{formatDate(p.paidAt || p.createdAt)}</td>
                    <td className="px-5 py-3">
                      {p.paymentStatus === 'paid' ? (
                        <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-dark">Paid</span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {p.paymentStatus === 'pending' ? 'Pending' : 'Unpaid'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink/80">{formatCurrency(p.pricing?.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
