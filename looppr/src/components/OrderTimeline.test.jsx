import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderTimeline from './OrderTimeline'
import { ORDER_FLOW } from '../constants/orderStatus'

describe('OrderTimeline', () => {
  it('renders every stage in the lifecycle', () => {
    render(<OrderTimeline status="requested" />)
    ORDER_FLOW.forEach((step) => {
      expect(screen.getByText(step.label)).toBeInTheDocument()
    })
  })

  it('marks the current stage distinctly from completed/upcoming ones', () => {
    render(<OrderTimeline status="washing" />)
    const washing = screen.getByText('Washing')
    expect(washing.className).toContain('font-semibold')

    const upcoming = screen.getByText('Completed')
    expect(upcoming.className).not.toContain('font-semibold')
  })

  it('shows a cancelled callout and does not highlight any stage as current', () => {
    render(<OrderTimeline status="cancelled" />)
    expect(screen.getByText('This order was cancelled.')).toBeInTheDocument()

    ORDER_FLOW.forEach((step) => {
      expect(screen.getByText(step.label).className).not.toContain('font-semibold')
    })
  })

  it('treats an unknown status as "nothing completed yet" rather than crashing', () => {
    render(<OrderTimeline status="some_future_status_not_in_the_list" />)
    ORDER_FLOW.forEach((step) => {
      expect(screen.getByText(step.label)).toBeInTheDocument()
    })
  })
})
