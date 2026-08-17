import mongoose from 'mongoose'

// One Expo push token per portal account. Deliberately separate from the
// four user models (User/BusinessUser/PartnerUser/DriverUser) rather than a
// field on each, so notificationService can look one up without knowing
// which model owns it -- ownerType + ownerId is enough. Overwritten on
// re-registration (single-device assumption, fine at MVP scale).
const pushTokenSchema = new mongoose.Schema(
  {
    ownerType: { type: String, enum: ['residential', 'business', 'partner', 'driver'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    token: { type: String, required: true },
  },
  { timestamps: true },
)

pushTokenSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true })

export const PushToken = mongoose.model('PushToken', pushTokenSchema)
