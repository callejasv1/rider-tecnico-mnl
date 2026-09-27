import { useRider } from '../store/rider'
import { ZONA_ANCHO_CM } from '../domain/mesa'

export function ParticipantForm() {
  const participante = useRider((s) => s.participante)
  const setParticipante = useRider((s) => s.setParticipante)

  return (
    <section className="panel">
      <h2 className="panel__title">Datos del participante</h2>
      <div className="grid">
        <label className="field">
          <span>Nombre</span>
          <input
            value={participante.nombre}
            onChange={(e) => setParticipante({ nombre: e.target.value })}
            placeholder="Tu nombre"
          />
        </label>
        <label className="field">
          <span>Proyecto / alias</span>
          <input
            value={participante.proyecto}
            onChange={(e) => setParticipante({ proyecto: e.target.value })}
            placeholder="Nombre del proyecto"
          />
        </label>
        <label className="field">
          <span>Contacto</span>
          <input
            value={participante.contacto}
            onChange={(e) => setParticipante({ contacto: e.target.value })}
            placeholder="email o teléfono"
          />
        </label>
        <label className="field">
          <span>Zona de mesa ({ZONA_ANCHO_CM / 100} m)</span>
          <select
            value={participante.zona}
            onChange={(e) => setParticipante({ zona: e.target.value as 'A' | 'B' })}
          >
            <option value="A">Zona A (izquierda)</option>
            <option value="B">Zona B (derecha)</option>
          </select>
        </label>
      </div>
    </section>
  )
}
