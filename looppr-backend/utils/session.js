import {
  businessRefreshCookieOptions,
  partnerRefreshCookieOptions,
  refreshCookieOptions,
  signAccessToken,
  signBusinessAccessToken,
  signBusinessRefreshToken,
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
