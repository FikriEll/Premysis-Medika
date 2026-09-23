// =============================================================
// Orkestrator pengembangan Premysis Medika
//
// Menjalankan tiga layanan sekaligus:
//   1. server API bersama   -> http://127.0.0.1:4000
//   2. dashboard admin      -> http://localhost:5173
//   3. aplikasi pasien      -> http://localhost:5174
//
// Server API dijalankan lebih dulu; kedua app Vite baru dinyalakan
// setelah API merespons, supaya permintaan pertama tidak gagal.
//
// Jalankan: npm run dev   (Ctrl+C menghentikan ketiganya)
// =============================================================

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'http://127.0.0.1:4000'

const anak = []
let berhenti = false

function jalankan(nama, perintah, args, opts = {}) {
  const p = spawn(perintah, args, {
    cwd: opts.cwd || ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })
  anak.push({ nama, p })

  const tulis = (aliran) => (buf) => {
    const teks = buf.toString()
    for (const baris of teks.split('\n')) {
      if (baris.trim()) process[aliran].write(`[${nama}] ${baris}\n`)
    }
  }
  p.stdout.on('data', tulis('stdout'))
  p.stderr.on('data', tulis('stderr'))
  p.on('exit', (kode, sinyal) => {
    if (berhenti) return
    process.stdout.write(`[${nama}] berhenti (kode ${kode ?? sinyal})\n`)
    // Bila satu layanan mati, hentikan sisanya agar tidak ada proses yatim.
    matikan(kode ?? 1)
  })
  return p
}

function matikan(kode = 0) {
  if (berhenti) return
  berhenti = true
  for (const { p } of anak) {
    if (!p.killed) p.kill('SIGTERM')
  }
  setTimeout(() => process.exit(kode), 300)
}

async function tungguApi(percobaan = 40) {
  for (let i = 0; i < percobaan; i++) {
    try {
      const res = await fetch(`${API}/api/state`)
      if (res.ok) return true
    } catch {
      // server belum siap, coba lagi
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

process.on('SIGINT', () => matikan(0))
process.on('SIGTERM', () => matikan(0))

console.log('Premysis Medika - menjalankan server API...')
jalankan('api', process.execPath, ['server/index.js'])

const siap = await tungguApi()
if (!siap) {
  console.error('Server API tidak merespons di ' + API + '. Periksa galat di atas.')
  matikan(1)
} else {
  console.log(`Server API siap di ${API}`)
  console.log('Menjalankan dashboard admin (5173) dan aplikasi pasien (5174)...')
  jalankan('admin', 'npm', ['--prefix', 'frontend', 'run', 'dev'])
  jalankan('pasien', 'npm', ['--prefix', 'pasien', 'run', 'dev'])
  console.log('\n  Dashboard admin : http://localhost:5173')
  console.log('  Aplikasi pasien : http://localhost:5174')
  console.log('  API bersama     : ' + API + '\n')
}
