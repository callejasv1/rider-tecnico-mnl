import type { Equipo } from './types'

export const PASO_SNAP_CM = 5

export interface Rect {
  x: number
  y: number
  ancho: number
  alto: number
}

export function dimensionesEnMesa(e: Equipo): { ancho: number; alto: number } {
  if (e.rot === 90 || e.rot === 270) {
    return { ancho: e.altoCm, alto: e.anchoCm }
  }
  return { ancho: e.anchoCm, alto: e.altoCm }
}

export function rectanguloDe(e: Equipo): Rect {
  const { ancho, alto } = dimensionesEnMesa(e)
  return { x: e.x, y: e.y, ancho, alto }
}

export function ajustarAGrilla(valor: number, paso = PASO_SNAP_CM): number {
  return Math.round(valor / paso) * paso
}

export function rectsSolapan(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y
}

export function dentroDe(rect: Rect, contenedor: Rect): boolean {
  return (
    rect.x >= contenedor.x &&
    rect.y >= contenedor.y &&
    rect.x + rect.ancho <= contenedor.x + contenedor.ancho &&
    rect.y + rect.alto <= contenedor.y + contenedor.alto
  )
}

export function limitarARect(rect: Rect, contenedor: Rect): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(rect.x, contenedor.ancho - rect.ancho)),
    y: Math.max(0, Math.min(rect.y, contenedor.alto - rect.alto)),
  }
}
