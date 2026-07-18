import { useState } from 'react'
import { useDriverData } from '../../context/DriverDataContext'
import {
  acceptDelivery,
  confirmDeliveryWeight,
  rejectDelivery,
  updateDeliveryStage,
} from '../../services/driverDashboardApi'

// Shared delivery-action handlers used by the Incoming / My Deliveries pages.
// Each action hits the API then reloads the shared dashboard data so every
// section stays in sync. Reject and weight-confirm each flow through a modal.
export function useDriverOrders() {
  const { reload } = useDriverData()
  const [rejectTarget, setRejectTarget] = useState(null)
  const [weightTarget, setWeightTarget] = useState(null)

  async function accept(delivery) {
    await acceptDelivery(delivery._id)
    await reload()
  }

  async function advance(delivery, action) {
    await updateDeliveryStage(delivery._id, action)
    await reload()
  }

  function requestReject(delivery) {
    setRejectTarget(delivery)
  }

  async function confirmReject(reason) {
    await rejectDelivery(rejectTarget._id, reason)
    setRejectTarget(null)
    await reload()
  }

  function cancelReject() {
    setRejectTarget(null)
  }

  function requestWeightConfirm(delivery) {
    setWeightTarget(delivery)
  }

  async function confirmWeight(actualWeightLbs) {
    await confirmDeliveryWeight(weightTarget._id, actualWeightLbs)
    setWeightTarget(null)
    await reload()
  }

  function cancelWeightConfirm() {
    setWeightTarget(null)
  }

  return {
    accept,
    advance,
    requestReject,
    rejectTarget,
    confirmReject,
    cancelReject,
    requestWeightConfirm,
    weightTarget,
    confirmWeight,
    cancelWeightConfirm,
  }
}
