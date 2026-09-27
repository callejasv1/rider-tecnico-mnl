import type { Alimentacion, SalidaAudio } from '../domain/types'

export interface EquipoPlantilla {
  id: string
  nombre: string
  marca: string
  categoria: string
  anchoCm: number
  altoCm: number
  fuente?: string
  salidas: SalidaAudio[]
  alimentacion: Alimentacion
}

export interface Catalogo {
  categorias: string[]
  equipos: EquipoPlantilla[]
}
