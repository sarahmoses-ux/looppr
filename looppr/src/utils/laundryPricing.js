export const PRICE_PER_LB = 1.59

export function weightError(value) {
  const weight = Number(value)
  return value === '' || !Number.isFinite(weight) || weight < 10 || weight > 500
    ? 'Enter the exact weight between 10 and 500 lbs.'
    : ''
}

export function laundrySubtotal(value) {
  const weight = Number(value)
  return Number.isFinite(weight) && weight > 0 ? Math.round(weight * PRICE_PER_LB * 100) / 100 : 0
}
