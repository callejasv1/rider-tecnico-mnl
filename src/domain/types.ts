export type Conector = '1/4" TS' | '1/4" TRS' | 'XLR' | '3.5mm' | 'RCA'

export type Canal = 'mono' | 'estéreo'

export interface SalidaAudio {
  id: string
  etiqueta?: string
  canal: Canal
  conector: Conector
}

export type TipoAlimentacion = 'adaptador' | 'IEC' | 'USB' | 'batería'

export interface Alimentacion {
  requiereCorriente: boolean
  tipo?: TipoAlimentacion
  enchufe?: string
  consumoA?: number
}

export interface Equipo {
  id: string
  templateId?: string
  nombre: string
  categoria: string
  anchoCm: number
  altoCm: number
  salidas: SalidaAudio[]
  alimentacion: Alimentacion
  x: number
  y: number
  rot: 0 | 90 | 180 | 270
  notas?: string
}

export interface Participante {
  nombre: string
  proyecto: string
  contacto: string
  zona: 'A' | 'B'
}

export interface Rider {
  version: 1
  participante: Participante
  equipos: Equipo[]
}
