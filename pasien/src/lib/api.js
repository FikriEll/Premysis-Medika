// =============================================================
// Klien REST API apotek - aplikasi pasien.
//
// Semua data berasal dari API apotek (Laravel + Sanctum) supaya
// katalog, stok, harga, dan pesanan selalu sama dengan yang dilihat
// petugas apotek. Autentikasi memakai token Bearer yang disimpan
// di localStorage perangkat.
// =============================================================

// Alamat API. Di pengembangan, Vite mem-proxy /api ke server apotek
// (lihat vite.config.js), jadi cukup memakai path relatif.
const BASE = import.meta.env?.VITE_API_URL || '/api'

const KUNCI_TOKEN = 'premysis_token'

export function ambilToken() {
  try {
    return window.localStorage.getItem(KUNCI_TOKEN) || null
  } catch {
    return null
  }
}

export function simpanToken(token) {
  try {
    if (token) window.localStorage.setItem(KUNCI_TOKEN, token)
    else window.localStorage.removeItem(KUNCI_TOKEN)
  } catch {
    /* localStorage bisa diblokir; abaikan. */
  }
}

// =============================================================
// Login dengan Google mengembalikan pengguna ke aplikasi ini
// dengan `google_token` (atau `google_error`) di query string.
//
// Fungsi ini dipanggil SEKALI sebelum aplikasi dirender, sehingga
// token sudah tersimpan di localStorage saat store memuat sesi.
// Query string langsung dibersihkan supaya token tidak tertinggal
// di address bar, riwayat peramban, atau bookmark pengguna.
// =============================================================
export function ambilTokenDariUrl() {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const token = url.searchParams.get('google_token')
  const galat = url.searchParams.get('google_error')
  if (!token && !galat) return null

  if (token) simpanToken(token)

  url.searchParams.delete('google_token')
  url.searchParams.delete('google_error')
  const bersih = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '') + url.hash
  window.history.replaceState({}, '', bersih)

  return { token, galat }
}

async function req(method, path, body, { kirimBerkas = false } = {}) {
  const headers = {}
  const token = ambilToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !kirimBerkas) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: kirimBerkas ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const err = new Error('Tidak dapat terhubung ke server apotek. Pastikan server API berjalan.')
    err.offline = true
    throw err
  }

  // Token kedaluwarsa/dicabut: bersihkan agar aplikasi kembali ke layar masuk.
  if (res.status === 401) {
    simpanToken(null)
  }

  const teks = await res.text()
  let data = null
  if (teks) {
    try {
      data = JSON.parse(teks)
    } catch {
      data = { message: teks }
    }
  }

  if (!res.ok) {
    // Laravel mengirim {message, errors:{field:[pesan]}}.
    let pesan = data?.message || `Permintaan gagal (${res.status})`
    const errors = data?.errors
    if (errors && typeof errors === 'object') {
      const pertama = Object.values(errors)[0]
      if (Array.isArray(pertama) && pertama[0]) pesan = pertama[0]
    }
    const err = new Error(pesan)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

const qs = (obj = {}) => {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, v)
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const api = {
  // --- Publik: katalog & konten ---
  home: () => req('GET', '/home'),
  settings: () => req('GET', '/settings'),
  halaman: () => req('GET', '/pages'),
  kontakInfo: () => req('GET', '/contact'),
  kirimKontak: (data) => req('POST', '/contact', data),
  testimoni: () => req('GET', '/testimonials'),
  promos: () => req('GET', '/promos'),
  validasiPromo: (code, subtotal) => req('POST', '/promos/validate', { code, subtotal }),
  faqs: () => req('GET', '/faqs'),
  blogs: (params) => req('GET', '/blogs' + qs(params)),
  blog: (slug) => req('GET', `/blogs/${slug}`),

  // --- Login dengan Google ---
  googleUrl: (redirect = '/') => req('GET', '/auth/google/redirect' + qs({ redirect })),

  kategori: () => req('GET', '/categories'),
  produk: (params) => req('GET', '/products' + qs(params)),
  produkDetail: (slug) => req('GET', `/products/${slug}`),

  metodeKirim: () => req('GET', '/shipping-methods'),
  hitungKirim: (shipping_method_id, weight_gram) =>
    req('POST', '/shipping/calculate', { shipping_method_id, weight_gram }),

  // --- Autentikasi ---
  masuk: (identifier, password) => req('POST', '/auth/login', { identifier, password }),
  daftar: (data) => req('POST', '/auth/register', data),
  saya: () => req('GET', '/auth/me'),
  ubahProfil: (data) => req('PATCH', '/auth/profile', data),
  ubahSandi: (data) => req('POST', '/auth/password', data),
  keluar: () => req('POST', '/auth/logout'),

  // --- Keranjang (di server) ---
  keranjang: () => req('GET', '/cart'),
  tambahKeranjang: (product_id, qty = 1) => req('POST', '/cart/add', { product_id, qty }),
  ubahJumlahKeranjang: (itemId, qty) => req('PATCH', `/cart/items/${itemId}`, { qty }),
  hapusItemKeranjang: (itemId) => req('DELETE', `/cart/items/${itemId}`),
  kosongkanKeranjang: () => req('DELETE', '/cart'),

  // --- Alamat ---
  alamat: () => req('GET', '/addresses'),
  tambahAlamat: (data) => req('POST', '/addresses', data),
  ubahAlamat: (id, data) => req('PUT', `/addresses/${id}`, data),
  hapusAlamat: (id) => req('DELETE', `/addresses/${id}`),
  alamatUtama: (id) => req('POST', `/addresses/${id}/default`),

  // --- Wishlist ---
  wishlist: () => req('GET', '/wishlist'),
  wishlistIds: () => req('GET', '/wishlist/ids'),
  toggleWishlist: (productId) => req('POST', `/wishlist/${productId}`),

  // --- Checkout & pesanan ---
  ringkasanCheckout: () => req('GET', '/checkout/summary'),
  checkout: (payload, { berkasResep } = {}) => {
    if (berkasResep) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v)
      })
      fd.append('prescription_file', berkasResep)
      return req('POST', '/checkout', fd, { kirimBerkas: true })
    }
    return req('POST', '/checkout', payload)
  },
  pesanan: (params) => req('GET', '/orders' + qs(params)),
  pesananDetail: (nomor) => req('GET', `/orders/${nomor}`),
  batalkanPesanan: (nomor) => req('POST', `/orders/${nomor}/cancel`),
  ajukanRetur: (nomor, payload, berkasBukti) => {
    const fd = new FormData()
    Object.entries(payload).forEach(([k, v]) => fd.append(k, v))
    if (berkasBukti) fd.append('evidence_image', berkasBukti)
    return req('POST', `/orders/${nomor}/returns`, fd, { kirimBerkas: true })
  },
  resep: () => req('GET', '/prescriptions'),

  // --- Pembayaran ---
  pembayaran: (nomor) => req('GET', `/orders/${nomor}/payment`),
  cekPembayaran: (nomor) => req('POST', `/orders/${nomor}/payment/check`),
}

export default api
