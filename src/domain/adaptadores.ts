import type { Conector, Equipo } from './types'
import { DESTINO_MODEL12, type Destino } from './destino'

export type TipoAdaptador = '3.5mm→1/4"' | '3.5mm→doble 1/4"' | 'RCA→1/4"'

export interface DetalleConexion {
  equipoId: string
  salidaId: string
  conector: Conector
  canal: 'mono' | 'estéreo'
  adaptador: TipoAdaptador | null
  conexion: string
}

export interface ResumenAdaptadores {
  total: number
  porTipo: Partial<Record<TipoAdaptador, number>>
  detalles: DetalleConexion[]
}

export function calcularAdaptadores(
  equipos: Equipo[],
  destino: Destino = DESTINO_MODEL12,
): ResumenAdaptadores {
  let cupo3_5mm = destino.entradas['3.5mm'] ?? 0

  const porTipo: Partial<Record<TipoAdaptador, number>> = {}
  const detalles: DetalleConexion[] = []
  let total = 0

  const registrar = (tipo: TipoAdaptador) => {
    total += 1
    porTipo[tipo] = (porTipo[tipo] ?? 0) + 1
  }

  for (const equipo of equipos) {
    for (const salida of equipo.salidas) {
      let adaptador: TipoAdaptador | null = null
      let conexion: string

      switch (salida.conector) {
        case 'XLR':
          conexion = 'XLR → XLR (directo)'
          break
        case '1/4" TS':
        case '1/4" TRS':
          conexion = '1/4" → 1/4" TRS (directo)'
          break
        case 'RCA':
          adaptador = 'RCA→1/4"'
          conexion = 'RCA → 1/4" TRS'
          break
        case '3.5mm':
          if (salida.canal === 'estéreo' && cupo3_5mm > 0) {
            cupo3_5mm -= 1
            conexion = '3.5mm → 3.5mm (ch 9/10, directo)'
          } else if (salida.canal === 'estéreo') {
            adaptador = '3.5mm→doble 1/4"'
            conexion = '3.5mm → 2× 1/4" TRS'
          } else {
            adaptador = '3.5mm→1/4"'
            conexion = '3.5mm → 1/4" TRS'
          }
          break
        default:
          conexion = 'Directo'
      }

      if (adaptador) registrar(adaptador)

      detalles.push({
        equipoId: equipo.id,
        salidaId: salida.id,
        conector: salida.conector,
        canal: salida.canal,
        adaptador,
        conexion,
      })
    }
  }

  return { total, porTipo, detalles }
}
