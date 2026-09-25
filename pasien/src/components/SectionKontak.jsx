import {
  IconJam, IconLokasi, IconTelepon, IconWhatsapp, IconKirimPesan, IconPanahMiring, IconChat,
} from './Icons'

// =============================================================
// Section kontak (gaya referensi "contact section").
//
// Panel gelap dengan gambar latar samar, kartu form putih di kiri,
// dan ajakan + keunggulan + kartu kontak langsung di kanan.
//
// Komponen ini murni tampilan: seluruh state form, pemeriksaan
// isian, dan pengiriman tetap dipegang halaman Kontak - jadi
// fungsinya tidak berubah, hanya wajahnya.
//
// Data yang tampil (nomor telepon, WhatsApp, alamat) datang dari
// pengaturan server, bukan ditulis di kode.
// =============================================================

const GAMBAR_LATAR =
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1600&q=80'

const TOPIK = [
  'Pertanyaan tentang pesanan',
  'Tanya ketersediaan obat',
  'Konsultasi pemakaian obat',
  'Kerja sama atau lainnya',
]

export default function SectionKontak({ info, form, ubah, kirim, galatForm = {}, sibuk = false }) {
  const wa = (info?.whatsapp || '').replace(/[^0-9]/g, '').replace(/^0/, '62')

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-shell)] bg-emerald-950">
      {/* --- Latar: foto samar + gradasi.
           Gradasi dibuat lebih pekat dari referensi karena teks di
           atasnya harus tetap lolos kontras AA; foto obat yang ramai
           membuat teks tipis sulit dibaca tanpa lapisan ini. --- */}
      <span className="absolute inset-0" aria-hidden="true">
        <img src={GAMBAR_LATAR} alt="" loading="lazy" className="h-full w-full object-cover opacity-25" />
        <span className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-950/95 to-emerald-900/85" />
      </span>

      <div className="relative z-10 p-5 sm:p-8 md:p-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* ============ KIRI: kartu form ============ */}
          <div className="lg:col-span-5">
            <div className="rounded-[var(--radius-card)] bg-white/95 p-4 shadow-lift ring-1 ring-black/10 backdrop-blur sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                    Layanan Pelanggan
                  </p>
                  <h3 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[27px]">
                    Ada pertanyaan?
                  </h3>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-emerald-950 text-emerald-50">
                  <IconChat size={18} weight="bold" />
                </span>
              </div>

              <form onSubmit={kirim} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="ct-topik" className="block text-[12.5px] text-neutral-600">
                    Topik
                  </label>
                  <select
                    id="ct-topik"
                    value={form.subject}
                    onChange={(e) => ubah('subject', e.target.value)}
                    className="mt-1 w-full rounded-[var(--radius-control)] bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none ring-1 ring-black/10 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-700"
                  >
                    {TOPIK.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ct-nama" className="block text-[12.5px] text-neutral-600">
                    Nama<span className="text-neutral-400"> *</span>
                  </label>
                  <input
                    id="ct-nama"
                    type="text"
                    value={form.name}
                    onChange={(e) => ubah('name', e.target.value)}
                    placeholder="Contoh: Siti Nurhaliza"
                    className="mt-1 w-full rounded-[var(--radius-control)] bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none ring-1 ring-black/10 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-700"
                  />
                  {galatForm.name && <p className="mt-1 text-[12.5px] text-red-600">{galatForm.name}</p>}
                </div>

                <div>
                  <label htmlFor="ct-email" className="block text-[12.5px] text-neutral-600">
                    Email<span className="text-neutral-400"> *</span>
                  </label>
                  <input
                    id="ct-email"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => ubah('email', e.target.value)}
                    placeholder="nama@email.com"
                    className="mt-1 w-full rounded-[var(--radius-control)] bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none ring-1 ring-black/10 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-700"
                  />
                  {galatForm.email && <p className="mt-1 text-[12.5px] text-red-600">{galatForm.email}</p>}
                </div>

                <div>
                  <label htmlFor="ct-hp" className="block text-[12.5px] text-neutral-600">
                    Nomor HP / WhatsApp
                  </label>
                  <input
                    id="ct-hp"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => ubah('phone', e.target.value)}
                    placeholder="0812-3456-7890"
                    className="mt-1 w-full rounded-[var(--radius-control)] bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none ring-1 ring-black/10 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label htmlFor="ct-pesan" className="block text-[12.5px] text-neutral-600">
                    Pesan<span className="text-neutral-400"> *</span>
                  </label>
                  <textarea
                    id="ct-pesan"
                    rows={4}
                    value={form.message}
                    onChange={(e) => ubah('message', e.target.value)}
                    placeholder="Ada yang bisa kami bantu?"
                    className="mt-1 w-full resize-y rounded-[var(--radius-control)] bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none ring-1 ring-black/10 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-700"
                  />
                  {galatForm.message && <p className="mt-1 text-[12.5px] text-red-600">{galatForm.message}</p>}
                </div>

                {galatForm.umum && (
                  <p role="alert" className="text-[12.5px] leading-relaxed text-red-600">
                    {galatForm.umum}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sibuk}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-emerald-950 px-4 py-3 text-[15.5px] font-semibold text-emerald-50 transition-colors hover:bg-emerald-900 disabled:opacity-60"
                >
                  {sibuk ? 'Mengirim...' : 'Kirim pesan'}
                  <IconKirimPesan size={17} weight="bold" />
                </button>

                <p className="text-[11.5px] leading-relaxed text-neutral-500">
                  Dengan mengirim, Anda menyetujui Syarat &amp; Kebijakan Privasi kami.
                </p>
              </form>
            </div>
          </div>

          {/* ============ KANAN: ajakan + keunggulan + kontak langsung ============ */}
          <div className="lg:col-span-7">
            <h2 className="text-[36px] font-semibold leading-[1.05] tracking-tight text-emerald-50 sm:text-[44px]">
              Mari bicara.
            </h2>
            <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-emerald-50/90">
              Ceritakan kebutuhan Anda - tanya stok obat, pesanan, atau kerja sama. Kami membalas
              dalam satu hari kerja.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-white/10 text-emerald-200 ring-1 ring-white/15 backdrop-blur">
                  <IconJam size={17} weight="bold" />
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold text-emerald-50">Balasan cepat</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-50/80">
                    Sebagian besar pesan dibalas di bawah 24 jam.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-white/10 text-emerald-200 ring-1 ring-white/15 backdrop-blur">
                  <IconPanahMiring size={17} weight="bold" />
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold text-emerald-50">Langkah yang jelas</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-50/80">
                    Kami lanjutkan dengan rencana dan perkiraan waktu.
                  </p>
                </div>
              </div>
            </div>

            {/* Kartu kontak langsung */}
            <div className="mt-7">
              <div className="inline-flex max-w-full flex-wrap items-center gap-3 rounded-[var(--radius-card)] bg-white/95 p-3 shadow-lift ring-1 ring-black/10 backdrop-blur">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-emerald-950 text-emerald-50">
                  <IconTelepon size={20} weight="bold" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-none text-neutral-500">Telepon / WhatsApp</p>
                  {info?.phone ? (
                    <a
                      href={`tel:${info.phone.replace(/\s/g, '')}`}
                      className="numeric block truncate text-[16px] font-semibold tracking-tight text-neutral-900 hover:underline"
                    >
                      {info.phone}
                    </a>
                  ) : (
                    <p className="text-[16px] font-semibold text-neutral-900">-</p>
                  )}
                </div>
                {info?.whatsapp && (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent('Halo, saya ingin bertanya kepada Klinik Premysis Medika.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-emerald-950 px-3 py-2 text-[13px] font-semibold text-emerald-50 transition-colors hover:bg-emerald-900"
                  >
                    <IconWhatsapp size={15} weight="bold" />
                    Tanya langsung
                  </a>
                )}
              </div>
            </div>

            {/* Alamat singkat */}
            {info?.address && (
              <p className="mt-5 flex items-start gap-2.5 text-[14px] leading-relaxed text-emerald-50/85">
                <IconLokasi size={17} className="mt-0.5 shrink-0 text-emerald-200" />
                <span>{info.address}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
