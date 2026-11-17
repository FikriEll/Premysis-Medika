// =============================================================
// SERVER REST API - Premysis Medika
//
// Satu basis data dalam memori, satu API, dipakai dua aplikasi:
//   1. Dashboard Admin (web)  - port 5173
//   2. Aplikasi Pasien (web)  - port 5174
//
// Karena keduanya beda origin, localStorage tidak bisa dibagi.
// Semua data karena itu lewat API ini - PRD §16, N-05.
//
// Aturan bisnis yang ditegakkan DI SINI (bukan di UI):
//   BR-02 mesin status pesanan      BR-06 ambang stok minimum
//   BR-03 konfirmasi pembayaran     BR-07 generate jadwal vaksin
//   BR-04 pengurangan stok          BR-08 trigger notifikasi
//   BR-05 produk wajib resep        BR-09 audit trail
//   BR-10 validasi registrasi
//
// Jalankan: npm run server   (lihat package.json di root)
// =============================================================

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedDatabase } from '../shared/seed.js'
import { waktuDemo, DEMO_TANGGAL } from '../shared/format.js'
import { hitungPengiriman, validasiPengiriman, KLINIK_KOORDINAT } from '../shared/pengiriman.js'
import { BANK, nominalBayar } from '../shared/pembayaran.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')

const PORT = Number(process.env.PORT || 4000)
const HOST = process.env.HOST || '127.0.0.1'

// -------------------------------------------------------------
// "Basis data" dalam memori
// -------------------------------------------------------------
let db = seedDatabase()
const counter = { next: 1000 }

const idBerikut = () => ++counter.next
const sekarang = () => waktuDemo()

function catat(aksi, entitas, idEntitas, idPengguna = null) {
  db.logAktivitas.unshift({
    id: idBerikut(),
    id_pengguna: idPengguna,
    aksi,
    entitas,
    id_entitas: idEntitas,
    waktu: sekarang(),
  })
}

function notifikasiUntuk(idPasien, judul, pesan, jenis) {
  db.notifikasi.unshift({
    id: idBerikut(),
    id_pasien: idPasien,
    judul,
    pesan,
    jenis,
    status_baca: false,
    tanggal: sekarang(),
  })
}

// -------------------------------------------------------------
// Aturan bisnis
// -------------------------------------------------------------

// BR-02: mesin status pesanan kanonik.
const TRANSISI_PESANAN = {
  'Menunggu Pembayaran': ['Dibayar', 'Dibatalkan'],
  Dibayar: ['Diproses', 'Dibatalkan'],
  Diproses: ['Siap Diambil', 'Dikirim', 'Dibatalkan'],
  'Siap Diambil': ['Selesai'],
  Dikirim: ['Selesai'],
  Selesai: [],
  Dibatalkan: [],
}

function bolehTransisi(dari, ke) {
  return (TRANSISI_PESANAN[dari] || []).includes(ke)
}

// BR-04: stok berkurang HANYA saat pesanan masuk "Diproses".
function kurangiStokPesanan(pesanan, idPengguna) {
  for (const d of pesanan.detail || []) {
    const pr = db.produk.find((x) => x.id === d.id_produk)
    if (!pr) continue
    const sebelum = pr.stok
    pr.stok = Math.max(0, pr.stok - d.jumlah)
    db.stokMutasi.unshift({
      id: idBerikut(),
      id_produk: pr.id,
      jenis: 'keluar',
      jumlah: d.jumlah,
      tanggal: DEMO_TANGGAL,
      keterangan: `Pesanan ${pesanan.nomor_pesanan}`,
      sumber: 'e-commerce',
      id_pengguna: idPengguna,
    })
    void sebelum
  }
}

// BR-04: saat checkout, stok hanya DICEK (belum dikurangi).
function validasiStokCheckout(items) {
  const masalah = []
  for (const it of items) {
    const pr = db.produk.find((x) => x.id === it.id_produk)
    if (!pr) {
      masalah.push(`Produk #${it.id_produk} tidak ditemukan.`)
      continue
    }
    if (pr.status !== 'Aktif') {
      masalah.push(`${pr.nama} sedang tidak dijual.`)
      continue
    }
    if (it.jumlah > pr.stok) {
      masalah.push(`Stok ${pr.nama} hanya ${pr.stok} ${pr.satuan}, Anda minta ${it.jumlah}.`)
    }
  }
  return masalah
}

// BR-05: produk wajib_resep hanya boleh checkout bila tertaut resep aktif pasien.
function validasiResep(idPasien, items) {
  const masalah = []
  const idResepAktif = new Set(
    db.resep
      .filter((r) => r.id_pasien === idPasien && r.status === 'Aktif')
      .flatMap((r) => (r.detail || []).map((d) => d.id_produk))
      .filter(Boolean),
  )
  for (const it of items) {
    const pr = db.produk.find((x) => x.id === it.id_produk)
    if (pr && pr.wajib_resep && !idResepAktif.has(pr.id)) {
      masalah.push(`${pr.nama} memerlukan resep dokter yang masih aktif.`)
    }
  }
  return masalah
}

// BR-07: generate jadwal vaksin dari master berdasarkan tanggal lahir bayi.
function generateJadwalVaksin(idBayi) {
  const bayi = db.bayi.find((b) => b.id === Number(idBayi))
  if (!bayi) return []
  const dibuat = []
  const lahir = new Date(bayi.tanggal_lahir + 'T00:00:00')
  for (const jv of db.jenisVaksin) {
    const sudah = db.jadwalVaksin.some(
      (j) => j.id_bayi === bayi.id && j.id_jenis_vaksin === jv.id,
    )
    if (sudah) continue
    const tgl = new Date(lahir)
    tgl.setMonth(tgl.getMonth() + jv.usia_bulan)
    const row = {
      id: idBerikut(),
      id_bayi: bayi.id,
      id_jenis_vaksin: jv.id,
      nama_vaksin: jv.nama_vaksin,
      tanggal_terjadwal: tgl.toISOString().slice(0, 10),
      tanggal_diberikan: null,
      status: 'Terjadwal',
    }
    db.jadwalVaksin.push(row)
    dibuat.push(row)
  }
  return dibuat
}

// BR-08: trigger notifikasi saat status pesanan berubah.
function notifikasiStatusPesanan(pesanan, status) {
  const teks = {
    Dibayar: `Pembayaran pesanan ${pesanan.nomor_pesanan} telah dikonfirmasi.`,
    Diproses: `Pesanan ${pesanan.nomor_pesanan} sedang diproses.`,
    'Siap Diambil': `Pesanan ${pesanan.nomor_pesanan} siap diambil di klinik.`,
    Dikirim: `Pesanan ${pesanan.nomor_pesanan} sedang dikirim.`,
    Selesai: `Pesanan ${pesanan.nomor_pesanan} telah selesai. Terima kasih.`,
    Dibatalkan: `Pesanan ${pesanan.nomor_pesanan} telah dibatalkan.`,
  }[status]
  if (teks) notifikasiUntuk(pesanan.id_pasien, `Pesanan ${status}`, teks, 'pesanan')
}

// -------------------------------------------------------------
// Helper HTTP
// -------------------------------------------------------------
function kirim(res, kode, data) {
  const body = JSON.stringify(data ?? null)
  res.writeHead(kode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(body)
}

function bacaBody(req) {
  return new Promise((selesai) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 1e6) req.destroy()
    })
    req.on('end', () => {
      if (!raw) return selesai({})
      try {
        selesai(JSON.parse(raw))
      } catch {
        selesai({})
      }
    })
  })
}

// -------------------------------------------------------------
// Router API
// -------------------------------------------------------------
async function tanganiApi(req, res, url) {
  const jalur = url.pathname.replace(/^\/api/, '') || '/'
  const bagian = jalur.split('/').filter(Boolean)
  const metode = req.method
  const body = ['POST', 'PATCH', 'PUT'].includes(metode) ? await bacaBody(req) : {}

  // --- Snapshot seluruh data (dipakai saat aplikasi dimuat) ---
  if (bagian.length === 1 && bagian[0] === 'state' && metode === 'GET') {
    return kirim(res, 200, db)
  }

  // --- Home page katalog (pasien app) ---
  if (bagian.length === 1 && bagian[0] === 'home' && metode === 'GET') {
    const promoAktif = db.promo.filter((p) => p.status === 'Aktif').map((p) => ({
      id: p.id,
      name: p.nama,
      description: p.deskripsi,
      code: p.kode_promo,
      type: p.diskon_persen ? 'percent' : 'nominal',
      value: p.diskon_persen || p.diskon_nominal,
      min_purchase: p.minimal_pembelian,
      start_date: p.tanggal_mulai,
      end_date: p.tanggal_selesai,
    }))
    return kirim(res, 200, {
      categories: db.kategori,
      featured_products: db.produk.filter((p) => p.status === 'Aktif').slice(0, 6),
      latest_products: db.produk.filter((p) => p.status === 'Aktif').slice(0, 6),
      popular_products: db.produk.filter((p) => p.status === 'Aktif').slice(0, 6),
      promos: promoAktif,
      testimonials: [],
      faqs: [],
      promises: [],
      settings: null,
    })
  }

  // --- Promo list & validation (pasien app) ---
  if (bagian[0] === 'promos') {
    if (metode === 'GET') {
      const promoAktif = db.promo.filter((p) => p.status === 'Aktif').map((p) => ({
        id: p.id,
        name: p.nama,
        description: p.deskripsi,
        code: p.kode_promo,
        type: p.diskon_persen ? 'percent' : 'nominal',
        value: p.diskon_persen || p.diskon_nominal,
        min_purchase: p.minimal_pembelian,
        start_date: p.tanggal_mulai,
        end_date: p.tanggal_selesai,
      }))
      return kirim(res, 200, { data: promoAktif })
    }
    if (bagian[1] === 'validate' && metode === 'POST') {
      const { code, subtotal } = JSON.parse(isiReq)
      const p = db.promo.find((x) => x.kode_promo === code && x.status === 'Aktif')
      if (!p || (p.minimal_pembelian && subtotal < p.minimal_pembelian)) {
        return kirim(res, 400, { error: 'Kode promo tidak valid atau tidak memenuhi syarat.' })
      }
      return kirim(res, 200, {
        valid: true,
        discount: p.diskon_persen ? (subtotal * p.diskon_persen) / 100 : p.diskon_nominal,
      })
    }
  }

  // --- Autentikasi ---
  if (bagian[0] === 'auth') {
    // Pasien login (R-01)
    //
    // Brief aplikasi pasien §6: "Login harus sangat sederhana",
    // inputnya Nomor HP + Password. Pengguna lansia lebih hafal nomor
    // HP daripada alamat email, jadi kita terima keduanya:
    // nomor HP (cocokkan dengan no_wa, tanda baca diabaikan) ATAU
    // email (untuk kompatibilitas akun lama & dashboard admin).
    if (bagian[1] === 'login-pasien' && metode === 'POST') {
      const identitas = String(body.identitas || body.email || body.no_hp || '').trim()
      if (!identitas) {
        return kirim(res, 400, { pesan: 'Nomor HP wajib diisi.' })
      }
      const angka = (s) => String(s || '').replace(/[^0-9]/g, '')
      const angkaInput = angka(identitas)
      const p = db.pasien.find(
        (x) =>
          String(x.email).toLowerCase() === identitas.toLowerCase() ||
          (angkaInput.length >= 8 && angka(x.no_wa) === angkaInput),
      )
      if (!p) return kirim(res, 404, { pesan: 'Nomor HP belum terdaftar. Silakan daftar dahulu.' })
      if (!p.status_aktif) return kirim(res, 403, { pesan: 'Akun Anda tidak aktif. Hubungi klinik.' })
      if (p.password !== body.password) return kirim(res, 401, { pesan: 'Password salah.' })
      // Password tidak pernah dikirim balik ke aplikasi.
      const { password: _sandi, ...pasienAman } = p
      return kirim(res, 200, { token: `token_${p.id}`, user: pasienAman })
    }

    // Alias untuk pasien app yang pakai /auth/login (bukan /auth/login-pasien)
    if (bagian[1] === 'login' && metode === 'POST' && !bagian[2]) {
      const identitas = String(body.identifier || body.identitas || body.email || body.no_hp || '').trim()
      if (!identitas) {
        return kirim(res, 400, { pesan: 'Email atau nomor HP wajib diisi.' })
      }
      const angka = (s) => String(s || '').replace(/[^0-9]/g, '')
      const angkaInput = angka(identitas)
      const p = db.pasien.find(
        (x) =>
          String(x.email).toLowerCase() === identitas.toLowerCase() ||
          (angkaInput.length >= 8 && angka(x.no_wa) === angkaInput),
      )
      if (!p) return kirim(res, 404, { pesan: 'Email/nomor HP atau kata sandi tidak cocok.' })
      if (!p.status_aktif) return kirim(res, 403, { pesan: 'Akun Anda tidak aktif. Hubungi klinik.' })
      if (p.password !== body.password) return kirim(res, 401, { pesan: 'Email/nomor HP atau kata sandi tidak cocok.' })
      const { password: _sandi, ...pasienAman } = p
      return kirim(res, 200, { token: `token_${p.id}`, user: pasienAman })
    }
    // Admin login (R-02/R-03)
    if (bagian[1] === 'login-admin' && metode === 'POST') {
      const u = db.users.find(
        (x) => String(x.email).toLowerCase() === String(body.email || '').toLowerCase(),
      )
      if (!u) return kirim(res, 404, { pesan: 'Email tidak terdaftar.' })
      if (!u.status_aktif) return kirim(res, 403, { pesan: 'Akun tidak aktif. Hubungi Bidan.' })
      if (!body.password || String(body.password).length < 1) {
        return kirim(res, 400, { pesan: 'Password wajib diisi.' })
      }
      return kirim(res, 200, u)
    }
    // Registrasi pasien - BR-10
    if (bagian[1] === 'registrasi' && metode === 'POST') {
      const { nama, nik, email, no_wa, alamat, tanggal_lahir, jenis_kelamin, password } = body
      if (!nama || !nik || !email || !password) {
        return kirim(res, 400, { pesan: 'Nama, NIK, email, dan password wajib diisi.' })
      }
      if (db.pasien.some((p) => p.nik === nik)) {
        return kirim(res, 409, { pesan: 'NIK sudah terdaftar.' })
      }
      if (db.pasien.some((p) => String(p.email).toLowerCase() === String(email).toLowerCase())) {
        return kirim(res, 409, { pesan: 'Email sudah terdaftar.' })
      }
      // BR-10: password minimal 8 karakter, kombinasi huruf & angka.
      if (String(password).length < 8) {
        return kirim(res, 400, { pesan: 'Password minimal 8 karakter.' })
      }
      if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return kirim(res, 400, { pesan: 'Password harus kombinasi huruf dan angka.' })
      }
      if (no_wa && !/^[0-9+\-\s()]{8,20}$/.test(String(no_wa))) {
        return kirim(res, 400, { pesan: 'Nomor WhatsApp tidak valid.' })
      }
      const baru = {
        id: idBerikut(),
        nama,
        nik,
        email,
        password,
        tanggal_lahir: tanggal_lahir || null,
        jenis_kelamin: jenis_kelamin || 'P',
        no_wa: no_wa || '',
        alamat: alamat || '',
        tanggal_registrasi: DEMO_TANGGAL,
        status_aktif: true,
      }
      db.pasien.push(baru)
      catat('Registrasi pasien baru', 'Pasien', baru.id)
      notifikasiUntuk(baru.id, 'Selamat Datang di Premysis Medika',
        'Akun Anda berhasil dibuat. Anda kini dapat membuat janji temu dan berbelanja produk kesehatan.', 'info')
      return kirim(res, 201, baru)
    }
    return kirim(res, 404, { pesan: 'Endpoint autentikasi tidak dikenal.' })
  }

  // --- Pengiriman: hitung jarak & ongkir dari lokasi pasien ---
  //
  // Dipakai halaman Checkout. Perhitungannya ditaruh di server supaya
  // aturan "kejauhan tidak boleh dipesan" tidak bisa dilewati dari
  // sisi aplikasi (pasien tidak bisa memalsukan jarak).
  //
  // POST { lat, lng } -> info zona, kurir, jarak, ongkir, estimasi.
  if (bagian[0] === 'pengiriman' && bagian[1] === 'hitung' && metode === 'POST') {
    const titik = { lat: Number(body.lat), lng: Number(body.lng) }
    if (!Number.isFinite(titik.lat) || !Number.isFinite(titik.lng)) {
      return kirim(res, 400, { pesan: 'Lokasi tidak valid.' })
    }
    return kirim(res, 200, { klinik: KLINIK_KOORDINAT, ...hitungPengiriman(titik) })
  }

  // --- Checkout (BR-04 validasi stok, BR-05 wajib resep) ---
  if (bagian[0] === 'checkout' && metode === 'POST') {
    const { id_pasien, items, metode_ambil, metode_bayar, alamat_pengiriman, titik_tujuan } = body
    if (!id_pasien) return kirim(res, 400, { pesan: 'Pasien tidak dikenal.' })
    if (!Array.isArray(items) || items.length === 0) {
      return kirim(res, 400, { pesan: 'Keranjang masih kosong.' })
    }
    const masalahStok = validasiStokCheckout(items)
    if (masalahStok.length) return kirim(res, 409, { pesan: masalahStok.join(' ') })
    const masalahResep = validasiResep(id_pasien, items)
    if (masalahResep.length) return kirim(res, 409, { pesan: masalahResep.join(' ') })

    // Aturan pengiriman ditegakkan DI SINI, bukan hanya di UI:
    // ongkir dihitung dari jarak, dan lokasi yang kejauhan ditolak.
    const kirimCek = validasiPengiriman(metode_ambil, titik_tujuan)
    if (!kirimCek.boleh) return kirim(res, 409, { pesan: kirimCek.pesan })

    // Pembayaran Tunai hanya masuk akal saat barang diambil sendiri
    // di klinik. Kalau dikirim, uang harus sudah diterima klinik
    // sebelum kurir berangkat, jadi pilihannya Transfer saja.
    if (metode_ambil === 'Dikirim' && metode_bayar === 'Tunai') {
      return kirim(res, 409, {
        pesan: 'Pesanan yang dikirim tidak bisa dibayar tunai. Silakan pilih Transfer Bank, atau ubah menjadi Ambil di Klinik.',
      })
    }

    const detail = items.map((it) => {
      const pr = db.produk.find((x) => x.id === it.id_produk)
      return { id: idBerikut(), id_produk: pr.id, jumlah: it.jumlah, harga_satuan: pr.harga }
    })
    const subtotal = detail.reduce((s, d) => s + d.jumlah * d.harga_satuan, 0)
    // Ongkir dari jarak (lihat shared/pengiriman.js), bukan tarif tetap.
    const kirimBiaya = kirimCek.ongkir || 0
    const nomor = `ORD-${DEMO_TANGGAL.replace(/-/g, '')}-${String(db.pesanan.length + 1).padStart(4, '0')}`
    const pesananBaru = {
      id: idBerikut(),
      nomor_pesanan: nomor,
      id_pasien: Number(id_pasien),
      // Konvensi: `total` SUDAH termasuk ongkos kirim. Jangan
      // menambahkan biaya_kirim lagi saat menampilkan - dulu dashboard
      // admin menghitung total + biaya_kirim sehingga ongkir terhitung
      // dua kali dan angka di admin berbeda dari yang dilihat pasien.
      total: subtotal + kirimBiaya,
      biaya_kirim: kirimBiaya,
      alamat_pengiriman: metode_ambil === 'Dikirim' ? (alamat_pengiriman || '') : '-',
      // Info jarak & kurir ikut disimpan supaya dashboard admin bisa
      // melihat mengapa ongkirnya sebesar itu (dan pasien bisa dicek
      // ulang kalau ada pertanyaan).
      pengiriman: kirimCek.info
        ? {
            jarak_km: kirimCek.info.jarak_km,
            zona: kirimCek.info.zona,
            label_zona: kirimCek.info.label_zona,
            kurir: kirimCek.info.kurir,
            estimasi_jam: kirimCek.info.estimasi_jam,
            titik_tujuan: titik_tujuan || null,
          }
        : null,
      metode_ambil: metode_ambil || 'Ambil di Klinik',
      metode_bayar: metode_bayar || 'Transfer Bank',
      status: 'Menunggu Pembayaran', // BR-02 titik awal
      // Fitur Minimal #5 Pembayaran: pesanan baru selalu "Belum Bayar".
      // Pasien mengunggah bukti lewat /api/pesanan/:id/bayar-pasien,
      // lalu admin memverifikasi lewat /api/pesanan/:id/verifikasi-bayar.
      status_pembayaran: 'Belum Bayar',
      bukti_bayar: null,
      waktu_pemesanan: sekarang(),
      detail,
    }
    db.pesanan.unshift(pesananBaru)
    catat('Membuat pesanan', 'Pesanan', pesananBaru.id)
    // Angka transfer memakai kode unik supaya admin mudah mencocokkan.
    const { harus_dibayar } = nominalBayar(pesananBaru)
    notifikasiUntuk(
      pesananBaru.id_pasien,
      'Pesanan Dibuat',
      // Brief §23: angka rupiah ditulis lengkap, bukan "12000".
      `Pesanan ${nomor} berhasil dibuat. Silakan bayar Rp ${harus_dibayar.toLocaleString('id-ID')} (termasuk kode unik) lalu unggah bukti transfer di menu Pesanan.`,
      'pesanan',
    )
    return kirim(res, 201, pesananBaru)
  }

  // --- Ubah status pesanan (BR-02 + BR-04 + BR-08) ---
  if (bagian[0] === 'pesanan' && bagian[2] === 'status' && metode === 'PATCH') {
    const p = db.pesanan.find((x) => x.id === Number(bagian[1]))
    if (!p) return kirim(res, 404, { pesan: 'Pesanan tidak ditemukan.' })
    const tujuan = body.status
    if (!bolehTransisi(p.status, tujuan)) {
      return kirim(res, 409, {
        pesan: `Transisi ${p.status} ke ${tujuan} tidak diizinkan (BR-02).`,
      })
    }
    const dari = p.status
    p.status = tujuan
    if (tujuan === 'Diproses' && dari !== 'Diproses') {
      kurangiStokPesanan(p, body.id_pengguna)
    }
    catat(`Ubah status pesanan ke ${tujuan}`, 'Pesanan', p.id, body.id_pengguna)
    notifikasiStatusPesanan(p, tujuan)
    return kirim(res, 200, p)
  }

  // --- Konfirmasi pembayaran (BR-03) ---
  if (bagian[0] === 'pesanan' && bagian[2] === 'pembayaran' && metode === 'POST') {
    const p = db.pesanan.find((x) => x.id === Number(bagian[1]))
    if (!p) return kirim(res, 404, { pesan: 'Pesanan tidak ditemukan.' })

    // Admin MENOLAK bukti: pesanan tetap "Menunggu Pembayaran" supaya
    // pasien bisa mengunggah ulang bukti yang benar.
    if (body.tolak) {
      if (p.status !== 'Menunggu Pembayaran') {
        return kirim(res, 409, { pesan: `Pesanan berstatus ${p.status}, tidak menunggu pembayaran.` })
      }
      const alasan = String(body.alasan || '').trim() || 'Bukti pembayaran tidak jelas. Silakan unggah ulang.'
      p.status_pembayaran = 'Ditolak'
      p.alasan_tolak = alasan
      catat('Menolak bukti pembayaran', 'Pesanan', p.id, body.id_pengguna)
      notifikasiUntuk(
        p.id_pasien,
        'Bukti Pembayaran Ditolak',
        `Bukti pembayaran pesanan ${p.nomor_pesanan} belum bisa kami terima: ${alasan}`,
        'pesanan',
      )
      return kirim(res, 200, p)
    }

    if (p.status !== 'Menunggu Pembayaran') {
      return kirim(res, 409, { pesan: `Pesanan berstatus ${p.status}, tidak menunggu pembayaran.` })
    }
    // Transfer hanya boleh diverifikasi setelah pasien mengunggah bukti,
    // supaya tidak ada pesanan "Dibayar" tanpa bukti pembayaran.
    if (p.metode_bayar === 'Transfer Bank' && p.status_pembayaran !== 'Menunggu Verifikasi') {
      return kirim(res, 409, {
        pesan: 'Pasien belum mengunggah bukti pembayaran. Tunggu bukti transfer masuk.',
      })
    }
    const { harus_dibayar } = nominalBayar(p)
    db.pembayaran.push({
      id: idBerikut(),
      id_pesanan: p.id,
      jumlah: p.metode_bayar === 'Transfer Bank' ? p.nominal_bayar || harus_dibayar : p.total,
      metode: body.metode || p.metode_bayar,
      bukti: p.bukti_bayar || body.bukti || null,
      status: 'Terverifikasi',
      waktu: sekarang(),
      id_pengguna: body.id_pengguna || null,
    })
    p.status_pembayaran = 'Terverifikasi'
    p.alasan_tolak = null
    p.status = 'Dibayar'
    catat('Konfirmasi pembayaran', 'Pesanan', p.id, body.id_pengguna)
    notifikasiStatusPesanan(p, 'Dibayar')
    return kirim(res, 200, p)
  }

  // --- Pasien membatalkan pesanan (BR-02: hanya saat Menunggu Pembayaran) ---
  if (bagian[0] === 'pesanan' && bagian[2] === 'batal-pasien' && metode === 'POST') {
    const p = db.pesanan.find((x) => x.id === Number(bagian[1]))
    if (!p) return kirim(res, 404, { pesan: 'Pesanan tidak ditemukan.' })
    if (p.id_pasien !== Number(body.id_pasien)) {
      return kirim(res, 403, { pesan: 'Pesanan ini bukan milik Anda.' })
    }
    if (p.status !== 'Menunggu Pembayaran') {
      return kirim(res, 409, {
        pesan: `Pesanan berstatus ${p.status} tidak dapat dibatalkan sendiri. Hubungi klinik.`,
      })
    }
    p.status = 'Dibatalkan'
    catat('Pasien membatalkan pesanan', 'Pesanan', p.id)
    notifikasiStatusPesanan(p, 'Dibatalkan')
    return kirim(res, 200, p)
  }

  // --- Pasien membayar / mengunggah bukti (Fitur Minimal #5) ---
  //
  // Alur: pesanan dibuat -> pasien transfer -> unggah bukti di sini ->
  // status_pembayaran jadi "Menunggu Verifikasi" -> admin memverifikasi
  // lewat /pesanan/:id/pembayaran -> "Terverifikasi".
  if (bagian[0] === 'pesanan' && bagian[2] === 'bayar-pasien' && metode === 'POST') {
    const p = db.pesanan.find((x) => x.id === Number(bagian[1]))
    if (!p) return kirim(res, 404, { pesan: 'Pesanan tidak ditemukan.' })
    if (p.id_pasien !== Number(body.id_pasien)) {
      return kirim(res, 403, { pesan: 'Pesanan ini bukan milik Anda.' })
    }
    if (p.metode_bayar === 'Tunai') {
      return kirim(res, 409, {
        pesan: 'Pesanan ini dibayar tunai saat mengambil di klinik, jadi tidak perlu unggah bukti.',
      })
    }
    if (p.status !== 'Menunggu Pembayaran') {
      return kirim(res, 409, {
        pesan: `Pesanan berstatus ${p.status}, tidak menunggu pembayaran lagi.`,
      })
    }
    if (p.status_pembayaran === 'Menunggu Verifikasi') {
      return kirim(res, 409, { pesan: 'Bukti pembayaran Anda sedang diperiksa klinik.' })
    }
    const bukti = String(body.bukti || '').trim()
    if (!bukti) {
      return kirim(res, 400, { pesan: 'Bukti pembayaran wajib diunggah.' })
    }
    const { harus_dibayar } = nominalBayar(p)
    p.bukti_bayar = bukti
    p.catatan_bayar = String(body.catatan || '').trim()
    p.nominal_bayar = Number(body.nominal) || harus_dibayar
    p.status_pembayaran = 'Menunggu Verifikasi'
    p.waktu_bayar = sekarang()
    db.pembayaran.push({
      id: idBerikut(),
      id_pesanan: p.id,
      jumlah: p.nominal_bayar,
      metode: p.metode_bayar,
      bukti,
      status: 'Menunggu Verifikasi',
      waktu: sekarang(),
      id_pengguna: null,
    })
    catat('Pasien mengunggah bukti pembayaran', 'Pesanan', p.id)
    notifikasiUntuk(
      p.id_pasien,
      'Bukti Pembayaran Diterima',
      `Bukti pembayaran pesanan ${p.nomor_pesanan} sudah kami terima dan sedang diperiksa klinik.`,
      'pesanan',
    )
    return kirim(res, 200, p)
  }

  // --- Ubah status appointment (BR-08 notifikasi) ---
  if (bagian[0] === 'appointment' && bagian[2] === 'status' && metode === 'PATCH') {
    const a = db.appointment.find((x) => x.id === Number(bagian[1]))
    if (!a) return kirim(res, 404, { pesan: 'Appointment tidak ditemukan.' })
    const dari = a.status
    a.status = body.status
    if (body.id_bidan) a.id_bidan = body.id_bidan
    catat(`Ubah status appointment ke ${body.status}`, 'Appointment', a.id, body.id_pengguna)
    if (dari !== body.status) {
      // Brief §18 & §23: notifikasi memakai bahasa manusia dan istilah
      // Indonesia. "Appointment" diganti "Janji Temu", tanggal ditulis
      // panjang, dan waktu memakai format 09.00 (bukan 09:00).
      const tgl = new Date(a.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
      const jam = String(a.waktu || '').replace(':', '.')
      const teks = {
        Dikonfirmasi: `Janji temu Anda pada ${tgl} pukul ${jam} WIB sudah dikonfirmasi klinik.`,
        Dibatalkan: `Janji temu Anda pada ${tgl} pukul ${jam} WIB telah dibatalkan.`,
        Selesai: `Janji temu Anda pada ${tgl} sudah selesai. Terima kasih sudah berkunjung.`,
        'Tidak Hadir': `Anda tercatat tidak hadir pada janji temu ${tgl}. Hubungi klinik bila perlu menjadwalkan ulang.`,
      }[body.status]
      const judul = {
        Dikonfirmasi: 'Janji Temu Dikonfirmasi',
        Dibatalkan: 'Janji Temu Dibatalkan',
        Selesai: 'Janji Temu Selesai',
        'Tidak Hadir': 'Anda Tidak Hadir',
      }[body.status]
      if (teks) notifikasiUntuk(a.id_pasien, judul, teks, 'appointment')
    }
    return kirim(res, 200, a)
  }

  // --- Notifikasi ---
  if (bagian[0] === 'notifikasi' && bagian[1] === 'baca-semua' && metode === 'POST') {
    let n = 0
    for (const notif of db.notifikasi) {
      if (notif.id_pasien === Number(body.id_pasien) && !notif.status_baca) {
        notif.status_baca = true
        n++
      }
    }
    return kirim(res, 200, { diubah: n })
  }

  // --- Generate jadwal vaksin bayi (BR-07) ---
  if (bagian[0] === 'bayi' && bagian[2] === 'generate-jadwal' && metode === 'POST') {
    const dibuat = generateJadwalVaksin(bagian[1])
    catat('Generate jadwal vaksin', 'Bayi', Number(bagian[1]))
    return kirim(res, 200, { dibuat: dibuat.length, jadwal: dibuat })
  }

  // --- Promo CRUD (admin only) ---
  if (bagian[0] === 'promo' && metode === 'GET') {
    return kirim(res, 200, db.promo)
  }
  if (bagian[0] === 'promo' && metode === 'POST') {
    const { nama, deskripsi, kode_promo, diskon_persen, diskon_nominal, minimal_pembelian, tanggal_mulai, tanggal_selesai, id_pengguna } = body
    if (!nama || !kode_promo) return kirim(res, 400, { pesan: 'Nama & kode promo wajib.' })
    const baru = {
      id: idBerikut(),
      nama,
      deskripsi: deskripsi || '',
      kode_promo,
      diskon_persen: diskon_persen || null,
      diskon_nominal: diskon_nominal || null,
      minimal_pembelian: minimal_pembelian || 0,
      tanggal_mulai: tanggal_mulai || DEMO_TANGGAL,
      tanggal_selesai: tanggal_selesai || DEMO_TANGGAL,
      status: 'Aktif',
      gambar: null,
      id_pengguna,
      dibuat_tanggal: sekarang(),
    }
    db.promo.push(baru)
    catat('Buat promo', 'Promo', baru.id, id_pengguna)
    return kirim(res, 201, baru)
  }
  if (bagian[0] === 'promo' && bagian[1] && metode === 'PATCH') {
    const p = db.promo.find((x) => x.id === Number(bagian[1]))
    if (!p) return kirim(res, 404, { pesan: 'Promo tidak ditemukan.' })
    Object.assign(p, body)
    catat('Ubah promo', 'Promo', p.id, body.id_pengguna)
    return kirim(res, 200, p)
  }
  if (bagian[0] === 'promo' && bagian[1] && metode === 'DELETE') {
    const idx = db.promo.findIndex((x) => x.id === Number(bagian[1]))
    if (idx === -1) return kirim(res, 404, { pesan: 'Promo tidak ditemukan.' })
    const hapus = db.promo.splice(idx, 1)[0]
    catat('Hapus promo', 'Promo', hapus.id, body.id_pengguna)
    return kirim(res, 200, hapus)
  }

  // --- Budget CRUD (admin only) ---
  if (bagian[0] === 'budget' && metode === 'GET') {
    return kirim(res, 200, db.budget)
  }
  if (bagian[0] === 'budget' && metode === 'POST') {
    const { bulan, modal_awal, stok_nilai, penjualan_bruto, penjualan_bersih, pengeluaran, laba_kotor, laba_bersih, catatan, id_pengguna } = body
    if (!bulan) return kirim(res, 400, { pesan: 'Bulan wajib (format: YYYY-MM).' })
    const baru = {
      id: idBerikut(),
      bulan,
      modal_awal: modal_awal || 0,
      stok_nilai: stok_nilai || 0,
      penjualan_bruto: penjualan_bruto || 0,
      penjualan_bersih: penjualan_bersih || 0,
      pengeluaran: pengeluaran || 0,
      laba_kotor: laba_kotor || 0,
      laba_bersih: laba_bersih || 0,
      catatan: catatan || '',
    }
    db.budget.push(baru)
    catat('Buat budget', 'Budget', baru.id, id_pengguna)
    return kirim(res, 201, baru)
  }
  if (bagian[0] === 'budget' && bagian[1] && metode === 'PATCH') {
    const b = db.budget.find((x) => x.id === Number(bagian[1]))
    if (!b) return kirim(res, 404, { pesan: 'Budget tidak ditemukan.' })
    Object.assign(b, body)
    catat('Ubah budget', 'Budget', b.id, body.id_pengguna)
    return kirim(res, 200, b)
  }
  if (bagian[0] === 'budget' && bagian[1] && metode === 'DELETE') {
    const idx = db.budget.findIndex((x) => x.id === Number(bagian[1]))
    if (idx === -1) return kirim(res, 404, { pesan: 'Budget tidak ditemukan.' })
    const hapus = db.budget.splice(idx, 1)[0]
    catat('Hapus budget', 'Budget', hapus.id, body.id_pengguna)
    return kirim(res, 200, hapus)
  }

  // --- Pengaturan Website (admin only) ---
  if (bagian[0] === 'pengaturan' && metode === 'GET') {
    return kirim(res, 200, db.pengaturan)
  }
  if (bagian[0] === 'pengaturan' && bagian[1] && metode === 'PATCH') {
    const p = db.pengaturan
    Object.assign(p, body)
    return kirim(res, 200, p)
  }

  // --- CRM Lead CRUD (admin only) ---
  if (bagian[0] === 'crmLead' && metode === 'GET') {
    return kirim(res, 200, db.crmLead)
  }
  if (bagian[0] === 'crmLead' && metode === 'POST') {
    const { nama, email, telepon, asal, status, nilai_potensial, catatan } = body
    if (!nama || !email) return kirim(res, 400, { pesan: 'Nama dan email wajib.' })
    const baru = {
      id: idBerikut(),
      nama,
      email,
      telepon: telepon || '',
      asal: asal || '',
      status: status || 'Prospek',
      nilai_potensial: nilai_potensial || 0,
      tanggal_daftar: DEMO_TANGGAL,
      catatan: catatan || '',
    }
    db.crmLead.push(baru)
    catat('Buat lead CRM', 'CRM Lead', baru.id)
    return kirim(res, 201, baru)
  }
  if (bagian[0] === 'crmLead' && bagian[1] && metode === 'PATCH') {
    const l = db.crmLead.find((x) => x.id === Number(bagian[1]))
    if (!l) return kirim(res, 404, { pesan: 'Lead tidak ditemukan.' })
    Object.assign(l, body)
    catat('Ubah lead CRM', 'CRM Lead', l.id)
    return kirim(res, 200, l)
  }
  if (bagian[0] === 'crmLead' && bagian[1] && metode === 'DELETE') {
    const idx = db.crmLead.findIndex((x) => x.id === Number(bagian[1]))
    if (idx === -1) return kirim(res, 404, { pesan: 'Lead tidak ditemukan.' })
    const hapus = db.crmLead.splice(idx, 1)[0]
    catat('Hapus lead CRM', 'CRM Lead', hapus.id)
    return kirim(res, 200, hapus)
  }

  // --- CRM Interaksi CRUD (admin only) ---
  if (bagian[0] === 'crmInteraksi' && metode === 'GET') {
    return kirim(res, 200, db.crmInteraksi)
  }
  if (bagian[0] === 'crmInteraksi' && metode === 'POST') {
    const { id_lead, jenis, hasil, catatan } = body
    if (!id_lead || !jenis) return kirim(res, 400, { pesan: 'Lead dan jenis interaksi wajib.' })
    const baru = {
      id: idBerikut(),
      id_lead: Number(id_lead),
      jenis,
      tanggal: sekarang(),
      hasil: hasil || '',
      catatan: catatan || '',
    }
    db.crmInteraksi.push(baru)
    catat('Buat interaksi CRM', 'CRM Interaksi', baru.id)
    return kirim(res, 201, baru)
  }

  
  const koleksi = bagian[0]
  if (!koleksi || !Array.isArray(db[koleksi])) {
    return kirim(res, 404, { pesan: `Koleksi "${koleksi}" tidak dikenal.` })
  }
  const arr = db[koleksi]
  const id = bagian[1] ? Number(bagian[1]) : null

  if (metode === 'GET') {
    if (id === null) return kirim(res, 200, arr)
    const row = arr.find((x) => x.id === id)
    return row ? kirim(res, 200, row) : kirim(res, 404, { pesan: 'Data tidak ditemukan.' })
  }

  if (metode === 'POST') {
    const row = { id: idBerikut(), ...body }
    if (koleksi === 'pesanan') {
      // Pesanan baru wajib lewat /api/checkout supaya stok & resep divalidasi.
      return kirim(res, 400, { pesan: 'Pesanan harus dibuat lewat checkout.' })
    }
    // Nama kategori harus unik supaya katalog tidak punya dua kategori
    // yang sama (membingungkan admin & pasien).
    if (koleksi === 'kategori' && arr.some((k) => String(k.nama).toLowerCase() === String(body.nama || '').toLowerCase())) {
      return kirim(res, 409, { pesan: `Kategori "${body.nama}" sudah ada.` })
    }
    arr.push(row)
    catat(`Menambah ${koleksi}`, koleksi, row.id, body.id_pengguna)
    // BR-07 otomatis saat bayi didaftarkan dari app pasien.
    if (koleksi === 'bayi') generateJadwalVaksin(row.id)
    return kirim(res, 201, row)
  }

  if (metode === 'PATCH') {
    const row = arr.find((x) => x.id === id)
    if (!row) return kirim(res, 404, { pesan: 'Data tidak ditemukan.' })
    // Status pesanan tidak boleh diubah lewat CRUD generik (harus lewat endpoint khusus).
    if (koleksi === 'pesanan' && body.status && body.status !== row.status) {
      return kirim(res, 409, { pesan: 'Ubah status pesanan lewat endpoint /pesanan/:id/status (BR-02).' })
    }
    if (
      koleksi === 'kategori' &&
      body.nama &&
      arr.some((k) => k.id !== id && String(k.nama).toLowerCase() === String(body.nama).toLowerCase())
    ) {
      return kirim(res, 409, { pesan: `Kategori "${body.nama}" sudah ada.` })
    }
    Object.assign(row, body)
    catat(`Mengubah ${koleksi}`, koleksi, row.id, body.id_pengguna)
    return kirim(res, 200, row)
  }

  if (metode === 'DELETE') {
    const i = arr.findIndex((x) => x.id === id)
    if (i < 0) return kirim(res, 404, { pesan: 'Data tidak ditemukan.' })
    // Kategori yang masih dipakai produk tidak boleh dihapus, supaya
    // produk tidak menjadi "yatim" tanpa kategori di katalog.
    if (koleksi === 'kategori') {
      const dipakai = db.produk.filter((p) => p.id_kategori === id).length
      if (dipakai > 0) {
        return kirim(res, 409, {
          pesan: `Kategori masih dipakai oleh ${dipakai} produk. Pindahkan produk itu ke kategori lain dulu.`,
        })
      }
    }
    const [dihapus] = arr.splice(i, 1)
    catat(`Menghapus ${koleksi}`, koleksi, id)
    return kirim(res, 200, dihapus)
  }

  return kirim(res, 405, { pesan: 'Metode tidak diizinkan.' })
}

// -------------------------------------------------------------
// Penyajian file statis (opsional): /  -> app pasien, /admin -> dashboard
// Dipakai kalau ingin menjalankan semuanya dari satu server (mode produksi).
// Saat pengembangan, Vite yang menyajikan dan mem-proxy /api ke sini.
// -------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

async function sajikanStatis(res, filePath, fallback) {
  try {
    const s = await stat(filePath)
    if (!s.isFile()) throw new Error('bukan file')
    const isi = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
      'Content-Length': isi.length,
      'Cache-Control': extname(filePath) === '.html' ? 'no-store' : 'public, max-age=3600',
    })
    return res.end(isi)
  } catch {
    if (!fallback) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      return res.end('Tidak ditemukan')
    }
    try {
      const isi = await readFile(fallback)
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' })
      return res.end(isi)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      return res.end('Build belum ada. Jalankan: npm run build:all')
    }
  }
}

const APP_PASIEN = join(ROOT, 'pasien', 'dist')
const APP_ADMIN = join(ROOT, 'admin', 'dist')

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  if (url.pathname.startsWith('/api')) {
    try {
      return await tanganiApi(req, res, url)
    } catch (e) {
      console.error('[api]', e)
      return kirim(res, 500, { pesan: 'Terjadi kesalahan di server.' })
    }
  }

  // Statis
  const bersih = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  const adaAdmin = existsSync(join(APP_ADMIN, 'index.html'))
  const adaPasien = existsSync(join(APP_PASIEN, 'index.html'))

  if (bersih.startsWith('/admin')) {
    const sisa = bersih.slice('/admin'.length) || '/'
    return sajikanStatis(res, join(APP_ADMIN, sisa), adaAdmin ? join(APP_ADMIN, 'index.html') : null)
  }

  return sajikanStatis(res, join(APP_PASIEN, bersih), adaPasien ? join(APP_PASIEN, 'index.html') : null)
})

server.listen(PORT, HOST, () => {
  console.log(`Premysis Medika API siap di http://${HOST}:${PORT}`)
  console.log(`  GET  /api/state            snapshot seluruh data`)
  console.log(`  GET  /api/promo            daftar promo`)
  console.log(`  POST /api/promo            buat promo`)
  console.log(`  PATCH /api/promo/:id       ubah promo`)
  console.log(`  DELETE /api/promo/:id      hapus promo`)
  console.log(`  GET  /api/budget           daftar budget`)
  console.log(`  POST /api/budget           buat budget`)
  console.log(`  PATCH /api/budget/:id      ubah budget`)
  console.log(`  DELETE /api/budget/:id     hapus budget`)
  console.log(`  POST /api/auth/login-pasien | login-admin | registrasi`)
  console.log(`  POST /api/checkout         validasi stok (BR-04) & resep (BR-05)`)
  console.log(`  PATCH /api/pesanan/:id/status   mesin status (BR-02)`)
  console.log(`  POST /api/pesanan/:id/pembayaran  konfirmasi (BR-03)`)
  console.log(`  Static: /  -> app pasien   |   /admin -> dashboard admin`)
})

// Muat ulang data ke kondisi awal (untuk demo/UAT) lewat SIGUSR2.
process.on('SIGUSR2', () => {
  db = seedDatabase()
  counter.next = 1000
  console.log('[server] data dikembalikan ke kondisi awal')
})
