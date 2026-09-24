// =============================================================
// Store aplikasi pasien (e-commerce murni).
//
// Seluruh data berasal dari REST API apotek: katalog, keranjang,
// alamat, pesanan, dan pembayaran. Tidak ada salinan data di
// localStorage kecuali token sesi (memang milik perangkat ini).
// Dengan begitu stok, harga, dan status pesanan yang dilihat pasien
// selalu sama dengan yang dilihat petugas apotek.
// =============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import api, { ambilToken, simpanToken } from './api'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [memuat, setMemuat] = useState(true)
  const [galatMuat, setGalatMuat] = useState(null)
  const [toast, setToast] = useState(null)

  const [katalog, setKatalog] = useState({ categories: [], featured_products: [], latest_products: [], popular_products: [], promos: [], testimonials: [], faqs: [], promises: [], settings: null })
  const [pengaturan, setPengaturan] = useState(null)
  const [daftarProduk, setDaftarProduk] = useState([])
  const [metaProduk, setMetaProduk] = useState(null)
  const [memuatProduk, setMemuatProduk] = useState(false)
  const [keranjang, setKeranjang] = useState({ items: [], subtotal: 0, total_qty: 0, total_weight_gram: 0, has_prescription_products: false })
  const [pesanan, setPesanan] = useState([])
  const [alamat, setAlamat] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])

  const cacheProduk = useRef(new Map())

  // --- Toast ringan untuk umpan balik aksi ---
  const beriToast = useCallback((pesan, tone = 'info') => {
    setToast({ pesan, tone, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  // --- Muat data privat (butuh login) ---
  const muatPrivat = useCallback(async () => {
    const [k, p, a, w] = await Promise.all([
      api.keranjang().catch(() => null),
      api.pesanan({ per_page: 50 }).catch(() => null),
      api.alamat().catch(() => []),
      api.wishlistIds().catch(() => []),
    ])
    if (k) setKeranjang(k)
    if (p) setPesanan(p.data || [])
    setAlamat(Array.isArray(a) ? a : a?.data || [])
    setWishlistIds(Array.isArray(w) ? w : w?.data || [])
  }, [])

  // --- Muat katalog publik + sesi ---
  const muat = useCallback(async () => {
    setMemuat(true)
    try {
      const [beranda, set] = await Promise.all([api.home(), api.settings().catch(() => null)])
      setKatalog(beranda)
      setPengaturan(set?.data || null)
      setGalatMuat(null)

      if (ambilToken()) {
        try {
          const me = await api.saya()
          setUser(me.user)
          await muatPrivat()
        } catch {
          // Token tidak valid lagi: mulai sesi baru.
          simpanToken(null)
          setUser(null)
        }
      }
    } catch (e) {
      setGalatMuat(e.message)
    } finally {
      setMemuat(false)
    }
  }, [muatPrivat])

  useEffect(() => {
    muat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ===========================================================
  // Autentikasi
  // ===========================================================
  const login = useCallback(
    async (identitas, password) => {
      const res = await api.masuk(identitas, password)
      simpanToken(res.token)
      setUser(res.user)
      await muatPrivat()
      return res.user
    },
    [muatPrivat],
  )

  const registrasi = useCallback(
    async (form) => {
      const res = await api.daftar(form)
      simpanToken(res.token)
      setUser(res.user)
      await muatPrivat()
      return res.user
    },
    [muatPrivat],
  )

  const logout = useCallback(async () => {
    try {
      await api.keluar()
    } catch {
      /* token mungkin sudah tidak valid; tetap bersihkan sesi lokal. */
    }
    simpanToken(null)
    setUser(null)
    setKeranjang({ items: [], subtotal: 0, total_qty: 0, total_weight_gram: 0, has_prescription_products: false })
    setPesanan([])
    setAlamat([])
    setWishlistIds([])
  }, [])

  const ubahProfil = useCallback(
    async (perubahan) => {
      const res = await api.ubahProfil(perubahan)
      setUser(res.user)
      beriToast('Profil diperbarui.', 'sukses')
      return res.user
    },
    [beriToast],
  )

  const ubahSandi = useCallback(
    async (data) => {
      const res = await api.ubahSandi(data)
      beriToast(res?.message || 'Kata sandi diperbarui.', 'sukses')
      return res
    },
    [beriToast],
  )

  // Selesaikan login Google: token sudah dibuat server, aplikasi pasien
  // hanya menyimpannya lalu memuat ulang sesi.
  const selesaikanLoginGoogle = useCallback(
    async (token) => {
      simpanToken(token)
      try {
        const me = await api.saya()
        setUser(me.user)
        await muatPrivat()
        return me.user
      } catch (e) {
        simpanToken(null)
        setUser(null)
        throw e
      }
    },
    [muatPrivat],
  )

  // ===========================================================
  // Katalog
  // ===========================================================
  const ambilProduk = useCallback(async (params) => {
    setMemuatProduk(true)
    try {
      const res = await api.produk(params)
      setDaftarProduk(res.data || [])
      setMetaProduk(res.meta || null)
      ;(res.data || []).forEach((p) => cacheProduk.current.set(p.id, p))
      return res
    } finally {
      setMemuatProduk(false)
    }
  }, [])

  const ambilProdukDetail = useCallback(async (slug) => {
    const res = await api.produkDetail(slug)
    if (res?.data) cacheProduk.current.set(res.data.id, res.data)
    return res
  }, [])

  const simpanProdukKeCache = useCallback((daftar) => {
    ;(daftar || []).forEach((p) => cacheProduk.current.set(p.id, p))
  }, [])

  // ===========================================================
  // Keranjang (disimpan di server)
  // ===========================================================
  const terapkanKeranjang = useCallback((res) => {
    if (res && Array.isArray(res.items)) {
      setKeranjang({
        items: res.items,
        subtotal: res.subtotal ?? 0,
        total_qty: res.total_qty ?? 0,
        total_weight_gram: res.total_weight_gram ?? 0,
        has_prescription_products: !!res.has_prescription_products,
      })
    }
  }, [])

  const tambahKeranjang = useCallback(
    async (productId, qty = 1) => {
      const res = await api.tambahKeranjang(productId, qty)
      terapkanKeranjang(res)
      return res
    },
    [terapkanKeranjang],
  )

  const setJumlahKeranjang = useCallback(
    async (itemId, qty) => {
      const res = await api.ubahJumlahKeranjang(itemId, qty)
      terapkanKeranjang(res)
      return res
    },
    [terapkanKeranjang],
  )

  const hapusDariKeranjang = useCallback(
    async (itemId) => {
      const res = await api.hapusItemKeranjang(itemId)
      terapkanKeranjang(res)
      return res
    },
    [terapkanKeranjang],
  )

  const kosongkanKeranjang = useCallback(async () => {
    const res = await api.kosongkanKeranjang()
    terapkanKeranjang(res)
    return res
  }, [terapkanKeranjang])

  // ===========================================================
  // Alamat
  // ===========================================================
  const tambahAlamat = useCallback(
    async (data) => {
      await api.tambahAlamat(data)
      setAlamat(await api.alamat())
      beriToast('Alamat ditambahkan.', 'sukses')
    },
    [beriToast],
  )

  const ubahAlamat = useCallback(
    async (id, data) => {
      await api.ubahAlamat(id, data)
      setAlamat(await api.alamat())
      beriToast('Alamat diperbarui.', 'sukses')
    },
    [beriToast],
  )

  const hapusAlamat = useCallback(
    async (id) => {
      await api.hapusAlamat(id)
      setAlamat(await api.alamat())
      beriToast('Alamat dihapus.', 'info')
    },
    [beriToast],
  )

  const jadikanAlamatUtama = useCallback(
    async (id) => {
      await api.alamatUtama(id)
      setAlamat(await api.alamat())
    },
    [],
  )

  // ===========================================================
  // Wishlist
  // ===========================================================
  const toggleWishlist = useCallback(async (productId) => {
    const res = await api.toggleWishlist(productId)
    setWishlistIds(await api.wishlistIds())
    return res
  }, [])

  // ===========================================================
  // Checkout & pesanan
  // ===========================================================
  const checkout = useCallback(
    async (payload, opsi) => {
      const res = await api.checkout(payload, opsi)
      await Promise.all([api.keranjang().then(terapkanKeranjang).catch(() => {}), muatPrivat()])
      beriToast(`Pesanan ${res.data?.order_number} berhasil dibuat.`, 'sukses')
      return res.data
    },
    [muatPrivat, terapkanKeranjang, beriToast],
  )

  const segarkanPesanan = useCallback(async () => {
    const p = await api.pesanan({ per_page: 50 }).catch(() => null)
    if (p) setPesanan(p.data || [])
  }, [])

  const batalkanPesanan = useCallback(
    async (nomor) => {
      await api.batalkanPesanan(nomor)
      await segarkanPesanan()
      beriToast('Pesanan dibatalkan.', 'info')
    },
    [segarkanPesanan, beriToast],
  )

  const cekPembayaran = useCallback(
    async (nomor) => {
      const res = await api.cekPembayaran(nomor)
      await segarkanPesanan()
      return res
    },
    [segarkanPesanan],
  )

  const ajukanRetur = useCallback(
    async (nomor, payload, berkas) => {
      const res = await api.ajukanRetur(nomor, payload, berkas)
      beriToast('Pengajuan retur terkirim.', 'sukses')
      return res
    },
    [beriToast],
  )

  // ===========================================================
  // Selector
  // ===========================================================
  const nilai = useMemo(() => {
    const itemKeranjang = keranjang.items || []
    const cariProduk = (id) => cacheProduk.current.get(Number(id)) || null

    return {
      katalog,
      pengaturan,
      kategori: katalog.categories || [],
      produkUnggulan: katalog.featured_products || [],
      produkTerbaru: katalog.latest_products || [],
      produkPopuler: katalog.popular_products || [],
      promo: katalog.promos || [],
      testimoni: katalog.testimonials || [],
      faq: katalog.faqs || [],
      janji: katalog.promises || [],

      daftarProduk,
      metaProduk,
      memuatProduk,
      simpanProdukKeCache,

      keranjang,
      itemKeranjang,
      subtotal: keranjang.subtotal || 0,
      jumlahKeranjang: keranjang.total_qty || 0,
      beratKeranjang: keranjang.total_weight_gram || 0,
      adaProdukResep: keranjang.has_prescription_products,

      pesananSaya: pesanan,
      alamat,
      alamatUtama: alamat.find((a) => a.is_default) || alamat[0] || null,
      wishlistIds,

      cariProduk,
      namaProduk: (id) => cariProduk(id)?.name || '-',
      jumlahDiKeranjang: (productId) =>
        itemKeranjang.find((x) => x.product?.id === Number(productId))?.qty || 0,
    }
  }, [katalog, daftarProduk, metaProduk, memuatProduk, keranjang, pesanan, alamat, wishlistIds, simpanProdukKeCache])

  const nilaiAkhir = {
    ...nilai,
    user, memuat, galatMuat, toast,
    login, registrasi, logout, muat, muatPrivat, ubahProfil, ubahSandi, selesaikanLoginGoogle,
    ambilProduk, ambilProdukDetail,
    tambahKeranjang, setJumlahKeranjang, hapusDariKeranjang, kosongkanKeranjang,
    tambahAlamat, ubahAlamat, hapusAlamat, jadikanAlamatUtama,
    toggleWishlist,
    checkout, segarkanPesanan, batalkanPesanan, cekPembayaran, ajukanRetur,
    beriToast,
  }

  return <StoreContext.Provider value={nilaiAkhir}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore harus dipakai di dalam StoreProvider')
  return ctx
}

export const useAuth = useStore
