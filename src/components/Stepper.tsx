import type { PasoId, Progreso } from '../ui/progreso'

interface StepperProps {
  progreso: Progreso
  actual: PasoId
  onIr: (paso: PasoId) => void
}

const PASOS: { id: PasoId; etiqueta: string }[] = [
  { id: 'datos', etiqueta: 'Datos' },
  { id: 'equipos', etiqueta: 'Equipos' },
  { id: 'mesa', etiqueta: 'Mesa' },
  { id: 'resumen', etiqueta: 'Resumen' },
  { id: 'exportar', etiqueta: 'Exportar' },
]

export function Stepper({ progreso, actual, onIr }: StepperProps) {
  return (
    <nav aria-label="Pasos del rider">
      <ol className="stepper">
        {PASOS.map((paso, indice) => (
          <li key={paso.id}>
            <button
              type="button"
              className="stepper__button"
              data-completo={progreso[paso.id]}
              aria-current={actual === paso.id ? 'step' : undefined}
              onClick={() => onIr(paso.id)}
            >
              <span className="stepper__numero">{indice + 1}</span>
              {paso.etiqueta}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
