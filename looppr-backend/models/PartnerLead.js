import mongoose from 'mongoose'

const partnerLeadSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['laundromat', 'driver', 'business'], required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    // Laundromat/business leads — business name; blank for driver applicants.
    businessName: { type: String, trim: true, maxlength: 150, default: '' },
    // Business leads pack their extra Q&A (volume, turnaround, etc.) into
    // this as formatted text rather than adding a dozen one-off schema
    // fields for what's ultimately just an admin-read lead form.
    message: { type: String, trim: true, maxlength: 2000, default: '' },
    // Set by an admin from the CRM & Pipeline inbox once someone has
    // followed up — mirrors ContactMessage.handled/handledAt.
    contacted: { type: Boolean, default: false },
    contactedAt: { type: Date },
  },
  { timestamps: true },
)

export const PartnerLead = mongoose.model('PartnerLead', partnerLeadSchema)
