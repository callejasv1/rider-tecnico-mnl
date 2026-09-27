import { describe, expect, it } from 'vitest'
import { calcularAdaptadores } from './adaptadores'
import { makeEquipo, makeSalida } from './fixtures'

describe('calcularAdaptadores (Tascam Model 12)', () => {
  it('no requiere adaptador para XLR ni para 1/4"', () => {
    const equipo = makeEquipo({
      salidas: [
        makeSalida({ id: 'a', conector: 'XLR' }),
        makeSalida({ id: 'b', conector: '1/4" TS' }),
        makeSalida({ id: 'c', conector: '1/4" TRS', canal: 'estéreo' }),
      ],
    })
    const resumen = calcularAdaptadores([equipo])
    expect(resumen.total).toBe(0)
    expect(resumen.porTipo).toEqual({})
  })

  it('requiere adaptador 3.5mm→1/4" para Eurorack mono', () => {
    const equipo = makeEquipo({ salidas: [makeSalida({ conector: '3.5mm', canal: 'mono' })] })
    const resumen = calcularAdaptadores([equipo])
    expect(resumen.total).toBe(1)
    expect(resumen.porTipo['3.5mm→1/4"']).toBe(1)
  })

  it('requiere adaptador RCA→1/4"', () => {
    const equipo = makeEquipo({
      salidas: [
        makeSalida({ id: 'l', conector: 'RCA', canal: 'mono' }),
        makeSalida({ id: 'r', conector: 'RCA', canal: 'mono' }),
      ],
    })
    const resumen = calcularAdaptadores([equipo])
    expect(resumen.total).toBe(2)
    expect(resumen.porTipo['RCA→1/4"']).toBe(2)
  })

  it('usa la única entrada 3.5mm para un estéreo y el resto necesita cable en Y', () => {
    const equipo = makeEquipo({
      salidas: [
        makeSalida({ id: 'a', conector: '3.5mm', canal: 'estéreo' }),
        makeSalida({ id: 'b', conector: '3.5mm', canal: 'estéreo' }),
      ],
    })
    const resumen = calcularAdaptadores([equipo])
    expect(resumen.total).toBe(1)
    expect(resumen.porTipo['3.5mm→doble 1/4"']).toBe(1)
    expect(resumen.detalles[0]?.adaptador).toBeNull()
    expect(resumen.detalles[1]?.adaptador).toBe('3.5mm→doble 1/4"')
  })

  it('marca null cuando la conexión es directa', () => {
    const equipo = makeEquipo({ salidas: [makeSalida({ conector: 'XLR' })] })
    const resumen = calcularAdaptadores([equipo])
    expect(resumen.detalles[0]?.adaptador).toBeNull()
    expect(resumen.detalles[0]?.conexion).toContain('XLR')
  })
})
