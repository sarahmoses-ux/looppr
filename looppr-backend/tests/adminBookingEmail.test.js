import { describe, expect, it, vi } from 'vitest'
import { adminBookingMessage } from '../services/email/adminBookingNotificationTemplate.js'

const { sendMail, send } = vi.hoisted(() => ({
  sendMail: vi.fn(async () => ({})), send: vi.fn(async () => ({ error: null })),
}))
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }))
vi.mock('resend', () => ({ Resend: class { emails = { send } } }))
import * as gmail from '../services/email/gmailProvider.js'
import * as resend from '../services/email/resendProvider.js'

const details = { orderId: 'order123', name: '<script>client</script>', preferredDate: '2027-06-01', notes: 'Ring & wait' }

describe('admin booking email delivery', () => {
  for (const [name, provider, sender] of [['gmail', gmail, sendMail], ['resend', resend, send]]) {
    it(`sends the booking to both super admins with ${name}`, async () => {
      await provider.sendAdminBookingNotification(details)
      expect(sender).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
        to: ['loopprlaundry@gmail.com', 'sarahmoses1102@gmail.com'],
        subject: 'New Looppr booking - order123',
      }))
    })
  }
  it('escapes client-supplied HTML', () => {
    const message = adminBookingMessage(details)
    expect(message.html).toContain('&lt;script&gt;client&lt;/script&gt;')
    expect(message.html).toContain('Ring &amp; wait')
    expect(message.html).not.toContain('<script>')
  })
  it('reports a Resend delivery failure', async () => {
    send.mockResolvedValueOnce({ error: { message: 'Delivery rejected' } })
    await expect(resend.sendAdminBookingNotification(details)).rejects.toThrow('Delivery rejected')
  })
})
