---
name: mnl-design-system
description: Use when building, restyling, or reviewing any UI in the Rider Técnico MNL app (React/CSS under src/), including the table canvas, panels, tutorial, toasts, and PDF preview, or when adding new components that must match the Make Noise Lab look.
---

# MNL Design System

Reference for the visual language of the Rider Técnico MNL app. Pairs with the
vendored `frontend-design` skill: that one governs aesthetic intent, this one
fixes the project's tokens, rules, and quality floor.

## Brand core (do not change)

- Logo assets live in `public/logos/`. Never recolor or stretch them.
- Accent yellow `#EDE200` on near-black is the identity. Keep yellow scarce:
  one clear action per view, plus a single emphasis element.

## Tokens (`src/index.css`)

```css
--bg:#0b0b0b  --surface-1:#141414  --surface-2:#1c1c1c  --surface-3:#242424
--border:#2e2e2e  --border-strong:#3d3d3d
--text:#f5f5f5  --text-muted:#a3a3a3  --text-faint:#6e6e6e
--accent:#ede200  --accent-ink:#0b0b0b
--danger:#ff6b6b  --warn:#ffb020  --ok:#4ade80
--radius-sm:6px  --radius-md:10px  --radius-lg:14px
--dur-fast:120ms  --dur:180ms  --ease:cubic-bezier(.2,.6,.2,1)
```

Spacing uses a 4px scale (`--space-1..--space-10`). Never introduce raw hex
values in components; use the variables.

## Type

- Display/headings: `Archivo`. UI/body: `Inter`. Fallback `system-ui, Arial`.
- One type scale. Body 14px, line-height 1.5, line length < 80ch.
- Avoid ALL-CAPS eyebrows on every heading and middle-dot meta strings; these
  are generated-default tells (see `frontend-design`). Use them only where the
  content is genuinely a sequence or a real list.

## Structure rules

- A panel is: `header` (title + optional context help) / `body` / action row.
- Radius and shadow encode hierarchy: surface-1 panels get `--radius-md` and no
  shadow; overlays (modal, popover, wizard) get `--radius-lg` + shadow.
- Don't make every block an identical rounded card. Group by proximity and
  alignment before reaching for a new border.

## Interaction rules

- Every action answers with a state change: toast, inline confirmation, or a
  visible update. Use the toast/modal components, never `alert`/`confirm`.
- Motion is for feedback, not decoration. Respect `prefers-reduced-motion`.
- Destructive actions use `--danger` and require an explicit confirmation.

## Accessibility floor (non-negotiable)

- Text contrast ≥ 4.5:1; UI borders/interactive ≥ 3:1.
- Visible `:focus-visible` on every interactive element.
- The table canvas is fully operable by keyboard (arrows move, `R` rotates,
  `Del` removes); any pointer-only interaction needs a keyboard equivalent.
- Icon-only buttons need `aria-label`. Overlays trap focus and close on `Esc`.
- Provide a skip link to content.

## Copy

- Sentence case, active voice, plain verbs. Buttons name the result ("Descargar
  PDF", "Cargar ejemplo"), and the resulting toast reuses that word.
- Empty states invite action; errors state what happened and how to fix it.
- Name things as the participant understands them (equipo, mesa, zona,
  adaptador, enchufe), not as the code names them.

## Before calling UI work done

- Responsive at 375px and 1280px.
- `npm run typecheck` and `npm run build` clean.
- Keyboard pass through the changed flow.
