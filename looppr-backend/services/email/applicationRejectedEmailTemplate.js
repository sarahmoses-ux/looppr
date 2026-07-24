export function applicationRejectedEmailSubject() {
  return 'An update on your Looppr application'
}

export function applicationRejectedEmailHtml(name, reason) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">Hi ${name}, an update on your application</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 16px;">
        Thank you for your interest in joining the Looppr network. After careful review,
        we're not able to move forward with your application at this time.
      </p>
      ${
        reason
          ? `<p style="font-size: 14px; color: #444; line-height: 1.6; background: #F5F4FF; border-radius: 12px; padding: 14px 18px; margin: 0 0 16px;">
              ${reason}
            </p>`
          : ''
      }
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
        We appreciate the time you took to apply, and wish you the best going forward.
      </p>
      <p style="font-size: 12px; color: #999; margin: 0;">
        Questions about this decision? Just reply to this email.
      </p>
    </div>
  `
}
