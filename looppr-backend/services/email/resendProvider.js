import { Resend } from 'resend'
import { contactConfirmationEmailHtml, contactConfirmationEmailSubject } from './contactConfirmationEmailTemplate.js'
import { otpEmailHtml, otpEmailSubject } from './otpEmailTemplate.js'
import { partnerLeadEmailHtml, partnerLeadEmailSubject } from './partnerLeadEmailTemplate.js'
import { paymentRequestEmailHtml, paymentRequestEmailSubject } from './paymentRequestEmailTemplate.js'
import { passwordResetEmailHtml, passwordResetEmailSubject } from './passwordResetEmailTemplate.js'
import { waitlistEmailHtml, waitlistEmailSubject } from './waitlistEmailTemplate.js'

let client = null

function getClient() {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export async function sendOtpEmail(toEmail, name, code) {
  const from = process.env.OTP_FROM_EMAIL || 'Looppr <onboarding@resend.dev>'

  // The Resend SDK does NOT throw on API-level failures (e.g. the sandbox
  // sender's "can only send to your own address" restriction) — it resolves
  // with { data: null, error }. Without this check, a failed send looked
  // identical to a successful one: no exception, so callers (login/register)
  // would issue a challengeToken/session as if the OTP had gone out.
  const { error } = await getClient().emails.send({
    from,
    to: toEmail,
    subject: otpEmailSubject(code),
    html: otpEmailHtml(name, code),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

export async function sendPaymentRequestEmail(toEmail, name, amount, currency, link) {
  const from = process.env.OTP_FROM_EMAIL || 'Looppr <onboarding@resend.dev>'

  const { error } = await getClient().emails.send({
    from,
    to: toEmail,
    subject: paymentRequestEmailSubject(amount, currency),
    html: paymentRequestEmailHtml(name, amount, currency, link),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

export async function sendPasswordResetEmail(toEmail, name, code) {
  const from = process.env.OTP_FROM_EMAIL || 'Looppr <onboarding@resend.dev>'

  const { error } = await getClient().emails.send({
    from,
    to: toEmail,
    subject: passwordResetEmailSubject(code),
    html: passwordResetEmailHtml(name, code),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

export async function sendWaitlistConfirmationEmail(toEmail) {
  const from = process.env.OTP_FROM_EMAIL || 'Looppr <onboarding@resend.dev>'

  const { error } = await getClient().emails.send({
    from,
    to: toEmail,
    subject: waitlistEmailSubject,
    html: waitlistEmailHtml(),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

export async function sendContactConfirmationEmail(toEmail, name) {
  const from = process.env.OTP_FROM_EMAIL || 'Looppr <onboarding@resend.dev>'

  const { error } = await getClient().emails.send({
    from,
    to: toEmail,
    subject: contactConfirmationEmailSubject,
    html: contactConfirmationEmailHtml(name),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

export async function sendPartnerLeadEmail(toEmail, type, name) {
  const from = process.env.OTP_FROM_EMAIL || 'Looppr <onboarding@resend.dev>'

  const { error } = await getClient().emails.send({
    from,
    to: toEmail,
    subject: partnerLeadEmailSubject(type),
    html: partnerLeadEmailHtml(type, name),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}
