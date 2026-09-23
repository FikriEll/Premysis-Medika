// =============================================================
// Klien REST API - aplikasi pasien.
// Semua data berasal dari server bersama supaya konsisten dengan
// dashboard admin (PRD §16, N-05). Tidak ada data yang disimpan
// sendiri di sisi pasien.
// =============================================================

const BASE = '/api'

async function req(method, path, body) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const err = new Error('Tidak dapat terhubung ke server. Pastikan server API berjalan (npm run server).')
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
    const err = new Error(data?.pesan || `Permintaan gagal (${res.status})`)
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

  loginPasien: (identitas, password) => req('POST', '/auth/login-pasien', { identitas, password }),
  registrasi: (data) => req('POST', '/auth/registrasi', data),

  checkout: (data) => req('POST', '/checkout', data),
  hitungPengiriman: (lat, lng) => req('POST', '/pengiriman/hitung', { lat, lng }),
  bayarPesanan: (id, data) => req('POST', `/pesanan/${id}/bayar-pasien`, data),
  batalkanPesanan: (id, idPasien) => req('POST', `/pesanan/${id}/batal-pasien`, { id_pasien: idPasien }),
  bacaNotifikasi: (id) => req('PATCH', `/notifikasi/${id}`, { status_baca: true }),
  bacaSemuaNotifikasi: (idPasien) => req('POST', '/notifikasi/baca-semua', { id_pasien: idPasien }),
}

export default api
