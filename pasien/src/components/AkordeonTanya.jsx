import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { IconTanya, IconPanahTurun, IconEmail } from './Icons'

// =============================================================
// Akordeon Tanya-Jawab bergaya kartu lembut.
//
// Satu pertanyaan terbuka pada satu waktu (accordion eksklusif).
// Tinggi jawaban dianimasikan dari 0 ke `auto` lewat framer-motion,
// sehingga membuka/menutup terasa halus tanpa mengukur tinggi
// manual.
//
// PENTING - animasi masuk memakai kelas .reveal (bukan
// `whileInView`). Animasi whileInView tidak andal pada gulir cepat
// atau programatik: elemen bisa terlewat dan, karena `once: true`,
// tidak pernah muncul lagi - seluruh akordeon jadi tak terlihat
// (opacity 0). Kelas .reveal sudah punya jaring pengaman fail-open
// di main.jsx, jadi konten dijamin tampil.
//
// Warna memakai token aplikasi, jadi mode gelap mengikuti otomatis.
// =============================================================

function BarisTanya({ item, terbuka, onToggle }) {
  const gerakDikurangi = useReducedMotion()
  const durasi = gerakDikurangi ? 0.01 : 0.22

  return (
    <li
      className={`reveal overflow-hidden rounded-[var(--radius-card)] border transition-colors duration-200 ${
        terbuka
          ? 'border-strong bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface-raised)]'
          : 'border-hairline surface-raised hover:surface-hover'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={terbuka}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
          <IconTanya size={19} weight="bold" />
        </span>
        <span
          className={`min-w-0 flex-1 text-[16.5px] font-semibold leading-snug transition-colors ${
            terbuka ? 'text-heading' : 'text-primary'
          }`}
        >
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: terbuka ? 180 : 0 }}
          transition={{ duration: durasi, ease: 'easeOut' }}
          className={`shrink-0 ${terbuka ? 'text-accent' : 'text-muted'}`}
        >
          <IconPanahTurun size={18} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {terbuka && (
          <motion.div
            key="jawaban"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: durasi, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pl-[3.75rem] text-[16px] leading-relaxed text-secondary">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function AkordeonTanya({ daftar = [], infoKontak }) {
  const [buka, setBuka] = useState(null)

  if (daftar.length === 0) return null

  return (
    <div className="space-y-2.5">
      <ul className="space-y-2.5">
        {daftar.map((f, i) => (
          <BarisTanya
            key={f.id ?? i}
            item={f}
            terbuka={buka === (f.id ?? i)}
            onToggle={() => setBuka(buka === (f.id ?? i) ? null : (f.id ?? i))}
          />
        ))}
      </ul>

      {infoKontak && (
        <div className="reveal mt-8 rounded-[var(--radius-card)] border border-hairline surface-raised p-6 text-center">
          <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
            <IconEmail size={20} weight="bold" />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-heading">{infoKontak.judul}</p>
          <p className="mt-1 text-[15.5px] text-secondary">{infoKontak.keterangan}</p>
          {infoKontak.aksi && <div className="mt-5">{infoKontak.aksi}</div>}
        </div>
      )}
    </div>
  )
}
