import type { Equipo, Participante } from '../domain/types'
import { validarRider } from '../domain/validacion'

export interface Progreso {
  datos: boolean
  equipos: boolean
  mesa: boolean
  resumen: boolean
  exportar: boolean
}

export type PasoId = keyof Progreso

export function calcularProgreso(participante: Participante, equipos: Equipo[]): Progreso {
  const datos =
    participante.nombre.trim() !== '' &&
    participante.proyecto.trim() !== '' &&
    participante.contacto.trim() !== ''
  const equiposListos = equipos.length > 0
  const sinErrores =
    equipos.length > 0 &&
    validarRider({ version: 1, participante, equipos }).every((p) => p.severidad !== 'error')

  return {
    datos,
    equipos: equiposListos,
    mesa: sinErrores,
    resumen: sinErrores,
    exportar: sinErrores,
  }
}
