import { useRider } from '../store/rider'
import { MESA, ZONA_ANCHO_CM } from '../domain/mesa'

export function ParticipantForm() {
  const participante = useRider((s) => s.participante)
  const setParticipante = useRider((s) => s.setParticipante)
  const zonaAnchoM = ZONA_ANCHO_CM / 100
  const mesaAltoM = MESA.altoCm / 100

  return (
    <section className="panel">
      <h2 className="panel__title">Datos del participante</h2>
      <div className="grid">
        <label className="field" htmlFor="participante-nombre">
          <span>Nombre</span>
          <input
            id="participante-nombre"
            name="nombre"
            autoComplete="name"
            value={participante.nombre}
            onChange={(e) => setParticipante({ nombre: e.target.value })}
            placeholder="Tu nombre"
          />
        </label>
        <label className="field" htmlFor="participante-proyecto">
          <span>Proyecto o alias</span>
          <input
            id="participante-proyecto"
            name="proyecto"
            autoComplete="off"
            value={participante.proyecto}
            onChange={(e) => setParticipante({ proyecto: e.target.value })}
            placeholder="Nombre del proyecto"
          />
        </label>
        <label className="field" htmlFor="participante-contacto">
          <span>Contacto</span>
          <input
            id="participante-contacto"
            name="contacto"
            autoComplete="email"
            value={participante.contacto}
            onChange={(e) => setParticipante({ contacto: e.target.value })}
            placeholder="Correo o teléfono"
          />
          <small className="field__hint">Para avisarte si algo del montaje necesita revisión.</small>
        </label>
        <label className="field" htmlFor="participante-zona">
          <span>Zona de mesa</span>
          <select
            id="participante-zona"
            name="zona"
            value={participante.zona}
            onChange={(e) => setParticipante({ zona: e.target.value as 'A' | 'B' })}
          >
            <option value="A">Zona A (izquierda)</option>
            <option value="B">Zona B (derecha)</option>
          </select>
          <small className="field__hint">
            Cada zona mide {zonaAnchoM} × {mesaAltoM} m.
          </small>
        </label>
      </div>
    </section>
  )
}
