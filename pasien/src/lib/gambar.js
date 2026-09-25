// =============================================================
// Gambar produk.
//
// Sebagian produk di server belum punya foto sendiri (kolom `image`
// masih kosong). Daripada menampilkan kotak ikon kosong, dipakai
// foto stok Unsplash yang sudah diverifikasi tersedia (HTTP 200).
//
// Pemilihannya deterministik berdasarkan id produk, jadi satu produk
// selalu memakai foto yang sama setiap kali halaman dibuka - tidak
// berubah-ubah saat pengguna berpindah halaman.
//
// Begitu apotek mengunggah foto asli lewat dashboard admin, foto itu
// otomatis dipakai dan daftar cadangan ini tidak terpakai lagi.
// =============================================================

const CADANGAN = [
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=700&q=75',
  'https://images.unsplash.com/photo-1583912268183-a34d41fe464a?auto=format&fit=crop&w=700&q=75',
]

// Foto per kategori supaya jenisnya masuk akal: obat, vitamin,
// alat kesehatan, dan kebutuhan ibu & bayi.
const PER_KATEGORI = {
  obat: [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=75',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=75',
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=700&q=75',
  ],
  vitamin: [
    'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=700&q=75',
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=700&q=75',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=700&q=75',
  ],
  bayi: [
    'https://images.unsplash.com/photo-1583912268183-a34d41fe464a?auto=format&fit=crop&w=700&q=75',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=75',
  ],
  alat: [
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=75',
    'https://images.unsplash.com/photo-1583912268183-a34d41fe464a?auto=format&fit=crop&w=700&q=75',
  ],
}

function kelompokKategori(nama = '') {
  if (/vitamin|suplemen|makanan sehat/i.test(nama)) return 'vitamin'
  if (/ibu|bayi|anak/i.test(nama)) return 'bayi'
  if (/alat|perawatan|kesehatan/i.test(nama)) return 'alat'
  return 'obat'
}

// Angka stabil dari teks, supaya pilihan foto tidak berubah tiap render.
function hash(teks) {
  let h = 0
  for (let i = 0; i < teks.length; i += 1) h = (h * 31 + teks.charCodeAt(i)) % 100000
  return h
}

/**
 * URL gambar untuk sebuah produk.
 * Pakai foto asli produk bila ada; kalau belum ada, pakai foto stok
 * yang cocok dengan kategorinya.
 */
export function gambarProduk(produk) {
  if (!produk) return CADANGAN[0]
  if (produk.image) return produk.image

  const namaKategori = produk.category?.name || produk.kategori || ''
  const daftar = PER_KATEGORI[kelompokKategori(namaKategori)]
  const kunci = String(produk.id ?? produk.slug ?? produk.name ?? '0')
  return daftar[hash(kunci) % daftar.length]
}
