// Free geocoding via OpenStreetMap's Nominatim service — no API key needed.
// Usage policy requires a descriptive User-Agent and caps requests at ~1/sec,
// which is why the result is stored on the pickup document instead of
// re-geocoding on every read.
export async function geocodeAddress(address) {
  const query = `${address.street}, ${address.city}, ${address.state} ${address.zip}`
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Looppr/1.0 (https://getlooppr.com)' },
  })
  if (!res.ok) throw new Error(`Geocoding failed with status ${res.status}`)

  const results = await res.json()
  if (!results.length) return null

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
}
