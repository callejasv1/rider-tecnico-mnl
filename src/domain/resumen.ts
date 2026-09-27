import type { Equipo } from './types'
import { contarCables, type ResumenCables } from './cables'
import { calcularAdaptadores, type ResumenAdaptadores } from './adaptadores'
import { calcularCorriente, type ResumenCorriente } from './corriente'

export interface ResumenRider {
  cantidadEquipos: number
  cables: ResumenCables
  adaptadores: ResumenAdaptadores
  corriente: ResumenCorriente
}

export function resumirRider(equipos: Equipo[]): ResumenRider {
  return {
    cantidadEquipos: equipos.length,
    cables: contarCables(equipos),
    adaptadores: calcularAdaptadores(equipos),
    corriente: calcularCorriente(equipos),
  }
}
