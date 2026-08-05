import mongoose from 'mongoose'

// A payout to a partner (laundromat) or driver for a date range of paid
// orders. Amount is computed once at creation time from PickupRequest data
// (see adminPayoutsController.js) and then frozen here — it does not
// recompute if orders in that range change later, same as a real payout
// record wouldn't retroactively change once issued.
const payoutSchema = new mongoose.Schema(
  {
    payeeType: { type: String, enum: ['partner', 'driver'], required: true },
    payeeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    orderCount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date },
    notes: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

payoutSchema.index({ payeeType: 1, payeeId: 1, createdAt: -1 })

export const Payout = mongoose.model('Payout', payoutSchema)
