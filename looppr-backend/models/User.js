import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    // 'admin' accounts are never created through a public endpoint — only
    // via scripts/seedAdmin.js. See routes/authRoutes.js for the separate
    // /admin/login surface.
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
    isVerified: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    // Quick-select addresses for Book.jsx — plain subdocuments (Mongoose
    // gives each an _id automatically) rather than a separate collection,
    // since these only ever make sense scoped to one user.
    savedAddresses: [
      {
        label: { type: String, trim: true, maxlength: 50, default: 'Address' },
        street: { type: String, required: true, trim: true, maxlength: 200 },
        apartment: { type: String, trim: true, maxlength: 50, default: '' },
        city: { type: String, required: true, trim: true, maxlength: 100 },
        state: { type: String, required: true, trim: true, maxlength: 2, uppercase: true, default: 'OK' },
        zip: { type: String, required: true, trim: true, maxlength: 10 },
      },
    ],
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },
    // Bumped on password change/reset — embedded in every issued JWT (see
    // utils/tokens.js) and checked against on refresh (see authController's
    // refresh handler) so old sessions stop being renewable. Not checked on
    // every access-token request: that would need a DB lookup per request,
    // defeating the point of stateless access tokens. Since access tokens
    // are short-lived (15m default), leaving them valid until natural
    // expiry after a password change is an accepted, bounded tradeoff.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
