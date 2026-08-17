import { Router } from 'express'
import {
  addBusinessProperty,
  createBusinessPickup,
  deleteBusinessProperty,
  getBusinessOverview,
  listBusinessInvoices,
  listBusinessPickups,
  listBusinessProperties,
  updateBusinessProperty,
} from '../controllers/businessController.js'
import { requireBusinessAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  businessAddPropertyValidation,
  businessCreatePickupValidation,
  businessPropertyIdValidation,
  businessUpdatePropertyValidation,
} from '../validations/businessValidation.js'

const router = Router()

// Every route below requires a valid Business Portal session. A customer or
// admin access token fails requireBusinessAuth outright (different signing
// secret), so those sessions can never reach business data.
router.use(requireBusinessAuth)

router.get('/overview', getBusinessOverview)
router.get('/pickups', listBusinessPickups)
router.post('/pickups', businessCreatePickupValidation, validate, createBusinessPickup)

router.get('/invoices', listBusinessInvoices)

router.get('/properties', listBusinessProperties)
router.post('/properties', businessAddPropertyValidation, validate, addBusinessProperty)
router.patch('/properties/:propertyId', businessUpdatePropertyValidation, validate, updateBusinessProperty)
router.delete('/properties/:propertyId', businessPropertyIdValidation, validate, deleteBusinessProperty)

export default router
