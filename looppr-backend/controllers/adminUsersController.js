import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// super_admin-only: the UI for assigning ops/support access without needing
// direct DB access or scripts/seedAdmin.js. Kept separate from
// authController.js (customer/admin login+session) — this is account
// provisioning, not authentication.

function publicAdminUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    adminRole: user.adminRole || 'super_admin',
    createdAt: user.createdAt,
  }
}

export const listAdminUsers = asyncHandler(async (_req, res) => {
  const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 })
  res.json({ success: true, admins: admins.map(publicAdminUser) })
})

export const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, adminRole } = req.body

  const existing = await User.findOne({ email: email.toLowerCase().trim() })
  if (existing) throw new ApiError(409, 'An account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)

  // isVerified: true — same as scripts/seedAdmin.js: there's no public
  // sign-up step for admin accounts to verify against.
  const admin = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: 'admin',
    adminRole,
    isVerified: true,
  })

  res.status(201).json({ success: true, admin: publicAdminUser(admin) })
})

export const updateAdminUserRole = asyncHandler(async (req, res) => {
  const { adminRole } = req.body
  if (req.params.id === req.user.sub) {
    throw new ApiError(400, 'You cannot change your own admin role.')
  }

  const admin = await User.findOne({ _id: req.params.id, role: 'admin' })
  if (!admin) throw new ApiError(404, 'Admin account not found.')

  admin.adminRole = adminRole
  await admin.save()

  res.json({ success: true, admin: publicAdminUser(admin) })
})
