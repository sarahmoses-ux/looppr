import { Expo } from 'expo-server-sdk'

const expo = new Expo()

// Best-effort: a push failure must never fail the operation that triggered
// it (an order status change, an assignment) -- so this only ever logs.
export async function sendPush(token, { title, body, data }) {
  if (!Expo.isExpoPushToken(token)) {
    console.error('Skipping push -- not a valid Expo push token', token)
    return
  }

  try {
    await expo.sendPushNotificationsAsync([{ to: token, sound: 'default', title, body, data }])
  } catch (err) {
    console.error('Failed to send push notification', err)
  }
}
