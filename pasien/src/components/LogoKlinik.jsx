// =============================================================
// Lambang klinik (emblem) yang menyesuaikan mode terang/gelap.
//
// Lambang resmi berwarna hijau tua. Di atas latar gelap warnanya
// nyaris menyatu (rasio kontras ~1,9:1, di bawah batas 3:1 untuk
// elemen grafis), jadi disediakan versi terang dengan bentuk dan
// detail yang sama, hanya diwarnai ulang. Keduanya dirender dan
// salah satu disembunyikan lewat varian `dark:`.
//
// Ukuran default 40px; header, footer, dan halaman masuk memakai
// ukuran sedikit berbeda supaya proporsional di tempatnya.
// =============================================================
export default function LogoKlinik({ size = 40, className = '' }) {
  const gaya = { width: size, height: size }

  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`} style={gaya}>
      <img
        src="/logo/logo_emblem.png"
        alt=""
        width={size}
        height={size}
        style={gaya}
        className="object-contain dark:hidden"
      />
      <img
        src="/logo/logo_emblem_terang.png"
        alt=""
        width={size}
        height={size}
        style={gaya}
        className="hidden object-contain dark:block"
      />
    </span>
  )
}
