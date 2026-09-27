import { useMemo, useState } from 'react'
import { CATALOGO } from '../data/catalogo'
import { filtrarCatalogo } from '../data/buscar'
import { CONECTORES } from '../domain/conectores'
import { useRider } from '../store/rider'
import { nuevoId } from '../store/rider'
import type { Conector, Equipo } from '../domain/types'

const vacio = {
  nombre: '',
  categoria: 'Otro',
  anchoCm: 30,
  altoCm: 20,
  conector: '1/4" TS' as Conector,
  canal: 'mono' as 'mono' | 'estéreo',
  salidas: 1,
  requiereCorriente: true,
}

export function DeviceCatalog() {
  const agregarDesdePlantilla = useRider((s) => s.agregarDesdePlantilla)
  const agregarEquipo = useRider((s) => s.agregarEquipo)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [form, setForm] = useState(vacio)

  const equipos = useMemo(
    () => filtrarCatalogo(CATALOGO.equipos, busqueda, categoria),
    [busqueda, categoria],
  )

  function crearPropio() {
    if (!form.nombre.trim()) return
    const equipo: Equipo = {
      id: nuevoId(),
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      anchoCm: Number(form.anchoCm) || 30,
      altoCm: Number(form.altoCm) || 20,
      salidas: Array.from({ length: Math.max(0, Number(form.salidas) || 0) }, (_, i) => ({
        id: `out-${i + 1}`,
        etiqueta: `Salida ${i + 1}`,
        canal: form.canal,
        conector: form.conector,
      })),
      alimentacion: {
        requiereCorriente: form.requiereCorriente,
        tipo: form.requiereCorriente ? 'adaptador' : undefined,
      },
      x: 4,
      y: 4,
      rot: 0,
    }
    agregarEquipo(equipo)
    setForm(vacio)
  }

  return (
    <section className="panel">
      <h2 className="panel__title">Catálogo de equipos</h2>
      <div className="catalog__filters">
        <label className="field" htmlFor="catalogo-buscar">
          <span>Buscar</span>
          <input
            id="catalogo-buscar"
            name="buscar"
            type="search"
            autoComplete="off"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Marca o equipo…"
          />
        </label>
        <label className="field" htmlFor="catalogo-categoria">
          <span>Categoría</span>
          <select
            id="catalogo-categoria"
            name="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="Todas">Todas las categorías</option>
            {CATALOGO.categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="catalog__list">
        {equipos.map((e) => (
          <li key={e.id} className="catalog__item">
            <div>
              <strong>
                {e.marca} {e.nombre}
              </strong>
              <small>
                <span className="badge">
                  {e.anchoCm}×{e.altoCm} cm
                </span>{' '}
                {e.categoria} · {e.salidas.length} salida(s) ·{' '}
                {e.alimentacion.requiereCorriente ? 'requiere corriente' : 'sin corriente'}
              </small>
            </div>
            <button
              type="button"
              aria-label={`Agregar ${e.marca} ${e.nombre}`}
              onClick={() => agregarDesdePlantilla(e)}
            >
              Agregar equipo
            </button>
          </li>
        ))}
        {equipos.length === 0 && (
          <li className="catalog__empty">
            No hay equipos que coincidan. Prueba otra búsqueda o categoría, o agrégalo como equipo
            propio.
          </li>
        )}
      </ul>

      <details className="custom">
        <summary>Agregar un equipo propio</summary>
        <div className="grid">
          <label className="field" htmlFor="propio-nombre">
            <span>Nombre</span>
            <input
              id="propio-nombre"
              name="nombre"
              autoComplete="off"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </label>
          <label className="field" htmlFor="propio-categoria">
            <span>Categoría</span>
            <select
              id="propio-categoria"
              name="categoria"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {CATALOGO.categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="propio-ancho">
            <span>Ancho (cm)</span>
            <input
              id="propio-ancho"
              name="anchoCm"
              type="number"
              min={1}
              value={form.anchoCm}
              onChange={(e) => setForm({ ...form, anchoCm: Number(e.target.value) })}
            />
          </label>
          <label className="field" htmlFor="propio-alto">
            <span>Alto (cm)</span>
            <input
              id="propio-alto"
              name="altoCm"
              type="number"
              min={1}
              value={form.altoCm}
              onChange={(e) => setForm({ ...form, altoCm: Number(e.target.value) })}
            />
          </label>
          <label className="field" htmlFor="propio-salidas">
            <span>Nº de salidas de audio</span>
            <input
              id="propio-salidas"
              name="salidas"
              type="number"
              min={0}
              value={form.salidas}
              onChange={(e) => setForm({ ...form, salidas: Number(e.target.value) })}
            />
          </label>
          <label className="field" htmlFor="propio-conector">
            <span>Tipo de salida</span>
            <select
              id="propio-conector"
              name="conector"
              value={form.conector}
              onChange={(e) => setForm({ ...form, conector: e.target.value as Conector })}
            >
              {CONECTORES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="propio-canal">
            <span>Mono o estéreo</span>
            <select
              id="propio-canal"
              name="canal"
              value={form.canal}
              onChange={(e) =>
                setForm({ ...form, canal: e.target.value as 'mono' | 'estéreo' })
              }
            >
              <option value="mono">Mono</option>
              <option value="estéreo">Estéreo</option>
            </select>
          </label>
          <label className="field field--check" htmlFor="propio-corriente">
            <input
              id="propio-corriente"
              name="requiereCorriente"
              type="checkbox"
              checked={form.requiereCorriente}
              onChange={(e) => setForm({ ...form, requiereCorriente: e.target.checked })}
            />
            <span>Requiere corriente</span>
          </label>
        </div>
        <button
          type="button"
          className="btn--primary"
          onClick={crearPropio}
          disabled={!form.nombre.trim()}
        >
          Agregar equipo propio
        </button>
      </details>
    </section>
  )
}
