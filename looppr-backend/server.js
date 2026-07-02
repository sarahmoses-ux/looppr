import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import { connectDB } from './config/db.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import pickupRoutes from './routes/pickupRoutes.js'

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
app.use('/api/pickups', pickupRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Looppr API listening on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })
