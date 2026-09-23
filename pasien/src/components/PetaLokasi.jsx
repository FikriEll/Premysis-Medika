// =============================================================
// Peta pemilihan lokasi kirim (Checkout).
//
// Kenapa Leaflet + OpenStreetMap:
//   - Tidak butuh kunci API, jadi demo bisa jalan di mana saja.
//   - Ubin peta dan pencarian alamat gratis (Nominatim).
//
// Kenapa tidak memakai peta bawaan ponsel:
//   - Peta bawaan membuka aplikasi lain, jadi aplikasi tidak bisa
//     menghitung jarak ke klinik. Aturan pemilik klinik ("kalau
//     kejauhan tidak bisa pesan") hanya bisa ditegakkan kalau titik
//     lokasi benar-benar dibaca aplikasi.
//
// PENTING soal akurasi: pengguna bisa menggeser pin sesuka hati.
// Server menghitung ulang jaraknya saat checkout, jadi angka di
// layar ini hanya untuk memberi tahu, bukan penentu akhir.
// =============================================================
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { KLINIK } from '../lib/layanan'

// Pin sederhana dari token warna aplikasi, supaya tidak perlu berkas
// gambar dan tetap ikut mode gelap.
const ikonPin = (warna, inti) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:26px;height:26px;border-radius:9999px;
      background:${warna};border:4px solid ${inti};box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })

export default function PetaLokasi({ titikAwal, onPilih, tinggi = 260, interaktif = true }) {
  const wadah = useRef(null)
  const peta = useRef(null)
  const penandaKlinik = useRef(null)
  const penandaPilih = useRef(null)
  const [siap, setSiap] = useState(false)
  const simpanCallback = useRef(onPilih)
  simpanCallback.current = onPilih

  // Bikin peta sekali saja.
  useEffect(() => {
    if (!wadah.current || peta.current) return
    const p = L.map(wadah.current, {
      center: [KLINIK.lat, KLINIK.lng],
      zoom: 13,
      zoomControl: interaktif,
      dragging: interaktif,
      scrollWheelZoom: false,
      attributionControl: true,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Peta: OpenStreetMap',
      // Di mode gelap ubin disaring lewat CSS (.peta-ubin) supaya
      // tidak menyilaukan. Pin tetap warna asli karena digambar
      // terpisah dari ubin.
      className: 'peta-ubin',
    }).addTo(p)

    penandaKlinik.current = L.marker([KLINIK.lat, KLINIK.lng], {
      icon: ikonPin('#0b7566', '#ffffff'),
      title: 'Klinik Premysis Medika',
    })
      .addTo(p)
      .bindPopup('Klinik Premysis Medika')

    peta.current = p
    setSiap(true)

    if (interaktif) {
      p.on('click', (e) => simpanCallback.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }))
    }

    return () => {
      p.remove()
      peta.current = null
      penandaKlinik.current = null
      penandaPilih.current = null
    }
  }, [interaktif])

  // Pindahkan pin pilihan setiap titik berubah.
  useEffect(() => {
    const p = peta.current
    if (!p || !siap) return
    if (!titikAwal) {
      if (penandaPilih.current) {
        p.removeLayer(penandaPilih.current)
        penandaPilih.current = null
      }
      return
    }
    const pos = [titikAwal.lat, titikAwal.lng]
    if (!penandaPilih.current) {
      penandaPilih.current = L.marker(pos, {
        icon: ikonPin('#841f22', '#ffffff'),
        draggable: interaktif,
        title: 'Lokasi kirim',
      }).addTo(p)
      penandaPilih.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng()
        simpanCallback.current?.({ lat, lng })
      })
    } else {
      penandaPilih.current.setLatLng(pos)
    }
    p.setView(pos, Math.max(p.getZoom(), 13))
  }, [titikAwal, siap, interaktif])

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-strong">
      <div ref={wadah} style={{ height: tinggi, width: '100%' }} aria-label="Peta lokasi pengiriman" role="application" />
    </div>
  )
}
