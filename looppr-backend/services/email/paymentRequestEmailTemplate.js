function formatMoney(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount)
}

export function paymentRequestEmailSubject(amount, currency) {
  return `Payment requested — ${formatMoney(amount, currency)} for your Looppr order`
}

export function paymentRequestEmailHtml(name, amount, currency, link) {
  const price = formatMoney(amount, currency)
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">Hi ${name}, your payment is ready</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
        We've reviewed your laundry pickup request — here's your total:
      </p>
      <div style="font-family: monospace; font-size: 28px; font-weight: 700; color: #1E1B4B; background: #F0EFFF; border-radius: 12px; padding: 16px 24px; text-align: center; margin: 0 0 24px;">
        ${price}
      </div>
      <p style="text-align: center; margin: 0 0 24px;">
        <a href="${link}" style="display: inline-block; background: #1E1B4B; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 999px;">
          Complete payment
        </a>
      </p>
      <p style="font-size: 12px; color: #999; margin: 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `
}
