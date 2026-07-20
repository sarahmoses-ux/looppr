import mongoose from 'mongoose'

const DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// Services a laundromat partner can offer — shared enum so the signup
// checkboxes, profile editor and any future matching logic agree.
export const PARTNER_SERVICES = [
  'wash_fold',
  'dry_cleaning',
  'ironing',
  'express',
  'commercial',
  'delicates',
  'stain_removal',
  'bedding',
]

// Admin-managed account state, distinct from `isVerified` (email ownership)
// and from `availability` (live online/offline toggle the partner controls).
export const PARTNER_ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'inactive']

export const PARTNER_AVAILABILITY = ['online', 'offline']

// Fully separate from User (client/admin) and BusinessUser — a partner
// account can only ever authenticate on the Partner Portal. Isolation is
// enforced by dedicated JWT signing secrets (see utils/tokens.js), the same
// pattern used for BusinessUser.
const partnerUserSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true, maxlength: 150 },
    ownerName: { type: String, required: true, trim: true, maxlength: 100 },
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

    address: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 2, uppercase: true, default: 'OK' },

    description: { type: String, trim: true, maxlength: 1000, default: '' },
    yearsInBusiness: { type: Number, min: 0, max: 200, default: 0 },
    employeeCount: { type: Number, min: 0, max: 100000, default: 0 },

    servicesOffered: {
      type: [{ type: String, enum: PARTNER_SERVICES }],
      default: [],
    },
    pickupAvailable: { type: Boolean, default: true },
    deliveryAvailable: { type: Boolean, default: true },

    operatingHours: {
      type: [
        {
          day: { type: String, enum: DAYS_OF_WEEK, required: true },
          open: { type: String, trim: true }, // 'HH:mm', 24h
          close: { type: String, trim: true },
          closed: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    // Max orders the shop can take in a day.
    maxDailyCapacity: { type: Number, min: 0, default: 20 },

    // File uploads are stored as data URLs for the MVP (no external bucket
    // yet). `select: false` on images so heavy blobs don't ride along on
    // every partner query — fetched explicitly by the profile endpoint.
    logo: { type: String, default: '' },
    images: { type: [String], default: [], select: false },
    businessDocument: { type: String, default: '', select: false },

    isVerified: { type: Boolean, default: false },
    accountStatus: { type: String, enum: PARTNER_ACCOUNT_STATUSES, default: 'active' },
    availability: { type: String, enum: PARTNER_AVAILABILITY, default: 'offline' },

    averageRating: { type: Number, min: 0, max: 5, default: null },

    role: { type: String, enum: ['partner'], default: 'partner' },

    // Flags the single system-owned PartnerUser account that
    // services/assignmentService.js falls back to when no dedicated partner
    // match applies yet. Not DB-unique (a unique index on a boolean needs a
    // partialFilterExpression) — the sole writer is
    // scripts/seedDefaultLaundromat.js, consistent with this codebase's
    // existing "trust the sole writer" convention (see the
    // LaundryPartner.activeOrderCount / Rider.activeDeliveryCount
    // "kept in sync by the assignment engine" comments).
    isDefaultLaundromat: { type: Boolean, default: false, index: true },

    // Stateless session revocation — bumped on password change/reset, checked
    // on refresh. Same approach as User/BusinessUser (chosen over storing a
    // live refresh token in the DB).
    tokenVersion: { type: Number, default: 0 },

    // Reused by utils/otp.js for signup email verification + password reset.
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },
  },
  { timestamps: true },
)

export const PartnerUser = mongoose.model('PartnerUser', partnerUserSchema)
