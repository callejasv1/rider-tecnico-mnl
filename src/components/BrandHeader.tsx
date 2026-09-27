const base = import.meta.env.BASE_URL

export function BrandHeader() {
  return (
    <header className="brand">
      <img className="brand__logo" src={`${base}logos/logo-mnl-horizontal.png`} alt="Make Noise Lab" />
      <span className="brand__tag">Rider Técnico · Graduación</span>
    </header>
  )
}
