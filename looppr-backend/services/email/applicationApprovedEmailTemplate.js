const PORTAL_LABELS = { partner: 'Partner', driver: 'Driver' }

export function applicationApprovedEmailSubject(portalType) {
  return `You're approved! Welcome to the Looppr ${PORTAL_LABELS[portalType] || 'Partner'} network`
}

export function applicationApprovedEmailHtml(name, portalType, loginUrl) {
  const label = PORTAL_LABELS[portalType] || 'Partner'
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">Hi ${name}, you're approved!</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
        Good news — we've reviewed your ${label} application and it's been approved.
        You can sign in now to access your dashboard and start ${portalType === 'driver' ? 'accepting deliveries' : 'accepting orders'}.
      </p>
      <p style="text-align: center; margin: 0 0 24px;">
        <a href="${loginUrl}" style="display: inline-block; background: #1E1B4B; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 999px;">
          Sign in to your dashboard
        </a>
      </p>
      <p style="font-size: 12px; color: #999; margin: 0;">
        Welcome to the Looppr network — we're glad to have you.
      </p>
    </div>
  `
}
