# Premysis Medika — Aplikasi Pasien (Web)

> **Branch `frontend-pasien`** — branch ini hanya berisi **aplikasi pasien** (`pasien/`)
> beserta **entitas bersama** (`shared/`) yang diimpornya.
> Backend ada di branch `backend`, web admin di `frontend-admin`, versi gabungan di `main`.

Aplikasi pasien **Premysis Medika** — layanan klinik (appointment, resep, imunisasi, riwayat)
**dan** alur e-commerce (katalog → keranjang → checkout → pembayaran → riwayat).
Dibangun dengan **React + Vite + Tailwind CSS v4**.

> Dokumen acuan: `docs/PRD.md` (PRD v1.1).

## Menjalankan

Perlu **backend** berjalan lebih dulu (`server/index.js` di http://127.0.0.1:4000).

```bash
npm install             # memasang dependensi di pasien/
npm run dev             # app pasien di http://localhost:5174
```

> Catatan: aplikasi ini mengimpor helper dari `shared/` (`format.js`, `pembayaran.js`),
> karena itu folder `shared/` ikut disertakan pada branch ini.

### Akun demo

| Pasien | No. HP | Password |
|---|---|---|
| Siti Nurhaliza | `0813-9000-0001` | `demo1234` |
| Dewi Lestari | `0813-9000-0002` | `demo1234` |

> Login pasien memakai **nomor HP**.

## Alur e-commerce

```
Login → Home → Produk → Detail → Cart → Checkout → Pembayaran → Riwayat Pesanan → Profil
```

Pembayaran: pesanan dibuat ("Menunggu Pembayaran") → pasien unggah bukti ("Menunggu Verifikasi")
→ admin verifikasi ("Terverifikasi", pesanan jadi "Dibayar") atau tolak.

## Struktur

```
pasien/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # entry + router
    ├── App.jsx                  # definisi rute
    ├── components/              # Header, BottomNav, kartu, Linimasa, PetaLokasi, Icons, ui
    ├── lib/                     # api.js, store.jsx, layanan.js, theme.jsx
    └── pages/                   # Beranda, Toko, DetailProduk, Keranjang, Checkout,
                                 # Pembayaran, Pesanan, Profil, Appointment, Resep, Vaksinasi, ...
shared/                          # helper bersama yang dipakai pasien (format, pembayaran)
docs/PRD.md                      # Product Requirements Document (v1.1)
```
