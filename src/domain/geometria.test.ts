import { describe, expect, it } from 'vitest'
import { ajustarAGrilla, dimensionesEnMesa, limitarARect, rectanguloDe, rectsSolapan } from './geometria'
import { makeEquipo } from './fixtures'

describe('geometria', () => {
  it('intercambia ancho y alto al rotar 90/270', () => {
    const e = makeEquipo({ anchoCm: 30, altoCm: 20, rot: 90 })
    expect(dimensionesEnMesa(e)).toEqual({ ancho: 20, alto: 30 })
    expect(dimensionesEnMesa(makeEquipo({ anchoCm: 30, altoCm: 20, rot: 0 })))
      .toEqual({ ancho: 30, alto: 20 })
  })

  it('rectanguloDe arma el rect con origen en x,y', () => {
    const e = makeEquipo({ anchoCm: 30, altoCm: 20, x: 10, y: 5, rot: 0 })
    expect(rectanguloDe(e)).toEqual({ x: 10, y: 5, ancho: 30, alto: 20 })
  })

  it('ajustarAGrilla redondea al múltiplo de 5', () => {
    expect(ajustarAGrilla(12, 5)).toBe(10)
    expect(ajustarAGrilla(13, 5)).toBe(15)
    expect(ajustarAGrilla(12)).toBe(10)
  })

  it('rectsSolapan detecta intersección real y no tocar bordes', () => {
    const a = { x: 0, y: 0, ancho: 10, alto: 10 }
    expect(rectsSolapan(a, { x: 5, y: 5, ancho: 10, alto: 10 })).toBe(true)
    expect(rectsSolapan(a, { x: 10, y: 0, ancho: 10, alto: 10 })).toBe(false)
  })

  it('limitarARect mete el rect dentro del contenedor', () => {
    const contenedor = { x: 0, y: 0, ancho: 300, alto: 100 }
    expect(limitarARect({ x: 290, y: 0, ancho: 30, alto: 20 }, contenedor)).toEqual({ x: 270, y: 0 })
    expect(limitarARect({ x: -5, y: -5, ancho: 30, alto: 20 }, contenedor)).toEqual({ x: 0, y: 0 })
  })
})
