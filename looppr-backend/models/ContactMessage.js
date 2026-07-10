import mongoose from 'mongoose'

export const CONTACT_PURPOSES = ['general', 'order_support', 'business', 'partnership', 'press', 'other']

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    purpose: { type: String, enum: CONTACT_PURPOSES, required: true },
    message: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
)

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema)
