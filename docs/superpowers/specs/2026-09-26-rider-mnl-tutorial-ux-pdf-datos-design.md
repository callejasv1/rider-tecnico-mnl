# Rider Técnico MNL — Tutorial, rediseño UI/UX, PDF y auditoría de datos

Fecha: 2026-09-26
Estado: aprobado para planificación
Ruta del proyecto: `/Users/ecallejasp/Documents/rider-tecnico-mnl`

## 1. Contexto

Aplicación web (React 19 + Vite + zustand + `@react-pdf/renderer`) para que los
participantes de la graduación de Make Noise Lab armen su **rider técnico**:

- Formulario del participante (nombre, proyecto, contacto, zona A/B).
- Catálogo de ~28 equipos; se agregan a una mesa arrastrable de 3 m × 1 m
  (dos zonas de 1,5 m).
- Resumen derivado: cables por conector, adaptadores necesarios hacia una
  Tascam Model 12 y corriente (enchufes/alargadores).
- Exportación a PDF y a JSON (guardar/cargar).

El público son personas que **nunca** han hecho un rider técnico. Hoy la app es
funcional pero: no explica nada, el look es básico, el PDF es feo y varias
dimensiones del catálogo están mal.

## 2. Objetivo

Convertir la app en una herramienta **autoexplicativa y agradable** para
primerizos, con un PDF presentable y datos de equipos correctos.

### Criterios de éxito

1. Un usuario sin experiencia entiende qué es un rider y completa su rider sin
   ayuda externa (validado de forma manual con el flujo guiado).
2. UI rediseñada, coherente con la marca (logo + amarillo `#EDE200`), responsive
   y accesible (WCAG AA en texto normal, navegación por teclado en la mesa).
3. PDF en blanco y negro, 1–2 páginas A4, legible impresso y sin elementos
   decorativos innecesarios.
4. Todas las dimensiones del catálogo corregidas contra especificaciones de
   fabricante, con fuente registrada y test que las protege.

### Fuera de alcance

- No se cambia la arquitectura de despliegue (GitHub Pages) ni el stack base.
- No se añaden libros de componentes externos pesados (Radix/Tailwind/driver.js).
- No se toca la lógica de destino/modelo 12 salvo lo necesario para el resumen.
- No hay backend, cuentas ni colaboración multiusuario.

### Supuestos

- "Dimensiones" = huella (ancho × alto/profundidad) de los equipos del catálogo,
  no de la mesa (confirmado por el usuario).
- La mesa sigue siendo 300 × 100 cm con 2 zonas de 150 cm.
- El idioma de la interfaz sigue siendo español.

## 3. Modelo de datos y cambios de estado

### 3.1 Catálogo (`src/data/`)

`EquipoPlantilla` añade:

- `fuente?: string` — URL de la ficha técnica usada para las dimensiones.

No se propaga `fuente` a `Equipo` (la instancia no la necesita), salvo que un
test la requiera.

### 3.2 Store (`src/store/rider.ts`)

Nuevo slice de tutorial:

```ts
interface TutorialState {
  visto: boolean        // mostró el wizard alguna vez
  completado: boolean   // terminó o saltó el wizard
  activo: boolean       // el overlay está visible
  paso: number          // índice del paso actual
}
```

Acciones: `iniciarTutorial()`, `siguientePaso()`, `pasoAnterior()`,
`irAPaso(n)`, `cerrarTutorial()`, `reiniciarTutorial()`.

Nuevo estado de selección (no persistido): `seleccionadoId: string | null`,
`seleccionarEquipo(id | null)`.

Selector `cargarEjemplo()` que reemplaza el rider con `src/data/ejemplo.ts`.

`persist` con `partialize` para no guardar `activo`, `paso` ni `seleccionadoId`.

### 3.3 Validación (`src/domain/validacion.ts`)

```ts
type Severidad = 'error' | 'aviso'
interface Problema {
  tipo: 'fuera-de-mesa' | 'fuera-de-zona' | 'solapamiento' | 'no-cabe'
  severidad: Severidad
  equipoId: string
  mensaje: string
}
function validarRider(rider: Rider): Problema[]
```

Reglas:

- `fuera-de-mesa` (error): el rectángulo del equipo excede la mesa.
- `fuera-de-zona` (aviso): el equipo no está íntegramente dentro de la zona del
  participante.
- `solapamiento` (error): dos equipos se intersectan.
- `no-cabe` (error): el equipo es más grande que la mesa/zona.

### 3.4 Datos nuevos

- `src/data/glosario.ts`: definiciones de términos (rider, zona A/B, mono,
  estéreo, TS, TRS, XLR, 3.5 mm, RCA, DI, adaptador, IEC, USB, enchufe,
  alargador, mesa de mezclas, modelo 12).
- `src/data/ejemplo.ts`: rider de ejemplo realista (≈7 equipos ubicados en la
  mesa, participante "Ejemplo").
- `src/tutorial/pasos.ts`: configuración de pasos del wizard (id, título,
  descripción, tips, selector `data-tour` objetivo, paso de navegación
  asociado).

## 4. Workstream 5 — Auditoría de dimensiones (se ejecuta primero)

Para **cada** equipo del catálogo:

1. Buscar especificaciones oficiales del fabricante (ancho × profundo/alto);
   usar fuentes de confianza (web del fabricante, manual, retailers técnicos).
2. Corregir `anchoCm` / `altoCm` (huella en cm, redondeo a 0,1 cm).
3. Anotar `fuente` con la URL consultada.
4. Casos ya detectados con error probable: **Maths 20 HP ≈ 10,2 cm** (hoy 20),
   **Beads 14 HP ≈ 7,1 cm** (hoy 14), **Eventide H9**, **Arturia MicroFreak**,
   **Moog Mother-32/DFAM**, **Strymon blueSky**, **Mackie Mix5**.

Añadir `src/data/catalogo.test.ts`:

- Toda dimensión `> 0`.
- Ids únicos; categorías válidas.
- Assert de valores esperados (tabla de referencia) para los equipos corregidos.
- Todo equipo con `requiereCorriente: true` tiene `tipo` y `enchufe` definidos.

Nota: las dimensiones son dato subjetivo-a-verificable; el test fija el valor
acordado en este spec para detectar regresiones, no valida la realidad física.

## 5. Workstream 1 — Sistema de diseño y UI/UX (rediseño completo)

Se mantiene el logo y el amarillo de marca. Se reemplaza la estética por una
nueva, con tokens y componentes consistentes. Todo en CSS plano (sin Tailwind).

### 5.0 Skills de diseño (ya instaladas)

- **Externa**: `anthropics/skills` → `frontend-design` (Apache 2.0), vendida en
  `.opencode/skills/frontend-design/` con `LICENSE.txt` y `README.md` de
  atribución. Guía la intención estética y prohíbe defaults generados.
- **Local**: `.opencode/skills/mnl-design-system/SKILL.md`, con tokens, reglas de
  estructura/interacción, piso de accesibilidad y reglas de copy.
- Nota de dirección: `frontend-design` advierte que "near-black + un único acento
  brillante", eyebrows en MAYÚSCULAS en cada título y meta-strings con "·" son
  tells de diseño generado. El near-black + amarillo **está fijado por la marca**
  (el brief gana), pero se evitan los otros tics: nada de eyebrows en cada
  sección ni separadores "·" decorativos.

### 5.1 Tokens (`src/styles/tokens.css`)

```css
:root {
  /* superficies */
  --bg: #0b0b0b;
  --surface-1: #141414;
  --surface-2: #1c1c1c;
  --surface-3: #242424;
  /* bordes */
  --border: #2e2e2e;
  --border-strong: #3d3d3d;
  /* texto */
  --text: #f5f5f5;
  --text-muted: #a3a3a3;
  --text-faint: #6e6e6e;
  /* marca / semánticos */
  --accent: #ede200;
  --accent-ink: #0b0b0b;
  --danger: #ff6b6b;
  --warn: #ffb020;
  --ok: #4ade80;
  /* espacio, radio, sombra, motion */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-pill: 999px;
  --shadow-1: 0 1px 2px rgba(0,0,0,.4);
  --shadow-2: 0 8px 24px rgba(0,0,0,.5);
  --dur-fast: 120ms; --dur: 180ms; --ease: cubic-bezier(.2,.6,.2,1);
}
```

### 5.2 Tipografía

- Cargar `Archivo` (títulos/marca) e `Inter` (UI) vía Google Fonts con
  `preconnect` y `display=swap`; fallback `system-ui, Arial`.
- Escala: display 28/36, h2 18, h3 14, cuerpo 14, micro-label 11 uppercase con
  `letter-spacing`.

### 5.3 Shell y layout

- **Top bar sticky**: logo, título "Rider Técnico", botones "Ayuda", "Ejemplo",
  "Exportar". En móvil colapsa.
- **Stepper de progreso** (Datos → Equipos → Mesa → Resumen → Export) que
  refleja completitud y permite saltar a cada sección.
- Layout: 2 columnas (izq. formulario + catálogo; der. mesa + equipos +
  resumen) que pasa a 1 columna con export sticky abajo en móvil.
- Paneles: cabecera (título + affordance `?`), cuerpo, estados vacíos con CTA.

### 5.4 Componentes

- Botones: primario (amarillo), secundario, fantasma, peligro; tamaños sm/md.
- Campos con label, hint y error; checks accesibles.
- Tarjetas de resumen con icono/etiqueta.
- **Toasts** (`src/components/Toast.tsx`) y **modal de confirmación** que
  reemplazan `alert`/`confirm` (`ExportBar`).
- Badges de severidad para avisos de validación.
- Tooltip/popover reutilizable para ayuda contextual.

### 5.5 Accesibilidad

- Contraste ≥ AA en texto normal.
- `:focus-visible` visible en todos los interactivos.
- Skip link "Saltar al contenido".
- Canvas operable por teclado (ver workstream 2).
- `aria-live` para toasts; roles/etiquetas en overlay y modales.
- Respetar `prefers-reduced-motion`.

## 6. Workstream 2 — Canvas de mesa

- Reglas (cm) y grid visual; **snap a 5 cm** al arrastrar.
- Zoom (‑/+/ajustar) y contenedor con scroll.
- Estados visuales: seleccionado, arrastrando, con problema (borde rojo/ámbar).
- **Panel del equipo seleccionado**: editar nombre, categoría, ancho, alto,
  salidas (añadir/quitar, conector, canal) y alimentación; botones rotar/quitar.
- Teclado sobre el equipo seleccionado: flechas = ±1 cm, `Shift`+flechas =
  ±5 cm, `R` = rotar, `Del`/`Backspace` = quitar.
- Doble clic sigue rotando; se conserva el arrastre con puntero.
- Mensajes de validación (`validarRider`) mostrados sobre la mesa y en un
  bloque de avisos.

## 7. Workstream 3 — Modo tutorial (combinación de las tres opciones)

### 7.1 Wizard de primera vez

- Se abre automáticamente si `!visto && equipos.length === 0`; no vuelve a
  abrirse salvo "Reiniciar tutorial".
- Overlay con **spotlight** sobre un elemento `[data-tour="…"]`; si el objetivo
  no existe, se muestra centrado.
- Cada paso: título, qué es / por qué importa, 2–3 tips y navegación
  `Anterior / Siguiente / Saltar`. Último paso: "Empezar".
- Pasos: (1) ¿Qué es un rider? (2) Tus datos (3) Elige tus equipos
  (4) La mesa y las zonas (5) Revisa tu resumen (6) Exporta.
- Navegación por teclado (Esc cierra, flechas/Enter navegan) y foco atrapado.

### 7.2 Ayuda contextual + glosario

- Botón `?` en cada panel → popover con explicación corta y enlace al glosario.
- **Glosario** accesible desde "Ayuda": lista buscable de términos de
  `glosario.ts`.
- Hints inline en puntos clave ("Arrastra para ubicar", "Doble clic para
  rotar", "El amarillo es un equipo").

### 7.3 Rider de ejemplo

- Botón "Ejemplo" carga `ejemplo.ts` (con confirmación si ya hay datos),
  mostrando un toast: "Rider de ejemplo cargado. Edítalo o reinícialo."

## 8. Workstream 4 — PDF mínimo y limpio

Reescritura de `src/pdf/RiderPdf.tsx`:

- **B/N**, A4, márgenes ~32 pt, tipografía Helvetica, reglas finas; sin rellenos
  salvo filas cebra en tablas y cajas del diagrama.
- **Página 1**: cabecera (título "Rider Técnico", participante, proyecto,
  contacto, zona, fecha), bloque resumen (equipos/cables/adaptadores/enchufes),
  **diagrama de mesa a escala** en línea negra con equipos numerados y leyenda.
- **Página 2**: tabla de equipos numerada (N.º, nombre, categoría, dimensiones,
  salidas, corriente), cables por conector, adaptadores, corriente y lista de
  conexiones por equipo.
- Footer con "Rider Técnico · Make Noise Lab" y paginación `x / y`.
- Si no hay equipos, mensaje claro en vez de páginas vacías.

## 9. Workstream 6 — Skills de diseño

- **Externa (hecho)**: `frontend-design` de `anthropics/skills`, licencia Apache
  2.0, vendida en `.opencode/skills/frontend-design/` (`SKILL.md`, `LICENSE.txt`,
  `README.md` con atribución y fuente). No se edita; se actualiza desde upstream.
- **Local (hecho)**: `.opencode/skills/mnl-design-system/SKILL.md`, skill de
  referencia del sistema de diseño (tokens, estructura, interacción, a11y, copy).
  Se irá ajustando durante el rediseño si cambian las decisiones visuales.
- Cualquier skill nueva se redacta siguiendo `writing-skills`.

## 10. Verificación

- `npm run typecheck` sin errores.
- `npm test` (vitest) verde, incluyendo `catalogo.test.ts`, `validacion.test.ts`
  y los tests existentes (cables, adaptadores, corriente, resumen).
- `npm run build` produce `dist/` sin errores.
- Manual con `npm run dev`: wizard en primera visita, ayuda contextual, cargar
  ejemplo, arrastrar/teclado en la mesa, avisos de validación, descargar PDF y
  comprobar 1–2 páginas B/N legibles, guardar/cargar JSON, reset.
- Revisión responsive a 375 px y 1280 px.

## 11. Fases (orden de ejecución)

1. Auditoría de catálogo + tests (workstream 5).
2. Tokens + tipografía + shell y rediseño de paneles (1).
3. Canvas: snap, zoom, panel de equipo, teclado, validación en vivo (2).
4. Tutorial: wizard + ayuda/glosario + ejemplo (3).
5. PDF rediseñado (4).
6. Pulido/a11y final + verificación (10).

## 12. Riesgos y mitigaciones

- **Datos de dimensiones ambiguos** (huella vs. alto con perillas): se fija la
  huella y se documenta la fuente; el test protege el valor acordado.
- **Regresión visual por rediseño**: tokens + componentes acotados; verificación
  manual en dos breakpoints.
- **Wizard molesto en reingresos**: solo se autoabre una vez; siempre hay
  "Saltar" y "Reiniciar tutorial" manual.
- **PDF con muchas conexiones**: la paginación se maneja con `break` de
  `@react-pdf`; se prueba con el rider de ejemplo.
