import mongoose from 'mongoose'

// A business invoice for a date range of paid orders. Same "frozen at
// creation" reasoning as Payout — amount doesn't recompute after the fact.
const invoiceSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessUser', required: true },
    // Human-facing identifier (INV-00001) — see adminInvoicesController.js
    // for how it's assigned. Distinct from _id so finance can reference it
    // in emails/PDFs without leaking a Mongo ObjectId.
    invoiceNumber: { type: String, required: true, unique: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    orderCount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'sent', 'paid'], default: 'draft' },
    sentAt: { type: Date },
    paidAt: { type: Date },
    notes: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

invoiceSchema.index({ businessId: 1, createdAt: -1 })

export const Invoice = mongoose.model('Invoice', invoiceSchema)
