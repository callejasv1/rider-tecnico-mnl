# Rider Técnico MNL — Tutorial, UI/UX, PDF y datos: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la app en una herramienta autoexplicativa y agradable para primerizos, con UI rediseñada según marca, canvas de mesa operable por teclado, tutorial guiado, PDF B/N limpio y catálogo con dimensiones corregidas.

**Architecture:** React 19 + Vite sobre GitHub Pages, estado en zustand 5 con `persist`, PDF con `@react-pdf/renderer`, CSS plano con tokens. Toda lógica nueva con valor de test se extrae a módulos `.ts` puros (geometría, validación, importación, progreso, tutorial, glosario, catálogo) porque el runner es vitest en entorno `node` y solo recolecta `src/**/*.test.ts` (sin JSX, sin jsdom, sin testing-library). Los componentes consumen esos módulos; su verificación es manual y por build.

**Tech Stack:** React 19, Vite 8, zustand 5, `@react-pdf/renderer` 4, TypeScript 7, vitest 4, CSS plano (sin Tailwind ni librerías de componentes).

**Spec:** `docs/superpowers/specs/2026-09-26-rider-mnl-tutorial-ux-pdf-datos-design.md`

## Global Constraints

- **Stack fijo.** No agregar Tailwind, Radix, driver.js ni librerías de componentes. No tocar la arquitectura de despliegue ni `base: '/rider-tecnico-mnl/'` en `vite.config.ts`. Toda ruta a assets usa `import.meta.env.BASE_URL`.
- **Idioma de UI:** español.
- **Tests:** vitest con `environment: 'node'` e `include: ['src/**/*.test.ts']` (ver `vite.config.ts`). Los tests son `.ts` puros: **no** pueden contener JSX ni depender del DOM. No agregar jsdom ni testing-library. Si algo necesita DOM, su lógica pura se extrae a un `.ts` y el componente queda verificado a mano.
- **Comandos:** `npm run typecheck`, `npm test` (vitest run; un archivo puede tardar ~90 s por el costo de import, usar timeout ≥ 300000 ms al invocar la herramienta de shell), `npm run build`.
- **CI:** `.github/workflows/deploy.yml` corre `npm run test` y `npm run build` en cada push a `main`. Ninguna tarea puede romperlos. (El CI no corre typecheck; igual debe quedar limpio.)
- **Marca:** logo en `public/logos/` sin recolorear ni estirar; acento amarillo `#EDE200` sobre near-black `#0b0b0b`. El amarillo es escaso: una acción clara por vista. En componentes CSS solo se usan variables (`var(--accent)`), nunca hex crudo; el único archivo con hex es `src/styles/tokens.css`.
- **`frontend-design`:** nada de eyebrows en MAYÚSCULAS sobre cada título ni separadores `·` decorativos (meta-strings). El near-black + amarillo está fijado por marca (el brief gana); el resto son decisiones deliberadas y documentadas.
- **`mnl-design-system`:** contraste texto ≥ 4.5:1, borde/interactivo ≥ 3:1; `:focus-visible` en todo interactivo; skip link; canvas operable por teclado; `aria-label` en botones de solo icono; overlays con foco atrapado y cierre con `Esc`; `prefers-reduced-motion` respetado; prohibido `alert`/`confirm` (usar `Toast`/`ConfirmDialog`); copy en sentence case, voz activa, el botón que dice "Descargar PDF" produce un toast que reusa esa palabra.
- **Sin comentarios en el código** salvo que se pidan explícitamente.
- **Convención de dimensiones (`anchoCm` × `altoCm` = huella sobre la mesa):** `anchoCm` es el ancho frontal. `altoCm` es la dimensión perpendicular: profundidad en equipos de escritorio/pedales, y altura de panel 3U (12.9 cm; se conserva 13 donde ya estaba) en módulos Eurorack. Redondeo a 0,1 cm. 1 HP = 0,508 cm.
- **Orden de workstreams:** 5 (datos) → 1 (diseño/UI) → 2 (canvas) → 3 (tutorial) → 4 (PDF) → verificación.

## Review Focus

Fallos que el spec implica pero que ningún test obvio cubre; cada uno tiene test en la tarea dueña.

1. **JSON importado inválido o parcial** (sin `equipos`, dimensiones `NaN`/≤0, `rot` fuera de `{0,90,180,270}`, coordenadas no finitas, `participante` ausente): debe rechazarse con mensaje claro y toast, nunca romper canvas ni PDF. → Tasks 7, 8 (`src/domain/importar.ts` + `ExportBar`).
2. **Solapamiento** cuando dos equipos quedan exactamente encima (p. ej. agregar dos veces la misma plantilla) o un equipo supera la zona/mesa: `validarRider` debe reportar `solapamiento` / `no-cabe` / `fuera-de-mesa`, no pasar en silencio. → Task 10 (`src/domain/validacion.ts`).
3. **Estado vacío y reapertura del wizard:** con `equipos: []` el PDF muestra un mensaje (no páginas vacías) y el wizard no se reabre si ya fue visto o si `localStorage` trae `activo: true` (por `partialize`). → Tasks 17, 21.
4. **Teclado del canvas sin selección o tras eliminar el seleccionado:** no debe lanzar, no debe mover/eliminar otro equipo, y `seleccionadoId` debe quedar en `null` al borrar. → Tasks 11, 12.
5. **Spotlight del wizard sin objetivo presente** (panel no renderizado en móvil o `[data-tour]` inexistente): el paso se muestra centrado, sin overlay en blanco ni crash. → Tasks 16, 18.

---

### Task 0: Preparación del worktree

**Files:** ninguno (solo entorno).

**Interfaces:**
- Consumes: repo limpio en `main`.
- Produces: worktree aislado con baseline verde; rama de trabajo para todas las tareas siguientes.

- [ ] **Step 1: Crear el worktree aislado**

Invocar la skill `superpowers:using-git-worktrees` y crear el worktree para esta feature (rama sugerida `feat/tutorial-ux-pdf-datos`). Todas las tareas siguientes se ejecutan dentro de ese worktree.

- [ ] **Step 2: Instalar dependencias**

Run: `npm ci`
Expected: sin errores; `node_modules/` completo.

- [ ] **Step 3: Confirmar baseline**

Run: `npm run typecheck && npm test`
Expected: typecheck limpio y los tests existentes (adaptadores, cables, corriente, resumen) en verde.

- [ ] **Step 4: Commit inicial (si el worktree lo requiere)**

```bash
git status
git commit --allow-empty -m "chore: start tutorial ux pdf datos workstream"
```
Solo si el worktree necesita un commit para partir; si no, omitir.

---

## Workstream 5 — Auditoría de dimensiones

### Task 1: `fuente` en el catálogo, dimensiones corregidas y test de protección

**Files:**
- Modify: `src/data/catalogoTypes.ts` (agregar `fuente?: string`)
- Modify: `src/data/catalogo.ts` (corregir 8 fichas y anotar `fuente` en las corregidas)
- Create: `src/data/catalogo.test.ts`

**Interfaces:**
- Consumes: `CATALOGO: Catalogo`, `EquipoPlantilla`.
- Produces: `EquipoPlantilla.fuente?: string`; catálogo con valores fijos que Tasks 16/22 consumen indirectamente.

**Tabla de referencia (valores acordados en este spec; el test los fija):**

| id | anchoCm | altoCm | fuente |
|---|---|---|---|
| `moog-mother-32` | 31.9 | 13.3 | `https://www.moogmusic.com/synthesizers/mother-32/` |
| `moog-dfam` | 31.9 | 13.3 | `https://www.moogmusic.com/synthesizers/dfam/` |
| `arturia-microfreak` | 31.1 | 23.3 | `https://www.arturia.com/products/hardware-synths/microfreak/details` |
| `make-noise-maths` | 10.2 | 13 | `https://www.makenoisemusic.com/wp-content/uploads/2024/03/MATHSmanual2013.pdf` |
| `mutable-beads` | 7.1 | 13 | `https://mail.pichenettes.github.io/mutable-instruments-documentation/modules/beads/` |
| `eventide-h9` | 11.8 | 5.0 | `https://www.eventideaudio.com/pedals/h9-max/` |
| `strymon-blueSky` | 10.2 | 11.4 | `https://www.strymon.net/faq/what-are-the-dimensions-of-my-pedal/` |
| `mackie-mix5` | 14.0 | 19.6 | `https://mackie.com/img/file_resources/Mix5_8_12FX_SS.pdf` |

Los 20 equipos restantes: en esta tarea se verifica cada uno contra ficha de fabricante y, si el valor cambia, se corrige y se anota `fuente` (los que ya estén correctos pueden quedar sin `fuente`). El test solo fija la tabla de arriba (los 8 marcados en el spec) más las invariantes de todo el catálogo.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/data/catalogo.test.ts
import { describe, expect, it } from 'vitest'
import { CATALOGO } from './catalogo'

const REFERENCIA: Record<string, [number, number]> = {
  'moog-mother-32': [31.9, 13.3],
  'moog-dfam': [31.9, 13.3],
  'arturia-microfreak': [31.1, 23.3],
  'make-noise-maths': [10.2, 13],
  'mutable-beads': [7.1, 13],
  'eventide-h9': [11.8, 5.0],
  'strymon-blueSky': [10.2, 11.4],
  'mackie-mix5': [14.0, 19.6],
}

describe('catálogo', () => {
  it('tiene dimensiones positivas en todo equipo', () => {
    for (const e of CATALOGO.equipos) {
      expect(e.anchoCm, e.id).toBeGreaterThan(0)
      expect(e.altoCm, e.id).toBeGreaterThan(0)
    }
  })

  it('tiene ids únicos y categorías válidas', () => {
    const ids = CATALOGO.equipos.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const e of CATALOGO.equipos) {
      expect(CATALOGO.categorias, e.id).toContain(e.categoria)
    }
  })

  it('respeta la tabla de referencia de dimensiones corregidas', () => {
    for (const [id, [ancho, alto]] of Object.entries(REFERENCIA)) {
      const e = CATALOGO.equipos.find((x) => x.id === id)
      expect(e, id).toBeDefined()
      expect(e!.anchoCm, id).toBe(ancho)
      expect(e!.altoCm, id).toBe(alto)
    }
  })

  it('todo equipo que requiere corriente define tipo y enchufe', () => {
    for (const e of CATALOGO.equipos) {
      if (!e.alimentacion.requiereCorriente) continue
      expect(e.alimentacion.tipo, e.id).toBeDefined()
      expect(e.alimentacion.enchufe, e.id).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/data/catalogo.test.ts`
Expected: FAIL en "respeta la tabla de referencia" (Maths 20 ≠ 10.2, Beads 14 ≠ 7.1, etc.).

- [ ] **Step 3: Agregar `fuente` y corregir dimensiones**

Agregar `fuente?: string` a `EquipoPlantilla`. Corregir en `src/data/catalogo.ts` los 8 valores de la tabla y anotar la URL de `fuente` en cada uno. Verificar los 20 restantes contra ficha de fabricante y corregir/anotar cuando difieran.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/data/catalogo.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck y commit**

Run: `npm run typecheck`
Expected: sin errores.

```bash
git add src/data/catalogoTypes.ts src/data/catalogo.ts src/data/catalogo.test.ts
git commit -m "fix(data): corregir dimensiones del catálogo y anotar fuente"
```

---

## Workstream 1 — Sistema de diseño y UI/UX

### Task 2: Tokens, tipografía y reglas de estilo

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Create: `src/styles/canvas.css`
- Modify: `src/index.css` (pasa a ser solo imports)
- Modify: `index.html` (fonts `Archivo` + `Inter` con `preconnect` y `display=swap`)

**Interfaces:**
- Consumes: nada.
- Produces: variables `--bg, --surface-1..3, --border, --border-strong, --text, --text-muted, --text-faint, --accent, --accent-ink, --danger, --warn, --ok, --space-1..10, --radius-sm/md/lg/pill, --shadow-1/2, --dur-fast, --dur, --ease`; clases base `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--danger`, `.field`, `.panel`, `.skip-link`. Usadas por Tasks 3–8, 12–13, 19–20.

> Nota de testabilidad: CSS y tokens no son testeables con vitest en entorno `node` (no hay jsdom ni `@types/node` para leer archivos). Por eso esta tarea no trae test unitario; su verificación es `npm run build` más la comprobación de tokens y de "sin hex crudo" por búsqueda en el shell. No agregar `@types/node` por esto.

- [ ] **Step 1: Crear `src/styles/tokens.css`**

Copiar exactamente los tokens del spec (sección 5.1), incluidos `--space-1..10`, `--radius-*`, `--shadow-*` y `--dur-*`. Este es el único archivo CSS con valores hex.

- [ ] **Step 2: Comprobar que los tokens están y que no hay hex crudo fuera de `tokens.css`**

Run:
```bash
grep -E -- '--accent: #ede200|--bg: #0b0b0b|--danger: #ff6b6b|--space-4: 16px|--radius-md: 10px' src/styles/tokens.css
grep -rnE '#[0-9a-fA-F]{3,8}' src/styles src/index.css | grep -v 'tokens.css'
```
Expected: el primer `grep` imprime las 5 líneas; el segundo **no imprime nada**. Si imprime coincidencias, reemplazarlas por variables antes de seguir.

- [ ] **Step 3: Crear el resto de los CSS y las fuentes**

`base.css`: reset, `body` con `Inter` y tokens, escala tipográfica display 28/36 · h2 18 · h3 14 · cuerpo 14, `.skip-link`, `:focus-visible` global, `@media (prefers-reduced-motion: reduce)`. `layout.css`: shell, top bar sticky, stepper, `.panel` según `mnl-design-system`. `components.css`: botones, campos, tarjetas, badges, toast, modal, popover, glosario, catálogo. `canvas.css`: mesa, reglas, zonas, dispositivo, estados `--selected`/`--dragging`/`--error`/`--warn`. `src/index.css` queda solo con `@import './styles/tokens.css';` y los demás. En `index.html`, agregar `<link rel="preconnect">` para `fonts.googleapis.com`/`fonts.gstatic.com` y la hoja de Google Fonts con `Archivo` (600/700) e `Inter` (400/500/600), `display=swap`. Sin hex crudo fuera de `tokens.css`.

- [ ] **Step 4: Verificar tokens y build**

Run: `grep -E -- '--accent: #ede200' src/styles/tokens.css && npm run build`
Expected: la línea del token y build sin errores.

- [ ] **Step 5: Verificación visual y commit**

Run: `npm run dev`
Expected: tipografía Archivo/Inter cargada, fondo near-black, foco visible; a 375 px y 1280 px sin desbordes.

```bash
git add src/styles src/index.css index.html
git commit -m "feat(ui): tokens, tipografia y reglas de estilo base"
```

### Task 3: Toast y ConfirmDialog reutilizables

**Files:**
- Create: `src/store/toast.ts`
- Create: `src/components/Toast.tsx`
- Create: `src/components/ConfirmDialog.tsx`
- Create: `src/store/toast.test.ts`

**Interfaces:**
- Consumes: tokens/clases de Task 2.
- Produces: `useToast()` con `{ aviso(mensaje): void, error(mensaje): void, actual: { id: number; tono: 'info'|'error'; mensaje: string } | null, cerrar(): void }`; `<Toast />`; `<ConfirmDialog abierto, titulo, mensaje, onConfirmar, onCancelar />`. Usados por Tasks 8, 14, 15, 20.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/store/toast.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useToast } from './toast'

beforeEach(() => useToast.setState({ actual: null, proximoId: 1 }))

describe('useToast', () => {
  it('muestra y cierra un aviso', () => {
    useToast.getState().aviso('Rider de ejemplo cargado.')
    expect(useToast.getState().actual?.mensaje).toBe('Rider de ejemplo cargado.')
    useToast.getState().cerrar()
    expect(useToast.getState().actual).toBeNull()
  })

  it('asigna ids crecientes y tono de error', () => {
    useToast.getState().error('El archivo no es un rider válido.')
    const primero = useToast.getState().actual!.id
    useToast.getState().aviso('ok')
    expect(useToast.getState().actual!.id).toBe(primero + 1)
    expect(useToast.getState().actual!.tono).toBe('info')
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/store/toast.test.ts`
Expected: FAIL (no existe `./toast`).

- [ ] **Step 3: Implementar el store y los componentes**

`src/store/toast.ts`: store zustand sin persist con `{ actual, proximoId, aviso, error, cerrar }`. `Toast.tsx`: `role="status"`/`aria-live="polite"` (o `assertive` en error), botón de cierre con `aria-label`, auto-cierre con temporizador que respete `prefers-reduced-motion`, usa `.toast`. `ConfirmDialog.tsx`: modal con `role="dialog"`, `aria-modal`, `aria-labelledby`, foco atrapado, cierre con `Esc` y overlay; botones cancelar/confirmar (peligro).

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/store/toast.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck y commit**

Run: `npm run typecheck`
Expected: sin errores.

```bash
git add src/store/toast.ts src/store/toast.test.ts src/components/Toast.tsx src/components/ConfirmDialog.tsx
git commit -m "feat(ui): toast y modal de confirmacion accesibles"
```

### Task 4: Progreso, top bar, stepper y shell de la app

**Files:**
- Create: `src/ui/progreso.ts`
- Create: `src/ui/progreso.test.ts`
- Create: `src/components/TopBar.tsx`
- Create: `src/components/Stepper.tsx`
- Modify: `src/App.tsx:1-30`
- Delete: `src/components/BrandHeader.tsx`

**Interfaces:**
- Consumes: `Participante`, `Equipo`, `validarRider` (Task 10), `Progreso`.
- Produces: `calcularProgreso(participante, equipos): Progreso`; `<TopBar onAyuda, onEjemplo />`; `<Stepper progreso, actual, onIr />`.

> Nota de orden: `calcularProgreso` depende de `validarRider` (Task 10). Como el plan ejecuta la fase 1 (Tasks 2–8) antes de la fase 2 (Tasks 9–13), adelantar **Task 10** antes de esta tarea (o implementar `progreso.ts` y postergar solo su test hasta que exista `src/domain/validacion.ts`).

- Produces: `calcularProgreso(participante, equipos): Progreso`; `<TopBar onAyuda, onEjemplo />`; `<Stepper progreso, actual, onIr />`.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/ui/progreso.test.ts
import { describe, expect, it } from 'vitest'
import { calcularProgreso } from './progreso'
import { makeEquipo } from '../domain/fixtures'
import type { Participante } from '../domain/types'

const datos: Participante = { nombre: 'Ada', proyecto: 'P', contacto: 'a@b.c', zona: 'A' }
const vacio: Participante = { nombre: '', proyecto: '', contacto: '', zona: 'A' }

describe('calcularProgreso', () => {
  it('sin datos ni equipos nada está completo', () => {
    expect(calcularProgreso(vacio, [])).toEqual({
      datos: false, equipos: false, mesa: false, resumen: false, exportar: false,
    })
  })

  it('marca datos y exportable con datos y equipos válidos', () => {
    const equipos = [makeEquipo({ id: 'a', anchoCm: 30, altoCm: 20, x: 0, y: 0 })]
    expect(calcularProgreso(datos, equipos)).toEqual({
      datos: true, equipos: true, mesa: true, resumen: true, exportar: true,
    })
  })

  it('marca mesa/resumen/exportar en falso si hay un error de validación', () => {
    const fuera = [makeEquipo({ id: 'a', anchoCm: 30, altoCm: 20, x: 290, y: 0 })]
    const p = calcularProgreso(datos, fuera)
    expect(p.equipos).toBe(true)
    expect(p.mesa).toBe(false)
    expect(p.resumen).toBe(false)
    expect(p.exportar).toBe(false)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/ui/progreso.test.ts`
Expected: FAIL (no existe `./progreso`).

- [ ] **Step 3: Implementar**

`src/ui/progreso.ts`:
`export interface Progreso { datos: boolean; equipos: boolean; mesa: boolean; resumen: boolean; exportar: boolean }`
`export function calcularProgreso(participante: Participante, equipos: Equipo[]): Progreso`
Reglas: `datos` = los tres textos no vacíos; `equipos` = `equipos.length > 0`; `sinErrores` = `equipos.length > 0 && validarRider({version:1, participante, equipos}).every(p => p.severidad !== 'error')`; `mesa = resumen = exportar = sinErrores`. `TopBar.tsx`: logo (`BASE_URL`), título "Rider Técnico", acciones "Ayuda", "Cargar ejemplo", "Descargar PDF"; colapsa en móvil. `Stepper.tsx`: lista de 5 pasos (Datos → Equipos → Mesa → Resumen → Exportar basado en `Progreso`) con `aria-current` y botones que llaman `onIr`. `App.tsx`: skip link, `TopBar`, `Stepper`, layout de 2 columnas que pasa a 1, `Toast`, y contenedor `main` con `id` objetivo del skip link. Borrar `BrandHeader.tsx`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/ui/progreso.test.ts`
Expected: PASS (requiere Task 10 implementada).

- [ ] **Step 5: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/ui src/components/TopBar.tsx src/components/Stepper.tsx src/App.tsx
git rm src/components/BrandHeader.tsx
git commit -m "feat(ui): shell, top bar y stepper de progreso"
```

### Task 5: Búsqueda del catálogo extraída y rediseño de ParticipantForm y DeviceCatalog

**Files:**
- Create: `src/data/buscar.ts`
- Create: `src/data/buscar.test.ts`
- Modify: `src/components/ParticipantForm.tsx`
- Modify: `src/components/DeviceCatalog.tsx`

**Interfaces:**
- Consumes: `CATALOGO`, tokens y clases de Task 2.
- Produces: `filtrarCatalogo(equipos, consulta, categoria): EquipoPlantilla[]`.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/data/buscar.test.ts
import { describe, expect, it } from 'vitest'
import { filtrarCatalogo } from './buscar'
import { CATALOGO } from './catalogo'

describe('filtrarCatalogo', () => {
  it('sin consulta y categoría Todas devuelve todo', () => {
    expect(filtrarCatalogo(CATALOGO.equipos, '', 'Todas').length).toBe(CATALOGO.equipos.length)
  })

  it('busca por marca o nombre sin distinguir mayúsculas', () => {
    const r = filtrarCatalogo(CATALOGO.equipos, 'moog', 'Todas')
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((e) => `${e.marca} ${e.nombre}`.toLowerCase().includes('moog'))).toBe(true)
  })

  it('combina categoría y consulta', () => {
    const r = filtrarCatalogo(CATALOGO.equipos, '', 'Efectos')
    expect(r.every((e) => e.categoria === 'Efectos')).toBe(true)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/data/buscar.test.ts`
Expected: FAIL (no existe `./buscar`).

- [ ] **Step 3: Implementar y rediseñar**

`src/data/buscar.ts`: extraer la lógica de filtrado de `DeviceCatalog`. Rediseñar `ParticipantForm` con labels, hints, `autocomplete`, asociación `htmlFor`/`id`, y `select` de zona con etiqueta clara. Rediseñar `DeviceCatalog`: buscador con `type="search"`, chips/select de categoría, lista con affordance de dimensiones y botón "Agregar equipo" (nombre del resultado), panel `<details>` de equipo propio con campos accesibles. Usar `filtrarCatalogo`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/data/buscar.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck y commit**

Run: `npm run typecheck`
Expected: sin errores.

```bash
git add src/data/buscar.ts src/data/buscar.test.ts src/components/ParticipantForm.tsx src/components/DeviceCatalog.tsx
git commit -m "feat(ui): rediseño de formulario y catalogo con busqueda extraida"
```

### Task 6: Rediseño de MyDevices y SummaryPanel

**Files:**
- Modify: `src/components/MyDevices.tsx`
- Modify: `src/components/SummaryPanel.tsx`

**Interfaces:**
- Consumes: `resumirRider`, tokens, `ConfirmDialog`/`useToast` (Task 3).
- Produces: paneles rediseñados. La acción "Seleccionar en la mesa" se agrega recién en Task 13, cuando exista `seleccionarEquipo` (Task 11); esta tarea no debe referenciar el store de selección para no adelantar una interfaz que aún no existe.

- [ ] **Step 1: Rediseñar MyDevices**

Lista de equipos con nombre, categoría y salidas; botones "Rotar" y "Quitar...". Usar `ConfirmDialog` (Task 3) para "Quitar" cuando haya más de un equipo, o quitar directo con deshacer vía toast. Sin `alert`/`confirm`.

- [ ] **Step 2: Rediseñar SummaryPanel**

Tarjetas de resumen (equipos, cables, adaptadores, enchufes) y detalles por conector/tipo con filas legibles, estados vacíos que invitan a actuar. Usar jerarquía de `mnl-design-system` (no todo card idéntica; agrupar por proximidad).

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`
Expected: ambos paneles se ven coherentes con tokens, sin hex crudo, con estados vacíos claros; a 375 px y 1280 px sin desbordes.

- [ ] **Step 4: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/components/MyDevices.tsx src/components/SummaryPanel.tsx
git commit -m "feat(ui): rediseño de mis equipos y resumen"
```

### Task 7: Importación saneada de JSON

**Files:**
- Create: `src/domain/importar.ts`
- Create: `src/domain/importar.test.ts`

**Interfaces:**
- Consumes: `Rider`, `Equipo`, `Participante`.
- Produces: `importarRider(texto: string): { ok: true; rider: Rider } | { ok: false; error: string }`. Usado por Task 8 y 20.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/domain/importar.test.ts
import { describe, expect, it } from 'vitest'
import { importarRider } from './importar'

const valido = JSON.stringify({
  version: 1,
  participante: { nombre: 'Ada', proyecto: 'P', contacto: 'a@b.c', zona: 'A' },
  equipos: [{
    id: 'e1', nombre: 'Maths', categoria: 'Eurorack', anchoCm: 10.2, altoCm: 13,
    salidas: [], alimentacion: { requiereCorriente: false }, x: 0, y: 0, rot: 0,
  }],
})

describe('importarRider', () => {
  it('acepta un rider válido', () => {
    const r = importarRider(valido)
    expect(r.ok).toBe(true)
  })

  it('rechaza JSON malformado', () => {
    expect(importarRider('{no-json')).toEqual({ ok: false, error: 'El archivo no es un JSON válido.' })
  })

  it('rechaza sin equipos o con participante inválido', () => {
    expect(importarRider(JSON.stringify({ version: 1 })).ok).toBe(false)
    expect(importarRider(JSON.stringify({ version: 1, participante: { nombre: 1 } })).ok).toBe(false)
  })

  it('rechaza equipos con dimensiones no finitas o rot inválido', () => {
    const malo = JSON.parse(valido)
    malo.equipos[0].anchoCm = 'x'
    expect(importarRider(JSON.stringify(malo)).ok).toBe(false)
    const rot = JSON.parse(valido)
    rot.equipos[0].rot = 45
    expect(importarRider(JSON.stringify(rot)).ok).toBe(false)
  })

  it('devuelve un mensaje de error claro', () => {
    const r = importarRider(JSON.stringify({ version: 1 }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/domain/importar.test.ts`
Expected: FAIL (no existe `./importar`).

- [ ] **Step 3: Implementar**

`importarRider` parsea, valida `participante` (strings + `zona` en `A|B`) y `equipos` (array; cada uno `id`/`nombre`/`categoria` string, `anchoCm`/`altoCm` finitos y `> 0`, `x`/`y` finitos, `rot` en `{0,90,180,270}`, `salidas` array, `alimentacion` objeto), y devuelve el `Rider` normalizado. Mensajes en español orientados a la acción (p. ej. `'El archivo no es un rider válido.'`, `'El archivo no es un JSON válido.'`). Cubre Review Focus #1.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/domain/importar.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/importar.ts src/domain/importar.test.ts
git commit -m "feat(domain): importacion de rider saneada y validada"
```

### Task 8: ExportBar con Toast y ConfirmDialog, guardar/cargar JSON saneado

**Files:**
- Modify: `src/components/ExportBar.tsx`

**Interfaces:**
- Consumes: `importarRider` (Task 7), `useToast`, `ConfirmDialog` (Task 3), `PDFDownloadLink`, `RiderPdf` (versión final en Task 21).
- Produces: barra de exportación con "Descargar PDF", "Guardar JSON", "Cargar JSON", "Reiniciar..." sin `alert`/`confirm`.

- [ ] **Step 1: Reemplazar alert/confirm**

`importarJson` usa `importarRider`; en `ok: false` llama `useToast.getState().error(resultado.error)`; en `ok: true` llama `reemplazarRider` y `useToast.getState().aviso('Rider cargado.')`. "Reiniciar" abre `ConfirmDialog` y al confirmar llama `reset()` y avisa con toast. Etiquetas en sentence case y resultado reusado en el toast.

- [ ] **Step 2: Verificación manual**

Run: `npm run dev`
Expected: cargar un JSON roto muestra toast de error sin romper la app; reiniciar pide confirmación; guardar descarga el JSON.

- [ ] **Step 3: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/components/ExportBar.tsx
git commit -m "feat(ui): exportacion con toast, confirmacion e importacion saneada"
```

---

## Workstream 2 — Canvas de mesa

### Task 9: Geometría pura de la mesa

**Files:**
- Create: `src/domain/geometria.ts`
- Create: `src/domain/geometria.test.ts`

**Interfaces:**
- Consumes: `Equipo`, `MESA`, `ZONA_ANCHO_CM`.
- Produces: `PASO_SNAP_CM = 5`; `interface Rect { x: number; y: number; ancho: number; alto: number }`; `dimensionesEnMesa(e): { ancho: number; alto: number }`; `rectanguloDe(e): Rect`; `ajustarAGrilla(valor, paso?): number`; `rectsSolapan(a, b): boolean`; `dentroDe(rect, contenedor): boolean`; `limitarARect(rect, contenedor): { x: number; y: number }`. Usado por Tasks 10, 12, 13, 21.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/domain/geometria.test.ts
import { describe, expect, it } from 'vitest'
import { ajustarAGrilla, dimensionesEnMesa, limitarARect, rectanguloDe, rectsSolapan } from './geometria'
import { makeEquipo } from './fixtures'

describe('geometria', () => {
  it('intercambia ancho y alto al rotar 90/270', () => {
    const e = makeEquipo({ anchoCm: 30, altoCm: 20, rot: 90 })
    expect(dimensionesEnMesa(e)).toEqual({ ancho: 20, alto: 30 })
    expect(dimensionesEnMesa(makeEquipo({ anchoCm: 30, altoCm: 20, rot: 0 })))
      .toEqual({ ancho: 30, alto: 20 })
  })

  it('rectanguloDe arma el rect con origen en x,y', () => {
    const e = makeEquipo({ anchoCm: 30, altoCm: 20, x: 10, y: 5, rot: 0 })
    expect(rectanguloDe(e)).toEqual({ x: 10, y: 5, ancho: 30, alto: 20 })
  })

  it('ajustarAGrilla redondea al múltiplo de 5', () => {
    expect(ajustarAGrilla(12, 5)).toBe(10)
    expect(ajustarAGrilla(13, 5)).toBe(15)
    expect(ajustarAGrilla(12)).toBe(10)
  })

  it('rectsSolapan detecta intersección real y no tocar bordes', () => {
    const a = { x: 0, y: 0, ancho: 10, alto: 10 }
    expect(rectsSolapan(a, { x: 5, y: 5, ancho: 10, alto: 10 })).toBe(true)
    expect(rectsSolapan(a, { x: 10, y: 0, ancho: 10, alto: 10 })).toBe(false)
  })

  it('limitarARect mete el rect dentro del contenedor', () => {
    const contenedor = { x: 0, y: 0, ancho: 300, alto: 100 }
    expect(limitarARect({ x: 290, y: 0, ancho: 30, alto: 20 }, contenedor)).toEqual({ x: 270, y: 0 })
    expect(limitarARect({ x: -5, y: -5, ancho: 30, alto: 20 }, contenedor)).toEqual({ x: 0, y: 0 })
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/domain/geometria.test.ts`
Expected: FAIL (no existe `./geometria`).

- [ ] **Step 3: Implementar**

`ajustarAGrilla(valor, paso = PASO_SNAP_CM) = Math.round(valor / paso) * paso`. `rectsSolapan` con solapamiento estricto (`<`, no `<=`, para que tocar bordes no cuente). `limitarARect` recorta a `[0, contenedor.ancho - rect.ancho]` (y análogo en alto), sin valores negativos.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/domain/geometria.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/geometria.ts src/domain/geometria.test.ts
git commit -m "feat(domain): geometria pura de la mesa"
```

### Task 10: Validación del rider

**Files:**
- Create: `src/domain/validacion.ts`
- Create: `src/domain/validacion.test.ts`

**Interfaces:**
- Consumes: `Rider`, `geometria` (Task 9), `MESA`, `ZONA_ANCHO_CM`.
- Produces: `type Severidad = 'error' | 'aviso'`; `type ProblemaTipo = 'fuera-de-mesa' | 'fuera-de-zona' | 'solapamiento' | 'no-cabe'`; `interface Problema { tipo; severidad; equipoId; mensaje }`; `validarRider(rider: Rider): Problema[]`. Consumido por Tasks 4, 12, 14, 16, 21.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/domain/validacion.test.ts
import { describe, expect, it } from 'vitest'
import { validarRider } from './validacion'
import { makeEquipo } from './fixtures'
import type { Rider } from './types'

function rider(equipos: Rider['equipos'], zona: 'A' | 'B' = 'A'): Rider {
  return { version: 1, participante: { nombre: '', proyecto: '', contacto: '', zona }, equipos }
}

describe('validarRider', () => {
  it('sin problemas devuelve lista vacía', () => {
    expect(validarRider(rider([makeEquipo({ id: 'a', x: 0, y: 0, anchoCm: 30, altoCm: 20 })]))).toEqual([])
  })

  it('detecta equipo fuera de la mesa', () => {
    const p = validarRider(rider([makeEquipo({ id: 'a', x: 290, y: 0, anchoCm: 30, altoCm: 20 })]))
    expect(p[0]?.tipo).toBe('fuera-de-mesa')
    expect(p[0]?.severidad).toBe('error')
  })

  it('detecta solapamiento exacto entre dos equipos apilados', () => {
    const p = validarRider(rider([
      makeEquipo({ id: 'a', x: 10, y: 10, anchoCm: 30, altoCm: 20 }),
      makeEquipo({ id: 'b', x: 10, y: 10, anchoCm: 30, altoCm: 20 }),
    ]))
    expect(p.some((x) => x.tipo === 'solapamiento' && x.severidad === 'error')).toBe(true)
  })

  it('avisa cuando el equipo no está en la zona del participante', () => {
    const p = validarRider(rider([makeEquipo({ id: 'a', x: 160, y: 0, anchoCm: 30, altoCm: 20 })], 'A'))
    expect(p.some((x) => x.tipo === 'fuera-de-zona' && x.severidad === 'aviso')).toBe(true)
    expect(p.some((x) => x.severidad === 'error')).toBe(false)
  })

  it('detecta equipo más grande que la zona', () => {
    const p = validarRider(rider([makeEquipo({ id: 'a', x: 0, y: 0, anchoCm: 160, altoCm: 20 })]))
    expect(p.some((x) => x.tipo === 'no-cabe' && x.severidad === 'error')).toBe(true)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/domain/validacion.test.ts`
Expected: FAIL (no existe `./validacion`).

- [ ] **Step 3: Implementar**

Recorrer equipos: `no-cabe` si `ancho > ZONA_ANCHO_CM` o `alto > MESA.altoCm`; `fuera-de-mesa` si `!dentroDe(rect, mesa)`; `fuera-de-zona` (aviso) si `!dentroDe(rect, zonaDelParticipante)` con zona A = `{x:0,y:0,ancho:150,alto:100}` y B = `{x:150,...}`; `solapamiento` por cada par con `rectsSolapan`. Mensajes en español, específicos y orientados a la acción. Cubre Review Focus #2.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/domain/validacion.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/validacion.ts src/domain/validacion.test.ts
git commit -m "feat(domain): validacion de rider con severidad"
```

### Task 11: Store — selección, comandos de teclado, partialize y ejemplo

**Files:**
- Create: `src/domain/teclado.ts`
- Create: `src/domain/teclado.test.ts`
- Modify: `src/store/rider.ts`
- Create: `src/store/rider.test.ts`

**Interfaces:**
- Consumes: `geometria`, `validarRider`, `Equipo`, `Rider`.
- Produces:
  - `comandoDeTecla(key: string, shift: boolean): ComandoTeclado | null` con `type ComandoTeclado = { tipo: 'mover'; dx: number; dy: number } | { tipo: 'rotar' } | { tipo: 'eliminar' }`.
  - Store: `seleccionadoId: string | null`, `seleccionarEquipo(id | null)`, `ejecutarComando(cmd)`, y `partialize` que omite `activo`, `paso`, `seleccionadoId`. (`cargarEjemplo` y el slice de tutorial llegan en Task 17; no forman parte de esta tarea.)
  - `eliminarEquipo` limpia `seleccionadoId` si coincide.

- [ ] **Step 1: Escribir los tests que fallan**

```ts
// src/domain/teclado.test.ts
import { describe, expect, it } from 'vitest'
import { comandoDeTecla } from './teclado'

describe('comandoDeTecla', () => {
  it('flechas mueven 1 cm y con Shift 5 cm', () => {
    expect(comandoDeTecla('ArrowRight', false)).toEqual({ tipo: 'mover', dx: 1, dy: 0 })
    expect(comandoDeTecla('ArrowUp', true)).toEqual({ tipo: 'mover', dx: 0, dy: -5 })
  })
  it('R rota y Delete/Backspace eliminan', () => {
    expect(comandoDeTecla('r', false)).toEqual({ tipo: 'rotar' })
    expect(comandoDeTecla('Delete', false)).toEqual({ tipo: 'eliminar' })
    expect(comandoDeTecla('Backspace', false)).toEqual({ tipo: 'eliminar' })
  })
  it('otras teclas no producen comando', () => {
    expect(comandoDeTecla('a', false)).toBeNull()
  })
})
```

```ts
// src/store/rider.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useRider } from './rider'
import { makeEquipo } from '../domain/fixtures'

beforeEach(() => useRider.getState().reset())

describe('store rider', () => {
  it('seleccionarEquipo guarda y limpia la selección', () => {
    useRider.getState().seleccionarEquipo('x')
    expect(useRider.getState().seleccionadoId).toBe('x')
    useRider.getState().seleccionarEquipo(null)
    expect(useRider.getState().seleccionadoId).toBeNull()
  })

  it('ejecutarComando sin selección no lanza ni toca los equipos', () => {
    useRider.getState().agregarEquipo(makeEquipo({ id: 'a' }))
    const antes = useRider.getState().equipos
    expect(() => useRider.getState().ejecutarComando({ tipo: 'eliminar' })).not.toThrow()
    expect(useRider.getState().equipos).toEqual(antes)
  })

  it('mueve el equipo seleccionado y respeta la mesa', () => {
    useRider.getState().agregarEquipo(makeEquipo({ id: 'a', x: 0, y: 0, anchoCm: 30, altoCm: 20 }))
    useRider.getState().seleccionarEquipo('a')
    useRider.getState().ejecutarComando({ tipo: 'mover', dx: -5, dy: -5 })
    expect(useRider.getState().equipos[0]).toMatchObject({ x: 0, y: 0 })
  })

  it('eliminar el equipo seleccionado deja seleccionadoId en null', () => {
    useRider.getState().agregarEquipo(makeEquipo({ id: 'a' }))
    useRider.getState().seleccionarEquipo('a')
    useRider.getState().eliminarEquipo('a')
    expect(useRider.getState().seleccionadoId).toBeNull()
    expect(useRider.getState().equipos).toEqual([])
  })

  it('partialize omite activo, paso y seleccionadoId', () => {
    const parcial = useRider.persist.getOptions().partialize!(
      useRider.getState() as never,
    ) as unknown as Record<string, unknown>
    expect(parcial).not.toHaveProperty('activo')
    expect(parcial).not.toHaveProperty('paso')
    expect(parcial).not.toHaveProperty('seleccionadoId')
  })
})
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npx vitest run src/domain/teclado.test.ts src/store/rider.test.ts`
Expected: FAIL (no existe `./teclado`; el store no tiene las acciones).

- [ ] **Step 3: Implementar**

`src/domain/teclado.ts` con el mapeo de flechas/rotar/eliminar. En el store: agregar `seleccionadoId`, `seleccionarEquipo`, `ejecutarComando` (si no hay selección retorna; si `mover`, usa `limitarARect` con la mesa; si `rotar`, reusa `rotarEquipo`; si `eliminar`, `eliminarEquipo`), y `partialize: (state) => ({ participante, equipos })`. Modificar `eliminarEquipo` para limpiar la selección. Cubre Review Focus #4.

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run src/domain/teclado.test.ts src/store/rider.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck y commit**

Run: `npm run typecheck`
Expected: sin errores.

```bash
git add src/domain/teclado.ts src/domain/teclado.test.ts src/store/rider.ts src/store/rider.test.ts
git commit -m "feat(store): seleccion, comandos de teclado y persist parcial"
```

### Task 12: TableCanvas con snap, zoom, selección y teclado

**Files:**
- Modify: `src/components/TableCanvas.tsx`
- Create: `src/components/ValidationPanel.tsx`

**Interfaces:**
- Consumes: `MESA`, `ZONA_ANCHO_CM`, `geometria` (Task 9), `validarRider` (Task 10), store de Task 11.
- Produces: `<TableCanvas />` con snap a 5 cm, zoom −/+/ajustar, contenedor con scroll, estados visuales y manejo de teclado; `<ValidationPanel />` con los avisos de `validarRider`.

- [ ] **Step 1: Implementar snap y selección**

Arrastre con puntero usando `ajustarAGrilla` y `limitarARect`; `seleccionarEquipo(id)` al `pointerdown`; marcar equipo seleccionado con clase y `tabIndex={0}`; `onKeyDown` llama `comandoDeTecla` + `ejecutarComando`, con `preventDefault` en las teclas manejadas. Doble clic sigue rotando. Añadir reglas de 5 cm y grid visual.

- [ ] **Step 2: Implementar zoom y estados**

Zoom con `−`, `+`, "Ajustar" (estado local, contenedor con `overflow: auto`); reflejar `arrastrando`, seleccionado y problemas de validación (`--error`/`--warn`) en las clases del equipo. Mostrar mensajes de `validarRider` sobre la mesa (marca) y en `ValidationPanel`. `ValidationPanel` usa badges de severidad y estado vacío ("Sin problemas: tu distribución es válida.").

- [ ] **Step 3: Verificación manual de teclado y puntero**

Run: `npm run dev`
Expected: arrastrar con snap a 5 cm; flechas ±1 cm y Shift ±5 cm sobre el seleccionado; `R` rota; `Del` quita; sin selección el teclado no hace nada; zoom y ajustar funcionan; el foco es visible.

- [ ] **Step 4: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/components/TableCanvas.tsx src/components/ValidationPanel.tsx src/styles/canvas.css
git commit -m "feat(ui): canvas de mesa con snap, zoom, teclado y validacion en vivo"
```

### Task 13: Panel del equipo seleccionado

**Files:**
- Create: `src/components/DeviceInspector.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/MyDevices.tsx` (agregar "Seleccionar en la mesa")

**Interfaces:**
- Consumes: store de Task 11 (`seleccionadoId`, `actualizarEquipo`, `seleccionarEquipo`), `CATALOGO.categorias`, `CONECTORES`.
- Produces: `<DeviceInspector />` que edita nombre, categoría, ancho, alto, salidas (añadir/quitar conector y canal) y alimentación, con botones rotar/quitar; `MyDevices` con "Seleccionar en la mesa" (`aria-pressed` según `seleccionadoId`).

- [ ] **Step 1: Implementar el panel**

Si no hay selección, estado vacío que invita a elegir un equipo ("Selecciona un equipo en la mesa para editarlo."). Si hay, formulario con labels asociados, inputs numéricos `min`/`step` (0.1 cm), editor de salidas (lista con quitar + alta), check "Requiere corriente" que al activar exige `tipo`, y acciones "Rotar" y "Quitar...". Toda acción refleja un cambio visible (toast o actualización).

- [ ] **Step 2: Verificación manual**

Run: `npm run dev`
Expected: al seleccionar un equipo aparece el inspector; editar dimensiones recoloca sin desbordar; agregar/quitar salidas actualiza el resumen; quitar pide confirmación.

- [ ] **Step 3: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/components/DeviceInspector.tsx src/App.tsx
git commit -m "feat(ui): inspector del equipo seleccionado"
```

---

## Workstream 3 — Tutorial

### Task 14: Glosario y búsqueda de términos

**Files:**
- Create: `src/data/glosario.ts`
- Create: `src/data/glosario.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `interface TerminoGlosario { id: string; termino: string; definicion: string }`; `GLOSARIO: TerminoGlosario[]`; `buscarEnGlosario(terminos, consulta): TerminoGlosario[]`.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/data/glosario.test.ts
import { describe, expect, it } from 'vitest'
import { GLOSARIO, buscarEnGlosario } from './glosario'

describe('glosario', () => {
  it('incluye los términos del spec', () => {
    const claves = GLOSARIO.map((t) => t.id)
    for (const id of ['rider', 'zona-a', 'zona-b', 'mono', 'estereo', 'ts', 'trs', 'xlr', '3.5mm', 'rca', 'di', 'adaptador', 'iec', 'usb', 'enchufe', 'alargador', 'mesa-de-mezclas', 'model-12']) {
      expect(claves, id).toContain(id)
    }
  })

  it('cada término tiene una definición no vacía', () => {
    for (const t of GLOSARIO) expect(t.definicion.trim().length, t.id).toBeGreaterThan(0)
  })

  it('busca por término y por definición, sin distinguir mayúsculas', () => {
    expect(buscarEnGlosario(GLOSARIO, 'xlr').some((t) => t.id === 'xlr')).toBe(true)
    expect(buscarEnGlosario(GLOSARIO, '').length).toBe(GLOSARIO.length)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/data/glosario.test.ts`
Expected: FAIL (no existe `./glosario`).

- [ ] **Step 3: Implementar los términos**

Escribir definiciones breves y en lenguaje del participante (usar el vocabulario de `mnl-design-system`: equipo, mesa, zona, adaptador, enchufe). Incluir los 18 ids del test.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/data/glosario.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/glosario.ts src/data/glosario.test.ts
git commit -m "feat(data): glosario de terminos del rider"
```

### Task 15: Rider de ejemplo

**Files:**
- Create: `src/data/ejemplo.ts`
- Create: `src/data/ejemplo.test.ts`

**Interfaces:**
- Consumes: `Rider`, `validarRider` (Task 10), `resumirRider`.
- Produces: `EJEMPLO: Rider` con participante "Ejemplo" y ≈7 equipos ubicados en la mesa.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/data/ejemplo.test.ts
import { describe, expect, it } from 'vitest'
import { EJEMPLO } from './ejemplo'
import { validarRider } from '../domain/validacion'
import { resumirRider } from '../domain/resumen'
import { MESA } from '../domain/mesa'

describe('EJEMPLO', () => {
  it('tiene participante de ejemplo y varios equipos', () => {
    expect(EJEMPLO.participante.nombre).toBe('Ejemplo')
    expect(EJEMPLO.equipos.length).toBeGreaterThanOrEqual(6)
    expect(EJEMPLO.equipos.length).toBeLessThanOrEqual(8)
  })

  it('no tiene errores de validación', () => {
    expect(validarRider(EJEMPLO).filter((p) => p.severidad === 'error')).toEqual([])
  })

  it('todos los equipos están dentro de la mesa', () => {
    for (const e of EJEMPLO.equipos) {
      expect(e.x).toBeGreaterThanOrEqual(0)
      expect(e.y).toBeGreaterThanOrEqual(0)
      expect(e.x + e.anchoCm).toBeLessThanOrEqual(MESA.anchoCm)
      expect(e.y + e.altoCm).toBeLessThanOrEqual(MESA.altoCm)
    }
  })

  it('produce un resumen con cables y corriente', () => {
    const r = resumirRider(EJEMPLO.equipos)
    expect(r.cables.total).toBeGreaterThan(0)
    expect(r.corriente.totalEnchufes).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/data/ejemplo.test.ts`
Expected: FAIL (no existe `./ejemplo`).

- [ ] **Step 3: Implementar el ejemplo**

7 equipos realistas (p. ej. Maths, Beads, Mother-32, MicroFreak, Digitakt, blueSky, Mix5) con salidas y alimentación coherentes, ubicados sin solaparse ni salir de la mesa. Ids literales y estables.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/data/ejemplo.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/ejemplo.ts src/data/ejemplo.test.ts
git commit -m "feat(data): rider de ejemplo realista"
```

### Task 16: Pasos y lógica del wizard

**Files:**
- Create: `src/tutorial/pasos.ts`
- Create: `src/tutorial/wizard.ts`
- Create: `src/tutorial/wizard.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `interface PasoTutorial { id: 'que-es-rider' | 'datos' | 'equipos' | 'mesa' | 'resumen' | 'exportar'; titulo: string; descripcion: string; tips: string[]; objetivo?: string }`; `PASOS: PasoTutorial[]`; `TOTAL_PASOS: number`.
  - `type ObjetivoWizard = { tipo: 'elemento'; selector: string } | { tipo: 'centrado' }`; `resolverObjetivo(objetivo: string | undefined, existe: (selector: string) => boolean): ObjetivoWizard`; `indiceSiguiente(paso: number, total?: number): number`; `indiceAnterior(paso: number): number`; `debeAbrirTutorial(visto: boolean, cantidadEquipos: number): boolean`.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/tutorial/wizard.test.ts
import { describe, expect, it } from 'vitest'
import { PASOS, TOTAL_PASOS } from './pasos'
import { debeAbrirTutorial, indiceAnterior, indiceSiguiente, resolverObjetivo } from './wizard'

describe('pasos del tutorial', () => {
  it('define los 6 pasos en orden', () => {
    expect(PASOS.map((p) => p.id)).toEqual([
      'que-es-rider', 'datos', 'equipos', 'mesa', 'resumen', 'exportar',
    ])
    expect(TOTAL_PASOS).toBe(6)
  })
  it('cada paso tiene título, descripción y 2-3 tips', () => {
    for (const p of PASOS) {
      expect(p.titulo.length).toBeGreaterThan(0)
      expect(p.descripcion.length).toBeGreaterThan(0)
      expect(p.tips.length).toBeGreaterThanOrEqual(2)
      expect(p.tips.length).toBeLessThanOrEqual(3)
    }
  })
})

describe('wizard', () => {
  it('resuelve un objetivo existente como elemento', () => {
    expect(resolverObjetivo('[data-tour="mesa"]', () => true))
      .toEqual({ tipo: 'elemento', selector: '[data-tour="mesa"]' })
  })
  it('cae a centrado si no hay objetivo o no existe en el DOM', () => {
    expect(resolverObjetivo(undefined, () => true)).toEqual({ tipo: 'centrado' })
    expect(resolverObjetivo('[data-tour="mesa"]', () => false)).toEqual({ tipo: 'centrado' })
  })
  it('navega con clamp y cierra en el último paso', () => {
    expect(indiceSiguiente(0)).toBe(1)
    expect(indiceSiguiente(TOTAL_PASOS - 1)).toBe(TOTAL_PASOS - 1)
    expect(indiceAnterior(0)).toBe(0)
    expect(indiceAnterior(2)).toBe(1)
  })
  it('abre solo la primera vez y con la mesa vacía', () => {
    expect(debeAbrirTutorial(false, 0)).toBe(true)
    expect(debeAbrirTutorial(true, 0)).toBe(false)
    expect(debeAbrirTutorial(false, 3)).toBe(false)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/tutorial/wizard.test.ts`
Expected: FAIL (no existen `./pasos` ni `./wizard`).

- [ ] **Step 3: Implementar**

`pasos.ts` con los 6 pasos del spec y `objetivo` como valor de `data-tour` (p. ej. `datos`, `catalogo`, `mesa`, `resumen`, `exportar`). `wizard.ts` con las funciones puras. `debeAbrirTutorial = !visto && cantidadEquipos === 0`. Cubre Review Focus #5.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/tutorial/wizard.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tutorial/pasos.ts src/tutorial/wizard.ts src/tutorial/wizard.test.ts
git commit -m "feat(tutorial): pasos y logica pura del wizard"
```

### Task 17: Store — slice de tutorial y cargar ejemplo

**Files:**
- Modify: `src/store/rider.ts`
- Modify: `src/store/rider.test.ts`

**Interfaces:**
- Consumes: `EJEMPLO` (Task 15), `TOTAL_PASOS` (Task 16), `debeAbrirTutorial`.
- Produces: `visto`, `completado`, `activo`, `paso`; `iniciarTutorial()`, `siguientePaso()`, `pasoAnterior()`, `irAPaso(n)`, `cerrarTutorial()`, `reiniciarTutorial()`; `cargarEjemplo()`.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/store/rider.test.ts (agregar)
describe('tutorial', () => {
  it('iniciar muestra el paso 0 y marca visto', () => {
    useRider.getState().iniciarTutorial()
    expect(useRider.getState()).toMatchObject({ activo: true, paso: 0, visto: true })
  })
  it('siguiente avanza y al final completa y cierra', () => {
    useRider.getState().iniciarTutorial()
    for (let i = 0; i < 6; i++) useRider.getState().siguientePaso()
    expect(useRider.getState()).toMatchObject({ activo: false, completado: true })
  })
  it('irAPaso limita al rango y anterior no baja de 0', () => {
    useRider.getState().iniciarTutorial()
    useRider.getState().irAPaso(99)
    expect(useRider.getState().paso).toBe(5)
    useRider.getState().irAPaso(-3)
    expect(useRider.getState().paso).toBe(0)
  })
  it('cerrar completa; reiniciar reabre desde cero', () => {
    useRider.getState().cerrarTutorial()
    expect(useRider.getState()).toMatchObject({ activo: false, completado: true })
    useRider.getState().reiniciarTutorial()
    expect(useRider.getState()).toMatchObject({ activo: true, completado: false, paso: 0 })
  })
})

describe('cargarEjemplo', () => {
  it('reemplaza el rider con el ejemplo', () => {
    useRider.getState().cargarEjemplo()
    expect(useRider.getState().participante.nombre).toBe('Ejemplo')
    expect(useRider.getState().equipos.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/store/rider.test.ts`
Expected: FAIL (acciones inexistentes).

- [ ] **Step 3: Implementar**

Agregar el slice con la semántica de la Task 16 (último paso cierra y completa) y `cargarEjemplo` que hace `set({ participante: EJEMPLO.participante, equipos: EJEMPLO.equipos })` y limpia `seleccionadoId`. `partialize` ya omite `activo`/`paso` (Task 11); agregar que al rehidratar no se filtre `activo` (ya cubierto por partialize). Cubre Review Focus #3 (parte wizard).

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/store/rider.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck y commit**

Run: `npm run typecheck`
Expected: sin errores.

```bash
git add src/store/rider.ts src/store/rider.test.ts
git commit -m "feat(store): slice de tutorial y carga de ejemplo"
```

### Task 18: TutorialOverlay con spotlight, foco y teclado

**Files:**
- Create: `src/components/TutorialOverlay.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: store de Task 17, `PASOS`, `resolverObjetivo`, `indiceSiguiente`, `indiceAnterior`.
- Produces: `<TutorialOverlay />` montado en `App`; auto-apertura vía `debeAbrirTutorial` en un `useEffect` cuando `!visto && equipos.length === 0`.

- [ ] **Step 1: Implementar**

Overlay con `role="dialog"`, `aria-modal`, título del paso en `aria-labelledby`; spotlight sobre `[data-tour="…"]` cuando `resolverObjetivo` da `elemento` (recuadro con `box-shadow`/borde), y tarjeta centrada cuando da `centrado` (Review Focus #5). Navegación Anterior/Siguiente/Saltar y "Empezar" en el último paso; foco atrapado dentro del overlay; `Esc` cierra; flechas y Enter navegan; `prefers-reduced-motion` respetado. El botón "Saltar" llama `cerrarTutorial`; "Reiniciar tutorial" (en Ayuda, Task 20) llama `reiniciarTutorial`.

- [ ] **Step 2: Verificación manual del wizard**

Run: `npm run dev` (con `localStorage` limpio)
Expected: aparece en la primera visita con la mesa vacía; no reaparece al recargar; `Esc` y "Saltar" cierran; al saltar a un paso sin panel visible el contenido queda centrado y legible; foco nunca sale del overlay.

- [ ] **Step 3: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/components/TutorialOverlay.tsx src/App.tsx
git commit -m "feat(tutorial): overlay con spotlight, foco y teclado"
```

### Task 19: Ayuda contextual, glosario y carga de ejemplo

**Files:**
- Create: `src/components/HelpPopover.tsx`
- Create: `src/components/Glossary.tsx`
- Modify: `src/components/TopBar.tsx`
- Modify: `src/components/ParticipantForm.tsx`, `src/components/DeviceCatalog.tsx`, `src/components/TableCanvas.tsx`, `src/components/SummaryPanel.tsx` (botón `?` y `data-tour`)
- Modify: `src/components/ExportBar.tsx` (botón "Cargar ejemplo")

**Interfaces:**
- Consumes: `GLOSARIO`, `buscarEnGlosario` (Task 14), `cargarEjemplo` (Task 17), `ConfirmDialog`/`useToast` (Task 3).
- Produces: `<HelpPopover titulo, children />`; `<Glossary abierto, onCerrar />`; botón "Ayuda" en `TopBar` abre el glosario; `?` en cada panel abre popover con texto corto y enlace al glosario; "Cargar ejemplo" con confirmación si hay datos y toast posterior.

- [ ] **Step 1: Implementar**

`HelpPopover`: botón de icono con `aria-label="Ayuda sobre …"`, popover `role="dialog"` o tooltip accesible con `Esc` y foco. `Glossary`: modal `role="dialog"`, buscador (`type="search"`) que usa `buscarEnGlosario`, lista de términos, botón cerrar, foco atrapado. Añadir `data-tour` a los paneles (`datos`, `catalogo`, `mesa`, `resumen`, `exportar`) para que el wizard tenga objetivos. "Cargar ejemplo": si `equipos.length > 0`, `ConfirmDialog` ("Se reemplazará tu rider actual."); al confirmar llama `cargarEjemplo()` y `useToast().aviso('Rider de ejemplo cargado. Edítalo o reinícialo.')`. Hints inline en puntos clave ("Arrastra para ubicar", "Doble clic para rotar").

- [ ] **Step 2: Verificación manual**

Run: `npm run dev`
Expected: `?` abre popover en cada panel y enlaza al glosario; el glosario filtra al escribir; "Cargar ejemplo" pide confirmación con datos y muestra el toast prometido; el wizard encuentra sus `data-tour`.

- [ ] **Step 3: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/components/HelpPopover.tsx src/components/Glossary.tsx src/components/TopBar.tsx src/components/ParticipantForm.tsx src/components/DeviceCatalog.tsx src/components/TableCanvas.tsx src/components/SummaryPanel.tsx src/components/ExportBar.tsx
git commit -m "feat(tutorial): ayuda contextual, glosario y rider de ejemplo"
```

---

## Workstream 4 — PDF

### Task 20: Diagrama de mesa puro para el PDF

**Files:**
- Create: `src/pdf/diagrama.ts`
- Create: `src/pdf/diagrama.test.ts`

**Interfaces:**
- Consumes: `Rider`, `geometria`, `MESA`, `ZONA_ANCHO_CM`.
- Produces: `interface RectPdf { left: number; top: number; ancho: number; alto: number }`; `escalaPdf(cm, maxCm, maxPdf): number`; `diagramaPdf(rider, anchoPdf): { ancho: number; alto: number; zonaAncho: number; equipos: Array<{ numero: number; rect: RectPdf }> }`; `tieneContenido(rider): boolean` (true si hay al menos un equipo).

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/pdf/diagrama.test.ts
import { describe, expect, it } from 'vitest'
import { diagramaPdf, escalaPdf, tieneContenido } from './diagrama'
import { EJEMPLO } from '../data/ejemplo'
import { MESA } from '../domain/mesa'
import type { Rider } from '../domain/types'

const vacio: Rider = { version: 1, participante: { nombre: '', proyecto: '', contacto: '', zona: 'A' }, equipos: [] }

describe('diagramaPdf', () => {
  it('escala proporcionalmente', () => {
    expect(escalaPdf(150, 300, 500)).toBe(250)
    expect(escalaPdf(0, 300, 500)).toBe(0)
  })
  it('numera los equipos desde 1 y conserva el orden', () => {
    const d = diagramaPdf(EJEMPLO, 500)
    expect(d.equipos.map((e) => e.numero)).toEqual(EJEMPLO.equipos.map((_, i) => i + 1))
    expect(d.equipos.length).toBe(EJEMPLO.equipos.length)
  })
  it('usa el alto de la mesa y divide en dos zonas', () => {
    const d = diagramaPdf(EJEMPLO, 500)
    expect(d.alto).toBe(escalaPdf(MESA.altoCm, MESA.anchoCm, 500))
    expect(d.zonaAncho * 2).toBeCloseTo(d.ancho, 5)
  })
  it('tieneContenido distingue vacío de no vacío', () => {
    expect(tieneContenido(vacio)).toBe(false)
    expect(tieneContenido(EJEMPLO)).toBe(true)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/pdf/diagrama.test.ts`
Expected: FAIL (no existe `./diagrama`).

- [ ] **Step 3: Implementar**

Reusar `dimensionesEnMesa`/`rectanguloDe` de `geometria` para calcular cada `RectPdf` escalado. `tieneContenido(rider) = rider.equipos.length > 0`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/pdf/diagrama.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/pdf/diagrama.ts src/pdf/diagrama.test.ts
git commit -m "feat(pdf): geometria pura del diagrama de mesa"
```

### Task 21: RiderPdf rediseñado (B/N, 1–2 páginas)

**Files:**
- Modify: `src/pdf/RiderPdf.tsx` (reescritura completa)

**Interfaces:**
- Consumes: `resumirRider`, `diagramaPdf` (Task 20), `MESA`.
- Produces: `<RiderPdf rider={rider} />` B/N, A4, márgenes ~32 pt, Helvetica, reglas finas, sin rellenos salvo cebra y cajas del diagrama.

- [ ] **Step 1: Reescribir la página 1**

Cabecera (título "Rider Técnico", participante, proyecto, contacto, zona, fecha), bloque resumen (equipos/cables/adaptadores/enchufes) y diagrama de mesa a escala en línea negra con equipos numerados y leyenda. Si `tieneContenido(rider)` es falso, mostrar un único mensaje claro ("Todavía no agregaste equipos. Completa tu mesa y vuelve a exportar.") en lugar del diagrama y las tablas (Review Focus #3).

- [ ] **Step 2: Reescribir la página 2**

Tabla de equipos numerada (N.º, nombre, categoría, dimensiones, salidas, corriente), cables por conector, adaptadores, corriente y conexiones por equipo. Usar `wrap`/`break` de `@react-pdf` para paginar con muchas conexiones. Footer en cada página: "Rider Técnico · Make Noise Lab" y paginación `x / y` con `render={({ pageNumber, totalPages }) => …}`.

- [ ] **Step 3: Verificación manual del PDF**

Run: `npm run dev`, descargar PDF con el rider de ejemplo y con la mesa vacía.
Expected: 1–2 páginas A4, B/N legible (sin amarillo), diagrama con equipos numerados y leyenda coherente con la tabla; con mesa vacía, un mensaje y sin páginas en blanco; footer con paginación correcta.

- [ ] **Step 4: Typecheck, build y commit**

Run: `npm run typecheck && npm run build`
Expected: sin errores.

```bash
git add src/pdf/RiderPdf.tsx
git commit -m "feat(pdf): rider en blanco y negro de 1-2 paginas"
```

---

## Verificación final

### Task 22: Pulido, accesibilidad y cierre

**Files:**
- Modify: `src/styles/*`, componentes con defectos encontrados
- Modify: `.opencode/skills/mnl-design-system/SKILL.md` (solo si cambiaron decisiones visuales)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: rama lista para integración.

- [ ] **Step 1: Suite completa y typecheck**

Run: `npm run typecheck && npm test`
Expected: typecheck limpio; todos los tests verdes (existentes + `catalogo`, `buscar`, `importar`, `geometria`, `validacion`, `teclado`, `rider`, `glosario`, `ejemplo`, `wizard`, `progreso`, `diagrama`, `toast`).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `dist/` generado sin errores.

- [ ] **Step 3: Pasada manual con `npm run dev`**

Checklist: primera visita abre el wizard y no vuelve; `?` y glosario funcionan; "Cargar ejemplo" confirma y avisa; arrastrar con snap y teclado (flechas, Shift+flechas, R, Del) sobre el seleccionado; solapamiento y fuera-de-zona se marcan; PDF de ejemplo y PDF vacío; guardar/cargar JSON válido y roto; reiniciar con confirmación; sin `alert`/`confirm` en el código.

- [ ] **Step 4: Responsive y accesibilidad**

Run: `npm run dev` a 375 px y 1280 px.
Expected: sin desbordes; export sticky abajo en móvil; recorrido completo solo con teclado, `:focus-visible` visible en todo interactivo, skip link funciona, overlays cierran con `Esc` y atrapan el foco; `prefers-reduced-motion: reduce` desactiva animaciones.

- [ ] **Step 5: Actualizar la skill de diseño y commit final**

Si durante el rediseño cambiaron tokens o reglas, reflejarlos en `.opencode/skills/mnl-design-system/SKILL.md`.

```bash
git add -A
git commit -m "chore: pulido final, accesibilidad y verificacion"
```

- [ ] **Step 6: Handoff**

Usar la skill `superpowers:finishing-a-development-branch` para decidir la integración (merge/PR) de la rama del worktree.

---

## Self-Review

**1. Cobertura del spec**
- 3.1 `fuente` en catálogo → Task 1. ✔
- 3.2 slice de tutorial, selección, `cargarEjemplo`, `partialize` → Tasks 11, 17. ✔
- 3.3 validación con tipos y reglas → Task 10. ✔
- 3.4 glosario/ejemplo/pasos → Tasks 14, 15, 16. ✔
- Workstream 5 (auditoría) → Task 1. ✔
- 5.0 skills de diseño → referenciadas en constraints; no requieren tarea. ✔
- 5.1 tokens → Task 2. ✔
- 5.2 tipografía → Task 2. ✔
- 5.3 shell/top bar/stepper/layout → Task 4. ✔
- 5.4 componentes (botones, campos, tarjetas, toasts, modal, badges, tooltip) → Tasks 2, 3, 6, 12, 19. ✔
- 5.5 accesibilidad → Tasks 2, 3, 12, 18, 19, 22. ✔
- Workstream 2 (canvas: snap, zoom, panel de equipo, teclado, validación) → Tasks 9, 10, 11, 12, 13. ✔
- Workstream 3 (wizard, ayuda/glosario, ejemplo) → Tasks 14, 15, 16, 17, 18, 19. ✔
- Workstream 4 (PDF) → Tasks 20, 21. ✔
- Workstream 6 (skills) → ya hechas; Task 22 las ajusta si cambia algo. ✔
- Sección 10 verificación → Task 22. ✔
- Sección 11 fases/orden → encabezado y orden 5→1→2→3→4→verificación. ✔

**2. Barrido de pasos**
Cada paso es una acción con resultado verificable. Los pasos de implementación con CSS/JSX dan archivos, clases y reglas, no cuerpos de código; los pasos de test traen las aserciones exactas. No hay pasos "TBD" ni "manejar casos borde" genéricos: los bordes están cubiertos por Review Focus con tests concretos.

**3. Consistencia de tipos**
`Problema`, `Severidad`, `ProblemaTipo`, `validarRider` se definen en Task 10 y se usan con esos nombres en Tasks 4, 12, 14, 15, 21. `ComandoTeclado`/`comandoDeTecla` en Task 11 y `ejecutarComando` en el store. `RectPdf`/`escalaPdf`/`diagramaPdf`/`tieneContenido` en Task 20 y se consumen en Task 21. `filtrarCatalogo`, `buscarEnGlosario`, `importarRider`, `calcularProgreso`, `resolverObjetivo` con firmas únicas en sus tasks dueñas.

**4. Review Focus**
#1 → Task 7 (tests de importación inválida). #2 → Task 10 (solapamiento exacto / no-cabe / fuera-de-mesa). #3 → Tasks 17 (partialize/wizard), 21 (PDF vacío). #4 → Tasks 11 (sin selección y borrado) y 12 (guard en el canvas). #5 → Tasks 16 (`resolverObjetivo`) y 18 (fallback centrado).

**5. Proporción**
El plan define decisiones (archivos, firmas, valores, tests) y evita transcribir cuerpos de componentes/CSS. Las únicas transcripciones son los tests, necesarios para que cada tarea sea autónoma.

**Nota de orden detectada en la revisión:** `calcularProgreso` (Task 4) depende de `validarRider` (Task 10). Para ejecución estricta en orden 1→2, adelantar Task 9–10 antes de Task 4, o implementar `progreso.ts` postergando su test hasta que `validarRider` exista. La opción recomendada es ejecutar Tasks 9 y 10 primero.
