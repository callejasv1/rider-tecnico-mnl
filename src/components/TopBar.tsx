import { irASeccion } from '../ui/secciones'

interface TopBarProps {
  onAyuda: () => void
  onEjemplo: () => void
}

const base = import.meta.env.BASE_URL

export function TopBar({ onAyuda, onEjemplo }: TopBarProps) {
  return (
    <header className="topbar">
      <img
        className="topbar__logo"
        src={`${base}logos/logo-mnl-horizontal.png`}
        alt="Make Noise Lab"
      />
      <h1 className="topbar__title">Rider Técnico</h1>
      <div className="topbar__actions">
        <button type="button" className="btn--ghost" onClick={onAyuda}>
          Ayuda
        </button>
        <button type="button" className="btn--secondary" onClick={onEjemplo}>
          Cargar ejemplo
        </button>
        <button type="button" className="btn--primary" onClick={() => irASeccion('exportar')}>
          Exportar
        </button>
      </div>
    </header>
  )
}
