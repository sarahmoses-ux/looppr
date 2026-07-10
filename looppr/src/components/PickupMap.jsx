import { useMemo, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { STATUS_LABELS } from '../constants/orderStatus'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Centered on the OKC metro — the Oklahoma launch service area.
const SERVICE_AREA_VIEW = { longitude: -97.5164, latitude: 35.4676, zoom: 9 }

// Falls back to bg-periwinkle for the two in-progress stages (see
// src/constants/orderStatus.js) — only the two terminal states get their
// own color here.
const STATUS_DOT = {
  ready_delivered: 'bg-success',
  cancelled: 'bg-red-500',
}

export default function PickupMap({ pickups }) {
  const mapRef = useRef(null)
  const [activeId, setActiveId] = useState(null)

  const points = useMemo(
    () =>
      pickups
        .filter((p) => p.location?.lat && p.location?.lng)
        .map((p) => ({ id: p._id, lat: p.location.lat, lng: p.location.lng, pickup: p })),
    [pickups],
  )

  const initialView = useMemo(() => {
    if (points.length === 0) return SERVICE_AREA_VIEW
    if (points.length === 1) return { longitude: points[0].lng, latitude: points[0].lat, zoom: 12 }

    const lats = points.map((p) => p.lat)
    const lngs = points.map((p) => p.lng)
    return {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: 10,
    }
  }, [points])

  const active = points.find((p) => p.id === activeId)

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-3xl border border-line bg-linen-soft text-center text-sm text-ink/50">
        Map unavailable — missing Mapbox token.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialView}
        style={{ height: 320, width: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-right" showCompass={false} />

        {points.map(({ id, lat, lng, pickup }) => (
          <Marker
            key={id}
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setActiveId(id)
            }}
          >
            <span
              className={`block h-4 w-4 cursor-pointer rounded-full border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${STATUS_DOT[pickup.status] || 'bg-periwinkle'}`}
            />
          </Marker>
        ))}

        {active && (
          <Popup
            longitude={active.lng}
            latitude={active.lat}
            anchor="top"
            onClose={() => setActiveId(null)}
            closeOnClick={false}
          >
            <div className="p-1 text-sm">
              <p className="font-semibold text-ink">{active.pickup.address.street}</p>
              <p className="text-ink/70">
                {active.pickup.address.city}, {active.pickup.address.state}{' '}
                {active.pickup.address.zip}
              </p>
              <p className="mt-1 text-ink/50">{STATUS_LABELS[active.pickup.status] || active.pickup.status}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
