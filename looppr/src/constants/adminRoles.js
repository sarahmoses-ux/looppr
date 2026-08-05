// A missing adminRole (accounts seeded before this field existed) is
// grandfathered in as super_admin — mirrors requireAdminRole() on the
// backend (looppr-backend/middleware/auth.js), so the frontend gate never
// disagrees with what the API will actually allow.
export function effectiveAdminRole(user) {
  return user?.adminRole || 'super_admin'
}
