import type { PasoId } from './progreso'

export function irASeccion(id: PasoId): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ block: 'start' })
  el.focus({ preventScroll: true })
}
