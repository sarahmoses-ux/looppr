import { ContactMessage } from '../models/ContactMessage.js'
import { sendContactConfirmationEmail } from '../services/emailService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, purpose, message } = req.body

  await ContactMessage.create({ name, email, phone, purpose, message })

  try {
    await sendContactConfirmationEmail(email, name)
  } catch (err) {
    console.error('Failed to send contact confirmation email', err)
  }

  res.status(201).json({ success: true })
})
