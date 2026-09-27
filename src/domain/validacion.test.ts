import { describe, expect, it } from 'vitest'
import { validarRider } from './validacion'
import { makeEquipo } from './fixtures'
import type { Rider } from './types'

function rider(equipos: Rider['equipos'], zona: 'A' | 'B' = 'A'): Rider {
  return { version: 1, participante: { nombre: '', proyecto: '', contacto: '', zona }, equipos }
}

describe('validarRider', () => {
  it('sin problemas devuelve lista vacía', () => {
    expect(validarRider(rider([makeEquipo({ id: 'a', x: 0, y: 0, anchoCm: 30, altoCm: 20 })]))).toEqual([])
  })

  it('detecta equipo fuera de la mesa', () => {
    const p = validarRider(rider([makeEquipo({ id: 'a', x: 290, y: 0, anchoCm: 30, altoCm: 20 })]))
    expect(p[0]?.tipo).toBe('fuera-de-mesa')
    expect(p[0]?.severidad).toBe('error')
  })

  it('detecta solapamiento exacto entre dos equipos apilados', () => {
    const p = validarRider(rider([
      makeEquipo({ id: 'a', x: 10, y: 10, anchoCm: 30, altoCm: 20 }),
      makeEquipo({ id: 'b', x: 10, y: 10, anchoCm: 30, altoCm: 20 }),
    ]))
    expect(p.some((x) => x.tipo === 'solapamiento' && x.severidad === 'error')).toBe(true)
  })

  it('avisa cuando el equipo no está en la zona del participante', () => {
    const p = validarRider(rider([makeEquipo({ id: 'a', x: 160, y: 0, anchoCm: 30, altoCm: 20 })], 'A'))
    expect(p.some((x) => x.tipo === 'fuera-de-zona' && x.severidad === 'aviso')).toBe(true)
    expect(p.some((x) => x.severidad === 'error')).toBe(false)
  })

  it('detecta equipo más grande que la zona', () => {
    const p = validarRider(rider([makeEquipo({ id: 'a', x: 0, y: 0, anchoCm: 160, altoCm: 20 })]))
    expect(p.some((x) => x.tipo === 'no-cabe' && x.severidad === 'error')).toBe(true)
  })
})
