import express, { Router } from 'express'
import { handleStripeWebhook } from '../controllers/stripeWebhookController.js'

// Mounted in app.js BEFORE the global express.json() middleware — Stripe's
// signature check (stripe.webhooks.constructEvent) needs the exact raw
// request body, which express.json() would otherwise parse and consume.
const router = Router()

router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook)

export default router
