import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminOrders from './AdminOrders'
import { fetchAllPickups } from '../../services/adminApi'

vi.mock('../../components/SEO', () => ({ default: () => null }))
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { role: 'admin', adminRole: 'support' } }) }))
vi.mock('../../context/ToastContext', () => ({ useToast: () => ({ showToast: vi.fn() }) }))
vi.mock('../../services/adminApi', () => ({
  fetchAllPickups: vi.fn(),
  fetchDriverApplications: vi.fn(async () => ({ drivers: [] })),
  fetchPartnerApplications: vi.fn(async () => ({ partners: [] })),
  updateOrderStatus: vi.fn(), assignDriverToOrder: vi.fn(), assignPartnerToOrder: vi.fn(),
}))

describe('previously placed admin orders', () => {
  it('renders full saved details for an older order without newer weight or pricing fields', async () => {
    fetchAllPickups.mockResolvedValueOnce({ pickups: [{
      _id: 'older-order', source: 'account',
      clientId: { name: 'Existing Client', email: 'existing@example.com', phone: '4055552222' },
      address: { street: '8 Original St', apartment: 'Unit 9', city: 'Tulsa', state: 'OK', zip: '74103' },
      deliveryAddress: { street: '90 Delivery St', apartment: 'Unit 12', city: 'Edmond', state: 'OK', zip: '73003' },
      preferredDate: '2026-07-01', window: 'morning', deliveryWindow: 'afternoon',
      loadSize: 'medium', status: 'request_received', paymentStatus: 'unpaid',
      notes: 'Please call the front desk.',
    }] })
    render(<MemoryRouter><AdminOrders /></MemoryRouter>)
    expect(await screen.findByText('older-order')).toBeInTheDocument()
    expect(screen.getByText('Unit 9')).toBeInTheDocument()
    expect(screen.getByText('90 Delivery St')).toBeInTheDocument()
    expect(screen.getByText('Unit 12')).toBeInTheDocument()
    expect(screen.getByText('4055552222')).toBeInTheDocument()
    expect(screen.getByText('Please call the front desk.')).toBeInTheDocument()
    expect(screen.getByText('Price not recorded')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Order status' })).toBeDisabled()
  })
})
