import { useRef, useState } from 'react'
import { useRider } from '../store/rider'
import { MESA, ZONA_ANCHO_CM } from '../domain/mesa'
import type { Equipo } from '../domain/types'

const PX_POR_CM = 3

function dimensiones(e: Equipo) {
  const rotado = e.rot === 90 || e.rot === 270
  return {
    ancho: rotado ? e.altoCm : e.anchoCm,
    alto: rotado ? e.anchoCm : e.altoCm,
  }
}

export function TableCanvas() {
  const equipos = useRider((s) => s.equipos)
  const moverEquipo = useRider((s) => s.moverEquipo)
  const rotarEquipo = useRider((s) => s.rotarEquipo)
  const eliminarEquipo = useRider((s) => s.eliminarEquipo)

  const contenedor = useRef<HTMLDivElement>(null)
  const [arrastrando, setArrastrando] = useState<{ id: string; dx: number; dy: number } | null>(null)

  const anchoPx = MESA.anchoCm * PX_POR_CM
  const altoPx = MESA.altoCm * PX_POR_CM

  function posicionDesdeEvento(ev: React.PointerEvent) {
    const rect = contenedor.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (ev.clientX - rect.left) / PX_POR_CM,
      y: (ev.clientY - rect.top) / PX_POR_CM,
    }
  }

  function onPointerDown(ev: React.PointerEvent, equipo: Equipo) {
    ev.preventDefault()
    const p = posicionDesdeEvento(ev)
    setArrastrando({ id: equipo.id, dx: p.x - equipo.x, dy: p.y - equipo.y })
    ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
  }

  function onPointerMove(ev: React.PointerEvent) {
    if (!arrastrando) return
    const p = posicionDesdeEvento(ev)
    const equipo = equipos.find((e) => e.id === arrastrando.id)
    if (!equipo) return
    const { ancho, alto } = dimensiones(equipo)
    const x = Math.min(Math.max(0, p.x - arrastrando.dx), MESA.anchoCm - ancho)
    const y = Math.min(Math.max(0, p.y - arrastrando.dy), MESA.altoCm - alto)
    moverEquipo(arrastrando.id, Math.round(x), Math.round(y))
  }

  function onPointerUp() {
    setArrastrando(null)
  }

  return (
    <section className="panel">
      <h2 className="panel__title">
        Mesa ({MESA.anchoCm / 100} m × {MESA.altoCm / 100} m · dos zonas de {ZONA_ANCHO_CM / 100} m)
      </h2>
      <p className="muted">Arrastra los equipos para ubicarlos. Doble clic para rotar.</p>
      <div className="table-wrap">
        <div
          ref={contenedor}
          className="table"
          style={{ width: anchoPx, height: altoPx }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div className="table__zone table__zone--a" style={{ width: ZONA_ANCHO_CM * PX_POR_CM }}>
            <span>Zona A</span>
          </div>
          <div className="table__zone table__zone--b" style={{ width: ZONA_ANCHO_CM * PX_POR_CM }}>
            <span>Zona B</span>
          </div>

          {equipos.map((equipo) => {
            const { ancho, alto } = dimensiones(equipo)
            return (
              <div
                key={equipo.id}
                className={`device ${arrastrando?.id === equipo.id ? 'device--active' : ''}`}
                style={{
                  left: equipo.x * PX_POR_CM,
                  top: equipo.y * PX_POR_CM,
                  width: ancho * PX_POR_CM,
                  height: alto * PX_POR_CM,
                }}
                onPointerDown={(ev) => onPointerDown(ev, equipo)}
                onDoubleClick={() => rotarEquipo(equipo.id)}
                title={`${equipo.nombre} · ${equipo.anchoCm}×${equipo.altoCm} cm`}
              >
                <span className="device__name">{equipo.nombre}</span>
                <span className="device__size">
                  {equipo.anchoCm}×{equipo.altoCm}
                </span>
                <button
                  type="button"
                  className="device__remove"
                  onPointerDown={(ev) => ev.stopPropagation()}
                  onClick={() => eliminarEquipo(equipo.id)}
                  aria-label={`Quitar ${equipo.nombre}`}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
