import { useEffect, useRef } from 'react'
import { IconClose } from './Icons'
import { Button, IconButton } from './ui'

// Modal generik (form tambah/edit, detail, konfirmasi).
//
// Perbaikan dari audit skill §"Interactivity and States":
// - Escape menutup, klik latar menutup, dan scroll halaman dikunci
//   selama modal terbuka (sebelumnya body tetap ikut bergulir).
// - Peran dialog + aria-modal supaya pembaca layar benar.
// - Fokus dipindahkan ke dalam dialog saat dibuka.
export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Fokuskan panel agar keyboard user tidak tertinggal di belakang.
    const t = window.setTimeout(() => panelRef.current?.focus(), 20)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      window.clearTimeout(t)
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

  return (
    <div
      className="animate-rise fixed inset-0 flex items-start justify-center overflow-y-auto bg-[rgb(9_14_17/0.55)] p-4 backdrop-blur-[2px] sm:items-center"
      style={{ zIndex: 'var(--z-modal)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`animate-rise w-full ${sizes[size]} overflow-hidden rounded-[var(--radius-shell)] border border-hairline surface-raised shadow-lift outline-none`}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-[16px] font-semibold tracking-tight text-primary">{title}</h2>}
            {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-secondary">{subtitle}</p>}
          </div>
          <IconButton label="Tutup" onClick={onClose} className="-mr-1 -mt-1">
            <IconClose size={18} />
          </IconButton>
        </div>
        <div className="max-h-[68vh] overflow-y-auto border-t border-hairline px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-hairline surface-sunken px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Ya, lanjutkan',
  variant = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-relaxed text-secondary">{message}</p>
    </Modal>
  )
}
