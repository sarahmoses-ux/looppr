import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import addressRoutes from './routes/addressRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import businessAuthRoutes from './routes/businessAuthRoutes.js'
import businessRoutes from './routes/businessRoutes.js'
import partnerAuthRoutes from './routes/partnerAuthRoutes.js'
import partnerRoutes from './routes/partnerRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import guestPickupRoutes from './routes/guestPickupRoutes.js'
import partnerLeadRoutes from './routes/partnerLeadRoutes.js'
import pickupRoutes from './routes/pickupRoutes.js'
import waitlistRoutes from './routes/waitlistRoutes.js'

// Factory rather than a module-level instance so tests can create an app
// against an in-memory DB/mocked env without ever calling connectDB() or
// app.listen() — see server.js for the real bootstrap, tests/setup.js for
// the test one.
export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(mongoSanitize())

  app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }))
  app.use('/api/auth', authRoutes)
  // Must come before /api/pickups: that router requires auth on everything,
  // and Express resolves routes in registration order, so guest (public)
  // requests need to be handled here first.
  app.use('/api/pickups/guest', guestPickupRoutes)
  app.use('/api/pickups', pickupRoutes)
  app.use('/api/admin', adminRoutes)
  // Business Portal — fully separate auth surface from /api/auth. The refresh
  // cookie is scoped to /api/business-auth (see utils/tokens.js) so it never
  // collides with the customer/admin session cookie on /api/auth.
  app.use('/api/business-auth', businessAuthRoutes)
  app.use('/api/business', businessRoutes)
  // Partner Portal — separate auth surface (refresh cookie scoped to
  // /api/partner-auth), isolated from customer/admin/business sessions.
  app.use('/api/partner-auth', partnerAuthRoutes)
  app.use('/api/partner', partnerRoutes)
  app.use('/api/waitlist', waitlistRoutes)
  app.use('/api/contact', contactRoutes)
  app.use('/api/partner-leads', partnerLeadRoutes)
  app.use('/api/addresses', addressRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
