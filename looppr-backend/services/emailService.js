import * as gmailProvider from './email/gmailProvider.js'
import * as resendProvider from './email/resendProvider.js'

// Single switch between providers — every OTP/notification email in the
// app calls sendOtpEmail from here, never a provider module directly, so
// swapping providers is a one-line env change with no other code changes.
//   EMAIL_PROVIDER=gmail   dev default: Gmail SMTP, any recipient, no domain
//   EMAIL_PROVIDER=resend  production: Resend, needs a verified domain (see
//                          services/email/resendProvider.js)
const PROVIDER = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase()
const provider = PROVIDER === 'gmail' ? gmailProvider : resendProvider

export async function sendOtpEmail(toEmail, name, code) {
  return provider.sendOtpEmail(toEmail, name, code)
}

export async function sendPaymentRequestEmail(toEmail, name, amount, currency, link) {
  return provider.sendPaymentRequestEmail(toEmail, name, amount, currency, link)
}

export async function sendWaitlistConfirmationEmail(toEmail) {
  return provider.sendWaitlistConfirmationEmail(toEmail)
}

export async function sendPasswordResetEmail(toEmail, name, code) {
  return provider.sendPasswordResetEmail(toEmail, name, code)
}

export async function sendContactConfirmationEmail(toEmail, name) {
  return provider.sendContactConfirmationEmail(toEmail, name)
}

export async function sendPartnerLeadEmail(toEmail, type, name) {
  return provider.sendPartnerLeadEmail(toEmail, type, name)
}
