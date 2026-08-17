import mongoose from 'mongoose'

// Sub-roles within role: 'admin' only — meaningless for role: 'client'.
// super_admin implicitly passes every requireAdminRole(...) check (see
// middleware/auth.js), so it never needs to be listed explicitly at a
// route. ops/support are each scoped to a subset of the admin panel;
// see routes/adminRoutes.js for the exact per-route matrix.
export const ADMIN_ROLES = ['super_admin', 'ops', 'support']

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
    // via scripts/seedAdmin.js, or by a super_admin through the Admin Users
    // panel (see controllers/adminUsersController.js). See routes/authRoutes.js
    // for the separate /admin/login surface.
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
    // Only set (and only meaningful) when role === 'admin'.
    adminRole: { type: String, enum: ADMIN_ROLES },
    isVerified: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    // Default wash preferences, pre-filled into Book.jsx step 3 so a
    // returning customer doesn't have to re-pick them every order — still
    // overridable per-booking there (see PickupRequest's own foldStyle/
    // detergent/waterTemperature, which record what was actually chosen).
    defaultFoldStyle: { type: String, enum: ['standard', 'konmari', 'hangers'] },
    defaultDetergent: { type: String, enum: ['freeAndClear', 'freshScent', 'eco'] },
    defaultWaterTemperature: { type: String, enum: ['cold', 'warm', 'hot'] },
    fabricSoftener: { type: Boolean, default: false },
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
