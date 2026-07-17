import mongoose from 'mongoose'
import { ActivityLog } from '../models/ActivityLog.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { geocodeAddress } from '../services/geocodeService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { computeOrderPrice } from '../utils/pricing.js'

// Business Portal pickup request. Same creation path as the customer flow
// (controllers/pickupController.js) but scoped to businessId + source
// 'business', and it logs to the ActivityLog so the ops team sees it.
export const createBusinessPickup = asyncHandler(async (req, res) => {
  const { address, preferredDate, window, loadSize, notes, deliveryWindow, deliveryAddress } = req.body

  const priorOrderCount = await PickupRequest.countDocuments({
    businessId: req.business.sub,
    status: { $ne: 'cancelled' },
  })

  const pickup = await PickupRequest.create({
    businessId: req.business.sub,
    source: 'business',
    address,
    preferredDate,
    window,
    loadSize,
    notes,
    deliveryWindow,
    deliveryAddress,
    pricing: computeOrderPrice(loadSize, priorOrderCount),
  })

  try {
    const location = await geocodeAddress(address)
    if (location) {
      pickup.location = location
      await pickup.save()
    }
  } catch (err) {
    console.error('Failed to geocode business pickup address', err)
  }

  try {
    await ActivityLog.create({
      actorType: 'client',
      actorId: new mongoose.Types.ObjectId(req.business.sub),
      action: 'business_pickup_requested',
      entityType: 'PickupRequest',
      entityId: pickup._id,
      metadata: { loadSize, source: 'business' },
    })
  } catch (err) {
    console.error('Failed to log business pickup activity', err)
  }

  res.status(201).json({ success: true, pickup })
})

export const listBusinessPickups = asyncHandler(async (req, res) => {
  const pickups = await PickupRequest.find({ businessId: req.business.sub }).sort({ createdAt: -1 })
  res.json({ success: true, pickups })
})

// Overview + analytics numbers for the dashboard, computed from the
// business's own pickups. No invoice model yet, so "spending" is derived from
// paid orders' pricing.amount.
export const getBusinessOverview = asyncHandler(async (req, res) => {
  const businessId = new mongoose.Types.ObjectId(req.business.sub)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    activeOrders,
    completedOrders,
    upcomingPickup,
    monthlySpendingAgg,
    ordersThisMonth,
    avgProcessingAgg,
  ] = await Promise.all([
    PickupRequest.countDocuments({
      businessId,
      status: { $in: ['request_received', 'pickup', 'laundry_in_progress'] },
    }),
    PickupRequest.countDocuments({ businessId, status: 'ready_delivered' }),
    PickupRequest.findOne({
      businessId,
      status: { $in: ['request_received', 'pickup'] },
      preferredDate: { $gte: new Date() },
    })
      .sort({ preferredDate: 1 })
      .select('preferredDate window address loadSize status'),
    PickupRequest.aggregate([
      { $match: { businessId, paymentStatus: 'paid', paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$pricing.amount' } } },
    ]),
    PickupRequest.countDocuments({ businessId, createdAt: { $gte: startOfMonth } }),
    // Average processing time (hours) from creation to delivery, over
    // completed orders — a real operational metric, not a placeholder.
    PickupRequest.aggregate([
      { $match: { businessId, status: 'ready_delivered' } },
      { $project: { hours: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60] } } },
      { $group: { _id: null, avgHours: { $avg: '$hours' } } },
    ]),
  ])

  res.json({
    success: true,
    overview: {
      activeOrders,
      completedOrders,
      upcomingPickup,
      monthlySpending: Math.round((monthlySpendingAgg[0]?.total || 0) * 100) / 100,
      ordersThisMonth,
      avgProcessingHours: avgProcessingAgg[0]?.avgHours
        ? Math.round(avgProcessingAgg[0].avgHours * 10) / 10
        : null,
    },
  })
})
