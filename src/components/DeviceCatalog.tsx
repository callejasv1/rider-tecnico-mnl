import { useMemo, useState } from 'react'
import { CATALOGO } from '../data/catalogo'
import { useRider } from '../store/rider'
import { nuevoId } from '../store/rider'
import type { Conector, Equipo } from '../domain/types'

const CONECTORES: Conector[] = ['1/4" TS', '1/4" TRS', '3.5mm', 'XLR', 'RCA']

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

  const equipos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return CATALOGO.equipos.filter((e) => {
      const coincideCategoria = categoria === 'Todas' || e.categoria === categoria
      const coincideBusqueda =
        !q || `${e.marca} ${e.nombre}`.toLowerCase().includes(q)
      return coincideCategoria && coincideBusqueda
    })
  }, [busqueda, categoria])

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
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar equipo o marca…"
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="Todas">Todas las categorías</option>
          {CATALOGO.categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <ul className="catalog__list">
        {equipos.map((e) => (
          <li key={e.id} className="catalog__item">
            <div>
              <strong>{e.marca} {e.nombre}</strong>
              <small>
                {e.categoria} · {e.anchoCm}×{e.altoCm} cm · {e.salidas.length} salida(s)
                {e.alimentacion.requiereCorriente ? ' · requiere corriente' : ' · sin corriente'}
              </small>
            </div>
            <button type="button" onClick={() => agregarDesdePlantilla(e)}>
              Agregar
            </button>
          </li>
        ))}
        {equipos.length === 0 && <li className="catalog__empty">Sin resultados.</li>}
      </ul>

      <details className="custom">
        <summary>Agregar un equipo propio</summary>
        <div className="grid">
          <label className="field">
            <span>Nombre</span>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </label>
          <label className="field">
            <span>Categoría</span>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATALOGO.categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Ancho (cm)</span>
            <input type="number" min={1} value={form.anchoCm} onChange={(e) => setForm({ ...form, anchoCm: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Alto (cm)</span>
            <input type="number" min={1} value={form.altoCm} onChange={(e) => setForm({ ...form, altoCm: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Nº de salidas de audio</span>
            <input type="number" min={0} value={form.salidas} onChange={(e) => setForm({ ...form, salidas: Number(e.target.value) })} />
          </label>
          <label className="field">
            <span>Tipo de salida</span>
            <select value={form.conector} onChange={(e) => setForm({ ...form, conector: e.target.value as Conector })}>
              {CONECTORES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Mono / Estéreo</span>
            <select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value as 'mono' | 'estéreo' })}>
              <option value="mono">Mono</option>
              <option value="estéreo">Estéreo</option>
            </select>
          </label>
          <label className="field field--check">
            <input type="checkbox" checked={form.requiereCorriente} onChange={(e) => setForm({ ...form, requiereCorriente: e.target.checked })} />
            <span>Requiere corriente</span>
          </label>
        </div>
        <button type="button" className="btn-primary" onClick={crearPropio}>
          Agregar equipo propio
        </button>
      </details>
    </section>
  )
}
