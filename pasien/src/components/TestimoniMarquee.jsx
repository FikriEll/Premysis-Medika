import { motion, useReducedMotion } from 'framer-motion'
import { AvatarPasien, Bintang } from './ui'
import { IconCentangBulat } from './Icons'

// =============================================================
// Section testimoni bergaya "marquee" tiga kolom.
//
// Tiap kolom berisi daun ulasan, digandakan dua kali, lalu digeser
// ke atas tanpa henti. Karena isi digandakan tepat dua kali dan
// jarak antar-kartu seragam (gap-6 + pb-6), saat animasi mencapai
// setengah tinggi, tampilannya kembali identik dengan awal - jadi
// gulirnya mulus tanpa jeda.
//
// PENTING - jangan pakai animasi `whileInView` di sini.
// Animasi berbasis viewport (whileInView) TIDAK andal pada gulir
// cepat atau programatik: elemen bisa terlewat dan, karena
// `once: true`, tidak pernah muncul kembali - akibatnya section
// tampil kosong (opacity 0). Itu kesalahan yang sama seperti yang
// dulu diperbaiki pada kelas .reveal (lihat main.jsx). Karena itu
// kartu di sini memakai kelas .reveal biasa yang punya jaring
// pengaman fail-open.
//
// Hanya gerak marquee (transform) yang memakai framer-motion,
// dan itu tidak menyembunyikan konten - bila gagal, kartu tetap
// terlihat, hanya tidak bergulir.
//
// Warna memakai token aplikasi (surface-*, text-*, accent), jadi
// mode gelap ikut menyesuaikan tanpa kelas `dark:` manual.
// =============================================================

// Satu kolom ulasan yang bergulir terus-menerus.
function KolomUlasan({ daftar, durasi = 18, kelas = '', ulangi = 2 }) {
  const gerakDikurangi = useReducedMotion()

  // Gandakan isi supaya lingkarannya mulus; salinan kedua diberi
  // aria-hidden agar pembaca layar tidak membacanya dua kali.
  const isi = Array.from({ length: ulangi }, (_, salinan) =>
    daftar.map((t, i) => ({ t, salinan, i })),
  ).flat()

  return (
    <div className={`w-full max-w-[22rem] ${kelas}`}>
      <motion.ul
        className="m-0 flex list-none flex-col gap-6 p-0 pb-6"
        animate={gerakDikurangi ? undefined : { y: '-50%' }}
        transition={
          gerakDikurangi
            ? undefined
            : { duration: durasi, repeat: Infinity, ease: 'linear', repeatType: 'loop' }
        }
      >
        {isi.map(({ t, salinan, i }) => (
          <motion.li
            key={`${salinan}-${t.id ?? i}`}
            aria-hidden={salinan === 1 ? 'true' : undefined}
            tabIndex={salinan === 1 ? -1 : 0}
            whileHover={
              gerakDikurangi
                ? undefined
                : {
                    scale: 1.03,
                    y: -6,
                    transition: { type: 'spring', stiffness: 380, damping: 18 },
                  }
            }
            className="cursor-default select-none rounded-[var(--radius-card)] border border-hairline surface-raised p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift"
          >
            <blockquote className="m-0 p-0">
              <Bintang nilai={t.rating} size={15} />
              <p className="mt-3 text-[16px] leading-relaxed text-secondary">{t.content}</p>
              <footer className="mt-5 flex items-center gap-3">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[var(--surface-sunken)]"
                  />
                ) : (
                  <AvatarPasien nama={t.name} size={40} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-semibold tracking-tight text-primary">
                    {t.name}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[14.5px] text-[var(--color-signal-green)]">
                    <IconCentangBulat size={14} weight="bold" />
                    Pelanggan terverifikasi
                  </p>
                </div>
              </footer>
            </blockquote>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}

// Bagi daftar ulasan menjadi tiga kolom secara bergilir (0,3,6...).
function bagiTiga(daftar) {
  return [
    daftar.filter((_, i) => i % 3 === 0),
    daftar.filter((_, i) => i % 3 === 1),
    daftar.filter((_, i) => i % 3 === 2),
  ]
}

export default function TestimoniMarquee({ daftar = [] }) {
  if (daftar.length === 0) return null

  // Kolom ke-2 dan ke-3 butuh cukup isi; ambil dari awal daftar bila kurang.
  const penuh = (kolom) =>
    kolom.length > 0 ? kolom : daftar.slice(0, Math.min(3, daftar.length))

  const [k1, k2, k3] = bagiTiga(daftar)
  const kolom2 = penuh(k2)
  const kolom3 = penuh(k3)

  // Bila isi kolom terlalu sedikit, ulangi lebih banyak agar lingkarannya
  // tetap penuh dan tidak menyisakan celah kosong.
  const ulangi = (kolom) => (kolom.length < 4 ? 3 : 2)

  return (
    <div
      className="relative flex max-h-[46rem] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      role="region"
      aria-label="Ulasan pelanggan yang bergulir"
    >
      <KolomUlasan daftar={k1} durasi={22} ulangi={ulangi(k1)} />
      <KolomUlasan daftar={kolom2} durasi={28} kelas="hidden md:block" ulangi={ulangi(kolom2)} />
      <KolomUlasan daftar={kolom3} durasi={25} kelas="hidden lg:block" ulangi={ulangi(kolom3)} />
    </div>
  )
}
