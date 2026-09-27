import { describe, expect, it } from 'vitest'
import { contarCables } from './cables'
import { makeEquipo, makeSalida } from './fixtures'

describe('contarCables', () => {
  it('devuelve cero sin equipos', () => {
    expect(contarCables([])).toEqual({ total: 0, porConector: {} })
  })

  it('cuenta una salida mono como un cable', () => {
    const equipo = makeEquipo({ salidas: [makeSalida({ canal: 'mono', conector: '1/4" TS' })] })
    expect(contarCables([equipo])).toEqual({ total: 1, porConector: { '1/4" TS': 1 } })
  })

  it('cuenta una salida estéreo como dos cables', () => {
    const equipo = makeEquipo({ salidas: [makeSalida({ canal: 'estéreo', conector: 'XLR' })] })
    expect(contarCables([equipo])).toEqual({ total: 2, porConector: { XLR: 2 } })
  })

  it('agrupa por conector sumando canales', () => {
    const equipo = makeEquipo({
      salidas: [
        makeSalida({ id: 'a', canal: 'mono', conector: '3.5mm' }),
        makeSalida({ id: 'b', canal: 'estéreo', conector: '3.5mm' }),
        makeSalida({ id: 'c', canal: 'mono', conector: 'XLR' }),
      ],
    })
    expect(contarCables([equipo])).toEqual({
      total: 4,
      porConector: { '3.5mm': 3, XLR: 1 },
    })
  })
})
