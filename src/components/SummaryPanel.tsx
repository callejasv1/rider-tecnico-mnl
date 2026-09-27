import { useRider } from '../store/rider'
import { resumirRider } from '../domain/resumen'

export function SummaryPanel() {
  const equipos = useRider((s) => s.equipos)
  const resumen = resumirRider(equipos)

  return (
    <section className="panel">
      <h2 className="panel__title">Resumen del rider</h2>
      <div className="summary">
        <div className="summary__card">
          <strong>{resumen.cantidadEquipos}</strong>
          <span>equipos</span>
        </div>
        <div className="summary__card">
          <strong>{resumen.cables.total}</strong>
          <span>cables de audio</span>
        </div>
        <div className="summary__card">
          <strong>{resumen.adaptadores.total}</strong>
          <span>adaptadores</span>
        </div>
        <div className="summary__card">
          <strong>{resumen.corriente.totalEnchufes}</strong>
          <span>enchufes</span>
        </div>
      </div>

      <div className="summary__detail">
        <h3>Cables por conector</h3>
        {Object.keys(resumen.cables.porConector).length === 0 ? (
          <p className="muted">Sin cables todavía.</p>
        ) : (
          <ul>
            {Object.entries(resumen.cables.porConector).map(([conector, cantidad]) => (
              <li key={conector}>
                <span>{conector}</span>
                <strong>{cantidad}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="summary__detail">
        <h3>Adaptadores necesarios</h3>
        {resumen.adaptadores.total === 0 ? (
          <p className="muted">No se necesitan adaptadores.</p>
        ) : (
          <ul>
            {Object.entries(resumen.adaptadores.porTipo).map(([tipo, cantidad]) => (
              <li key={tipo}>
                <span>{tipo}</span>
                <strong>{cantidad}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="summary__detail">
        <h3>Corriente</h3>
        <p>
          {resumen.corriente.totalEnchufes} enchufe(s) · {resumen.corriente.alargadoresSugeridos}{' '}
          alargador(es) sugerido(s)
        </p>
        <ul>
          {Object.entries(resumen.corriente.porTipo).map(([tipo, cantidad]) => (
            <li key={tipo}>
              <span>{tipo}</span>
              <strong>{cantidad}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
