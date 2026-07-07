export function passwordResetEmailSubject(code) {
  return `${code} is your Looppr password reset code`
}

export function passwordResetEmailHtml(name, code) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">Hi ${name}, reset your password</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
        Enter this code to reset your password. It expires in 10 minutes.
      </p>
      <div style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1E1B4B; background: #F0EFFF; border-radius: 12px; padding: 16px 24px; text-align: center; margin: 0 0 24px;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #999; margin: 0;">
        If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
    </div>
  `
}
