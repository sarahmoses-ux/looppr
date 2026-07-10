import nodemailer from 'nodemailer'
import { contactConfirmationEmailHtml, contactConfirmationEmailSubject } from './contactConfirmationEmailTemplate.js'
import { otpEmailHtml, otpEmailSubject } from './otpEmailTemplate.js'
import { partnerLeadEmailHtml, partnerLeadEmailSubject } from './partnerLeadEmailTemplate.js'
import { paymentRequestEmailHtml, paymentRequestEmailSubject } from './paymentRequestEmailTemplate.js'
import { passwordResetEmailHtml, passwordResetEmailSubject } from './passwordResetEmailTemplate.js'
import { waitlistEmailHtml, waitlistEmailSubject } from './waitlistEmailTemplate.js'

// Gmail SMTP for local/dev use — sends to ANY recipient (no domain
// verification needed), unlike Resend's sandbox sender. Requires:
//   GMAIL_USER            the sending Gmail address (2FA must be enabled)
//   GMAIL_APP_PASSWORD     a 16-character App Password from
//                          https://myaccount.google.com/apppasswords
//                          (NOT the account's normal login password)
let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  }
  return transporter
}

// Redundant when GMAIL_USER already is the reply-to inbox (replies go to
// `from` by default), but keeps this provider's behavior aligned with
// resendProvider.js in case they ever point at different addresses.
function replyTo() {
  return process.env.REPLY_TO_EMAIL || undefined
}

export async function sendOtpEmail(toEmail, name, code) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Looppr'

  // nodemailer rejects the promise on SMTP/auth failures (unlike the Resend
  // SDK), so a bad App Password or missing GMAIL_USER surfaces immediately
  // to the caller instead of silently pretending to succeed.
  await getTransporter().sendMail({
    from: `${fromName} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: replyTo(),
    subject: otpEmailSubject(code),
    html: otpEmailHtml(name, code),
  })
}

export async function sendPaymentRequestEmail(toEmail, name, amount, currency, link) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Looppr'

  await getTransporter().sendMail({
    from: `${fromName} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: replyTo(),
    subject: paymentRequestEmailSubject(amount, currency),
    html: paymentRequestEmailHtml(name, amount, currency, link),
  })
}

export async function sendPasswordResetEmail(toEmail, name, code) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Looppr'

  await getTransporter().sendMail({
    from: `${fromName} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: replyTo(),
    subject: passwordResetEmailSubject(code),
    html: passwordResetEmailHtml(name, code),
  })
}

export async function sendWaitlistConfirmationEmail(toEmail) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Looppr'

  await getTransporter().sendMail({
    from: `${fromName} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: replyTo(),
    subject: waitlistEmailSubject,
    html: waitlistEmailHtml(),
  })
}

export async function sendContactConfirmationEmail(toEmail, name) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Looppr'

  await getTransporter().sendMail({
    from: `${fromName} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: replyTo(),
    subject: contactConfirmationEmailSubject,
    html: contactConfirmationEmailHtml(name),
  })
}

export async function sendPartnerLeadEmail(toEmail, type, name) {
  const fromName = process.env.GMAIL_FROM_NAME || 'Looppr'

  await getTransporter().sendMail({
    from: `${fromName} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    replyTo: replyTo(),
    subject: partnerLeadEmailSubject(type),
    html: partnerLeadEmailHtml(type, name),
  })
}
