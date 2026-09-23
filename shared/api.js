// =============================================================
// Klien REST API bersama - dipakai dashboard admin DAN app pasien.
//
// Kedua aplikasi berjalan di port berbeda, jadi tidak bisa berbagi
// localStorage (beda origin). Semua data karena itu lewat satu API
// supaya konsisten - PRD §16 (REST API) & N-05 (konsistensi data).
// =============================================================

const BASE = '/api'

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  const teks = await res.text()
  if (teks) {
    try {
      data = JSON.parse(teks)
    } catch {
      data = { pesan: teks }
    }
  }
  if (!res.ok) {
    const err = new Error(data?.pesan || `Permintaan gagal (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  // --- Snapshot & CRUD generik ---
  state: () => req('GET', '/state'),
  list: (koleksi) => req('GET', '/' + koleksi),
  create: (koleksi, data) => req('POST', '/' + koleksi, data),
  update: (koleksi, id, data) => req('PATCH', `/${koleksi}/${id}`, data),
  remove: (koleksi, id) => req('DELETE', `/${koleksi}/${id}`),

  // --- Autentikasi ---
  loginPasien: (email, password) => req('POST', '/auth/login-pasien', { email, password }),
  loginAdmin: (email, password) => req('POST', '/auth/login-admin', { email, password }),
  registrasi: (data) => req('POST', '/auth/registrasi', data),

  // --- Aksi beraturan bisnis ---
  checkout: (data) => req('POST', '/checkout', data),
  ubahStatusPesanan: (id, status, idPengguna) =>
    req('PATCH', `/pesanan/${id}/status`, { status, id_pengguna: idPengguna }),
  batalkanPesananPasien: (id, idPasien) =>
    req('POST', `/pesanan/${id}/batal-pasien`, { id_pasien: idPasien }),
  ubahStatusAppointment: (id, status, idPengguna) =>
    req('PATCH', `/appointment/${id}/status`, { status, id_pengguna: idPengguna }),
  konfirmasiPembayaran: (id, idPengguna, metode) =>
    req('POST', `/pesanan/${id}/pembayaran`, { id_pengguna: idPengguna, metode }),
  bacaNotifikasi: (id) => req('PATCH', `/notifikasi/${id}`, { status_baca: true }),
  bacaSemuaNotifikasi: (idPasien) => req('POST', '/notifikasi/baca-semua', { id_pasien: idPasien }),
  tambahJadwalVaksin: (data) => req('POST', '/jadwalVaksin', data),
  generateJadwalBayi: (idBayi) => req('POST', `/bayi/${idBayi}/generate-jadwal`, {}),
}

export default api
