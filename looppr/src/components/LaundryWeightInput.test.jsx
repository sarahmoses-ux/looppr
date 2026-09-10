import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import LaundryWeightInput from './LaundryWeightInput'

function Form() {
  const [value, setValue] = useState('')
  return <LaundryWeightInput value={value} onChange={event => setValue(event.target.value)} />
}

describe('exact laundry weight pricing', () => {
  it('updates the price as the entered pounds change', () => {
    render(<Form />)
    const weight = screen.getByLabelText('Exact laundry weight (lbs)')
    for (const [lbs, price] of [['10', '$15.90'], ['12', '$19.08'], ['22.5', '$35.78'], ['30', '$47.70'], ['', '$0.00']]) {
      fireEvent.change(weight, { target: { value: lbs } })
      expect(screen.getByLabelText('Laundry price')).toHaveTextContent(price)
    }
  })
})
