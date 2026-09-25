// =============================================================
// Ikon aplikasi pasien - SATU keluarga ikon (Lucide).
//
// Referensi desain (Live Oak Pharmacy) memakai Lucide, jadi seluruh
// aplikasi memakai Lucide juga: satu pustaka, satu ketebalan garis.
//
// Nama ekspor (IconXxx) sengaja DIPERTAHANKAN sama seperti versi
// Phosphor sebelumnya, supaya halaman-halaman lain tidak perlu
// diubah. Yang berubah hanya pustaka di baliknya.
//
// Prop `weight` ikut dipertahankan demi kompatibilitas:
//   'regular' -> garis 2   (bawaan Lucide)
//   'bold'    -> garis 2.4 (penekanan)
//   'fill'    -> bentuk terisi
// =============================================================
import {
  House,
  CalendarCheck,
  ClipboardList,
  Store,
  ShoppingCart,
  Receipt,
  User,
  Bell,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  CircleCheck,
  TriangleAlert,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  MessageCircle,
  Baby,
  Syringe,
  Stethoscope,
  HeartPulse,
  Clock,
  MapPin,
  Crosshair,
  Truck,
  Package,
  Pill,
  Sparkles,
  List,
  Pencil,
  Camera,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  Calendar,
  Wallet,
  RotateCcw,
  CircleUser,
  LayoutGrid,
  FlaskConical,
  Bandage,
  SprayCan,
  ShoppingBag,
  Heart,
  CalendarDays,
  NotebookPen,
  CircleQuestionMark,
  Send,
  RefreshCw,
  Map,
  Smartphone,
  Hand,
  Star,
  ShieldCheck,
  FileText,
  BookOpen,
  Tag,
  Settings,
  CreditCard,
  BadgeCheck,
  MessagesSquare,
  CirclePlus,
  Share2,
  ArrowUpRight,
  Users,
  Ruler,
  ChevronDown,
} from 'lucide-react'

const STROKE = { regular: 2, bold: 2.4 }

function make(Icon) {
  const Wrapped = ({ size = 22, className = '', weight = 'regular', ...rest }) => (
    <Icon
      size={size}
      className={className}
      strokeWidth={STROKE[weight] ?? 2}
      fill={weight === 'fill' ? 'currentColor' : 'none'}
      aria-hidden="true"
      focusable="false"
      {...rest}
    />
  )
  Wrapped.displayName = `Icon(${Icon.displayName || 'Lucide'})`
  return Wrapped
}

// --- Navigasi utama (bottom nav) - PRD §17.1 ---
export const IconBeranda = make(House)
export const IconAppointment = make(CalendarCheck)
export const IconResep = make(ClipboardList)
export const IconToko = make(Store)
export const IconKeranjang = make(ShoppingCart)
export const IconPesanan = make(Receipt)
export const IconProfil = make(User)
export const IconNotifikasi = make(Bell)

// --- Aksi ---
export const IconCari = make(Search)
export const IconTambah = make(Plus)
export const IconKurang = make(Minus)
export const IconHapus = make(Trash2)
export const IconTutup = make(X)
export const IconCentang = make(Check)
export const IconCentangBulat = make(CircleCheck)
export const IconPeringatan = make(TriangleAlert)
export const IconKeluar = make(LogOut)
export const IconPanahKanan = make(ChevronRight)
export const IconPanahKiri = make(ChevronLeft)
export const IconKembali = make(ArrowLeft)
export const IconLanjut = make(ArrowRight)
export const IconMata = make(Eye)
export const IconMataTutup = make(EyeOff)
export const IconEdit = make(Pencil)
export const IconKamera = make(Camera)
export const IconDaftar = make(List)
export const IconInfo = make(Info)

// --- Klinis & toko ---
export const IconBayi = make(Baby)
export const IconVaksin = make(Syringe)
export const IconPemeriksaan = make(Stethoscope)
export const IconRekam = make(ClipboardList)
export const IconPulse = make(HeartPulse)
export const IconObat = make(Pill)
export const IconPil = make(Pill)
export const IconProduk = make(Package)
export const IconJam = make(Clock)
export const IconLokasi = make(MapPin)
export const IconLokasiSaya = make(Crosshair)
export const IconKirim = make(Truck)
export const IconDompet = make(Wallet)
export const IconTanggal = make(Calendar)
export const IconTelepon = make(Phone)
export const IconEmail = make(Mail)
export const IconKunci = make(Lock)
// Lucide tidak menyediakan ikon merek; WhatsApp diwakili ikon
// percakapan yang maknanya sama (tombolnya selalu berlabel teks).
export const IconWhatsapp = make(MessageCircle)
export const IconSparkle = make(Sparkles)

// --- Tema ---
export const IconMatahari = make(Sun)
export const IconBulan = make(Moon)

// --- Tambahan untuk design system brief §25 ---
export const IconUlang = make(RotateCcw)
export const IconSegarkan = make(RefreshCw)
export const IconPasien = make(CircleUser)
export const IconLayanan = make(LayoutGrid)
export const IconLab = make(FlaskConical)
export const IconPerawatan = make(Bandage)
export const IconPerawatanKulit = make(SprayCan)
export const IconBelanja = make(ShoppingBag)
export const IconHati = make(Heart)
export const IconKalender = make(CalendarDays)
export const IconCatatan = make(NotebookPen)
export const IconTanya = make(CircleQuestionMark)
export const IconKirimPesan = make(Send)
export const IconChat = make(MessageCircle)
export const IconPeta = make(Map)
export const IconPonsel = make(Smartphone)
// Lambaian tangan menggantikan emoji 👋 (brief §7 memakai emoji,
// tetapi aturan skill melarang emoji dekoratif; ikon Lucide
// memberi makna yang sama tanpa melanggar aturan).
export const IconSapa = make(Hand)

// --- Tambahan untuk halaman konten & akun ---
export const IconBintang = make(Star)
export const IconPerisai = make(ShieldCheck)
export const IconDokumen = make(FileText)
export const IconBuku = make(BookOpen)
export const IconLabel = make(Tag)
export const IconGear = make(Settings)
export const IconKartu = make(CreditCard)
export const IconTerverifikasi = make(BadgeCheck)
export const IconDiskusi = make(MessagesSquare)
export const IconTambahBulat = make(CirclePlus)
export const IconTentang = make(Info)

// --- Ikon tambahan untuk tampilan bergaya Live Oak ---
export const IconPanahMiring = make(ArrowUpRight)
// ChevronDown: penanda akordeon yang mengarah ke bawah saat tertutup.
export const IconPanahTurun = make(ChevronDown)
// Ikon baru untuk kartu produk & artikel bergaya referensi.
export const IconBagikan = make(Share2)
export const IconPengguna = make(Users)
export const IconPenggaris = make(Ruler)
