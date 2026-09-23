// Klien REST API untuk dashboard admin.
// Sama seperti yang dipakai aplikasi pasien, supaya kedua aplikasi
// membaca satu sumber data (PRD §16, N-05).
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
    const err = new Error('Tidak dapat terhubung ke server API. Jalankan: npm run server')
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
