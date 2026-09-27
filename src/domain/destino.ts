import type { Conector } from './types'

export interface Destino {
  nombre: string
  entradas: Partial<Record<Conector, number>>
}

export const DESTINO_MODEL12: Destino = {
  nombre: 'Tascam Model 12',
  entradas: {
    XLR: 8,
    '1/4" TRS': 10,
    '3.5mm': 1,
  },
}
