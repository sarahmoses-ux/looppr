import { usePartnerData } from '../../../context/PartnerDataContext'
import StatCard from '../../../components/business/StatCard'
import DashboardCard from '../../../components/business/DashboardCard'
import { formatCurrency, formatDate, orderRef } from '../../../components/partner/partnerUi'

export default function PartnerEarnings() {
  const { earnings, myOrders, status } = usePartnerData()

  if (status === 'loading') return <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/60" />
  const e = earnings || {}
  const paidOrders = myOrders.filter((o) => o.paymentStatus === 'paid')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Earnings</h1>
        <p className="mt-1 text-sm text-ink/55">Revenue from orders you've fulfilled.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Revenue" value={formatCurrency(e.totalRevenue)} accent="success" />
        <StatCard label="Weekly Revenue" value={formatCurrency(e.weeklyRevenue)} accent="sky" />
        <StatCard label="Monthly Revenue" value={formatCurrency(e.monthlyRevenue)} accent="violet" />
        <StatCard label="Pending Payments" value={formatCurrency(e.pendingPayments)} accent="amber" />
        <StatCard label="Completed Payouts" value={formatCurrency(e.completedPayouts)} accent="success" />
      </div>

      <DashboardCard title="Invoices" subtitle="Paid orders you've fulfilled">
        {paidOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/45">No paid invoices yet.</p>
        ) : (
          <div className="-mx-5 -my-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-5 py-3 font-semibold">Invoice</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-right font-semibold">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paidOrders.map((o) => (
                  <tr key={o._id} className="transition-colors hover:bg-linen/60">
                    <td className="px-5 py-3 font-semibold text-ink">{orderRef(o._id)}</td>
                    <td className="px-5 py-3 text-ink/70">{o.customerName}</td>
                    <td className="px-5 py-3 text-ink/70">{formatDate(o.paidAt || o.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink/80">{formatCurrency(o.pricing?.amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs font-medium text-ink/35" title="Downloadable invoices coming soon">PDF —</span>
                    </td>
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
