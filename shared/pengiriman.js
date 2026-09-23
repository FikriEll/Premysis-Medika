// =============================================================
// Aturan pengiriman obat - Premysis Medika
//
// Satu sumber kebenaran untuk server DAN aplikasi pasien, supaya
// angka jarak, tarif, dan keputusan "bisa dikirim atau tidak" tidak
// pernah berbeda antara yang ditampilkan dan yang ditegakkan.
//
// Aturan yang diminta pemilik klinik:
//   1. Ongkos kirim dihitung dari JARAK, bukan tarif tetap.
//   2. Kalau lokasi masih dekat (dalam kota), kirim pakai kurir
//      instan biasa.
//   3. Kalau lokasi jauh (luar kota), kirim pakai Grab atau Gojek
//      (kurir instan antar-kota), bukan kurir biasa.
//   4. Kalau perjalanannya butuh LEBIH DARI 1 HARI, berarti
//      kejauhan - pesanan tidak boleh dibuat.
//
// Catatan penting soal angka: tarif di bawah ini adalah TARIF
// SIMULASI untuk demo. Tarif Grab/Gojek yang sebenarnya hanya bisa
// didapat lewat API resmi mereka (butuh akun mitra dan kunci API
// yang tidak ada di lingkungan ini). Karena itu:
//   - perhitungan jarak & keputusan "kejauhan" ditegakkan di server;
//   - tarif ditulis sebagai estimasi dan diberi label jelas di UI,
//     bukan diam-diam dianggap harga pasti.
// =============================================================

// Koordinat klinik (Depok, Jawa Barat) - dipakai sebagai titik nol.
// Nilainya sama dengan alamat di pasien/src/lib/layanan.js.
export const KLINIK_KOORDINAT = { lat: -6.4025, lng: 106.7942 }

// Radius "dalam kota" dalam kilometer. Di bawah ini dianggap masih
// terjangkau kurir instan biasa (pengiriman di hari yang sama).
export const RADIUS_DALAM_KOTA_KM = 12

// Kecepatan rata-rata kurir instan di jalan kota (km/jam). Dipakai
// hanya untuk MENGESTIMASI lama perjalanan, bukan janji waktu.
export const KECEPATAN_KURIR_KM_PER_JAM = 25

// Batas waktu tempuh sebelum pesanan dianggap KEJAUHAN (jam).
// 24 jam = lebih dari 1 hari, sesuai aturan pemilik klinik.
export const BATAS_JAM = 24

// Tarif simulasi.
export const TARIF = {
  // Kurir instan dalam kota: biaya buka + tarif per km.
  dalamKota: { biayaDasar: 10000, perKm: 2500 },
  // Kurir instan antar-kota (Grab/Gojek antar kota): lebih mahal.
  luarKota: { biayaDasar: 20000, perKm: 4000 },
}

// -----------------------------------------------------------------
// Hitung jarak dua titik di permukaan bumi (rumus haversine).
// Hasil dalam kilometer, dibulatkan 1 desimal.
// -----------------------------------------------------------------
export function jarakKm(a, b) {
  const R = 6371 // jari-jari bumi (km)
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  const km = 2 * R * Math.asin(Math.sqrt(x))
  return Math.round(km * 10) / 10
}

// -----------------------------------------------------------------
// Tentukan cara kirim, tarif, dan estimasi waktu dari jarak.
//
// Mengembalikan objek siap pakai untuk UI:
//   { boleh, jarak_km, zona, label_zona, kurir, estimasi_jam,
//     estimasi_hari, ongkir, alasan, saran }
//
// `boleh: false` berarti pesanan TIDAK boleh dibuat.
// -----------------------------------------------------------------
export function hitungPengiriman(titikTujuan) {
  if (!titikTujuan || typeof titikTujuan.lat !== 'number' || typeof titikTujuan.lng !== 'number') {
    return {
      boleh: false,
      alasan: 'Lokasi belum diketahui. Silakan pilih lokasi pengiriman di peta.',
      saran: 'Ketuk peta atau tombol "Pakai Lokasi Saya" untuk menentukan titik kirim.',
    }
  }

  const jarak = jarakKm(KLINIK_KOORDINAT, titikTujuan)

  // Estimasi lama perjalanan. Minimal 1 jam supaya tidak terkesan
  // "langsung sampai" untuk jarak yang sangat dekat.
  const estimasiJam = Math.max(1, Math.round((jarak / KECEPATAN_KURIR_KM_PER_JAM) * 10) / 10)
  const estimasiHari = Math.max(1, Math.ceil(estimasiJam / 24))

  const dalamKota = jarak <= RADIUS_DALAM_KOTA_KM
  const zona = dalamKota ? 'dalam-kota' : 'luar-kota'
  const kurir = dalamKota ? 'Kurir instan klinik' : 'Grab / Gojek antar kota'
  const labelZona = dalamKota ? 'Dalam kota' : 'Luar kota'
  const tarif = dalamKota ? TARIF.dalamKota : TARIF.luarKota
  const ongkir = Math.round((tarif.biayaDasar + tarif.perKm * jarak) / 500) * 500

  // Aturan pemilik klinik: lebih dari 1 hari perjalanan = kejauhan.
  if (estimasiJam > BATAS_JAM) {
    return {
      boleh: false,
      jarak_km: jarak,
      zona,
      label_zona: labelZona,
      kurir,
      estimasi_jam: estimasiJam,
      estimasi_hari: estimasiHari,
      ongkir,
      alasan:
        `Lokasi ini sekitar ${jarak} km dari klinik dan perjalanannya ` +
        `diperkirakan ${estimasiHari} hari. Pengiriman hanya melayani ` +
        `alamat yang bisa sampai dalam 1 hari.`,
      saran:
        'Silakan pilih "Ambil di Klinik" (tanpa biaya kirim), atau ubah ' +
        'lokasi kirim ke alamat yang lebih dekat dengan klinik.',
    }
  }

  return {
    boleh: true,
    jarak_km: jarak,
    zona,
    label_zona: labelZona,
    kurir,
    estimasi_jam: estimasiJam,
    estimasi_hari: estimasiHari,
    ongkir,
    alasan: '',
    saran: '',
  }
}

// -----------------------------------------------------------------
// Validasi dipakai server saat checkout: menolak pesanan kirim ke
// lokasi yang kejauhan. Ditegakkan di server supaya tidak bisa
// dilewati dari sisi aplikasi.
// -----------------------------------------------------------------
export function validasiPengiriman(metodeAmbil, titikTujuan) {
  if (metodeAmbil !== 'Dikirim') return { boleh: true, ongkir: 0, info: null }
  const hasil = hitungPengiriman(titikTujuan)
  if (!hasil.boleh) return { boleh: false, pesan: `${hasil.alasan} ${hasil.saran}`, info: hasil }
  return { boleh: true, ongkir: hasil.ongkir, info: hasil }
}
