import { WaitlistSignup } from '../models/WaitlistSignup.js'
import { sendWaitlistConfirmationEmail } from '../services/emailService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Idempotent on purpose — re-submitting the same email (e.g. a double
// click) is a success, not a 409. We don't want this endpoint to reveal
// whether an email has already signed up either.
export const joinWaitlist = asyncHandler(async (req, res) => {
  const { email } = req.body

  const existing = await WaitlistSignup.findOne({ email })
  if (!existing) {
    await WaitlistSignup.create({ email })
    try {
      await sendWaitlistConfirmationEmail(email)
    } catch (err) {
      console.error('Failed to send waitlist confirmation email', err)
    }
  }

  res.status(201).json({ success: true })
})
