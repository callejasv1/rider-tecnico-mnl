import { beforeEach, describe, expect, it } from 'vitest'
import { useToast } from './toast'

beforeEach(() => useToast.setState({ actual: null, proximoId: 1 }))

describe('useToast', () => {
  it('muestra y cierra un aviso', () => {
    useToast.getState().aviso('Rider de ejemplo cargado.')
    expect(useToast.getState().actual?.mensaje).toBe('Rider de ejemplo cargado.')
    useToast.getState().cerrar()
    expect(useToast.getState().actual).toBeNull()
  })

  it('asigna ids crecientes y tono de error', () => {
    useToast.getState().error('El archivo no es un rider válido.')
    const primero = useToast.getState().actual!.id
    useToast.getState().aviso('ok')
    expect(useToast.getState().actual!.id).toBe(primero + 1)
    expect(useToast.getState().actual!.tono).toBe('info')
  })
})
