import { create } from 'zustand'

export type TonoToast = 'info' | 'error'

export interface AvisoToast {
  id: number
  tono: TonoToast
  mensaje: string
}

interface ToastState {
  actual: AvisoToast | null
  proximoId: number
  aviso: (mensaje: string) => void
  error: (mensaje: string) => void
  cerrar: () => void
}

export const useToast = create<ToastState>()((set) => ({
  actual: null,
  proximoId: 1,

  aviso: (mensaje) =>
    set((state) => ({
      actual: { id: state.proximoId, tono: 'info', mensaje },
      proximoId: state.proximoId + 1,
    })),

  error: (mensaje) =>
    set((state) => ({
      actual: { id: state.proximoId, tono: 'error', mensaje },
      proximoId: state.proximoId + 1,
    })),

  cerrar: () => set({ actual: null }),
}))
