import { describe, expect, it } from 'vitest'
import { calcularCorriente } from './corriente'
import { makeEquipo } from './fixtures'

describe('calcularCorriente', () => {
  it('ignora equipos sin corriente', () => {
    const equipo = makeEquipo({ alimentacion: { requiereCorriente: false } })
    expect(calcularCorriente([equipo])).toEqual({
      totalEnchufes: 0,
      porTipo: {},
      alargadoresSugeridos: 0,
    })
  })

  it('cuenta un enchufe por equipo con corriente y agrupa por tipo', () => {
    const equipos = [
      makeEquipo({ alimentacion: { requiereCorriente: true, tipo: 'adaptador' } }),
      makeEquipo({ alimentacion: { requiereCorriente: true, tipo: 'adaptador' } }),
      makeEquipo({ alimentacion: { requiereCorriente: true, tipo: 'IEC' } }),
    ]
    expect(calcularCorriente(equipos)).toEqual({
      totalEnchufes: 3,
      porTipo: { adaptador: 2, IEC: 1 },
      alargadoresSugeridos: 1,
    })
  })

  it('sugiere alargadores cada 6 enchufes', () => {
    const equipos = Array.from({ length: 13 }, () =>
      makeEquipo({ alimentacion: { requiereCorriente: true, tipo: 'adaptador' } }),
    )
    expect(calcularCorriente(equipos).alargadoresSugeridos).toBe(3)
  })
})
