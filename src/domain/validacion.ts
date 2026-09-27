import type { Equipo, Rider } from './types'
import { dentroDe, rectanguloDe, rectsSolapan, type Rect } from './geometria'
import { MESA, ZONA_ANCHO_CM } from './mesa'

export type Severidad = 'error' | 'aviso'

export type ProblemaTipo = 'fuera-de-mesa' | 'fuera-de-zona' | 'solapamiento' | 'no-cabe'

export interface Problema {
  tipo: ProblemaTipo
  severidad: Severidad
  equipoId: string
  mensaje: string
}

export function validarRider(rider: Rider): Problema[] {
  const problemas: Problema[] = []
  const mesa: Rect = { x: 0, y: 0, ancho: MESA.anchoCm, alto: MESA.altoCm }
  const zona: Rect =
    rider.participante.zona === 'A'
      ? { x: 0, y: 0, ancho: ZONA_ANCHO_CM, alto: MESA.altoCm }
      : { x: ZONA_ANCHO_CM, y: 0, ancho: ZONA_ANCHO_CM, alto: MESA.altoCm }

  for (const equipo of rider.equipos) {
    const rect = rectanguloDe(equipo)

    if (rect.ancho > ZONA_ANCHO_CM || rect.alto > MESA.altoCm) {
      problemas.push({
        tipo: 'no-cabe',
        severidad: 'error',
        equipoId: equipo.id,
        mensaje: `«${etiqueta(equipo)}» mide ${rect.ancho}×${rect.alto} cm y no cabe en la zona de ${ZONA_ANCHO_CM}×${MESA.altoCm} cm. Reduce sus dimensiones o gíralo.`,
      })
    }

    if (!dentroDe(rect, mesa)) {
      problemas.push({
        tipo: 'fuera-de-mesa',
        severidad: 'error',
        equipoId: equipo.id,
        mensaje: `«${etiqueta(equipo)}» se sale de la mesa de ${MESA.anchoCm}×${MESA.altoCm} cm. Muévelo para que quede completamente dentro.`,
      })
    }

    if (!dentroDe(rect, zona)) {
      problemas.push({
        tipo: 'fuera-de-zona',
        severidad: 'aviso',
        equipoId: equipo.id,
        mensaje: `«${etiqueta(equipo)}» está fuera de tu zona (${rider.participante.zona}). Muévelo a tu mitad de la mesa.`,
      })
    }
  }

  for (let i = 0; i < rider.equipos.length; i++) {
    for (let j = i + 1; j < rider.equipos.length; j++) {
      const a = rider.equipos[i]
      const b = rider.equipos[j]
      if (rectsSolapan(rectanguloDe(a), rectanguloDe(b))) {
        problemas.push({
          tipo: 'solapamiento',
          severidad: 'error',
          equipoId: a.id,
          mensaje: `«${etiqueta(a)}» se solapa con «${etiqueta(b)}». Sepáralos para que sus rectángulos no se crucen.`,
        })
      }
    }
  }

  return problemas
}

function etiqueta(equipo: Equipo): string {
  return equipo.nombre || equipo.id
}
