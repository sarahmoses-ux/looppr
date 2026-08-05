import { ActivityLog } from '../models/ActivityLog.js'
import { BusinessUser } from '../models/BusinessUser.js'
import { Invoice } from '../models/Invoice.js'
import { PickupRequest } from '../models/PickupRequest.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const round = (v) => Math.round((v || 0) * 100) / 100

// Sequential, human-facing (INV-00001) rather than a raw ObjectId, generated
// off the current count — fine at admin-only, one-at-a-time invoice volume;
// a real concurrent-write-safe counter would be overkill here.
async function nextInvoiceNumber() {
  const count = await Invoice.countDocuments()
  return `INV-${String(count + 1).padStart(5, '0')}`
}

export const listInvoices = asyncHandler(async (req, res) => {
  const { status } = req.query
  const match = {}
  if (['draft', 'sent', 'paid'].includes(status)) match.status = status

  const invoices = await Invoice.find(match)
    .sort({ createdAt: -1 })
    .populate('businessId', 'businessName contactPerson email')
    .lean()

  res.json({ success: true, invoices })
})

export const generateInvoice = asyncHandler(async (req, res) => {
  const { businessId, periodStart, periodEnd } = req.body

  const business = await BusinessUser.findById(businessId)
  if (!business) throw new ApiError(404, 'Business account not found.')

  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
    throw new ApiError(422, 'Invalid date range.')
  }

  const [agg] = await PickupRequest.aggregate([
    { $match: { businessId: business._id, paymentStatus: 'paid', paidAt: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$pricing.amount' }, count: { $sum: 1 } } },
  ])

  const amount = round(agg?.total)
  const orderCount = agg?.count || 0
  if (orderCount === 0) throw new ApiError(409, 'No paid orders in this date range.')

  const invoice = await Invoice.create({
    businessId: business._id,
    invoiceNumber: await nextInvoiceNumber(),
    periodStart: start,
    periodEnd: end,
    amount,
    orderCount,
    createdBy: req.user.sub,
  })

  await ActivityLog.create({
    actorType: 'admin',
    actorId: req.user.sub,
    action: 'business_invoice_created',
    entityType: 'BusinessUser',
    entityId: business._id,
    metadata: { invoiceNumber: invoice.invoiceNumber, amount, orderCount },
  }).catch(() => {})

  res.status(201).json({ success: true, invoice })
})

const NEXT_STATUS = { draft: 'sent', sent: 'paid' }

export const advanceInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
  if (!invoice) throw new ApiError(404, 'Invoice not found.')

  const { status } = req.body
  if (invoice.status === 'paid') throw new ApiError(409, 'This invoice has already been paid.')
  if (NEXT_STATUS[invoice.status] !== status) {
    throw new ApiError(409, `An invoice must go ${invoice.status} → ${NEXT_STATUS[invoice.status]} first.`)
  }

  invoice.status = status
  if (status === 'sent') invoice.sentAt = new Date()
  if (status === 'paid') invoice.paidAt = new Date()
  await invoice.save()

  await ActivityLog.create({
    actorType: 'admin',
    actorId: req.user.sub,
    action: `business_invoice_${status}`,
    entityType: 'BusinessUser',
    entityId: invoice.businessId,
    metadata: { invoiceNumber: invoice.invoiceNumber, amount: invoice.amount },
  }).catch(() => {})

  res.json({ success: true, invoice })
})
