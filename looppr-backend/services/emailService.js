import * as gmailProvider from './email/gmailProvider.js'
import * as resendProvider from './email/resendProvider.js'

// Single switch between providers — every OTP/notification email in the
// app calls sendOtpEmail from here, never a provider module directly, so
// swapping providers is a one-line env change with no other code changes.
//   EMAIL_PROVIDER=gmail   dev default: Gmail SMTP, any recipient, no domain
//   EMAIL_PROVIDER=resend  production: Resend, needs a verified domain (see
//                          services/email/resendProvider.js)
const requestedProvider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase()

// Resend requires RESEND_API_KEY to function at all — every send would just
// fail. Rather than let that surprise a dev/staging environment that hasn't
// set it up, fall back to Gmail SMTP (see gmailProvider.js) if it's
// configured. Warns loudly so a genuinely missing prod key doesn't go
// unnoticed — see tests/emailService.test.js.
const resendConfigured = Boolean(process.env.RESEND_API_KEY)
if (requestedProvider === 'resend' && !resendConfigured) {
  console.warn(
    'EMAIL_PROVIDER=resend but RESEND_API_KEY is not set — falling back to Gmail SMTP. Set RESEND_API_KEY to use Resend.',
  )
}
const PROVIDER = requestedProvider === 'resend' && !resendConfigured ? 'gmail' : requestedProvider
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

// Recipient is fixed (ADMIN_NOTIFICATION_EMAIL, resolved inside each
// provider) — `details` carries applicantType/fullName/email/phone/
// businessName/vehicleDetails/city/state/appliedAt/reviewUrl.
export async function sendAdminApplicationNotification(details) {
  return provider.sendAdminApplicationNotification(details)
}

export async function sendApplicationApprovedEmail(toEmail, name, portalType, loginUrl) {
  return provider.sendApplicationApprovedEmail(toEmail, name, portalType, loginUrl)
}

export async function sendApplicationRejectedEmail(toEmail, name, reason) {
  return provider.sendApplicationRejectedEmail(toEmail, name, reason)
}
