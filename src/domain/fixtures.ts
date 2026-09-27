import type { Equipo, SalidaAudio } from './types'

export function makeSalida(overrides: Partial<SalidaAudio> = {}): SalidaAudio {
  return {
    id: 's1',
    canal: 'mono',
    conector: '1/4" TS',
    ...overrides,
  }
}

export function makeEquipo(overrides: Partial<Equipo> = {}): Equipo {
  return {
    id: 'eq',
    nombre: 'Equipo',
    categoria: 'Otro',
    anchoCm: 30,
    altoCm: 20,
    salidas: [],
    alimentacion: { requiereCorriente: false },
    x: 0,
    y: 0,
    rot: 0,
    ...overrides,
  }
}
