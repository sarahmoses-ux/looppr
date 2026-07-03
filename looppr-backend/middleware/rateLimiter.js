import rateLimit from 'express-rate-limit'

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.body?.email || ''}`,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
    })
  },
})

export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.user?.sub || ''}`,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many code requests. Please try again later.',
    })
  },
})

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.user?.sub || ''}`,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.',
    })
  },
})

// Login-OTP endpoints run before the user has a session, so key on IP alone.
export const loginOtpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.',
    })
  },
})

export const loginOtpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many code requests. Please try again later.',
    })
  },
})
