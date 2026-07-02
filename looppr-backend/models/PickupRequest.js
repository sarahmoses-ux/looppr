import mongoose from 'mongoose'

const pickupRequestSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: {
      street: { type: String, required: true, trim: true, maxlength: 200 },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      state: { type: String, required: true, trim: true, maxlength: 2, uppercase: true },
      zip: { type: String, required: true, trim: true, maxlength: 10 },
    },
    preferredDate: { type: Date, required: true },
    window: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    loadSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'cancelled'],
      default: 'requested',
    },
  },
  { timestamps: true },
)

export const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema)
