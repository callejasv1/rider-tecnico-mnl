import { useState } from 'react'
import { TopBar } from './components/TopBar'
import { Stepper } from './components/Stepper'
import { ParticipantForm } from './components/ParticipantForm'
import { DeviceCatalog } from './components/DeviceCatalog'
import { MyDevices } from './components/MyDevices'
import { TableCanvas } from './components/TableCanvas'
import { SummaryPanel } from './components/SummaryPanel'
import { ExportBar } from './components/ExportBar'
import { Toast } from './components/Toast'
import { useRider } from './store/rider'
import { useToast } from './store/toast'
import { calcularProgreso, type PasoId } from './ui/progreso'
import { irASeccion } from './ui/secciones'

function App() {
  const participante = useRider((s) => s.participante)
  const equipos = useRider((s) => s.equipos)
  const aviso = useToast((s) => s.aviso)
  const [pasoActual, setPasoActual] = useState<PasoId>('datos')

  const progreso = calcularProgreso(participante, equipos)

  function irA(paso: PasoId) {
    setPasoActual(paso)
    irASeccion(paso)
  }

  return (
    <div className="app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <TopBar
        onAyuda={() => aviso('La ayuda estará disponible en breve.')}
        onEjemplo={() => aviso('Cargar ejemplo estará disponible en breve.')}
      />
      <main id="contenido" tabIndex={-1}>
        <Stepper progreso={progreso} actual={pasoActual} onIr={irA} />
        <section id="exportar" className="seccion" tabIndex={-1} aria-label="Exportar">
          <ExportBar />
        </section>
        <div className="app__layout">
          <div className="app__col">
            <section id="datos" className="seccion" tabIndex={-1} aria-label="Datos">
              <ParticipantForm />
            </section>
            <section id="equipos" className="seccion" tabIndex={-1} aria-label="Equipos">
              <DeviceCatalog />
            </section>
          </div>
          <div className="app__col">
            <section id="mesa" className="seccion" tabIndex={-1} aria-label="Mesa">
              <TableCanvas />
            </section>
            <MyDevices />
            <section id="resumen" className="seccion" tabIndex={-1} aria-label="Resumen">
              <SummaryPanel />
            </section>
          </div>
        </div>
      </main>
      <footer className="app__footer">Make Noise Lab · Wires &amp; Voltage</footer>
      <Toast />
    </div>
  )
}

export default App
