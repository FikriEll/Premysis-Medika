# Premysis Medika

> **Branch `backend`** — branch ini hanya berisi **backend**: REST API (`server/`) dan entitas bersama (`shared/`).
> Web admin ada di branch `frontend-admin`, aplikasi pasien di `frontend-pasien`, dan versi gabungan di `main`.

Sistem informasi pelayanan kesehatan & e-commerce klinik ibu dan anak.
Repositori ini berisi **tiga bagian** yang berjalan di atas **satu sumber data**.

| Bagian | Folder | Alamat | Isi |
|---|---|---|---|
| Dashboard Admin | `admin/` | http://localhost:5173 | Modul operasional klinik + e-commerce/ERP |
| Aplikasi Pasien | `pasien/` | http://localhost:5174 | Fitur pasien + alur e-commerce |
| API Bersama | `server/` + `shared/` | http://127.0.0.1:4000 | REST API + aturan bisnis BR-02..BR-10 |

> Dokumen acuan: `docs/PRD.md` (PRD v1.1).

## Menjalankan (branch backend saja)

```bash
npm install
npm run server          # REST API di http://127.0.0.1:4000
```

Cek: `curl http://127.0.0.1:4000/api/state`

Aturan bisnis ditegakkan **di server**, bukan di UI, sehingga tidak bisa dilewati:

- **BR-02** mesin status pesanan (transisi ilegal ditolak)
- **BR-03** konfirmasi pembayaran (hanya setelah pasien mengunggah bukti)
- **BR-04** pengurangan stok (hanya saat pesanan masuk "Diproses")
- **BR-05** produk wajib resep hanya bila pasien punya resep aktif
- **BR-06** ambang stok minimum
- **BR-07** generate jadwal vaksin saat bayi didaftarkan
- **BR-08** notifikasi otomatis ke pasien saat status berubah
- **BR-09** audit trail (log aktivitas)
- **BR-10** validasi registrasi (NIK & email unik)

## Struktur

```
.
├── server/index.js    REST API + penegakan aturan bisnis
├── shared/
│   ├── seed.js        Entitas awal
│   ├── format.js      Format tanggal/uang + konstanta waktu demo
│   ├── pengiriman.js  Aturan jarak, zona, kurir, ongkir
│   └── pembayaran.js  Rekening klinik, label status & instruksi pembayaran
├── docs/PRD.md        Product Requirements Document (v1.1)
└── package.json
```
