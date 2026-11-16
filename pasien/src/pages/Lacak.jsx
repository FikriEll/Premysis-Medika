import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

export default function Lacak() {
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState(null)

  useEffect(() => {
    // Fetch latest order with tracking
    const fetchTracking = async () => {
      try {
        const res = await fetch('/api/orders')
        const orders = await res.json()
        if (orders.length > 0) {
          const latest = orders[0]
          setOrder(latest)
          // Simulate realtime courier position
          setTracking({
            lat: -6.3980,
            lng: 106.7875,
            status: 'Sedang dikirim',
            estimasi: '30 menit',
            driver: 'Aji K.',
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchTracking()
    const interval = setInterval(fetchTracking, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Lacak Pengiriman</h1>

      {order && (
        <>
          <div className="rounded-lg border border-hairline p-4">
            <p className="text-sm text-muted">Pesanan {order.nomor_pesanan}</p>
            <p className="text-lg font-semibold">{order.status}</p>
            {tracking && (
              <>
                <p className="mt-2 text-base font-medium">{tracking.status}</p>
                <p className="text-sm text-muted">Driver: {tracking.driver}</p>
                <p className="text-sm">Estimasi: {tracking.estimasi}</p>
              </>
            )}
          </div>

          {tracking && (
            <div className="h-96 w-full rounded-lg border border-hairline overflow-hidden">
              <MapContainer center={[tracking.lat, tracking.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[tracking.lat, tracking.lng]}>
                  <Popup>{tracking.driver} sedang dalam perjalanan</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </>
      )}

      {!order && (
        <div className="rounded-lg border border-hairline p-4 text-center text-muted">
          Tidak ada pesanan yang sedang dikirim
        </div>
      )}
    </div>
  )
}
