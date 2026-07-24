import { beforeEach, describe, expect, it, vi } from 'vitest'

// tests/setup.js globally mocks emailService.js (every other test file wants
// that — no real network calls). This file is the one place that needs the
// REAL implementation, to verify its provider-selection logic itself.
vi.unmock('../services/emailService.js')

const gmailSendOtpEmail = vi.fn(async () => {})
const resendSendOtpEmail = vi.fn(async () => {})

vi.mock('../services/email/gmailProvider.js', () => ({
  sendOtpEmail: gmailSendOtpEmail,
  sendPaymentRequestEmail: vi.fn(async () => {}),
  sendPasswordResetEmail: vi.fn(async () => {}),
  sendWaitlistConfirmationEmail: vi.fn(async () => {}),
  sendContactConfirmationEmail: vi.fn(async () => {}),
  sendPartnerLeadEmail: vi.fn(async () => {}),
}))

vi.mock('../services/email/resendProvider.js', () => ({
  sendOtpEmail: resendSendOtpEmail,
  sendPaymentRequestEmail: vi.fn(async () => {}),
  sendPasswordResetEmail: vi.fn(async () => {}),
  sendWaitlistConfirmationEmail: vi.fn(async () => {}),
  sendContactConfirmationEmail: vi.fn(async () => {}),
  sendPartnerLeadEmail: vi.fn(async () => {}),
}))

describe('emailService', () => {
  beforeEach(() => {
    vi.resetModules()
    gmailSendOtpEmail.mockReset()
    resendSendOtpEmail.mockReset()
    delete process.env.EMAIL_PROVIDER
    delete process.env.RESEND_API_KEY
    delete process.env.GMAIL_USER
    delete process.env.GMAIL_APP_PASSWORD
  })

  it('falls back to Gmail when Resend is selected but no API key is configured', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.GMAIL_USER = 'looppr@example.com'
    process.env.GMAIL_APP_PASSWORD = 'app-password'

    const { sendOtpEmail } = await import('../services/emailService.js')
    await sendOtpEmail('user@example.com', 'Test User', '123456')

    expect(gmailSendOtpEmail).toHaveBeenCalledTimes(1)
    expect(resendSendOtpEmail).not.toHaveBeenCalled()
  })
})
