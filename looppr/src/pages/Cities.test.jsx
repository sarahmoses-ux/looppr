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

  it('links each city\'s "Join waitlist" card down to the on-page notify form', () => {
    render(
      <MemoryRouter>
        <Cities />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link', { name: /join waitlist/i })
    expect(links.length).toBeGreaterThan(0)
    links.forEach((link) => expect(link).toHaveAttribute('href', '#notify'))
  })

  it('joins the waitlist from the notify form and shows a confirmation', async () => {
    render(
      <MemoryRouter>
        <Cities />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /notify me/i }))

    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument()
    expect(joinWaitlist).toHaveBeenCalledWith('test@example.com')
  })
})
