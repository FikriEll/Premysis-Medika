// =============================================================
// Klien REST API untuk dashboard admin klinik.
//
// Dashboard ini sekarang bicara ke SERVER APOTEK (Laravel + Sanctum)
// yang sama dengan aplikasi pasien, lewat prefiks /api/admin - jadi
// satu basis data melayani dua aplikasi (PRD §16, N-05).
//
// Di pengembangan, Vite mem-proxy /api ke http://127.0.0.1:8000
// (lihat vite.config.js), jadi cukup memakai path relatif.
// =============================================================
const BASE = import.meta.env?.VITE_API_URL || '/api/admin'

async function req(method, path, body) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const err = new Error(
      'Tidak dapat terhubung ke server API. Pastikan server apotek berjalan (php artisan serve).',
    )
    err.offline = true
    throw err
  }
  const teks = await res.text()
  let data = null
  if (teks) {
    try {
      data = JSON.parse(teks)
    } catch {
      data = { pesan: teks }
    }
  }
  if (!res.ok) {
    // Server memakai `pesan` (kontrak klinik) atau `message` (Laravel).
    const err = new Error(data?.pesan || data?.message || `Permintaan gagal (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  state: () => req('GET', '/state'),
  list: (k) => req('GET', '/' + k),
  create: (k, d) => req('POST', '/' + k, d),
  update: (k, id, d) => req('PATCH', `/${k}/${id}`, d),
  remove: (k, id) => req('DELETE', `/${k}/${id}`),
  loginAdmin: (email, password) => req('POST', '/auth/login-admin', { email, password }),
  ubahStatusPesanan: (id, status, idPengguna) =>
    req('PATCH', `/pesanan/${id}/status`, { status, id_pengguna: idPengguna }),
  konfirmasiPembayaran: (id, idPengguna, metode) =>
    req('POST', `/pesanan/${id}/pembayaran`, { id_pengguna: idPengguna, metode }),
  tolakPembayaran: (id, idPengguna, alasan) =>
    req('POST', `/pesanan/${id}/pembayaran`, { id_pengguna: idPengguna, tolak: true, alasan }),
  ubahStatusAppointment: (id, status, idPengguna) =>
    req('PATCH', `/appointment/${id}/status`, { status, id_pengguna: idPengguna }),
}

export default api
