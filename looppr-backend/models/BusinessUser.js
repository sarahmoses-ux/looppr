import mongoose from 'mongoose'

// The commercial segments the Business Portal serves — kept as an enum so the
// signup form, dashboard and any future admin filtering all share one list.
export const BUSINESS_TYPES = [
  'hotel',
  'airbnb',
  'restaurant',
  'hospital',
  'gym',
  'spa',
  'salon',
  'office',
  'school',
  'event_center',
  'other',
]

// Admin-managed account state, distinct from `isVerified` (email ownership).
// A business can be email-verified but still 'suspended', and vice versa.
export const BUSINESS_ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'inactive']

// Completely separate from the User (client/admin) collection — a business
// account can only ever authenticate on the Business Portal. Isolation is
// enforced at two layers: this is its own collection, and business JWTs are
// signed with dedicated secrets (see utils/tokens.js) so a business token is
// rejected by the customer/admin auth middleware and vice versa.
const businessUserSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true, maxlength: 150 },
    businessType: { type: String, enum: BUSINESS_TYPES, required: true },
    contactPerson: { type: String, required: true, trim: true, maxlength: 100 },
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

    // Oklahoma-only at launch, so state defaults to 'OK' — same convention as
    // LaundryPartner.address / User.savedAddresses.
    address: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 2, uppercase: true, default: 'OK' },

    // Free-text so businesses can give a range ("50–100 lbs/day") rather than
    // being forced into a single number at signup.
    weeklyVolume: { type: String, trim: true, maxlength: 100, default: '' },
    // Optional business/tax registration number, for verified commercial accounts.
    registrationNumber: { type: String, trim: true, maxlength: 60, default: '' },

    // "Verification Status" — email ownership, flipped true by verifyOtpCode
    // (utils/otp.js), which this model reuses via the otp* fields below.
    isVerified: { type: Boolean, default: false },
    accountStatus: { type: String, enum: BUSINESS_ACCOUNT_STATUSES, default: 'active' },

    // Only ever 'business' today, but kept as an explicit enum so role-based
    // authorization has something to check and future tiers (e.g. a business
    // 'staff' vs 'owner') slot in without a schema migration.
    role: { type: String, enum: ['business'], default: 'business' },

    // Bumped on password change/reset and logout-all — embedded in every
    // issued JWT and checked on refresh so old sessions stop being renewable.
    // Same stateless-revocation approach as User.tokenVersion.
    tokenVersion: { type: Number, default: 0 },

    // Reused by utils/otp.js for both signup email verification and password
    // reset codes (only one such flow is ever in flight per account at a time).
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },
  },
  { timestamps: true },
)

export const BusinessUser = mongoose.model('BusinessUser', businessUserSchema)
