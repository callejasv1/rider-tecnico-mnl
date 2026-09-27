import { describe, expect, it } from 'vitest'
import { filtrarCatalogo } from './buscar'
import { CATALOGO } from './catalogo'

describe('filtrarCatalogo', () => {
  it('sin consulta y categoría Todas devuelve todo', () => {
    expect(filtrarCatalogo(CATALOGO.equipos, '', 'Todas').length).toBe(CATALOGO.equipos.length)
  })

  it('busca por marca o nombre sin distinguir mayúsculas', () => {
    const r = filtrarCatalogo(CATALOGO.equipos, 'moog', 'Todas')
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((e) => `${e.marca} ${e.nombre}`.toLowerCase().includes('moog'))).toBe(true)
  })

  it('combina categoría y consulta', () => {
    const r = filtrarCatalogo(CATALOGO.equipos, '', 'Efectos')
    expect(r.every((e) => e.categoria === 'Efectos')).toBe(true)
  })
})
