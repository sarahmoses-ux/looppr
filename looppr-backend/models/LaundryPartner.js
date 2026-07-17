import mongoose from 'mongoose'

export const PARTNER_STATUSES = ['pending', 'active', 'inactive', 'suspended']

const DAYS_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const laundryPartnerSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true, maxlength: 150 },
    contactName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },

    // Same subdocument shape as PickupRequest.address / User.savedAddresses
    // — Looppr is Oklahoma-only at launch, hence state defaults to 'OK'.
    address: {
      street: { type: String, required: true, trim: true, maxlength: 200 },
      apartment: { type: String, trim: true, maxlength: 50, default: '' },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      state: { type: String, required: true, trim: true, maxlength: 2, uppercase: true, default: 'OK' },
      zip: { type: String, required: true, trim: true, maxlength: 10 },
    },

    // GeoJSON Point — required once set, but the document itself can exist
    // without one yet (e.g. before the address has been geocoded).
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

    status: { type: String, enum: PARTNER_STATUSES, default: 'pending' },

    // Matches PickupRequest.loadSize's enum so a request's loadSize can be
    // checked directly against a partner's acceptsLoadSizes without a
    // separate taxonomy to keep in sync.
    acceptsLoadSizes: {
      type: [{ type: String, enum: ['small', 'medium', 'large'] }],
      default: ['small', 'medium', 'large'],
    },

    operatingHours: {
      type: [
        {
          day: { type: String, enum: DAYS_OF_WEEK, required: true },
          open: { type: String, trim: true }, // 'HH:mm', 24h
          close: { type: String, trim: true }, // 'HH:mm', 24h
          closed: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    maxActiveOrders: { type: Number, default: 20, min: 0 },
    // Denormalized count, kept in sync by the assignment engine.
    activeOrderCount: { type: Number, default: 0, min: 0 },

    rating: { type: Number, min: 0, max: 5, default: null },
  },
  { timestamps: true },
)

laundryPartnerSchema.index({ location: '2dsphere' })

export const LaundryPartner = mongoose.model('LaundryPartner', laundryPartnerSchema)
