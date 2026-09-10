import Input from './Input'
import { laundrySubtotal } from '../utils/laundryPricing'

export default function LaundryWeightInput({ value, onChange, error }) {
  return (
    <div className="space-y-3">
      <Input
        id="weightLbs" name="weightLbs" type="number" label="Exact laundry weight (lbs)"
        min="10" max="500" step="any" inputMode="decimal" required
        value={value} onChange={onChange} error={error} placeholder="e.g. 10"
      />
      <p className="text-sm text-ink/60">Enter the pounds for your selected load. Minimum 10 lbs.</p>
      <div className="flex items-center justify-between rounded-xl bg-linen px-4 py-3" aria-live="polite" aria-atomic="true">
        <span className="text-sm text-ink/70">Wash &amp; fold at $1.59/lb</span>
        <output htmlFor="weightLbs" aria-label="Laundry price" className="font-semibold text-ink">
          ${laundrySubtotal(value).toFixed(2)}
        </output>
      </div>
      <p className="text-xs text-ink/50">Delivery and shoe laundry are calculated separately.</p>
    </div>
  )
}
