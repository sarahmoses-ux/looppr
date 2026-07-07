// Shared by every email provider (resendProvider.js, gmailProvider.js) so
// the OTP email's copy/design lives in exactly one place.
export function otpEmailSubject(code) {
  return `${code} is your Looppr verification code`
}

export function otpEmailHtml(name, code) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">Hi ${name}, confirm your email</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
        Enter this code to verify your email address. It expires in 10 minutes.
      </p>
      <div style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1E1B4B; background: #F0EFFF; border-radius: 12px; padding: 16px 24px; text-align: center; margin: 0 0 24px;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #999; margin: 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `
}
