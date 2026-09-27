import { BrandHeader } from './components/BrandHeader'
import { ParticipantForm } from './components/ParticipantForm'
import { DeviceCatalog } from './components/DeviceCatalog'
import { MyDevices } from './components/MyDevices'
import { TableCanvas } from './components/TableCanvas'
import { SummaryPanel } from './components/SummaryPanel'
import { ExportBar } from './components/ExportBar'

function App() {
  return (
    <div className="app">
      <BrandHeader />
      <ExportBar />
      <div className="app__layout">
        <div className="app__col">
          <ParticipantForm />
          <DeviceCatalog />
        </div>
        <div className="app__col">
          <TableCanvas />
          <MyDevices />
          <SummaryPanel />
        </div>
      </div>
      <footer className="app__footer">Make Noise Lab · Wires &amp; Voltage</footer>
    </div>
  )
}

export default App
