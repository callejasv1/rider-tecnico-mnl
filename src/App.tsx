const base = import.meta.env.BASE_URL

function App() {
  return (
    <main className="landing">
      <img
        className="landing__logo"
        src={`${base}logos/logo-mnl-principal.png`}
        alt="Make Noise Lab"
      />
      <h1 className="landing__title">Rider Técnico</h1>
      <p className="landing__subtitle">Graduación · Make Noise Lab</p>
      <p className="landing__note">En construcción.</p>
    </main>
  )
}

export default App
