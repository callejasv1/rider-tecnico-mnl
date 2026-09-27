import type { Equipo, TipoAlimentacion } from './types'

export interface ResumenCorriente {
  totalEnchufes: number
  porTipo: Partial<Record<TipoAlimentacion, number>>
  alargadoresSugeridos: number
}

export const ENCHUFES_POR_ALARGADOR = 6

export function calcularCorriente(
  equipos: Equipo[],
  enchufesPorAlargador: number = ENCHUFES_POR_ALARGADOR,
): ResumenCorriente {
  const porTipo: Partial<Record<TipoAlimentacion, number>> = {}
  let totalEnchufes = 0

  for (const equipo of equipos) {
    if (!equipo.alimentacion.requiereCorriente) continue
    totalEnchufes += 1
    const tipo = equipo.alimentacion.tipo ?? 'adaptador'
    porTipo[tipo] = (porTipo[tipo] ?? 0) + 1
  }

  return {
    totalEnchufes,
    porTipo,
    alargadoresSugeridos: Math.ceil(totalEnchufes / enchufesPorAlargador),
  }
}
