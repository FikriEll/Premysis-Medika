// =============================================================
// Ikon aplikasi pasien - SATU keluarga ikon (Phosphor).
// Aturan skill design-taste-frontend: dilarang SVG gambar tangan,
// satu pustaka, satu ketebalan garis.
// =============================================================
import {
  House,
  CalendarCheck,
  FirstAid,
  Prescription,
  Storefront,
  ShoppingCartSimple,
  Receipt,
  User,
  Bell,
  MagnifyingGlass,
  Plus,
  Minus,
  Trash,
  X,
  Check,
  CheckCircle,
  Warning,
  SignOut,
  CaretRight,
  CaretLeft,
  ArrowLeft,
  ArrowRight,
  Sun,
  MoonStars,
  WhatsappLogo,
  Baby,
  Syringe,
  Stethoscope,
  ClipboardText,
  Heartbeat,
  Clock,
  MapPin,
  Crosshair,
  Truck,
  Package,
  Pill,
  Sparkle,
  List,
  PencilSimple,
  Camera,
  Phone,
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  Info,
  CalendarBlank,
  Wallet,
  ArrowCounterClockwise,
  UserCircle,
  SquaresFour,
  Flask,
  Bandaids,
  SprayBottle,
  ShoppingBag,
  Heart,
  CalendarDots,
  NotePencil,
  Question,
  PaperPlaneTilt,
  ArrowClockwise,
  ChatCircle,
  MapTrifold,
  DeviceMobile,
  HandWaving,
} from '@phosphor-icons/react'

const WEIGHT = 'regular'

function make(Icon) {
  const Wrapped = ({ size = 22, className = '', weight = WEIGHT, ...rest }) => (
    <Icon size={size} weight={weight} className={className} {...rest} />
  )
  Wrapped.displayName = `Icon(${Icon.displayName || 'Phosphor'})`
  return Wrapped
}

// --- Navigasi utama (bottom nav) - PRD §17.1 ---
export const IconBeranda = make(House)
export const IconAppointment = make(CalendarCheck)
export const IconResep = make(Prescription)
export const IconToko = make(Storefront)
export const IconKeranjang = make(ShoppingCartSimple)
export const IconPesanan = make(Receipt)
export const IconProfil = make(User)
export const IconNotifikasi = make(Bell)

// --- Aksi ---
export const IconCari = make(MagnifyingGlass)
export const IconTambah = make(Plus)
export const IconKurang = make(Minus)
export const IconHapus = make(Trash)
export const IconTutup = make(X)
export const IconCentang = make(Check)
export const IconCentangBulat = make(CheckCircle)
export const IconPeringatan = make(Warning)
export const IconKeluar = make(SignOut)
export const IconPanahKanan = make(CaretRight)
export const IconPanahKiri = make(CaretLeft)
export const IconKembali = make(ArrowLeft)
export const IconLanjut = make(ArrowRight)
export const IconMata = make(Eye)
export const IconMataTutup = make(EyeSlash)
export const IconEdit = make(PencilSimple)
export const IconKamera = make(Camera)
export const IconDaftar = make(List)
export const IconInfo = make(Info)

// --- Klinis & toko ---
export const IconBayi = make(Baby)
export const IconVaksin = make(Syringe)
export const IconPemeriksaan = make(Stethoscope)
export const IconRekam = make(ClipboardText)
export const IconPulse = make(Heartbeat)
export const IconObat = make(FirstAid)
export const IconPil = make(Pill)
export const IconProduk = make(Package)
export const IconJam = make(Clock)
export const IconLokasi = make(MapPin)
export const IconLokasiSaya = make(Crosshair)
export const IconKirim = make(Truck)
export const IconDompet = make(Wallet)
export const IconTanggal = make(CalendarBlank)
export const IconTelepon = make(Phone)
export const IconEmail = make(EnvelopeSimple)
export const IconKunci = make(Lock)
export const IconWhatsapp = make(WhatsappLogo)
export const IconSparkle = make(Sparkle)

// --- Tema ---
export const IconMatahari = make(Sun)
export const IconBulan = make(MoonStars)

// --- Tambahan untuk design system brief §25 ---
export const IconUlang = make(ArrowCounterClockwise)
export const IconSegarkan = make(ArrowClockwise)
export const IconPasien = make(UserCircle)
export const IconLayanan = make(SquaresFour)
export const IconLab = make(Flask)
export const IconPerawatan = make(Bandaids)
export const IconPerawatanKulit = make(SprayBottle)
export const IconBelanja = make(ShoppingBag)
export const IconHati = make(Heart)
export const IconKalender = make(CalendarDots)
export const IconCatatan = make(NotePencil)
export const IconTanya = make(Question)
export const IconKirimPesan = make(PaperPlaneTilt)
export const IconChat = make(ChatCircle)
export const IconPeta = make(MapTrifold)
export const IconPonsel = make(DeviceMobile)
// Lambaian tangan menggantikan emoji 👋 (brief §7 memakai emoji,
// tetapi aturan skill melarang emoji dekoratif; ikon Phosphor
// memberi makna yang sama tanpa melanggar aturan).
export const IconSapa = make(HandWaving)
