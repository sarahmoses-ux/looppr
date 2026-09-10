// Use the same contact/assignment details for the list and mutation responses.
export const ADMIN_ORDER_POPULATION = [
  { path: 'clientId', select: 'name email phone emailNotifications' },
  { path: 'businessId', select: 'businessName contactPerson email phone' },
  { path: 'partnerUserId', select: 'businessName ownerName isDefaultLaundromat' },
  { path: 'driverUserId', select: 'name' },
]
