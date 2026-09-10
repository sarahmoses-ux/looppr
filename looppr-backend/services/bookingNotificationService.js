import { User } from '../models/User.js'
import { BusinessUser } from '../models/BusinessUser.js'
import { sendAdminBookingNotification } from './emailService.js'

export async function notifyAdminsOfBooking(pickup) {
  try {
    const contact = pickup.source === 'guest' ? pickup.guest
      : pickup.source === 'business'
        ? await BusinessUser.findById(pickup.businessId).select('contactPerson businessName email phone').lean()
        : await User.findById(pickup.clientId).select('name email phone').lean()
    await sendAdminBookingNotification({
      orderId: String(pickup._id), source: pickup.source,
      name: contact?.name || contact?.contactPerson || 'Client',
      businessName: contact?.businessName, email: contact?.email, phone: contact?.phone,
      address: pickup.address, preferredDate: pickup.preferredDate,
      window: pickup.window, loadSize: pickup.loadSize, weightLbs: pickup.weightLbs,
      deliveryWindow: pickup.deliveryWindow, notes: pickup.notes,
    })
  } catch (error) {
    // The order is saved; an email outage must not cause a duplicate booking.
    console.error('Failed to send admin booking notification', String(pickup._id), error)
  }
}
