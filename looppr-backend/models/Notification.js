import mongoose from 'mongoose'

// A real, persisted notification -- written by notificationService whenever
// something actually happens to an order (assigned, picked up, delivered,
// etc.), not a client-side mock. Same ownerType/ownerId shape as PushToken.
const notificationSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ['residential', 'business', 'partner', 'driver'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    data: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
)

notificationSchema.index({ ownerType: 1, ownerId: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)
