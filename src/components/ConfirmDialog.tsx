import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: string
  onConfirmar: () => void
  onCancelar: () => void
}

const SELECTOR_ENFOCABLES =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const cancelarRef = useRef<HTMLButtonElement>(null)
  const onCancelarRef = useRef(onCancelar)
  onCancelarRef.current = onCancelar

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement as HTMLElement | null
    cancelarRef.current?.focus()

    function alTeclear(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        onCancelarRef.current()
        return
      }
      if (ev.key !== 'Tab') return
      const contenedor = cardRef.current
      if (!contenedor) return
      const enfocables = contenedor.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES)
      if (enfocables.length === 0) return
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      if (ev.shiftKey && document.activeElement === primero) {
        ev.preventDefault()
        ultimo.focus()
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      previo?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  const tituloId = 'confirm-dialog-titulo'

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onCancelar} />
      <div
        ref={cardRef}
        className="modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <h2 id={tituloId} className="modal__title">
          {titulo}
        </h2>
        <p className="modal__body">{mensaje}</p>
        <div className="modal__actions">
          <button
            ref={cancelarRef}
            type="button"
            className="btn--secondary"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button type="button" className="btn--danger" onClick={onConfirmar}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
