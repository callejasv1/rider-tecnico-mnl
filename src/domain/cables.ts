import type { Conector, Equipo } from './types'

export interface ResumenCables {
  total: number
  porConector: Partial<Record<Conector, number>>
}

export function contarCables(equipos: Equipo[]): ResumenCables {
  const porConector: Partial<Record<Conector, number>> = {}
  let total = 0

  for (const equipo of equipos) {
    for (const salida of equipo.salidas) {
      const cantidad = salida.canal === 'estéreo' ? 2 : 1
      total += cantidad
      porConector[salida.conector] = (porConector[salida.conector] ?? 0) + cantidad
    }
  }

  return { total, porConector }
}
