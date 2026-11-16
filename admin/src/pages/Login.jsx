import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { users, roleLabels } from '../data/mockData'
import { Button, Field, Input } from '../components/ui'
import { IconStethoscope, IconAlert, IconArrowRight } from '../components/Icons'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Login diverifikasi server apotek (Laravel); perlu ditunggu.
    const res = await login(email, password)
    if (res.ok) {
      navigate('/')
    } else {
      setError(res.message)
    }
  }

  const quickFill = (u) => {
    setEmail(u.email)
    setPassword('password')
    setError('')
  }

  const akunAktif = users.filter((u) => u.status_aktif)

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-10">
      {/* Latar: gradasi radial lembut bernada teal, bukan mesh AI ungu. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 12% 0%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 55%), radial-gradient(90% 70% at 100% 100%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 60%)',
        }}
      />

      <div className="w-full max-w-[420px]">
        {/* Merek: rata kiri, bukan tumpukan tengah yang generik. */}
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent text-[var(--accent-contrast)] shadow-soft">
            <IconStethoscope size={22} />
          </span>
          <div>
            <p className="text-[17px] font-semibold leading-tight tracking-tight text-primary">
              Premysis Medika
            </p>
            <p className="text-[12.5px] text-secondary">Dashboard bidan &amp; asisten</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-shell)] border border-hairline surface-raised p-6 shadow-lift">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="nama@premysismedika.id"
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </Field>

            {error && (
              <p className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-signal-rose-soft)] px-3 py-2 text-[13px] text-[var(--color-signal-rose)]">
                <IconAlert size={17} className="mt-px shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <Button type="submit" size="lg" className="w-full">
              Masuk
              <IconArrowRight size={17} />
            </Button>
          </form>

          <div className="mt-6 border-t border-hairline pt-4">
            <p className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">
              Akun demo
            </p>
            <ul className="space-y-1">
              {akunAktif.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => quickFill(u)}
                    className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-control)] px-2.5 py-2 text-left transition-colors duration-200 hover:surface-hover"
                  >
                    <span className="truncate text-[13px] text-primary">{u.email}</span>
                    <span className="shrink-0 text-[11.5px] text-muted">{roleLabels[u.peran]}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 px-2.5 text-[11.5px] text-muted">Password demo: <code>password</code></p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed text-muted">
          Klik akun di atas untuk isi email, lalu masukkan password.
        </p>
      </div>
    </div>
  )
}
