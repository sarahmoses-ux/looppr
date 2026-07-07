export const waitlistEmailSubject = "You're on the Looppr waitlist"

export function waitlistEmailHtml() {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">You're on the list!</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 8px;">
        Thanks for signing up. We'll email you the moment Looppr launches in
        OKC, Edmond, Norman &amp; Moore.
      </p>
      <p style="font-size: 12px; color: #999; margin: 24px 0 0;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `
}
