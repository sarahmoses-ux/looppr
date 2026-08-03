import mongoose from 'mongoose'

export const CONTACT_PURPOSES = ['general', 'order_support', 'business', 'partnership', 'press', 'other']

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    purpose: { type: String, enum: CONTACT_PURPOSES, required: true },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    // Set by an admin from the Customer Care inbox once the message has
    // been dealt with — purely a triage flag, doesn't affect the sender.
    handled: { type: Boolean, default: false },
    handledAt: { type: Date },
  },
  { timestamps: true },
)

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema)
