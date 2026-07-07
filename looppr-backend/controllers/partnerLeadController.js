import { PartnerLead } from '../models/PartnerLead.js'
import { sendPartnerLeadEmail } from '../services/emailService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const submitPartnerLead = asyncHandler(async (req, res) => {
  const { type, name, email, phone, businessName, message } = req.body

  await PartnerLead.create({ type, name, email, phone, businessName, message })

  try {
    await sendPartnerLeadEmail(email, type, name)
  } catch (err) {
    console.error('Failed to send partner lead confirmation email', err)
  }

  res.status(201).json({ success: true })
})
