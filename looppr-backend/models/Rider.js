import mongoose from 'mongoose'

// Account-level state, admin managed — separate from live dispatch state
// (`availability` below). A rider can be 'active' but currently 'offline'.
export const RIDER_STATUSES = ['pending', 'active', 'inactive', 'suspended']

// Live dispatch state the future assignment engine reads/writes.
export const RIDER_AVAILABILITY_STATES = ['offline', 'available', 'on_delivery']

export const VEHICLE_TYPES = ['bike', 'car', 'van']

const riderSchema = new mongoose.Schema(
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

    status: { type: String, enum: RIDER_STATUSES, default: 'pending' },
    availability: { type: String, enum: RIDER_AVAILABILITY_STATES, default: 'offline' },
    vehicleType: { type: String, enum: VEHICLE_TYPES, required: true },

    // GeoJSON Point, left unset until the rider has reported a location at
    // least once. `default: undefined` (not `{}`) so Mongoose doesn't
    // auto-vivify a coordinate-less Point on save — same guard used for
    // PickupRequest.deliveryAddress.
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
    // Denormalized count, kept in sync by the assignment engine (not
    // computed on every read) so workload-balancing queries stay cheap.
    activeDeliveryCount: { type: Number, default: 0, min: 0 },

    rating: { type: Number, min: 0, max: 5, default: null },
  },
  { timestamps: true },
)

riderSchema.index({ location: '2dsphere' })

export const Rider = mongoose.model('Rider', riderSchema)
