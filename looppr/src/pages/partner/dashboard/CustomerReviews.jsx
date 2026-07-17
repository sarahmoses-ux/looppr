import { usePartnerAuth } from '../../../context/PartnerAuthContext'
import DashboardCard from '../../../components/business/DashboardCard'

export default function CustomerReviews() {
  const { partner } = usePartnerAuth()
  const rating = partner?.averageRating

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Customer Reviews</h1>
        <p className="mt-1 text-sm text-ink/55">Feedback from customers you've served.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Your rating">
          <div className="flex flex-col items-center py-4">
            <p className="font-display text-5xl font-bold text-ink">{rating != null ? rating.toFixed(1) : '—'}</p>
            <div className="mt-2 text-lg tracking-[2px] text-amber-400">
              {'★★★★★'.slice(0, Math.round(rating || 0)) || '☆'}
            </div>
            <p className="mt-2 text-xs text-ink/45">{rating != null ? 'Average customer rating' : 'No ratings yet'}</p>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent reviews" className="lg:col-span-2">
          <p className="py-10 text-center text-sm text-ink/45">
            No reviews yet. Once customers rate their completed orders, their feedback will appear here.
          </p>
        </DashboardCard>
      </div>
    </div>
  )
}
