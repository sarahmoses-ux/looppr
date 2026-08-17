import { Router } from 'express'
import { body } from 'express-validator'
import { listNotifications, markAllRead, registerPushToken } from '../controllers/notificationsController.js'
import { identifyAnyPortalUser } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// Shared by all four mobile portals -- see identifyAnyPortalUser for how a
// single route figures out which one is calling.
router.use(identifyAnyPortalUser)

router.get('/', listNotifications)
router.post('/register-token', [body('token').trim().notEmpty().withMessage('Missing push token.')], validate, registerPushToken)
router.post('/mark-all-read', markAllRead)

export default router
