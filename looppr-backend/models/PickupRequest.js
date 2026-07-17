import mongoose from 'mongoose'
import { ALL_STATUSES } from '../constants/orderStatus.js'

const pickupRequestSchema = new mongoose.Schema(
  {
    // Absent for guest requests — guests never get an account in this
    // flow; admin manages them directly via guest.name/email/phone.
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    // 'guest' requests carry contact details directly (no account);
    // 'account' requests rely on clientId + the User document instead;
    // 'business' requests come from the Business Portal and rely on
    // businessId + the BusinessUser document.
    source: { type: String, enum: ['account', 'guest', 'business'], default: 'account' },

    // Set on Business Portal requests (source: 'business'). Kept alongside
    // clientId rather than reusing it so business orders never collide with a
    // customer's order history and each side queries only its own scope.
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUser',
      index: true,
      default: null,
    },
    guest: {
      name: { type: String, trim: true, maxlength: 100 },
      email: { type: String, trim: true, lowercase: true, maxlength: 200 },
      phone: { type: String, trim: true, maxlength: 20 },
    },

    address: {
      street: { type: String, required: true, trim: true, maxlength: 200 },
      apartment: { type: String, required: true, trim: true, maxlength: 50 },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      state: { type: String, required: true, trim: true, maxlength: 2, uppercase: true },
      zip: { type: String, required: true, trim: true, maxlength: 10 },
    },
    preferredDate: { type: Date, required: true },
    window: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    loadSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    notes: { type: String, trim: true, maxlength: 500, default: '' },

    // Delivery preferences, collected alongside pickup at booking time.
    deliveryWindow: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    // Only present when the customer chose a delivery address different
    // from the pickup address — absent (not just empty) means "same as
    // pickup", which the frontend/admin should treat as the fallback.
    // Wrapped in its own Schema with default: undefined on the parent field
    // below — without both of those, Mongoose auto-vivifies this into
    // `{ apartment: '' }` on every save just because `apartment` has a
    // default, defeating the "absent means same as pickup" check.
    deliveryAddress: {
      type: new mongoose.Schema(
        {
          street: { type: String, trim: true, maxlength: 200 },
          apartment: { type: String, trim: true, maxlength: 50 },
          city: { type: String, trim: true, maxlength: 100 },
          state: { type: String, trim: true, maxlength: 2, uppercase: true },
          zip: { type: String, trim: true, maxlength: 10 },
        },
        { _id: false },
      ),
      default: undefined,
    },

    // Full order lifecycle — see constants/orderStatus.js. Admin drives
    // this end to end via PATCH /admin/pickups/:id/status.
    status: {
      type: String,
      enum: ALL_STATUSES,
      default: 'request_received',
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    // GeoJSON mirror of location.lat/lng, kept in sync by the pre-save hook
    // below — location itself stays as-is since it's read elsewhere as
    // plain lat/lng. This is what the assignment engine's $near queries use
    // (2dsphere indexes require GeoJSON, not a plain {lat,lng} pair).
    // default: undefined so Mongoose doesn't auto-vivify a coordinate-less
    // Point on save — same guard as deliveryAddress above.
    geoLocation: {
      type: new mongoose.Schema(
        {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], required: true }, // [lng, lat]
        },
        { _id: false },
      ),
      default: undefined,
    },

    // Assignment — set by the future decision engine, left null until then.
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', index: true, default: null },
    riderAssignedAt: { type: Date },
    laundryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LaundryPartner',
      index: true,
      default: null,
    },
    partnerAssignedAt: { type: Date },

    // Partner Portal claim/lifecycle — separate from laundryPartnerId (which
    // refs the ops-foundation LaundryPartner collection). partnerUserId is the
    // self-serve PartnerUser who claimed the order through the portal.
    // partnerStage tracks the granular partner-facing lifecycle, decoupled
    // from the 4-stage customer `status` above (the controller keeps `status`
    // roughly in sync so the customer's tracking still reflects progress).
    partnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartnerUser',
      index: true,
      default: null,
    },
    partnerStage: {
      type: String,
      enum: ['accepted', 'pickup_completed', 'laundry_in_progress', 'ready_for_delivery', 'delivered'],
      default: undefined,
    },
    partnerAcceptedAt: { type: Date },
    // PartnerUser ids that rejected this order, so it drops out of their
    // incoming list without affecting other partners.
    partnerRejectedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },

    // Computed automatically at creation from loadSize (see utils/pricing.js)
    // — matches the price shown on the website. No admin pricing step.
    // subtotal/deliveryFee are only present on orders created after this
    // field was added — older paid orders have `amount` only, and the
    // receipt UI falls back to a non-itemized total for those.
    pricing: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'usd' },
      subtotal: { type: Number, min: 0 },
      deliveryFee: { type: Number, min: 0 },
    },

    // 'pending' = a payment request has been sent and we're waiting on it.
    // Simulated for now (see controllers: payGuestOrder/payMyOrder) — the
    // seam where a real Stripe webhook will replace the direct "mark paid"
    // call once Stripe keys are available.
    paymentStatus: { type: String, enum: ['unpaid', 'pending', 'paid', 'failed'], default: 'unpaid' },
    paymentLink: { type: String },
    paidAt: { type: Date },

    // One-time token handed to a guest at creation so they can view status
    // and pay for their own request without an account.
    guestAccessToken: { type: String, select: false },
  },
  { timestamps: true },
)

// Keeps geoLocation in sync with location.lat/lng whenever both are set,
// so callers that already write location (createPickup, etc.) don't need
// to change. Leaves geoLocation unset if either coordinate is missing,
// matching the deliveryAddress "absent means not present" convention.
pickupRequestSchema.pre('save', function syncGeoLocation(next) {
  if (this.isModified('location') && this.location?.lat != null && this.location?.lng != null) {
    this.geoLocation = { type: 'Point', coordinates: [this.location.lng, this.location.lat] }
  }
  next()
})

pickupRequestSchema.index({ geoLocation: '2dsphere' })

export const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema)
