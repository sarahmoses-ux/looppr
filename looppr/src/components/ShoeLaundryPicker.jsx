const SHOE_LAUNDRY_PRICE_PER_PAIR = 30

function formatMoney(n) {
  return `$${n.toFixed(2)}`
}

function SneakerIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
      <path
        d="M9 29.5c5.8.8 10.3-.7 13.5-4.5l2.3-2.7c.9-1.1 2.5-1.3 3.7-.5l9.5 6.5c2.1 1.4 3.4 3.8 3.4 6.4v.8H8.5a3.5 3.5 0 0 1-3.5-3.5v-3.2c0-1 .9-1.7 1.9-1.5l2.1.2Z"
        className="fill-periwinkle-soft stroke-periwinkle-text"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 27.8 21 35.5M23.5 24.8l5 4M27.5 22.8l5 4M31.5 24.2l-2.4 3.2M36.5 27.6l-2.2 3"
        className="stroke-periwinkle-text"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M5.5 35.5h35.9" className="stroke-ink/30" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ShoeLaundryPicker({ pairs, onChange, error }) {
  const selected = pairs > 0
  const total = pairs * SHOE_LAUNDRY_PRICE_PER_PAIR

  function handleToggle() {
    onChange(selected ? 0 : 1)
  }

  function handlePairsChange(e) {
    const next = Number.parseInt(e.target.value, 10)
    onChange(Number.isNaN(next) ? 1 : Math.max(1, next))
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-5 transition-colors ${
        selected ? 'border-periwinkle shadow-[0_16px_36px_-24px_rgba(124,115,230,0.7)]' : 'border-line'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linen-soft text-periwinkle-text">
            <SneakerIcon />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-periwinkle">
              Shoe Laundry
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink">
              Clean &amp; Polish Your Shoes
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
              Give your sneakers and shoes a fresh look. Our shoe care service cleans, refreshes, and polishes
              your footwear so it looks clean and ready to wear again.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="font-display text-2xl font-semibold text-ink">
            {formatMoney(SHOE_LAUNDRY_PRICE_PER_PAIR)}
          </p>
          <p className="text-xs font-medium text-ink/45">per pair</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors sm:w-auto ${
            selected
              ? 'bg-periwinkle-soft text-periwinkle-text hover:bg-periwinkle-muted/60'
              : 'bg-ink text-white hover:bg-ink/90'
          }`}
        >
          {selected ? 'Remove Shoe Service' : 'Add Shoe Service'}
        </button>

        {selected && (
          <div className="grid gap-2 sm:min-w-44">
            <label htmlFor="shoeLaundryPairs" className="text-sm font-medium text-ink/70">
              Pairs to clean
            </label>
            <input
              id="shoeLaundryPairs"
              name="shoeLaundryPairs"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={pairs}
              onChange={handlePairsChange}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors focus:border-periwinkle"
            />
            <p className="text-xs font-semibold text-periwinkle-text">
              Shoe total: {formatMoney(total)}
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  )
}

export { SHOE_LAUNDRY_PRICE_PER_PAIR }
