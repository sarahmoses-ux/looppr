import mongoose from 'mongoose'

export const DRIVER_VEHICLE_TYPES = ['bike', 'car', 'van']

// Admin-managed account state, distinct from `isVerified` (email ownership)
// and from `availability` (live dispatch state the driver controls).
export const DRIVER_ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'inactive']

// Live dispatch state — mirrors the ops-foundation Rider.availability enum
// so both concepts speak the same vocabulary even though they're separate
// collections.
export const DRIVER_AVAILABILITY_STATES = ['offline', 'available', 'on_delivery']

// Fully separate from User/BusinessUser/PartnerUser — a driver account can
// only ever authenticate on the Driver Portal. Isolation is enforced by
// dedicated JWT signing secrets (see utils/tokens.js).
//
// Distinct from the ops-foundation `Rider` collection (admin-managed, no
// auth, referenced by PickupRequest.riderId for the future assignment
// engine) — this is the self-serve portal account. Portal claims use their
// own PickupRequest.driverUserId so the two never collide.
const driverUserSchema = new mongoose.Schema(
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

    address: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 2, uppercase: true, default: 'OK' },

    vehicleType: { type: String, enum: DRIVER_VEHICLE_TYPES, required: true },
    // Make/model, e.g. "Toyota Corolla" — distinct from vehicleType's broad
    // category, so a customer/dispatcher can identify the actual vehicle.
    vehicleName: { type: String, trim: true, maxlength: 100, default: '' },
    licenseNumber: { type: String, trim: true, maxlength: 40, default: '' },
    vehiclePlate: { type: String, trim: true, maxlength: 20, default: '' },

    // Data-URL upload (MVP — no external bucket yet, same approach as
    // PartnerUser.logo). Shown in the driver's own sidebar AND to the
    // customer once this driver has claimed their delivery.
    profilePhoto: { type: String, default: '' },

    isVerified: { type: Boolean, default: false },
    accountStatus: { type: String, enum: DRIVER_ACCOUNT_STATUSES, default: 'active' },
    availability: { type: String, enum: DRIVER_AVAILABILITY_STATES, default: 'offline' },

    // GeoJSON Point, left unset until the driver shares a location at least
    // once. `default: undefined` (not `{}`) so Mongoose doesn't auto-vivify
    // a coordinate-less Point on save — same guard used elsewhere (Rider,
    // LaundryPartner, PickupRequest).
    location: {
      type: new mongoose.Schema(
        {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], required: true }, // [lng, lat]
        },
        { _id: false },
      ),
      default: undefined,
    },
    locationUpdatedAt: { type: Date },

    maxActiveDeliveries: { type: Number, default: 3, min: 0 },
    // Denormalized count, kept in sync as deliveries are accepted/delivered
    // rather than computed on every read.
    activeDeliveryCount: { type: Number, default: 0, min: 0 },

    averageRating: { type: Number, min: 0, max: 5, default: null },

    role: { type: String, enum: ['driver'], default: 'driver' },

    // Stateless session revocation — bumped on password change/reset,
    // checked on refresh. Same approach as User/BusinessUser/PartnerUser.
    tokenVersion: { type: Number, default: 0 },

    // Reused by utils/otp.js for signup email verification + password reset.
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },
  },
  { timestamps: true },
)

driverUserSchema.index({ location: '2dsphere' })

export const DriverUser = mongoose.model('DriverUser', driverUserSchema)
