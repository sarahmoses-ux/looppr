import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  refreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js'

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  res.cookie('refreshToken', refreshToken, refreshCookieOptions())
  return accessToken
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(409, 'An account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, phone, passwordHash })

  const accessToken = issueSession(res, user)
  res.status(201).json({ success: true, accessToken, user: publicUser(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) throw new ApiError(401, 'Incorrect email or password.')

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) throw new ApiError(401, 'Incorrect email or password.')

  const accessToken = issueSession(res, user)
  res.json({ success: true, accessToken, user: publicUser(user) })
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) throw new ApiError(401, 'Not authenticated.')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw new ApiError(401, 'Session expired, please sign in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new ApiError(401, 'Session expired, please sign in again.')

  const accessToken = issueSession(res, user)
  res.json({ success: true, accessToken, user: publicUser(user) })
})

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' })
  res.json({ success: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub)
  if (!user) throw new ApiError(401, 'Not authenticated.')
  res.json({ success: true, user: publicUser(user) })
})
