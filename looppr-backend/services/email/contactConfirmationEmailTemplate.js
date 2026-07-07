export const contactConfirmationEmailSubject = "We've got your message"

export function contactConfirmationEmailHtml(name) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">Thanks, ${name}</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 8px;">
        We've received your message and someone from the Looppr team will get back to you soon.
      </p>
      <p style="font-size: 12px; color: #999; margin: 24px 0 0;">
        If you didn't send this, you can safely ignore this email.
      </p>
    </div>
  `
}
