export interface MesaConfig {
  anchoCm: number
  altoCm: number
  zonas: number
  margenCm: number
}

export const MESA: MesaConfig = {
  anchoCm: 300,
  altoCm: 100,
  zonas: 2,
  margenCm: 2,
}

export const ZONA_ANCHO_CM = MESA.anchoCm / MESA.zonas
