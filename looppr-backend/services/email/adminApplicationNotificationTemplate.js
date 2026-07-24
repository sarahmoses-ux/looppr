// Sent to ADMIN_NOTIFICATION_EMAIL (see services/email/gmailProvider.js /
// resendProvider.js) the moment a Partner or Driver application is
// email-verified — not at raw registration submit, since step 1 of signup
// accepts any address including typos/bots (see controllers/
// partnerAuthController.js / driverAuthController.js).
export function adminApplicationNotificationSubject(applicantType, fullName) {
  return `New ${applicantType} application — ${fullName}`
}

function row(label, value) {
  if (!value) return ''
  return `
    <tr>
      <td style="padding: 8px 0 8px 20px; font-size: 13px; color: #999; width: 140px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 20px 8px 0; font-size: 14px; color: #1E1B4B; font-weight: 600;">${value}</td>
    </tr>
  `
}

export function adminApplicationNotificationHtml({
  applicantType,
  fullName,
  email,
  phone,
  businessName,
  vehicleDetails,
  city,
  state,
  appliedAt,
  reviewUrl,
}) {
  const appliedLabel = new Date(appliedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 14px; color: #5A52C5; font-weight: 600; margin: 0 0 8px;">Looppr</p>
      <h1 style="font-size: 22px; color: #1E1B4B; margin: 0 0 16px;">New ${applicantType} application</h1>
      <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 20px;">
        ${fullName} just verified their email and is awaiting review.
      </p>
      <table style="width: 100%; border-collapse: collapse; background: #F0EFFF; border-radius: 12px; margin: 0 0 24px;" cellpadding="0" cellspacing="0">
        <tbody>
          ${row('Applicant type', applicantType)}
          ${row('Full name', fullName)}
          ${row('Email', email)}
          ${row('Phone', phone)}
          ${row('Business name', businessName)}
          ${row('Vehicle', vehicleDetails)}
          ${row('City/State', [city, state].filter(Boolean).join(', '))}
          ${row('Applied', appliedLabel)}
        </tbody>
      </table>
      <p style="text-align: center; margin: 0 0 24px;">
        <a href="${reviewUrl}" style="display: inline-block; background: #1E1B4B; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 999px;">
          Review application
        </a>
      </p>
      <p style="font-size: 12px; color: #999; margin: 0;">
        This is an automated notification from the Looppr application system.
      </p>
    </div>
  `
}
