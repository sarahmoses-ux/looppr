import {
  businessRefreshCookieOptions,
  driverRefreshCookieOptions,
  partnerRefreshCookieOptions,
  refreshCookieOptions,
  signAccessToken,
  signBusinessAccessToken,
  signBusinessRefreshToken,
  signDriverAccessToken,
  signDriverRefreshToken,
  signPartnerAccessToken,
  signPartnerRefreshToken,
  signRefreshToken,
} from './tokens.js'

// Used by every authController endpoint that issues a session
// (register/login/refresh) — one place that knows how a session is built.
export function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  res.cookie('refreshToken', refreshToken, refreshCookieOptions())
  return accessToken
}

// Business Portal equivalent of issueSession — issues a business access token
// and sets the business refresh cookie (own name/path, see tokens.js).
// `persistent` mirrors the login "Remember me" checkbox.
export function issueBusinessSession(res, business, persistent = true) {
  const accessToken = signBusinessAccessToken(business)
  const refreshToken = signBusinessRefreshToken(business, persistent)
  res.cookie('businessRefreshToken', refreshToken, businessRefreshCookieOptions(persistent))
  return accessToken
}

export function issuePartnerSession(res, partner, persistent = true) {
  const accessToken = signPartnerAccessToken(partner)
  const refreshToken = signPartnerRefreshToken(partner, persistent)
  res.cookie('partnerRefreshToken', refreshToken, partnerRefreshCookieOptions(persistent))
  return accessToken
}

export function issueDriverSession(res, driver, persistent = true) {
  const accessToken = signDriverAccessToken(driver)
  const refreshToken = signDriverRefreshToken(driver, persistent)
  res.cookie('driverRefreshToken', refreshToken, driverRefreshCookieOptions(persistent))
  return accessToken
}

export function publicDriver(driver) {
  return {
    id: driver._id.toString(),
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
    address: driver.address,
    city: driver.city,
    state: driver.state,
    vehicleType: driver.vehicleType,
    vehicleName: driver.vehicleName,
    licenseNumber: driver.licenseNumber,
    vehiclePlate: driver.vehiclePlate,
    profilePhoto: driver.profilePhoto,
    isVerified: driver.isVerified,
    accountStatus: driver.accountStatus,
    availability: driver.availability,
    location: driver.location || null,
    locationUpdatedAt: driver.locationUpdatedAt || null,
    averageRating: driver.averageRating,
    role: driver.role,
    createdAt: driver.createdAt,
  }
}

export function publicPartner(partner) {
  return {
    id: partner._id.toString(),
    businessName: partner.businessName,
    ownerName: partner.ownerName,
    email: partner.email,
    phone: partner.phone,
    address: partner.address,
    city: partner.city,
    state: partner.state,
    description: partner.description,
    yearsInBusiness: partner.yearsInBusiness,
    employeeCount: partner.employeeCount,
    servicesOffered: partner.servicesOffered,
    pickupAvailable: partner.pickupAvailable,
    deliveryAvailable: partner.deliveryAvailable,
    operatingHours: partner.operatingHours,
    maxDailyCapacity: partner.maxDailyCapacity,
    logo: partner.logo,
    isVerified: partner.isVerified,
    accountStatus: partner.accountStatus,
    availability: partner.availability,
    averageRating: partner.averageRating,
    role: partner.role,
    createdAt: partner.createdAt,
  }
}

export function publicBusiness(business) {
  return {
    id: business._id.toString(),
    businessName: business.businessName,
    businessType: business.businessType,
    contactPerson: business.contactPerson,
    email: business.email,
    phone: business.phone,
    address: business.address,
    city: business.city,
    state: business.state,
    weeklyVolume: business.weeklyVolume,
    registrationNumber: business.registrationNumber,
    isVerified: business.isVerified,
    accountStatus: business.accountStatus,
    role: business.role,
    createdAt: business.createdAt,
  }
}

export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    emailNotifications: user.emailNotifications,
    createdAt: user.createdAt,
  }
}
