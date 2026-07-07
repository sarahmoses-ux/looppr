import mongoose from 'mongoose'

const waitlistSignupSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true },
)

export const WaitlistSignup = mongoose.model('WaitlistSignup', waitlistSignupSchema)
