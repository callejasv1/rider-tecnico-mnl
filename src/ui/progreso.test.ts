import { describe, expect, it } from 'vitest'
import { calcularProgreso } from './progreso'
import { makeEquipo } from '../domain/fixtures'
import type { Participante } from '../domain/types'

const datos: Participante = { nombre: 'Ada', proyecto: 'P', contacto: 'a@b.c', zona: 'A' }
const vacio: Participante = { nombre: '', proyecto: '', contacto: '', zona: 'A' }

describe('calcularProgreso', () => {
  it('sin datos ni equipos nada está completo', () => {
    expect(calcularProgreso(vacio, [])).toEqual({
      datos: false, equipos: false, mesa: false, resumen: false, exportar: false,
    })
  })

  it('marca datos y exportable con datos y equipos válidos', () => {
    const equipos = [makeEquipo({ id: 'a', anchoCm: 30, altoCm: 20, x: 0, y: 0 })]
    expect(calcularProgreso(datos, equipos)).toEqual({
      datos: true, equipos: true, mesa: true, resumen: true, exportar: true,
    })
  })

  it('marca mesa/resumen/exportar en falso si hay un error de validación', () => {
    const fuera = [makeEquipo({ id: 'a', anchoCm: 30, altoCm: 20, x: 290, y: 0 })]
    const p = calcularProgreso(datos, fuera)
    expect(p.equipos).toBe(true)
    expect(p.mesa).toBe(false)
    expect(p.resumen).toBe(false)
    expect(p.exportar).toBe(false)
  })
})
