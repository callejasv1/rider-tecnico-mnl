import { useRider } from '../store/rider'

export function MyDevices() {
  const equipos = useRider((s) => s.equipos)
  const rotarEquipo = useRider((s) => s.rotarEquipo)
  const eliminarEquipo = useRider((s) => s.eliminarEquipo)

  return (
    <section className="panel">
      <h2 className="panel__title">Mis equipos ({equipos.length})</h2>
      {equipos.length === 0 ? (
        <p className="muted">Aún no has agregado equipos.</p>
      ) : (
        <ul className="mylist">
          {equipos.map((e) => (
            <li key={e.id}>
              <div>
                <strong>{e.nombre}</strong>
                <small>
                  {e.categoria} · {e.salidas.length} salida(s) ·{' '}
                  {e.alimentacion.requiereCorriente ? 'enchufe' : 'sin corriente'}
                </small>
              </div>
              <div className="mylist__actions">
                <button type="button" onClick={() => rotarEquipo(e.id)}>
                  Rotar
                </button>
                <button type="button" className="danger" onClick={() => eliminarEquipo(e.id)}>
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
