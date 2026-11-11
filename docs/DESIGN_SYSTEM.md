# HOMELOTTERY Design System · "Velvet Broadcast"

Código: `src/styles/tokens.css` (tokens), `base.css` (tipos, layout, motion), `components.css` (librería), `shell.css` (navegación), `screens.css` (composición por mundo). Componentes React en `src/components/ui.tsx`.

## Color
| Token | Uso |
|---|---|
| `--ink-0…4` | Escenario y superficies (tinta con matiz vino, nunca gris puro) |
| `--ivory`, `--ivory-2`, `--ivory-3`, `--ivory-4` | Texto principal, secundario, terciario (mín. 5,3:1) y deshabilitado |
| `--wine`, `--wine-2`, `--wine-3` | Marca: sellos, cortina, foco del escenario |
| `--champagne` | **Solo valor**: monedas, premios, botón `value` |
| `--legend` | Degradado iridiscente: **solo** para momentos legendarios |
| `--success`, `--danger`, `--warning`, `--live` | Estados semánticos (independientes del acento) |
| `--gabriel`, `--tatiana` | Identidad de los jugadores, siempre acompañada de inicial y lado |
| `--c-home`, `--c-gaming`, `--c-cards`, `--c-party`, `--c-couples`, `--c-movie`, `--c-boxes`, `--c-roulette`, `--c-host` | Acento de cada mundo. `[data-world]` lo asigna a `--accent` |

## Tipografía
- **Instrument Serif** (`--f-display`) para titulares, marcadores y momentos.
- **Geist Sans** (`--f-ui`) para la interfaz.
- **Geist Mono** (`--f-mono`) para rótulos, tiempos y datos.
- Escala: `--t-micro` 11 · `xs` 12 · `sm` 13 · `base` 15 · `md` 17 · `lg` 19–22 · `xl` 24–32 · `2xl` 32–52 · `3xl` 42–76 · `score` 52–96.
- Roles: `.h1` a `.h5`, `.lead`, `.eyebrow`, `.score`, `.num` (tabular).

## Espacio, forma y elevación
- Espaciado en base 4: `--s-1` (4) … `--s-10` (72).
- Radios: `xs 6 · sm 10 · md 14 · lg 20 · xl 28 · pill`.
- Elevación: `--e-1` (superficies), `--e-2` (toasts), `--e-3` (sheets y carta).
- Toque: `--tap` 44 / `--tap-lg` 52.
- Breakpoints: **600** (2 columnas), **900** (raíl lateral, layouts de escritorio), **1280** (3 columnas).

## Motion
- Duraciones: `--d-instant` 90 · `fast` 160 · `base` 260 · `slow` 460 · `epic` 900.
- Curvas: `--ease-out`, `--ease-in-out`, `--ease-spring` (feedback), `--ease-anticipate` (tapas y aperturas).
- Primitivas: `.page` (entrada), `.stagger` (escalonado), `pop`, `rise`, `float-up` (deltas), `pulse-live`.
- Celebración: `celebrate(1 | 2 | 3)` en `src/lib/celebrate.ts`, proporcional a la recompensa.
- Todo se desactiva con `prefers-reduced-motion`.

## Componentes
| Componente | Clases / React | Estados |
|---|---|---|
| Button | `.btn` + `primary`, `accent`, `value`, `ghost`, `quiet`, `danger` · `sm`, `lg`, `block`, `icon` | hover, focus-visible, active (escala), disabled, `is-loading`, `is-armed` (confirmación) |
| ConfirmButton | `<ConfirmButton>` | reposo → armado (late y vibra) → confirmado; vuelve al reposo a los 3,5 s |
| Tabs / segmentado | `<Seg>`, `<PlayerSwitch>` | on, hover, focus; con `role` de tablist o radiogroup |
| Chip / Tag | `.chip` (filtro, `aria-pressed`), `.tag` (estado: `ok`, `live`, `value`, `sweet`, `spicy`, `legendary`) | |
| Switch / Range / Input | `<Toggle>`, `<Range>`, `.input` | focus con anillo de acento; error con `aria-invalid` + `.error-text` |
| Sheet (modal) | `<Modal>` | bottom sheet en móvil, diálogo centrado en escritorio; foco y Escape gestionados |
| Curtain | `<Curtain>` | privacidad para un solo móvil: mantener pulsado para revelar |
| Toast | `<Toaster>` + `toast()` | gold, good, bad, info; se pospone durante las revelaciones |
| Timer | `<Timer>` | anillo de progreso, presets, alarma |
| AnimatedNumber | `<AnimatedNumber showDelta>` | conteo + delta flotante |
| Listas | `.list` + `.row-item` (con `.lead-icon` y `.chev`) | hover con barrido y flecha que se desplaza |
| Ledger / Specs | `.ledger`, `.specs` | stats y fichas con filetes, sin tarjetas |
| Game card | `.ccard` | hover con elevación, `aria-disabled` cuando está fuera de límites |
| Mystery box | `<Box3D tier state>` | idle, still, locked, charging, open |
| Mystery card | `<MysteryCard>` | hover con inclinación |
| Empty / Skeleton | `<Empty>`, `.skeleton` | |

## Identidad por mundo
| Mundo | Tratamiento |
|---|---|
| Home | Editorial: titular serif grande, marcador en banda, listas con filetes |
| Gaming | Paneles por juego con su propio color (LoL dorado hextech, Split Fiction violeta, ARK verde jungla, PS azul) y tragaperras |
| Card Arena | Tapete verde, dados físicos, moneda que gira y carta real |
| Party | Coral/magenta, cartas-prompt marfil con sombra desplazada, receta en rejilla |
| Couples | Rosa sobrio, medidor de intensidad Sweet / Spicy / Legendary |
| Movie Night | Cabecera con bandas de letterbox, haz de proyector cian, cartelera en pósters, bingo en papel |
| Mystery Boxes | Cámara acorazada con cajas 3D por material (bronce, plata, oro, cristal facetado, laca negra iridiscente) |
| Roulette | Segmentos coloreados por significado (valor, ataque, suerte), ticks y buje con monograma |
| Host Mode | Sala de control: densa, sans, franjas de "clasificado", tablas |
