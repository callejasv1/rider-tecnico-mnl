import { PDFDownloadLink } from '@react-pdf/renderer'
import { RiderPdf } from '../pdf/RiderPdf'
import { obtenerRider, useRider } from '../store/rider'
import type { Rider } from '../domain/types'

export function ExportBar() {
  const participante = useRider((s) => s.participante)
  const equipos = useRider((s) => s.equipos)
  const reemplazarRider = useRider((s) => s.reemplazarRider)

  const rider = obtenerRider({ participante, equipos })
  const nombreArchivo = `rider-${(participante.nombre || 'participante')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}.pdf`

  function exportarJson() {
    const blob = new Blob([JSON.stringify(rider, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo.replace(/\.pdf$/, '.json')
    a.click()
    URL.revokeObjectURL(url)
  }

  function importarJson(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Rider
        if (data && data.participante && Array.isArray(data.equipos)) {
          reemplazarRider(data)
        }
      } catch {
        alert('El archivo no es un rider válido.')
      }
    }
    reader.readAsText(file)
    ev.target.value = ''
  }

  return (
    <div className="exportbar">
      <PDFDownloadLink document={<RiderPdf rider={rider} />} fileName={nombreArchivo} className="btn-primary">
        {({ loading }) => (loading ? 'Generando PDF…' : 'Descargar PDF')}
      </PDFDownloadLink>
      <button type="button" onClick={exportarJson}>
        Guardar JSON
      </button>
      <label className="btn-file">
        Cargar JSON
        <input type="file" accept="application/json" onChange={importarJson} />
      </label>
      <button type="button" className="danger" onClick={() => confirm('¿Borrar todo el rider?') && useRider.getState().reset()}>
        Reiniciar
      </button>
    </div>
  )
}
