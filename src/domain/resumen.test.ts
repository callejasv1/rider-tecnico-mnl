import { describe, expect, it } from 'vitest'
import { resumirRider } from './resumen'
import { makeEquipo, makeSalida } from './fixtures'

describe('resumirRider', () => {
  it('combina cables, adaptadores y corriente', () => {
    const equipos = [
      makeEquipo({
        id: 'a',
        salidas: [makeSalida({ canal: 'estéreo', conector: '3.5mm' })],
        alimentacion: { requiereCorriente: true, tipo: 'adaptador' },
      }),
      makeEquipo({
        id: 'b',
        salidas: [makeSalida({ canal: 'mono', conector: 'XLR' })],
        alimentacion: { requiereCorriente: true, tipo: 'IEC' },
      }),
    ]

    const resumen = resumirRider(equipos)

    expect(resumen.cantidadEquipos).toBe(2)
    expect(resumen.cables.total).toBe(3)
    expect(resumen.adaptadores.total).toBe(0)
    expect(resumen.corriente.totalEnchufes).toBe(2)
  })
})
