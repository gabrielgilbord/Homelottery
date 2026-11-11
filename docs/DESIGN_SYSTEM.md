# HOMELOTTERY Design System · "Late Show en casa"

Código: `src/styles/tokens.css` (tokens), `base.css` (tipos, layout, motion y ajustes nativos), `components.css` (librería), `shell.css` (navegación y transiciones), `screens.css` (composición de cada mundo). Componentes React en `src/components/` (`ui.tsx`, `Logo.tsx`, `DeckDrawer.tsx`, `NameSpinner.tsx`, `Icon.tsx`).

## Color
| Token | Valor | Uso |
|---|---|---|
| `--velvet-0…4` | `#1a0b12` → `#452534` | Fondo y superficies de terciopelo burdeos |
| `--curtain` | `#4a1426` | Telón: escenario, cortina de privacidad, cartela de episodio |
| `--ivory`, `-2`, `-3`, `-4` | `#f7ecdf`, `#d6c4b6`, `#a8928a`, `#6f5a5c` | Texto (15,9 : 1, 10,6 : 1 y 6,1 : 1). `-4` solo para deshabilitado |
| `--brass` | `#d9b46a` | **Solo valor**: monedas, premios y botón `value` |
| `--on-air` | `#ff5b4a` | En directo |
| `--success`, `--danger`, `--warning` | | Estados |
| `--gabriel`, `--tatiana` | `#9cc2ff`, `#ff9fbb` | Siempre con inicial y lado, nunca solo el color |
| `--w-*` | gaming `#5bd7ff`, cards `#63c59a`, party `#ff8552`, couples `#f27a9b`, movie `#ffbe55`, boxes brass, roulette `#ff5b4a`, host `#a7b4c2` | Un acento por mundo, vía `[data-world]` → `--accent`. Sin violeta |
| `--foil` | degradado iridiscente | Material de los objetos legendarios. Nunca sobre texto |

## Tipografía
- **Bricolage Grotesque Variable**, con ancho del 75 al 85 % y peso de 680 a 800: titulares, marcadores, nombres de premios y logotipo.
- **Geist Sans**: interfaz y texto.
- **Geist Mono**: solo los dígitos del temporizador y el PIN.
- Escala: 12 · 13 · 15 · 17 · 21 · 26→34 · 34→56 · 44→84 · marcador 56→104.
- Etiquetas siempre en minúscula normal. Nada de mayúsculas espaciadas.

## Espacio, radios, elevación, táctil
- Rejilla de 4 px (`--s-1` … `--s-10`). Gutter de `max(20px, safe-area)`.
- Radios por función: etiqueta 6 · chip e input 10 · botón 14 · superficie 20 · escenario y hoja 28.
- Elevación con desplazamiento y desenfoque cálido (`--e-1/2/3`).
- Objetivos táctiles de 44 y 52 px.
- Breakpoints: **600** (dos columnas), **900** (raíl lateral), **1280**.

## Movimiento
- Curvas: `--ease-out` (0.23,1,0.32,1), `--ease-in-out` (0.77,0,0.175,1), `--ease-drawer` (0.32,0.72,0,1); `--ease-spring` solo en celebraciones.
- Duraciones: pulsar 120 · rápido 180 · base 240 · hoja 380 · revelación 640.
- Hover solo con puntero fino. `:active` a 0,97 en todo lo que se pulsa.
- Movimiento reducido: menos desplazamiento, pero el feedback de opacidad y color se mantiene.

## Componentes y estados
| Componente | Estados |
|---|---|
| `.btn` (`primary`, `accent`, `value`, `ghost`, `quiet`, `danger`; `sm`, `lg`, `block`, `icon`) | hover (solo puntero), focus-visible, active, disabled, `is-loading`, `is-armed` |
| `ConfirmButton` | reposo → armado (late y vibra) → confirmado |
| `Seg`, `PlayerSwitch`, `.chip`, `.tag` | on, focus y pressed (`aria-pressed`, `role`) |
| `.input`, `Toggle`, `Range` | focus con anillo de acento, error (`aria-invalid` + `.error-text`) |
| `Modal` (hoja inferior en móvil), `Curtain`, `Toaster` | foco y Escape gestionados. Los toasts se posponen durante las revelaciones |
| `.row-item`, `.crow` (fila de catálogo), `.ledger`, `.specs`, `.h2h` | listas y datos sin "muro de tarjetas" |
| `.stage` + `.scorebug` + `.tug` | escenario del Home y del marcador |
| `DeckStage` (`.prompt-card`) | selector de baraja + carta marfil. Las barajas privadas van tras la cortina |
| `Box3D`, `.reveal-stage`, `.prize-card` | idle, still, locked, charging, open |
| `Timer`, `AnimatedNumber`, `MysteryCard`, `Empty`, `.skeleton` | |

## Identidad por mundo
| Mundo | Tratamiento |
|---|---|
| Home | Escenario con telón, foco, marcador tipo televisión y escaleta de 8 episodios |
| Challenges | Catálogo en filas con icono del mundo, metadatos y recompensa en latón |
| Gaming | Paneles por juego (LoL dorado, Split Fiction rosa, ARK verde, PlayStation azul) y ranuras de sorteo |
| Card Arena | Tapete verde, dados, moneda y carta real |
| Party | Carta marfil grande, selector de 9 barajas y laboratorio de cócteles |
| Couples | Medidor Sweet / Spicy / Legendary con el nivel común |
| Movie Night | Cabecera de cine con bombillas de marquesina y haz de proyector, cartelera y bingo en papel |
| Mystery Boxes | Cámara acorazada con cajas 3D por material y revelación con anticipación |
| Roulette | Rueda con colores por significado, ticks de latón y buje con logo |
| Leaderboard | Marcador y tabla cara a cara |
| Host Mode | Sala de control: más fría, densa y con cronologías con hora |
