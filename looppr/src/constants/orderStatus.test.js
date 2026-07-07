import { describe, expect, it } from 'vitest'
import { ALL_STATUSES, ORDER_FLOW, STATUS_LABELS, TERMINAL_STATUSES } from './orderStatus'

describe('order status constants', () => {
  it('ALL_STATUSES is ORDER_FLOW plus exactly one extra entry: cancelled', () => {
    expect(ALL_STATUSES.length).toBe(ORDER_FLOW.length + 1)
    expect(ALL_STATUSES.map((s) => s.value)).toContain('cancelled')
  })

  it('has no duplicate status values', () => {
    const values = ALL_STATUSES.map((s) => s.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('STATUS_LABELS has a label for every status value', () => {
    ALL_STATUSES.forEach((s) => {
      expect(STATUS_LABELS[s.value]).toBe(s.label)
    })
  })

  it('every terminal status is a real status value', () => {
    const values = ALL_STATUSES.map((s) => s.value)
    TERMINAL_STATUSES.forEach((t) => {
      expect(values).toContain(t)
    })
  })
})
