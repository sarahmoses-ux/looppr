import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastContext'

function ToastTrigger() {
  const { showToast } = useToast()
  return (
    <>
      <button onClick={() => showToast('Saved.')}>show success</button>
      <button onClick={() => showToast('Failed.', 'error')}>show error</button>
    </>
  )
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <ToastTrigger />
    </ToastProvider>,
  )
}

describe('ToastContext', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws if useToast is used outside a ToastProvider', () => {
    function Broken() {
      useToast()
      return null
    }
    // Suppress the expected React error-boundary console noise for this one.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Broken />)).toThrow('useToast must be used within a ToastProvider')
    spy.mockRestore()
  })

  it('renders a toast on showToast and lets it be dismissed manually', () => {
    renderWithProvider()

    fireEvent.click(screen.getByText('show success'))
    expect(screen.getByRole('status')).toHaveTextContent('Saved.')

    fireEvent.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('auto-dismisses after the timeout', () => {
    vi.useFakeTimers()
    renderWithProvider()

    fireEvent.click(screen.getByText('show success'))
    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('supports multiple simultaneous toasts', () => {
    renderWithProvider()

    fireEvent.click(screen.getByText('show success'))
    fireEvent.click(screen.getByText('show error'))

    const toasts = screen.getAllByRole('status')
    expect(toasts).toHaveLength(2)
    expect(toasts[0]).toHaveTextContent('Saved.')
    expect(toasts[1]).toHaveTextContent('Failed.')
  })
})
