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
