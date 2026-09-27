import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Rider } from '../domain/types'
import { resumirRider } from '../domain/resumen'
import { MESA, ZONA_ANCHO_CM } from '../domain/mesa'

const amarillo = '#ede200'
const negro = '#0a0a0a'
const gris = '#555555'
const borde = '#cccccc'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: negro },
  h1: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  sub: { fontSize: 11, color: gris, marginBottom: 14 },
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 6,
    backgroundColor: amarillo,
    padding: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: borde, paddingVertical: 3 },
  label: { color: gris },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderWidth: 1, borderColor: borde, padding: 8, width: '23%' },
  cardNum: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  cardLabel: { color: gris },
})

function escala(cm: number, maxCm: number, maxPx: number) {
  return (cm / maxCm) * maxPx
}

export function RiderPdf({ rider }: { rider: Rider }) {
  const resumen = resumirRider(rider.equipos)
  const mesaAncho = 500
  const mesaAlto = escala(MESA.altoCm, MESA.anchoCm, mesaAncho)
  const zonaAncho = escala(ZONA_ANCHO_CM, MESA.anchoCm, mesaAncho)

  return (
    <Document title={`Rider Técnico · ${rider.participante.nombre || 'Participante'}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Rider Técnico · Make Noise Lab</Text>
        <Text style={styles.sub}>Graduación · Destino: Tascam Model 12</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Participante</Text>
          <Text>{rider.participante.nombre || '—'}</Text>
          <Text style={styles.cardLabel}>Proyecto</Text>
          <Text>{rider.participante.proyecto || '—'}</Text>
          <Text style={styles.cardLabel}>Contacto</Text>
          <Text>{rider.participante.contacto || '—'}</Text>
        </View>

        <Text style={styles.h2}>Resumen</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardNum}>{resumen.cantidadEquipos}</Text>
            <Text style={styles.cardLabel}>equipos</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNum}>{resumen.cables.total}</Text>
            <Text style={styles.cardLabel}>cables</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNum}>{resumen.adaptadores.total}</Text>
            <Text style={styles.cardLabel}>adaptadores</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNum}>{resumen.corriente.totalEnchufes}</Text>
            <Text style={styles.cardLabel}>enchufes</Text>
          </View>
        </View>

        <Text style={styles.h2}>Equipos</Text>
        {rider.equipos.map((e) => (
          <View key={e.id} style={styles.row}>
            <Text>
              {e.nombre} — {e.categoria} · {e.anchoCm}×{e.altoCm} cm
            </Text>
            <Text style={styles.label}>
              {e.salidas.length} salida(s) · {e.alimentacion.requiereCorriente ? 'corriente' : 'sin corriente'}
            </Text>
          </View>
        ))}

        <Text style={styles.h2}>Diagrama de mesa ({MESA.anchoCm / 100} × {MESA.altoCm / 100} m)</Text>
        <View style={{ width: mesaAncho, height: mesaAlto, borderWidth: 1, borderColor: negro, position: 'relative' }}>
          <View style={{ position: 'absolute', left: 0, top: 0, width: zonaAncho, height: mesaAlto, borderRightWidth: 1, borderRightColor: borde }} />
          <View style={{ position: 'absolute', left: zonaAncho, top: 0, width: zonaAncho, height: mesaAlto }} />
          {rider.equipos.map((e) => {
            const rotado = e.rot === 90 || e.rot === 270
            const ancho = rotado ? e.altoCm : e.anchoCm
            const alto = rotado ? e.anchoCm : e.altoCm
            return (
              <View
                key={e.id}
                style={{
                  position: 'absolute',
                  left: escala(e.x, MESA.anchoCm, mesaAncho),
                  top: escala(e.y, MESA.altoCm, mesaAlto),
                  width: escala(ancho, MESA.anchoCm, mesaAncho),
                  height: escala(alto, MESA.altoCm, mesaAlto),
                  backgroundColor: amarillo,
                  borderWidth: 0.5,
                  borderColor: negro,
                }}
              />
            )
          })}
        </View>
        <Text style={{ fontSize: 7, color: gris, marginTop: 2 }}>
          Zona A (izquierda) · Zona B (derecha). Cada zona mide {ZONA_ANCHO_CM / 100} × {MESA.altoCm / 100} m.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Cables, adaptadores y corriente</Text>

        <Text style={styles.h2}>Cables por conector</Text>
        {Object.entries(resumen.cables.porConector).map(([conector, cantidad]) => (
          <View key={conector} style={styles.row}>
            <Text>{conector}</Text>
            <Text>{cantidad}</Text>
          </View>
        ))}
        {Object.keys(resumen.cables.porConector).length === 0 && <Text style={styles.label}>Sin cables.</Text>}

        <Text style={styles.h2}>Adaptadores</Text>
        {Object.entries(resumen.adaptadores.porTipo).map(([tipo, cantidad]) => (
          <View key={tipo} style={styles.row}>
            <Text>{tipo}</Text>
            <Text>{cantidad}</Text>
          </View>
        ))}
        {resumen.adaptadores.total === 0 && <Text style={styles.label}>No se necesitan adaptadores.</Text>}

        <Text style={styles.h2}>Conexiones por equipo</Text>
        {resumen.adaptadores.detalles.map((d, i) => {
          const equipo = rider.equipos.find((e) => e.id === d.equipoId)
          return (
            <View key={`${d.equipoId}-${d.salidaId}-${i}`} style={styles.row}>
              <Text>
                {equipo?.nombre ?? 'Equipo'} · {d.conector} ({d.canal})
              </Text>
              <Text style={styles.label}>{d.conexion}</Text>
            </View>
          )
        })}

        <Text style={styles.h2}>Corriente</Text>
        <View style={styles.row}>
          <Text>Total de enchufes</Text>
          <Text>{resumen.corriente.totalEnchufes}</Text>
        </View>
        <View style={styles.row}>
          <Text>Alargadores sugeridos</Text>
          <Text>{resumen.corriente.alargadoresSugeridos}</Text>
        </View>
        {Object.entries(resumen.corriente.porTipo).map(([tipo, cantidad]) => (
          <View key={tipo} style={styles.row}>
            <Text>{tipo}</Text>
            <Text>{cantidad}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}
