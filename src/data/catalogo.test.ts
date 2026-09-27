import { describe, expect, it } from 'vitest'
import { CATALOGO } from './catalogo'

const REFERENCIA: Record<string, [number, number]> = {
  'moog-mother-32': [31.9, 13.3],
  'moog-dfam': [31.9, 13.3],
  'arturia-microfreak': [31.1, 23.3],
  'make-noise-maths': [10.2, 13],
  'mutable-beads': [7.1, 13],
  'eventide-h9': [11.8, 5.0],
  'strymon-blueSky': [10.2, 11.4],
  'mackie-mix5': [14.0, 19.6],
}

describe('catálogo', () => {
  it('tiene dimensiones positivas en todo equipo', () => {
    for (const e of CATALOGO.equipos) {
      expect(e.anchoCm, e.id).toBeGreaterThan(0)
      expect(e.altoCm, e.id).toBeGreaterThan(0)
    }
  })

  it('tiene ids únicos y categorías válidas', () => {
    const ids = CATALOGO.equipos.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of CATALOGO.equipos) {
      expect(CATALOGO.categorias, e.id).toContain(e.categoria)
    }
  })

  it('respeta la tabla de referencia de dimensiones corregidas', () => {
    for (const [id, [ancho, alto]] of Object.entries(REFERENCIA)) {
      const e = CATALOGO.equipos.find((x) => x.id === id)
      expect(e, id).toBeDefined()
      expect(e!.anchoCm, id).toBe(ancho)
      expect(e!.altoCm, id).toBe(alto)
    }
  })

  it('toda ficha corregida anota su fuente', () => {
    for (const id of Object.keys(REFERENCIA)) {
      const e = CATALOGO.equipos.find((x) => x.id === id)
      expect(e!.fuente, id).toBeTruthy()
    }
  })

  it('todo equipo que requiere corriente define tipo y enchufe', () => {
    for (const e of CATALOGO.equipos) {
      if (!e.alimentacion.requiereCorriente) continue
      expect(e.alimentacion.tipo, e.id).toBeDefined()
      expect(e.alimentacion.enchufe, e.id).toBeTruthy()
    }
  })
})
