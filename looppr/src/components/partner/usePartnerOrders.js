import { useState } from 'react'
import { usePartnerData } from '../../context/PartnerDataContext'
import { acceptOrder, rejectOrder, updateOrderStage } from '../../services/partnerDashboardApi'

// Shared order-action handlers used by the Incoming / Accepted / Active pages.
// Each action hits the API then reloads the shared dashboard data so every
// section stays in sync. Reject flows through a modal (reason required).
export function usePartnerOrders() {
  const { reload } = usePartnerData()
  const [rejectTarget, setRejectTarget] = useState(null)

  async function accept(order) {
    await acceptOrder(order._id)
    await reload()
  }

  async function advance(order, action) {
    await updateOrderStage(order._id, action)
    await reload()
  }

  function requestReject(order) {
    setRejectTarget(order)
  }

  async function confirmReject(reason) {
    await rejectOrder(rejectTarget._id, reason)
    setRejectTarget(null)
    await reload()
  }

  function cancelReject() {
    setRejectTarget(null)
  }

  return { accept, advance, requestReject, rejectTarget, confirmReject, cancelReject }
}
