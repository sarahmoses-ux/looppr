import { ContactMessage } from '../models/ContactMessage.js'
import { PartnerLead } from '../models/PartnerLead.js'
import { WaitlistSignup } from '../models/WaitlistSignup.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// Real submission counts only — no completion-rate/funnel column like the
// design mockup's version, since that needs page-view/funnel tracking this
// app doesn't have. Fabricating a percentage here would be worse than not
// showing one.
export const getIntakeStats = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - THIRTY_DAYS_MS)

  const [
    contactTotal,
    contactRecent,
    laundromatTotal,
    laundromatRecent,
    driverTotal,
    driverRecent,
    businessTotal,
    businessRecent,
    waitlistTotal,
    waitlistRecent,
  ] = await Promise.all([
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ createdAt: { $gte: since } }),
    PartnerLead.countDocuments({ type: 'laundromat' }),
    PartnerLead.countDocuments({ type: 'laundromat', createdAt: { $gte: since } }),
    PartnerLead.countDocuments({ type: 'driver' }),
    PartnerLead.countDocuments({ type: 'driver', createdAt: { $gte: since } }),
    PartnerLead.countDocuments({ type: 'business' }),
    PartnerLead.countDocuments({ type: 'business', createdAt: { $gte: since } }),
    WaitlistSignup.countDocuments(),
    WaitlistSignup.countDocuments({ createdAt: { $gte: since } }),
  ])

  res.json({
    success: true,
    intakePoints: [
      { key: 'contact', label: 'Contact form', location: '/contact', total: contactTotal, last30: contactRecent },
      {
        key: 'laundromat',
        label: 'Laundromat partner application',
        location: '/laundromats/apply',
        total: laundromatTotal,
        last30: laundromatRecent,
      },
      { key: 'driver', label: 'Driver application', location: '/drive/apply', total: driverTotal, last30: driverRecent },
      {
        key: 'business',
        label: 'Business partnership inquiry',
        location: '/business/apply',
        total: businessTotal,
        last30: businessRecent,
      },
      {
        key: 'waitlist',
        label: 'Waitlist signup',
        location: 'Footer / landing page',
        total: waitlistTotal,
        last30: waitlistRecent,
      },
    ],
  })
})
