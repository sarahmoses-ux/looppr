export const adminBookingRecipients = ['loopprlaundry@gmail.com', 'sarahmoses1102@gmail.com']

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
}

export function adminBookingMessage(details) {
  const address = details.address || {}
  const rows = [
    ['Order ID', details.orderId], ['Booking type', details.source],
    ['Client', details.name], ['Business', details.businessName],
    ['Email', details.email], ['Phone', details.phone],
    ['Pickup address', [address.street, address.apartment, address.city, address.state, address.zip].filter(Boolean).join(', ')],
    ['Pickup date', new Date(details.preferredDate).toISOString().slice(0, 10)],
    ['Pickup window', details.window], ['Load size', details.loadSize], ['Weight (lbs)', details.weightLbs],
    ['Delivery window', details.deliveryWindow], ['Notes', details.notes],
  ].filter(([, value]) => value)
  return {
    subject: `New Looppr booking - ${details.orderId}`,
    text: 'A client has booked Looppr.\n\n' + rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
    html: '<div style="font-family:sans-serif;color:#1E1B4B"><h1>New client booking</h1><p>A client has booked Looppr.</p><table>'
      + rows.map(([label, value]) => `<tr><th style="text-align:left;padding:8px">${label}</th><td style="padding:8px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('')
      + '</table></div>',
  }
}
