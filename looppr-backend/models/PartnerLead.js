import mongoose from 'mongoose'

const partnerLeadSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['laundromat', 'driver'], required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    // Laundromat leads only — business name; blank for driver applicants.
    businessName: { type: String, trim: true, maxlength: 150, default: '' },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
)

export const PartnerLead = mongoose.model('PartnerLead', partnerLeadSchema)
