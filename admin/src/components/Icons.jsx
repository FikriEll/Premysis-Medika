// =============================================================
// Lapisan ikon - SATU keluarga ikon untuk seluruh aplikasi.
//
// Sebelumnya ikon SVG digambar manual. Aturan skill
// "design-taste-frontend" (§3.C) melarang hand-rolled SVG icons:
// pakai pustaka ikon resmi, satu keluarga, satu ketebalan garis.
//
// Di sini: Phosphor Icons (@phosphor-icons/react).
// Semua nama ekspor lama dipertahankan supaya halaman tidak berubah.
// Ketebalan garis diseragamkan lewat WEIGHT (bukan strokeWidth).
// =============================================================
import {
  SquaresFour,
  UsersThree,
  CalendarCheck,
  Stethoscope,
  Syringe,
  Prescription,
  Package,
  Stack,
  ShoppingCartSimple,
  ShieldCheck,
  ChartBar,
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Trash,
  X,
  Eye,
  SignOut,
  Bell,
  List,
  CaretLeft,
  CaretRight,
  Check,
  Warning,
  DownloadSimple,
  WhatsappLogo,
  User,
  Sun,
  MoonStars,
  ArrowRight,
  FunnelSimple,
  TrendUp,
  Clock,
  ClipboardText,
  Heartbeat,
  FirstAid,
} from '@phosphor-icons/react'

// Ketebalan garis tunggal untuk seluruh aplikasi.
const WEIGHT = 'regular'

// Ukuran default tunggal (dulu 20) supaya grid tetap rapat.
function make(Icon) {
  const Wrapped = ({ size = 20, className = '', weight = WEIGHT, ...rest }) => (
    <Icon size={size} weight={weight} className={className} {...rest} />
  )
  Wrapped.displayName = `Icon(${Icon.displayName || 'Phosphor'})`
  return Wrapped
}

// --- Navigasi utama (PRD §22) ---
export const IconDashboard = make(SquaresFour)
export const IconPasien = make(UsersThree)
export const IconAppointment = make(CalendarCheck)
export const IconPemeriksaan = make(Stethoscope)
export const IconVaksin = make(Syringe)
export const IconResep = make(Prescription)
export const IconProduk = make(Package)
export const IconStok = make(Stack)
export const IconPesanan = make(ShoppingCartSimple)
export const IconPengguna = make(ShieldCheck)
export const IconLaporan = make(ChartBar)

// --- Aksi & kontrol ---
export const IconSearch = make(MagnifyingGlass)
export const IconPlus = make(Plus)
export const IconEdit = make(PencilSimple)
export const IconTrash = make(Trash)
export const IconClose = make(X)
export const IconEye = make(Eye)
export const IconLogout = make(SignOut)
export const IconBell = make(Bell)
export const IconMenu = make(List)
export const IconChevronLeft = make(CaretLeft)
export const IconChevronRight = make(CaretRight)
export const IconCheck = make(Check)
export const IconAlert = make(Warning)
export const IconShield = make(ShieldCheck)
export const IconDownload = make(DownloadSimple)
export const IconFilter = make(FunnelSimple)
export const IconTrend = make(TrendUp)
export const IconClock = make(Clock)
export const IconArrowRight = make(ArrowRight)

// --- Konteks klinis ---
export const IconStethoscope = make(Stethoscope)
export const IconWhatsapp = make(WhatsappLogo)
export const IconUser = make(User)
export const IconRekam = make(ClipboardText)
export const IconPulse = make(Heartbeat)
export const IconObat = make(FirstAid)

// --- Tema ---
export const IconSun = make(Sun)
export const IconMoon = make(MoonStars)
