// =============================================================
// Pustaka ilustrasi aplikasi pasien.
//
// CATATAN KEPUTUSAN (penting, dibaca sebelum menambah ilustrasi):
//
// Skill "design-taste-frontend" §4.8 menaruh prioritas aset visual:
//   1. tool pembuat gambar, 2. foto asli, 3. SVG gambar tangan
//      (terakhir, dan hanya bila brief memintanya eksplisit).
//
// Di lingkungan ini TIDAK ADA tool pembuat gambar. Brief dari
// pengguna berbunyi eksplisit: "gunakan banyak ilustrasi cute".
// Karena itu jalur ke-3 dipakai, dan itulah pengecualian yang
// diizinkan skill ("Acceptable only when the brief explicitly
// calls for it").
//
// Supaya tidak jadi hiasan murahan, ilustrasi ini mematuhi aturan
// yang sama dengan sisa aplikasi:
// - Satu keluarga bentuk: bulat, lembut, tanpa sudut tajam.
// - Semua warna lewat token CSS (--illus-*), jadi mode gelap ikut
//   berubah tanpa pengecualian di komponen.
// - Tidak ada emoji. Tidak ada em-dash.
// - Semua ilustrasi dekoratif diberi aria-hidden; yang menyampaikan
//   makna diberi role="img" + aria-label.
// =============================================================

// Bingkai bersama: menjaga rasio, ukuran, dan aksesibilitas seragam.
//
// Aksesibilitas: ilustrasi di aplikasi ini hampir selalu DEKORATIF
// (judul dan teks di sekitarnya sudah menyampaikan makna yang sama).
// Karena itu bawaannya `dekoratif` = true, sehingga diberi
// aria-hidden dan tidak dibacakan dua kali oleh pembaca layar.
// Set `dekoratif={false}` hanya bila ilustrasi adalah satu-satunya
// pembawa makna di tempat itu.
function Bingkai({ viewBox, size, className = '', label, dekoratif = true, children }) {
  const [, , w, h] = viewBox.split(' ').map(Number)
  const bermakna = !dekoratif && label
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={Math.round((size * h) / w)}
      className={className}
      role={bermakna ? 'img' : undefined}
      aria-label={bermakna ? label : undefined}
      aria-hidden={bermakna ? undefined : true}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

// Karakter bayi kecil yang dipakai ulang di beberapa ilustrasi.
function BayiKecil({ x = 0, y = 0, r = 20 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r={r} fill="var(--illus-kulit)" />
      <path
        d={`M${-r} -3c0-${r * 0.55} ${r * 0.42}-${r} ${r}-${r}s${r} ${r * 0.45} ${r} ${r}c0 2 0 3-1 5-4-8-11-12-19-12s-15 4-19 12c-1-2-1-3-1-5Z`}
        fill="var(--illus-rambut)"
      />
      <ellipse cx={-r * 0.34} cy="1" rx="2.2" ry="2.9" fill="var(--illus-mata)" />
      <ellipse cx={r * 0.34} cy="1" rx="2.2" ry="2.9" fill="var(--illus-mata)" />
      <ellipse cx={-r * 0.62} cy="6" rx="4.2" ry="2.8" fill="var(--illus-hangat)" opacity="0.55" />
      <ellipse cx={r * 0.62} cy="6" rx="4.2" ry="2.8" fill="var(--illus-hangat)" opacity="0.55" />
      <path d={`M-4 8c2 3 6 3 8 0`} fill="none" stroke="var(--illus-mata)" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

// -------------------------------------------------------------
// 1. Ibu menggendong bayi. Dipakai di kartu sambutan Beranda dan
//    di halaman masuk.
// -------------------------------------------------------------
export function IlustrasiIbuBayi({ size = 220, className = '' }) {
  return (
    <Bingkai viewBox="0 0 240 190" size={size} className={className} label="Ilustrasi ibu menggendong bayi">
      <ellipse cx="120" cy="178" rx="82" ry="11" fill="var(--illus-teal-3)" />

      {/* badan ibu */}
      <path d="M96 96c-30 0-46 24-50 78h100c-4-54-20-78-50-78Z" fill="var(--illus-teal-1)" />
      <path d="M96 96c-9 0-16 5-20 13 6 6 12 9 20 9s14-3 20-9c-4-8-11-13-20-13Z" fill="var(--illus-teal-3)" />

      {/* lengan menggendong */}
      <path d="M58 126c-11 12-12 31 0 41 10 9 28 8 37-1" fill="none" stroke="var(--illus-kulit-teduh)" strokeWidth="15" strokeLinecap="round" />
      <path d="M134 126c11 12 12 31 0 41-10 9-28 8-37-1" fill="none" stroke="var(--illus-kulit)" strokeWidth="15" strokeLinecap="round" />

      {/* kepala ibu */}
      <circle cx="96" cy="62" r="31" fill="var(--illus-kulit)" />
      <path d="M65 58c0-18 14-32 31-32s31 14 31 32c0 4-1 8-2 11-3-12-14-18-29-18s-26 6-29 18c-1-3-2-7-2-11Z" fill="var(--illus-rambut)" />
      <circle cx="96" cy="25" r="12" fill="var(--illus-rambut)" />
      <ellipse cx="86" cy="64" rx="2.6" ry="3.4" fill="var(--illus-mata)" />
      <ellipse cx="107" cy="64" rx="2.6" ry="3.4" fill="var(--illus-mata)" />
      <ellipse cx="78" cy="73" rx="5" ry="3.2" fill="var(--illus-hangat)" opacity="0.5" />
      <ellipse cx="115" cy="73" rx="5" ry="3.2" fill="var(--illus-hangat)" opacity="0.5" />
      <path d="M90 75c3 4 9 4 12 0" fill="none" stroke="var(--illus-mata)" strokeWidth="2.4" strokeLinecap="round" />

      {/* bayi */}
      <BayiKecil x={150} y={112} r={21} />
      <path d="M124 132c6 13 46 13 52 0 3 15-3 27-26 27s-29-12-26-27Z" fill="var(--illus-teal-2)" />

      {/* hati kecil, memperkuat makna kasih sayang */}
      <path d="M187 60c-4-6-13-5-13 3 0 6 8 11 13 15 5-4 13-9 13-15 0-8-9-9-13-3Z" fill="var(--illus-hangat)" opacity="0.85" />
      <path d="M45 86c-3-5-10-4-10 2 0 5 6 9 10 12 4-3 10-7 10-12 0-6-7-7-10-2Z" fill="var(--illus-teal-2)" opacity="0.8" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 2. Bayi dengan mainan. Dipakai di Vaksinasi.
// -------------------------------------------------------------
export function IlustrasiBayi({ size = 160, className = '' }) {
  return (
    <Bingkai viewBox="0 0 200 170" size={size} className={className} label="Ilustrasi bayi">
      <ellipse cx="100" cy="158" rx="66" ry="9" fill="var(--illus-teal-3)" />
      <path d="M56 154c4-30 20-44 44-44s40 14 44 44Z" fill="var(--illus-teal-2)" />
      <BayiKecil x={100} y={78} r={38} />
      {/* rambut ikal */}
      <circle cx="100" cy="36" r="9" fill="var(--illus-rambut)" />
      {/* selimut */}
      <path d="M60 152c6 10 74 10 80 0 4 6 2 12-40 12s-44-6-40-12Z" fill="var(--illus-teal-2)" />
      {/* mainan kerincingan */}
      <g transform="rotate(-18 164 108)">
        <rect x="160" y="104" width="9" height="34" rx="4.5" fill="var(--illus-teal-2)" />
        <circle cx="164.5" cy="100" r="12" fill="var(--illus-hangat)" />
        <circle cx="164.5" cy="100" r="5" fill="var(--illus-hangat-soft)" />
      </g>
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 3. Botol obat & pil. Dipakai di Resep.
// -------------------------------------------------------------
export function IlustrasiObat({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi obat">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-teal-3)" />
      {/* botol */}
      <rect x="52" y="60" width="62" height="94" rx="14" fill="var(--illus-teal-1)" />
      <rect x="52" y="96" width="62" height="24" fill="var(--illus-teal-3)" />
      <rect x="68" y="42" width="30" height="22" rx="6" fill="var(--illus-putih)" />
      <rect x="64" y="34" width="38" height="12" rx="6" fill="var(--illus-teal-2)" />
      {/* label dengan tanda silang medis */}
      <rect x="64" y="104" width="38" height="26" rx="7" fill="var(--illus-putih)" />
      <path d="M83 110v14M76 117h14" stroke="var(--illus-teal-1)" strokeWidth="4.5" strokeLinecap="round" />
      {/* pil-pil */}
      <g>
        <rect x="126" y="118" width="30" height="18" rx="9" fill="var(--illus-teal-2)" transform="rotate(-24 141 127)" />
        <rect x="126" y="118" width="15" height="18" rx="9" fill="var(--illus-teal-3)" transform="rotate(-24 141 127)" />
        <circle cx="152" cy="86" r="13" fill="var(--illus-hangat)" />
        <path d="M143 77a13 13 0 0 1 18 18" fill="none" stroke="var(--illus-hangat-soft)" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* hati kecil */}
      <path d="M40 66c-3-5-10-4-10 2 0 5 6 9 10 12 4-3 10-7 10-12 0-6-7-7-10-2Z" fill="var(--illus-hangat)" opacity="0.7" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 4. Kalender janji temu. Dipakai di Appointment.
// -------------------------------------------------------------
export function IlustrasiJanji({ size = 160, className = '' }) {
  return (
    <Bingkai viewBox="0 0 200 170" size={size} className={className} label="Ilustrasi jadwal janji temu">
      <ellipse cx="100" cy="158" rx="66" ry="9" fill="var(--illus-teal-3)" />
      <rect x="42" y="46" width="116" height="104" rx="16" fill="var(--illus-putih)" stroke="var(--illus-teal-2)" strokeWidth="3" />
      <rect x="42" y="46" width="116" height="30" rx="16" fill="var(--illus-teal-2)" />
      <rect x="42" y="66" width="116" height="10" fill="var(--illus-teal-2)" />
      <rect x="62" y="34" width="10" height="24" rx="5" fill="var(--illus-teal-1)" />
      <rect x="128" y="34" width="10" height="24" rx="5" fill="var(--illus-teal-1)" />
      <circle cx="76" cy="102" r="8" fill="var(--illus-teal-3)" />
      <circle cx="100" cy="102" r="8" fill="var(--illus-teal-3)" />
      <circle cx="124" cy="102" r="8" fill="var(--illus-teal-3)" />
      <circle cx="76" cy="128" r="8" fill="var(--illus-hangat-soft)" />
      <circle cx="100" cy="128" r="8" fill="var(--illus-teal-3)" />
      {/* centang pada tanggal terpilih */}
      <circle cx="124" cy="128" r="11" fill="var(--illus-teal-1)" />
      <path d="M119 128l4 4 6-8" fill="none" stroke="var(--illus-putih)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* hati */}
      <path d="M168 54c-4-6-13-5-13 3 0 6 8 11 13 15 5-4 13-9 13-15 0-8-9-9-13-3Z" fill="var(--illus-hangat)" opacity="0.8" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 5. Keranjang belanja berisi. Dipakai di Toko & Keranjang kosong.
// -------------------------------------------------------------
export function IlustrasiKeranjang({ size = 150, className = '', label = 'Ilustrasi keranjang belanja' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label={label}>
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-hangat-soft)" />
      {/* barang di belakang keranjang */}
      <rect x="58" y="60" width="26" height="46" rx="8" fill="var(--illus-teal-2)" />
      <rect x="62" y="52" width="18" height="14" rx="5" fill="var(--illus-teal-1)" />
      <rect x="88" y="66" width="30" height="40" rx="9" fill="var(--illus-teal-2)" />
      <circle cx="118" cy="74" r="13" fill="var(--illus-hangat)" />
      {/* keranjang */}
      <path d="M44 92h102l-13 56a8 8 0 0 1-8 6H65a8 8 0 0 1-8-6L44 92Z" fill="var(--illus-teal-2)" />
      <path d="M44 92h102l-3 14H47Z" fill="var(--illus-hangat-soft)" />
      <path d="M76 92c0-22 8-34 19-34s19 12 19 34" fill="none" stroke="var(--illus-teal-2)" strokeWidth="6" strokeLinecap="round" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 6. Paket kiriman. Dipakai di Pesanan.
// -------------------------------------------------------------
export function IlustrasiPaket({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi paket pesanan">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-teal-3)" />
      <rect x="52" y="70" width="86" height="82" rx="10" fill="var(--illus-teal-2)" />
      <rect x="52" y="70" width="86" height="20" rx="10" fill="var(--illus-teal-2)" />
      <rect x="52" y="82" width="86" height="10" fill="var(--illus-teal-2)" />
      <rect x="86" y="70" width="18" height="82" fill="var(--illus-teal-3)" />
      <rect x="86" y="70" width="18" height="82" fill="var(--illus-hangat-soft)" opacity="0.5" />
      {/* pita */}
      <path d="M95 70c-10-14-26-12-24-2 2 8 16 8 24 2Zm0 0c10-14 26-12 24-2-2 8-16 8-24 2Z" fill="var(--illus-hangat)" />
      <circle cx="95" cy="70" r="6" fill="var(--illus-hangat)" />
      {/* tanda hati pada label */}
      <path d="M95 112c-3-5-10-4-10 2 0 5 6 9 10 12 4-3 10-7 10-12 0-6-7-7-10-2Z" fill="var(--illus-putih)" opacity="0.9" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 7. Lonceng notifikasi. Dipakai di Notifikasi.
// -------------------------------------------------------------
export function IlustrasiNotifikasi({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi notifikasi">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-teal-3)" />
      <path d="M62 118c0-38 6-64 33-64s33 26 33 64Z" fill="var(--illus-teal-2)" />
      <rect x="56" y="116" width="78" height="14" rx="7" fill="var(--illus-teal-2)" />
      <circle cx="95" cy="48" r="8" fill="var(--illus-teal-1)" />
      <path d="M87 136c0 6 4 10 8 10s8-4 8-10Z" fill="var(--illus-teal-2)" />
      {/* garis getar */}
      <path d="M42 92c-6-6-6-16 0-22M148 92c6-6 6-16 0-22" fill="none" stroke="var(--illus-teal-2)" strokeWidth="5" strokeLinecap="round" />
      {/* percikan */}
      <path d="M150 44l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-teal-2)" />
      <path d="M36 52l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--illus-hangat)" opacity="0.85" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 8. Profil pengguna (avatar besar). Dipakai di Profil.
// -------------------------------------------------------------
export function IlustrasiProfil({ size = 130, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi profil pengguna">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-teal-3)" />
      <path d="M60 154c2-38 18-56 35-56s33 18 35 56Z" fill="var(--illus-teal-1)" />
      <circle cx="95" cy="74" r="38" fill="var(--illus-kulit)" />
      <path d="M57 70c0-22 17-40 38-40s38 18 38 40c0 5-1 10-3 14-4-15-17-23-35-23s-31 8-35 23c-2-4-3-9-3-14Z" fill="var(--illus-rambut)" />
      <ellipse cx="83" cy="76" rx="3" ry="4" fill="var(--illus-mata)" />
      <ellipse cx="107" cy="76" rx="3" ry="4" fill="var(--illus-mata)" />
      <ellipse cx="74" cy="86" rx="6" ry="4" fill="var(--illus-hangat)" opacity="0.5" />
      <ellipse cx="116" cy="86" rx="6" ry="4" fill="var(--illus-hangat)" opacity="0.5" />
      <path d="M88 89c4 5 10 5 14 0" fill="none" stroke="var(--illus-mata)" strokeWidth="2.6" strokeLinecap="round" />
      {/* kerah */}
      <path d="M95 106c-8 0-15 5-19 13 5 6 11 9 19 9s14-3 19-9c-4-8-11-13-19-13Z" fill="var(--illus-putih)" />
      {/* hati kecil */}
      <path d="M158 62c-4-6-13-5-13 3 0 6 8 11 13 15 5-4 13-9 13-15 0-8-9-9-13-3Z" fill="var(--illus-hangat)" opacity="0.8" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 9. Halaman tidak ditemukan.
// -------------------------------------------------------------
export function IlustrasiTidakDitemukan({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi halaman tidak ditemukan">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-hangat-soft)" />
      {/* karakter kecil bingung */}
      <circle cx="80" cy="96" r="26" fill="var(--illus-kulit)" />
      <path d="M54 92c0-15 12-27 26-27s26 12 26 27c0 3-1 7-2 10-3-10-12-16-24-16s-21 6-24 16c-1-3-2-7-2-10Z" fill="var(--illus-rambut)" />
      <ellipse cx="71" cy="97" rx="2.4" ry="3.2" fill="var(--illus-mata)" />
      <ellipse cx="89" cy="97" rx="2.4" ry="3.2" fill="var(--illus-mata)" />
      <ellipse cx="63" cy="105" rx="4.4" ry="3" fill="var(--illus-hangat)" opacity="0.55" />
      <ellipse cx="97" cy="105" rx="4.4" ry="3" fill="var(--illus-hangat)" opacity="0.55" />
      <path d="M74 109c3-4 9-4 12 0" fill="none" stroke="var(--illus-mata)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M62 142c2-14 8-22 18-22s16 8 18 22Z" fill="var(--illus-teal-2)" />
      {/* kaca pembesar */}
      <circle cx="128" cy="104" r="26" fill="var(--illus-putih)" opacity="0.85" stroke="var(--illus-teal-1)" strokeWidth="7" />
      <path d="M147 124l18 18" stroke="var(--illus-teal-1)" strokeWidth="10" strokeLinecap="round" />
      <path d="M120 96l4 6 7 2-5 5 1 7-7-3-6 4 1-7-5-5 7-2Z" fill="var(--illus-teal-2)" opacity="0.9" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 10. Stetoskop & hati. Dipakai di Masuk dan Registrasi.
// -------------------------------------------------------------
export function IlustrasiSehat({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi layanan kesehatan">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-teal-3)" />
      {/* hati besar */}
      <path d="M95 142C64 120 44 102 44 78c0-18 14-30 30-30 9 0 17 4 21 11 4-7 12-11 21-11 16 0 30 12 30 30 0 24-20 42-51 64Z" fill="var(--illus-hangat)" />
      <path d="M95 142C64 120 44 102 44 78c0-18 14-30 30-30 9 0 17 4 21 11-6 6-10 16-10 28 0 20 8 36 10 55Z" fill="var(--illus-hangat-soft)" opacity="0.55" />
      {/* denyut */}
      <path d="M62 84h16l7-16 10 30 8-20 6 6h17" fill="none" stroke="var(--illus-putih)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* stetoskop */}
      <path d="M40 30v18a20 20 0 0 0 40 0V30" fill="none" stroke="var(--illus-teal-2)" strokeWidth="7" strokeLinecap="round" />
      <path d="M60 68v10a34 34 0 0 0 34 34h12" fill="none" stroke="var(--illus-teal-2)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="120" cy="112" r="13" fill="var(--illus-teal-2)" />
      <circle cx="120" cy="112" r="6" fill="var(--illus-teal-3)" />
      <circle cx="40" cy="28" r="6" fill="var(--illus-teal-1)" />
      <circle cx="80" cy="28" r="6" fill="var(--illus-teal-1)" />
      {/* percikan */}
      <path d="M158 44l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-teal-2)" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 11. Kotak kosong generik untuk keadaan kosong apa pun.
// -------------------------------------------------------------
export function IlustrasiKosong({ size = 130, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi belum ada data">
      <ellipse cx="95" cy="158" rx="62" ry="9" fill="var(--illus-teal-3)" />
      <path d="M48 92h94v50a10 10 0 0 1-10 10H58a10 10 0 0 1-10-10Z" fill="var(--illus-teal-2)" />
      <path d="M48 92h94l-6-14a10 10 0 0 0-9-6H63a10 10 0 0 0-9 6Z" fill="var(--illus-teal-2)" />
      <rect x="84" y="118" width="22" height="10" rx="5" fill="var(--illus-teal-3)" />
      <path d="M95 70c-14-18-34-14-32-2 2 10 20 10 32 2Zm0 0c14-18 34-14 32-2-2 10-20 10-32 2Z" fill="var(--illus-hangat)" opacity="0.9" />
      <circle cx="95" cy="72" r="7" fill="var(--illus-hangat)" />
    </Bingkai>
  )
}

// =============================================================
// TAMBAHAN: ilustrasi untuk halaman konten dan akun.
//
// Semua memakai bahasa bentuk yang sama dengan ilustrasi di atas
// (bulat, lembut, tanpa sudut tajam) dan hanya warna token
// (--illus-*), jadi mode gelap ikut berubah tanpa pengecualian
// per komponen. Menambah ilustrasi baru: ikuti pola yang sama,
// jangan memakai warna heksadesimal langsung.
// =============================================================

// Hati kecil yang dipakai ulang. Digambar dari satu titik asal lalu
// diperkecil, supaya bentuknya persis sama di semua ilustrasi.
function Hati({ x = 0, y = 0, s = 0.3, fill = 'var(--illus-hangat)', opacity = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path
        d="M0 64C-31 42-51 24-51 0c0-18 14-30 30-30 9 0 17 4 21 11 4-7 12-11 21-11 16 0 30 12 30 30 0 24-20 42-51 64Z"
        fill={fill}
      />
    </g>
  )
}

// -------------------------------------------------------------
// 12. Tentang Kami: apoteker di depan gedung apotek.
// -------------------------------------------------------------
export function IlustrasiTentangKami({ size = 180, className = '' }) {
  return (
    <Bingkai viewBox="0 0 220 180" size={size} className={className} label="Ilustrasi apoteker dan gedung apotek">
      <ellipse cx="110" cy="168" rx="86" ry="10" fill="var(--illus-teal-3)" />

      {/* gedung apotek */}
      <rect x="118" y="66" width="84" height="94" rx="12" fill="var(--illus-teal-1)" />
      <rect x="118" y="66" width="84" height="22" rx="12" fill="var(--illus-teal-2)" />
      <rect x="118" y="80" width="84" height="8" fill="var(--illus-teal-2)" />
      <rect x="140" y="112" width="22" height="48" rx="5" fill="var(--illus-putih)" />
      <rect x="130" y="124" width="42" height="22" rx="5" fill="var(--illus-putih)" />
      <rect x="176" y="112" width="16" height="18" rx="4" fill="var(--illus-teal-3)" />

      {/* apoteker */}
      <path d="M52 168c2-36 15-54 34-54s32 18 34 54Z" fill="var(--illus-putih)" />
      <path d="M86 114l-9 13 9 11 9-11Z" fill="var(--illus-teal-2)" />
      <circle cx="86" cy="84" r="25" fill="var(--illus-kulit)" />
      <path d="M61 82c0-14 11-25 25-25s25 11 25 25c0 3-1 6-2 9-3-9-11-14-23-14s-20 5-23 14c-1-3-2-6-2-9Z" fill="var(--illus-rambut)" />
      <ellipse cx="78" cy="86" rx="2.3" ry="3.1" fill="var(--illus-mata)" />
      <ellipse cx="94" cy="86" rx="2.3" ry="3.1" fill="var(--illus-mata)" />
      <path d="M81 94c3 3 7 3 10 0" fill="none" stroke="var(--illus-mata)" strokeWidth="2.2" strokeLinecap="round" />

      {/* stetoskop menggantung di leher */}
      <path d="M68 120v12a18 18 0 0 0 36 0v-12" fill="none" stroke="var(--illus-teal-2)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="104" cy="132" r="7" fill="var(--illus-teal-1)" />

      <Hati x={196} y={38} s={0.34} opacity={0.85} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 13. Kontak Kami: ponsel, gelembung pesan, dan pin lokasi.
// -------------------------------------------------------------
export function IlustrasiKontak({ size = 160, className = '' }) {
  return (
    <Bingkai viewBox="0 0 200 170" size={size} className={className} label="Ilustrasi kontak apotek">
      <ellipse cx="100" cy="158" rx="68" ry="9" fill="var(--illus-teal-3)" />

      <rect x="46" y="30" width="66" height="116" rx="15" fill="var(--illus-teal-2)" />
      <rect x="54" y="42" width="50" height="84" rx="8" fill="var(--illus-putih)" />
      <rect x="71" y="132" width="16" height="5" rx="2.5" fill="var(--illus-teal-3)" />

      {/* gelembung pesan di layar ponsel */}
      <path d="M62 56h34a7 7 0 0 1 7 7v18a7 7 0 0 1-7 7h-18l-9 9v-9h-7a7 7 0 0 1-7-7V63a7 7 0 0 1 7-7Z" fill="var(--illus-teal-3)" />
      <circle cx="72" cy="72" r="2.8" fill="var(--illus-teal-1)" />
      <circle cx="80" cy="72" r="2.8" fill="var(--illus-teal-1)" />
      <circle cx="88" cy="72" r="2.8" fill="var(--illus-teal-1)" />
      <rect x="62" y="98" width="34" height="6" rx="3" fill="var(--illus-teal-3)" />
      <rect x="62" y="110" width="22" height="6" rx="3" fill="var(--illus-teal-3)" />

      {/* pin lokasi */}
      <path d="M140 52c0-17 13-30 29-30s29 13 29 30c0 21-29 47-29 47s-29-26-29-47Z" fill="var(--illus-hangat)" />
      <circle cx="169" cy="52" r="11" fill="var(--illus-putih)" />

      <Hati x={34} y={94} s={0.3} fill="var(--illus-teal-2)" opacity={0.8} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 14. FAQ: dua gelembung tanya jawab.
// -------------------------------------------------------------
export function IlustrasiFAQ({ size = 160, className = '' }) {
  return (
    <Bingkai viewBox="0 0 200 170" size={size} className={className} label="Ilustrasi pertanyaan yang sering diajukan">
      <ellipse cx="100" cy="158" rx="68" ry="9" fill="var(--illus-teal-3)" />

      <path d="M40 34h76a12 12 0 0 1 12 12v34a12 12 0 0 1-12 12H74l-21 19v-19H40a12 12 0 0 1-12-12V46a12 12 0 0 1 12-12Z" fill="var(--illus-teal-2)" />
      <path d="M70 54c0-7 5-12 12-12s12 5 12 12c0 5-3 8-6 10-2 1-3 2-3 4" fill="none" stroke="var(--illus-putih)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="85" cy="84" r="4.2" fill="var(--illus-putih)" />

      <path d="M116 92h46a11 11 0 0 1 11 11v22a11 11 0 0 1-11 11h-10l-15 13v-13h-21a11 11 0 0 1-11-11v-22a11 11 0 0 1 11-11Z" fill="var(--illus-teal-3)" />
      <path d="M129 114l7 7 13-15" fill="none" stroke="var(--illus-teal-1)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />

      <path d="M172 30l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-hangat)" opacity="0.85" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 15. Syarat dan Ketentuan: dokumen dengan tanda centang.
// -------------------------------------------------------------
export function IlustrasiSyarat({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi syarat dan ketentuan">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <rect x="46" y="22" width="84" height="120" rx="12" fill="var(--illus-putih)" stroke="var(--illus-teal-2)" strokeWidth="3" />
      <rect x="46" y="22" width="84" height="22" rx="12" fill="var(--illus-teal-2)" />
      <rect x="46" y="36" width="84" height="8" fill="var(--illus-teal-2)" />
      <rect x="58" y="58" width="60" height="7" rx="3.5" fill="var(--illus-teal-3)" />
      <rect x="58" y="74" width="60" height="7" rx="3.5" fill="var(--illus-teal-3)" />
      <rect x="58" y="90" width="44" height="7" rx="3.5" fill="var(--illus-teal-3)" />
      <rect x="58" y="106" width="52" height="7" rx="3.5" fill="var(--illus-teal-3)" />

      <circle cx="138" cy="116" r="25" fill="var(--illus-teal-1)" />
      <path d="M127 116l8 8 15-17" fill="none" stroke="var(--illus-putih)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />

      <Hati x={38} y={42} s={0.28} opacity={0.8} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 16. Kebijakan Privasi: perisai dengan gembok.
// -------------------------------------------------------------
export function IlustrasiPrivasi({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi perlindungan data pribadi">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M95 20l52 18v42c0 34-22 56-52 66-30-10-52-32-52-66V38Z" fill="var(--illus-teal-1)" />
      <path d="M95 20l52 18v42c0 34-22 56-52 66Z" fill="var(--illus-teal-2)" />

      <rect x="77" y="76" width="36" height="32" rx="8" fill="var(--illus-putih)" />
      <path d="M85 76v-9a10 10 0 0 1 20 0v9" fill="none" stroke="var(--illus-putih)" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="95" cy="89" r="4.6" fill="var(--illus-teal-1)" />
      <rect x="92.8" y="89" width="4.4" height="11" rx="2.2" fill="var(--illus-teal-1)" />

      <path d="M160 44l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--illus-hangat)" opacity={0.8} />
      <path d="M28 58l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--illus-teal-2)" opacity={0.7} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 17. Testimoni Pelanggan: gelembung ulasan berbintang.
// -------------------------------------------------------------
export function IlustrasiTestimoni({ size = 155, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi testimoni pelanggan">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M30 34h116a12 12 0 0 1 12 12v44a12 12 0 0 1-12 12H78l-24 21v-21H30a12 12 0 0 1-12-12V46a12 12 0 0 1 12-12Z" fill="var(--illus-putih)" stroke="var(--illus-teal-2)" strokeWidth="3" />

      <path d="M88 48l8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3Z" fill="var(--illus-hangat)" />
      <rect x="44" y="96" width="62" height="7" rx="3.5" fill="var(--illus-teal-3)" />
      <rect x="44" y="109" width="44" height="7" rx="3.5" fill="var(--illus-teal-3)" />

      <circle cx="150" cy="112" r="19" fill="var(--illus-kulit)" />
      <path d="M131 110c0-11 8-19 19-19s19 8 19 19c0 3-1 5-2 8-2-7-9-12-17-12s-15 5-17 12c-1-3-2-5-2-8Z" fill="var(--illus-rambut)" />
      <path d="M150 131c-7 0-12 4-15 11h30c-3-7-8-11-15-11Z" fill="var(--illus-teal-2)" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 18. Blog / Berita: buku terbuka dengan pensil.
// -------------------------------------------------------------
export function IlustrasiBlog({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi artikel dan berita kesehatan">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M95 50c-13-9-31-11-47-7v78c16-4 34-2 47 7 13-9 31-11 47-7V43c-16-4-34-2-47 7Z" fill="var(--illus-putih)" stroke="var(--illus-teal-2)" strokeWidth="3" />
      <path d="M95 50v78" stroke="var(--illus-teal-2)" strokeWidth="3" />
      <rect x="58" y="62" width="27" height="6" rx="3" fill="var(--illus-teal-3)" />
      <rect x="58" y="75" width="27" height="6" rx="3" fill="var(--illus-teal-3)" />
      <rect x="58" y="88" width="19" height="6" rx="3" fill="var(--illus-teal-3)" />
      <rect x="105" y="62" width="27" height="6" rx="3" fill="var(--illus-teal-3)" />
      <rect x="105" y="75" width="27" height="6" rx="3" fill="var(--illus-teal-3)" />

      <g transform="rotate(36 152 104)">
        <rect x="146" y="80" width="13" height="42" rx="3" fill="var(--illus-teal-2)" />
        <path d="M146 122l6.5 13 6.5-13Z" fill="var(--illus-hangat)" />
      </g>

      <Hati x={38} y={42} s={0.28} opacity={0.8} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 19. Promo / Diskon: label harga dengan tanda persen.
// -------------------------------------------------------------
export function IlustrasiPromo({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi promo dan diskon">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M46 74h84l14 20-14 20H46a10 10 0 0 1-10-10V84a10 10 0 0 1 10-10Z" fill="var(--illus-teal-2)" />
      <circle cx="140" cy="94" r="7" fill="var(--illus-teal-3)" />

      <circle cx="68" cy="86" r="7" fill="none" stroke="var(--illus-putih)" strokeWidth="4.5" />
      <circle cx="92" cy="102" r="7" fill="none" stroke="var(--illus-putih)" strokeWidth="4.5" />
      <path d="M68 108l24-22" stroke="var(--illus-putih)" strokeWidth="4.5" strokeLinecap="round" />

      {/* pita di atas label */}
      <path d="M88 74c-13-17-32-15-30-2 2 9 19 9 30 2Zm0 0c13-17 32-15 30-2-2 9-19 9-30 2Z" fill="var(--illus-hangat)" />
      <circle cx="88" cy="74" r="7" fill="var(--illus-hangat)" />

      <path d="M160 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-teal-2)" />
      <Hati x={32} y={112} s={0.26} opacity={0.75} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 20. Wishlist: kartu produk dengan hati.
// -------------------------------------------------------------
export function IlustrasiWishlist({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi daftar produk favorit">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <rect x="46" y="42" width="88" height="104" rx="13" fill="var(--illus-putih)" stroke="var(--illus-teal-2)" strokeWidth="3" />
      <rect x="58" y="54" width="64" height="42" rx="9" fill="var(--illus-teal-3)" />
      <rect x="58" y="106" width="46" height="7" rx="3.5" fill="var(--illus-teal-3)" />
      <rect x="58" y="119" width="30" height="7" rx="3.5" fill="var(--illus-teal-3)" />

      <Hati x={128} y={58} s={0.44} />

      <path d="M148 118l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--illus-teal-2)" opacity={0.85} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 21. Pengaturan Pengiriman: rumah dengan pin alamat.
// -------------------------------------------------------------
export function IlustrasiAlamat({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi alamat pengiriman">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M95 44l54 42v58a8 8 0 0 1-8 8H49a8 8 0 0 1-8-8V86Z" fill="var(--illus-teal-2)" />
      <path d="M95 44l54 42v58a8 8 0 0 1-8 8H95Z" fill="var(--illus-teal-1)" />
      <rect x="76" y="106" width="38" height="46" rx="6" fill="var(--illus-putih)" />
      <rect x="83" y="116" width="10" height="10" rx="2" fill="var(--illus-teal-3)" />
      <rect x="99" y="116" width="10" height="10" rx="2" fill="var(--illus-teal-3)" />
      <rect x="83" y="132" width="10" height="10" rx="2" fill="var(--illus-teal-3)" />
      <rect x="99" y="132" width="10" height="10" rx="2" fill="var(--illus-teal-3)" />

      <path d="M138 52c0-13 10-23 23-23s23 10 23 23c0 16-23 36-23 36s-23-20-23-36Z" fill="var(--illus-hangat)" />
      <circle cx="161" cy="52" r="8.5" fill="var(--illus-putih)" />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 22. Pengiriman: mobil kurir apotek.
// -------------------------------------------------------------
export function IlustrasiPengiriman({ size = 160, className = '' }) {
  return (
    <Bingkai viewBox="0 0 200 170" size={size} className={className} label="Ilustrasi pengiriman pesanan">
      <ellipse cx="100" cy="158" rx="72" ry="9" fill="var(--illus-teal-3)" />

      {/* kotak barang di atas mobil */}
      <rect x="104" y="24" width="52" height="34" rx="7" fill="var(--illus-hangat-soft)" stroke="var(--illus-hangat)" strokeWidth="3" />
      <path d="M130 32v18M121 41h18" stroke="var(--illus-hangat)" strokeWidth="4" strokeLinecap="round" />

      {/* badan mobil */}
      <path d="M34 104h132v30a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10Z" fill="var(--illus-teal-2)" />
      <path d="M34 104h132v10H34Z" fill="var(--illus-teal-1)" />
      <path d="M34 96a10 10 0 0 1 10-10h34a8 8 0 0 1 8 8v10H34Z" fill="var(--illus-teal-2)" />
      <rect x="44" y="94" width="30" height="20" rx="4" fill="var(--illus-putih)" />
      <rect x="128" y="118" width="30" height="8" rx="4" fill="var(--illus-teal-3)" />

      {/* roda */}
      <circle cx="66" cy="146" r="14" fill="var(--illus-mata)" />
      <circle cx="66" cy="146" r="6" fill="var(--illus-putih)" />
      <circle cx="140" cy="146" r="14" fill="var(--illus-mata)" />
      <circle cx="140" cy="146" r="6" fill="var(--illus-putih)" />

      <path d="M26 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-teal-2)" opacity={0.85} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 23. Pembayaran: kartu dan dompet.
// -------------------------------------------------------------
export function IlustrasiPembayaran({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi metode pembayaran">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      {/* dompet */}
      <path d="M42 78h96a12 12 0 0 1 12 12v38a12 12 0 0 1-12 12H42a12 12 0 0 1-12-12V90a12 12 0 0 1 12-12Z" fill="var(--illus-teal-2)" />
      <path d="M104 92h34a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-34a11 11 0 0 1 0-22Z" fill="var(--illus-teal-1)" />
      <circle cx="120" cy="103" r="4.5" fill="var(--illus-putih)" />

      {/* kartu menonjol */}
      <rect x="58" y="36" width="88" height="56" rx="10" fill="var(--illus-putih)" stroke="var(--illus-teal-2)" strokeWidth="3" />
      <rect x="58" y="50" width="88" height="12" fill="var(--illus-teal-3)" />
      <rect x="68" y="72" width="26" height="8" rx="4" fill="var(--illus-teal-2)" />
      <circle cx="126" cy="76" r="7" fill="var(--illus-hangat)" />
      <circle cx="136" cy="76" r="7" fill="var(--illus-hangat)" opacity={0.7} />

      <path d="M162 118l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--illus-teal-2)" opacity={0.8} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 24. Pengaturan Akun: avatar dengan roda gigi.
// -------------------------------------------------------------
export function IlustrasiAkun({ size = 150, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi pengaturan akun">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M58 152c2-38 18-56 37-56s35 18 37 56Z" fill="var(--illus-teal-1)" />
      <circle cx="95" cy="72" r="36" fill="var(--illus-kulit)" />
      <path d="M59 68c0-21 16-38 36-38s36 17 36 38c0 4-1 9-3 13-4-14-16-22-33-22s-29 8-33 22c-2-4-3-9-3-13Z" fill="var(--illus-rambut)" />
      <ellipse cx="84" cy="74" rx="2.9" ry="3.9" fill="var(--illus-mata)" />
      <ellipse cx="106" cy="74" rx="2.9" ry="3.9" fill="var(--illus-mata)" />
      <path d="M88 86c4 5 10 5 14 0" fill="none" stroke="var(--illus-mata)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M95 104c-8 0-15 5-19 13 5 6 11 9 19 9s14-3 19-9c-4-8-11-13-19-13Z" fill="var(--illus-putih)" />

      {/* roda gigi */}
      <g transform="translate(148 122)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
          <rect key={d} x="-4" y="-30" width="8" height="13" rx="4" fill="var(--illus-teal-2)" transform={`rotate(${d})`} />
        ))}
        <circle cx="0" cy="0" r="21" fill="var(--illus-teal-2)" />
        <circle cx="0" cy="0" r="8.5" fill="var(--illus-putih)" />
      </g>
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 25. Pencarian tanpa hasil: kaca pembesar di atas kotak kosong.
// -------------------------------------------------------------
export function IlustrasiPencarianKosong({ size = 140, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi pencarian tidak ditemukan">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <path d="M42 96h96v44a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10Z" fill="var(--illus-teal-2)" />
      <path d="M42 96h96l-6-13a10 10 0 0 0-9-6H57a10 10 0 0 0-9 6Z" fill="var(--illus-teal-2)" />
      <rect x="84" y="120" width="24" height="10" rx="5" fill="var(--illus-teal-3)" />

      <circle cx="82" cy="52" r="26" fill="var(--illus-putih)" opacity={0.9} stroke="var(--illus-teal-1)" strokeWidth="7" />
      <path d="M101 72l20 20" stroke="var(--illus-teal-1)" strokeWidth="10" strokeLinecap="round" />

      <path d="M150 44l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--illus-hangat)" opacity={0.8} />
    </Bingkai>
  )
}

// -------------------------------------------------------------
// 26. Berhasil: tanda centang besar dengan percikan.
// -------------------------------------------------------------
export function IlustrasiSukses({ size = 140, className = '' }) {
  return (
    <Bingkai viewBox="0 0 190 170" size={size} className={className} label="Ilustrasi berhasil">
      <ellipse cx="95" cy="158" rx="64" ry="9" fill="var(--illus-teal-3)" />

      <circle cx="95" cy="90" r="52" fill="var(--illus-teal-2)" />
      <circle cx="95" cy="90" r="40" fill="var(--illus-putih)" />
      <path d="M76 90l13 14 26-30" fill="none" stroke="var(--illus-teal-1)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />

      <path d="M32 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-teal-2)" opacity={0.85} />
      <path d="M156 46l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="var(--illus-hangat)" opacity={0.85} />
      <Hati x={95} y={26} s={0.24} opacity={0.85} />
    </Bingkai>
  )
}
