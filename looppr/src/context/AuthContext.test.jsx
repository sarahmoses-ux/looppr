import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../services/api', () => ({
  setAccessToken: vi.fn(),
  setAuthFailureHandler: vi.fn(),
}))

vi.mock('../services/authApi', () => ({
  changePassword: vi.fn(),
  fetchMe: vi.fn(),
  forgotPassword: vi.fn(),
  loginClient: vi.fn(),
  logout: vi.fn(),
  registerClient: vi.fn(),
  resendLoginOtp: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
  verifyLoginOtp: vi.fn(),
}))

vi.mock('../services/adminAuthApi', () => ({
  loginAdmin: vi.fn(),
  resendAdminLoginOtp: vi.fn(),
  verifyAdminLoginOtp: vi.fn(),
}))

function StatusProbe() {
  const { status } = useAuth()
  return <div data-testid="status">{status}</div>
}

describe('AuthProvider', () => {
  it('does not restore an authenticated session on a fresh visit', async () => {
    render(
      <AuthProvider>
        <StatusProbe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('guest'))
  })
})
