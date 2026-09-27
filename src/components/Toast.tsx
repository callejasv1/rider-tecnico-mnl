import { useEffect } from 'react'
import { useToast } from '../store/toast'

const DURACION_MS = 5000

export function Toast() {
  const actual = useToast((s) => s.actual)
  const cerrar = useToast((s) => s.cerrar)

  useEffect(() => {
    if (!actual) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const temporizador = window.setTimeout(cerrar, DURACION_MS)
    return () => window.clearTimeout(temporizador)
  }, [actual, cerrar])

  if (!actual) return null

  const esError = actual.tono === 'error'

  return (
    <div
      className={esError ? 'toast toast--error' : 'toast'}
      role="status"
      aria-live={esError ? 'assertive' : 'polite'}
    >
      <span>{actual.mensaje}</span>
      <button
        type="button"
        className="toast__close"
        aria-label="Cerrar aviso"
        onClick={cerrar}
      >
        ×
      </button>
    </div>
  )
}
