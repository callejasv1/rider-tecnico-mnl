import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Equipo, Participante, Rider } from '../domain/types'
import type { EquipoPlantilla } from '../data/catalogoTypes'

export function nuevoId(prefijo = 'eq'): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 9)}`
}

export function equipoDesdePlantilla(plantilla: EquipoPlantilla, x = 0, y = 0): Equipo {
  return {
    id: nuevoId(),
    templateId: plantilla.id,
    nombre: `${plantilla.marca} ${plantilla.nombre}`,
    categoria: plantilla.categoria,
    anchoCm: plantilla.anchoCm,
    altoCm: plantilla.altoCm,
    salidas: plantilla.salidas.map((salida) => ({ ...salida })),
    alimentacion: { ...plantilla.alimentacion },
    x,
    y,
    rot: 0,
  }
}

interface RiderState {
  participante: Participante
  equipos: Equipo[]
  setParticipante: (participante: Partial<Participante>) => void
  agregarDesdePlantilla: (plantilla: EquipoPlantilla) => void
  agregarEquipo: (equipo: Equipo) => void
  actualizarEquipo: (id: string, cambios: Partial<Equipo>) => void
  eliminarEquipo: (id: string) => void
  moverEquipo: (id: string, x: number, y: number) => void
  rotarEquipo: (id: string) => void
  reemplazarRider: (rider: Rider) => void
  reset: () => void
}

const participanteInicial: Participante = {
  nombre: '',
  proyecto: '',
  contacto: '',
  zona: 'A',
}

export const useRider = create<RiderState>()(
  persist(
    (set) => ({
      participante: participanteInicial,
      equipos: [],

      setParticipante: (cambios) =>
        set((state) => ({ participante: { ...state.participante, ...cambios } })),

      agregarDesdePlantilla: (plantilla) =>
        set((state) => {
          const offset = state.equipos.length * 4
          return {
            equipos: [
              ...state.equipos,
              equipoDesdePlantilla(plantilla, 4 + offset, 4 + offset),
            ],
          }
        }),

      agregarEquipo: (equipo) => set((state) => ({ equipos: [...state.equipos, equipo] })),

      actualizarEquipo: (id, cambios) =>
        set((state) => ({
          equipos: state.equipos.map((e) => (e.id === id ? { ...e, ...cambios } : e)),
        })),

      eliminarEquipo: (id) =>
        set((state) => ({ equipos: state.equipos.filter((e) => e.id !== id) })),

      moverEquipo: (id, x, y) =>
        set((state) => ({
          equipos: state.equipos.map((e) => (e.id === id ? { ...e, x, y } : e)),
        })),

      rotarEquipo: (id) =>
        set((state) => ({
          equipos: state.equipos.map((e) =>
            e.id === id ? { ...e, rot: (((e.rot + 90) % 360) as Equipo['rot']) } : e,
          ),
        })),

      reemplazarRider: (rider) =>
        set({ participante: rider.participante, equipos: rider.equipos }),

      reset: () => set({ participante: participanteInicial, equipos: [] }),
    }),
    { name: 'rider-tecnico-mnl' },
  ),
)

export function obtenerRider(state: Pick<RiderState, 'participante' | 'equipos'>): Rider {
  return { version: 1, participante: state.participante, equipos: state.equipos }
}
