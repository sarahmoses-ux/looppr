import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Cities from './Cities'

// vi.mock factories are hoisted above imports, so the mock fn must be too
// (a plain top-level `const` here hits a temporal-dead-zone ReferenceError).
const { joinWaitlist } = vi.hoisted(() => ({ joinWaitlist: vi.fn() }))

vi.mock('../services/waitlistApi', () => ({
  joinWaitlist,
}))

describe('Cities waitlist flow', () => {
  beforeEach(() => {
    joinWaitlist.mockReset()
    joinWaitlist.mockResolvedValue({})
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ city: 'Edmond', region_code: 'OK' }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens a modal for notify me when Join waitlist is clicked', async () => {
    render(
      <MemoryRouter>
        <Cities />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: /join waitlist/i })[0])

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/be the first to know/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument()
  })
})
