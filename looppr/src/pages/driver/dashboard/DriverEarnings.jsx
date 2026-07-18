import { useDriverData } from '../../../context/DriverDataContext'
import StatCard from '../../../components/business/StatCard'
import DashboardCard from '../../../components/business/DashboardCard'
import { formatCurrency, formatDate, orderRef } from '../../../components/driver/driverUi'

export default function DriverEarnings() {
  const { earnings, myDeliveries, status } = useDriverData()

  if (status === 'loading') return <div className="h-64 animate-pulse rounded-2xl border border-line bg-white/60" />
  const e = earnings || {}
  const paidDeliveries = myDeliveries.filter((d) => d.paymentStatus === 'paid')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Earnings</h1>
        <p className="mt-1 text-sm text-ink/55">Delivery fee revenue from deliveries you've fulfilled.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Earnings" value={formatCurrency(e.totalEarnings)} accent="success" />
        <StatCard label="Weekly Earnings" value={formatCurrency(e.weeklyEarnings)} accent="sky" />
        <StatCard label="Monthly Earnings" value={formatCurrency(e.monthlyEarnings)} accent="violet" />
        <StatCard label="Pending Payments" value={formatCurrency(e.pendingPayments)} accent="amber" />
        <StatCard label="Completed Payouts" value={formatCurrency(e.completedPayouts)} accent="success" />
      </div>

      <DashboardCard title="Payout history" subtitle="Paid deliveries you've fulfilled">
        {paidDeliveries.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/45">No paid deliveries yet.</p>
        ) : (
          <div className="-mx-5 -my-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-5 py-3 font-semibold">Delivery</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Delivery fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {paidDeliveries.map((d) => (
                  <tr key={d._id} className="transition-colors hover:bg-linen/60">
                    <td className="px-5 py-3 font-semibold text-ink">{orderRef(d._id)}</td>
                    <td className="px-5 py-3 text-ink/70">{d.customerName}</td>
                    <td className="px-5 py-3 text-ink/70">{formatDate(d.paidAt || d.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink/80">{formatCurrency(d.pricing?.deliveryFee)}</td>
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
