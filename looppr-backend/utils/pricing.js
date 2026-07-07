// Mirrors the pricing shown on the website (looppr/src/pages/Book.jsx) so
// every order — guest or logged-in — gets the same price computed the same
// way at creation time. No admin pricing step; if the formula changes,
// update both this file and Book.jsx's constants together.
const PRICE_PER_LB = 1.59
const DELIVERY_FEE = 4.99
const FREE_DELIVERY_ORDER_LIMIT = 2

const LOAD_SIZE_LBS = { small: 10, medium: 20, large: 35 }

// `priorOrderCount` — number of previous non-cancelled orders for this
// customer/guest, used for the "free delivery on your first two orders"
// promo. Callers count this however is cheapest for them (clientId lookup
// for accounts, email lookup for guests).
export function computeOrderPrice(loadSize, priorOrderCount = 0) {
  const lbs = LOAD_SIZE_LBS[loadSize] ?? LOAD_SIZE_LBS.medium
  const subtotal = Math.round(lbs * PRICE_PER_LB * 100) / 100
  const freeDelivery = priorOrderCount < FREE_DELIVERY_ORDER_LIMIT
  const deliveryFee = freeDelivery ? 0 : DELIVERY_FEE
  const amount = Math.round((subtotal + deliveryFee) * 100) / 100
  // subtotal/deliveryFee are kept alongside amount so paid orders can show
  // an itemized receipt later (see Orders.jsx) instead of just a total.
  return { amount, currency: 'usd', subtotal, deliveryFee }
}
