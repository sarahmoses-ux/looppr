const WINDOWS = { morning: 'Morning · 8am – 11am', afternoon: 'Afternoon · 12pm – 3pm', evening: 'Evening · 4pm – 7pm' }
const FOLDS = { standard: 'Standard fold', konmari: 'KonMari fold', hangers: 'On hangers' }
const DETERGENTS = { freeAndClear: 'Free & Clear (unscented)', freshScent: 'Fresh Scent', eco: 'Eco-Friendly' }
const TEMPERATURES = { cold: 'Cold', warm: 'Warm', hot: 'Hot' }

function dateLabel(value, dateOnly = false) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return date.toLocaleString('en-US', dateOnly
    ? { dateStyle: 'full', timeZone: 'UTC' }
    : { dateStyle: 'medium', timeStyle: 'short' })
}

function Field({ label, children }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-3 py-2">
    <dt className="text-ink/55">{label}</dt>
    <dd className="whitespace-pre-wrap break-words font-medium text-ink">{children ?? 'Not provided'}</dd>
  </div>
}

function Section({ title, children }) {
  return <section className="min-w-0 rounded-xl bg-linen-soft p-4">
    <h3 className="font-semibold text-ink">{title}</h3>
    <dl className="mt-2 divide-y divide-line text-sm">{children}</dl>
  </section>
}

function AddressFields({ address }) {
  return <>
    <Field label="Street address">{address?.street || 'Not provided'}</Field>
    <Field label="Apartment / unit">{address?.apartment || 'Not provided'}</Field>
    <Field label="City">{address?.city || 'Not provided'}</Field>
    <Field label="State">{address?.state || 'Not provided'}</Field>
    <Field label="ZIP code">{address?.zip || 'Not provided'}</Field>
  </>
}

export default function AdminOrderDetails({ pickup }) {
  const business = pickup.source === 'business' ? pickup.businessId : null
  const contact = business || pickup.clientId || pickup.guest || {}
  const sameAddress = !pickup.deliveryAddress?.street
  const pricing = pickup.pricing || {}
  const money = value => value == null ? 'Not recorded' : new Intl.NumberFormat('en-US', {
    style: 'currency', currency: (pricing.currency || 'usd').toUpperCase(),
  }).format(value)

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Section title="Client & order">
      <Field label="Order ID">{pickup._id}</Field>
      <Field label="Booking type">{{ account: 'Account', guest: 'Guest', business: 'Business' }[pickup.source] || 'Account'}</Field>
      {business && <Field label="Business name">{business.businessName}</Field>}
      <Field label="Contact name">{contact.name || contact.contactPerson || 'Not provided'}</Field>
      <Field label="Email">{contact.email || 'Not provided'}</Field>
      <Field label="Phone">{contact.phone || 'Not provided'}</Field>
      <Field label="Booked at">{dateLabel(pickup.createdAt)}</Field>
      <Field label="Last updated">{dateLabel(pickup.updatedAt)}</Field>
    </Section>
    <Section title="Pickup details">
      <Field label="Pickup date">{dateLabel(pickup.preferredDate, true)}</Field>
      <Field label="Pickup window">{WINDOWS[pickup.window] || pickup.window || 'Not provided'}</Field>
      <AddressFields address={pickup.address} />
    </Section>
    <Section title="Delivery details">
      <Field label="Delivery window">{WINDOWS[pickup.deliveryWindow] || pickup.deliveryWindow || 'Not provided'}</Field>
      <Field label="Address choice">{sameAddress ? 'Same as pickup address' : 'Different delivery address'}</Field>
      <AddressFields address={sameAddress ? pickup.address : pickup.deliveryAddress} />
    </Section>
    <Section title="Laundry preferences">
      <Field label="Load category">{{ small: 'Small (10–15 lbs)', medium: 'Medium (16–25 lbs)', large: 'Large (26–35 lbs)' }[pickup.loadSize] || pickup.loadSize}</Field>
      <Field label="Booked weight">{pickup.weightLbs != null ? `${pickup.weightLbs} lbs` : 'Not recorded'}</Field>
      <Field label="Confirmed weight">{pickup.actualWeightLbs != null ? `${pickup.actualWeightLbs} lbs` : 'Not yet confirmed'}</Field>
      <Field label="Weight confirmed at">{dateLabel(pickup.weightConfirmedAt)}</Field>
      <Field label="Fold style">{FOLDS[pickup.foldStyle] || pickup.foldStyle || 'Not recorded'}</Field>
      <Field label="Detergent">{DETERGENTS[pickup.detergent] || pickup.detergent || 'Not recorded'}</Field>
      <Field label="Water temperature">{TEMPERATURES[pickup.waterTemperature] || pickup.waterTemperature || 'Not recorded'}</Field>
      <Field label="Shoe laundry">{pickup.shoeLaundry?.pairs ? `${pickup.shoeLaundry.pairs} pairs · Clean & Polish` : 'None'}</Field>
    </Section>
    <Section title="Pricing & payment">
      <Field label="Wash & fold">{money(pricing.subtotal)}</Field>
      <Field label="Shoe laundry">{money(pricing.shoeLaundrySubtotal)}</Field>
      <Field label="Delivery fee">{money(pricing.deliveryFee)}</Field>
      <Field label="Order total">{money(pricing.amount)}</Field>
      <Field label="Payment status">{pickup.paymentStatus || 'Not recorded'}</Field>
      <Field label="Paid at">{dateLabel(pickup.paidAt)}</Field>
    </Section>
    <Section title="Special instructions">
      <Field label="Client notes">{pickup.notes?.trim() ? pickup.notes : 'No special instructions'}</Field>
    </Section>
  </div>
}
