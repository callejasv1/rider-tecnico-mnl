import type { EquipoPlantilla } from './catalogoTypes'

export function filtrarCatalogo(
  equipos: EquipoPlantilla[],
  consulta: string,
  categoria: string,
): EquipoPlantilla[] {
  const q = consulta.trim().toLowerCase()
  return equipos.filter((e) => {
    const coincideCategoria = categoria === 'Todas' || e.categoria === categoria
    const coincideBusqueda = !q || `${e.marca} ${e.nombre}`.toLowerCase().includes(q)
    return coincideCategoria && coincideBusqueda
  })
}
