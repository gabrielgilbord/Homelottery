# HOMELOTTERY Design System v4 · "The Private Show × The Play Club"

La marca y sus reglas de uso están en `docs/BRAND_GUIDELINES.md`. El movimiento, en `docs/MOTION_GUIDELINES.md`. Este documento cubre el **código**.

## Archivos

| Archivo | Contenido |
|---|---|
| `src/styles/fonts.css` | `@font-face` de Bodoni Moda (subconjunto latino, local) |
| `src/styles/tokens.css` | Tintas de marca, **esquemas** (`night`, `paper`, `ink`, `stage`, `live`), alias de compatibilidad, acentos por mundo, escala, espacio, radios, elevación, movimiento y grano |
| `src/styles/base.css` | Reset, ajustes nativos para móvil, las tres voces, rótulos de emisión (`.bc`), `.fig`, `.ticket`, layout y animaciones base |
| `src/styles/components.css` | Botones, chips, pestañas, campos, interruptor, superficies, listas, ledger, hojas, cortina, avisos, cartas, temporizador, tablas |
| `src/styles/shell.css` | Wordmark, ON AIR, `EpNum`, `Seal`, barra de emisión, navegación con luz de tally, rail, menú y cartela de episodio |
| `src/styles/screens.css` | Home, catálogo, guía, sobres, mundos, cajas, ruleta, marcador, Host e intro |
| `src/components/Logo.tsx` | `Wordmark`, `LogoMark`, `Monogram`, `OnAir`, `Seal`, `EpNum` |
| `src/components/Envelope.tsx` | `Envelope` (4 familias y 3 estados) y `EnvelopeReveal` |
| `src/screens/Boxes.tsx` | `Box3D` (materiales por nivel y etiqueta numerada) |

## Esquemas

`App.tsx` pone `data-scheme` y `data-world` en `<html>` según la ruta, y actualiza `theme-color` para la barra del sistema:

```
paper: show, challenges, challenge, leaderboard, inventory, achievements, prefs
ink:   gaming, movie, host, cards        stage: couples        live: party
night: el resto (home, boxes, roulette, intro)
```

Los componentes **solo** leen tokens semánticos: `--bg`, `--bg-1…4`, `--fg`, `--fg-2…4`, `--line…3`, `--value`, `--hot`, `--gabriel`, `--tatiana`, `--success`, `--danger`. Los nombres antiguos (`--velvet-*`, `--ivory-*`, `--brass`, `--curtain`) son alias que se vuelven a resolver en cada esquema. Por eso un bloque `.s-paper` dentro de una pantalla oscura se reimprime en crema sin CSS extra.

## Componentes y estados

| Componente | Variantes y estados |
|---|---|
| `.btn` | `primary` (tinta del esquema invertida, doble filete), `cta` (invitación naranja, una por pantalla), `accent`, `value`, `ghost`, `quiet` (subrayado), `danger`, `sm`, `lg`, `block`, `icon`. Estados: hover (puntero fino), `:active` 0,97, `focus-visible`, `disabled`, `is-loading`, `is-armed` |
| `.chip`, `.tag`, `.bc`, `.stamp` | on (`aria-pressed`), tonos `sweet`, `spicy`, `legendary`, `ok`, `live`, `value`, `accent` |
| `.seg` | Pestañas con subrayado animado (`scaleX`); en `.players` el subrayado va en el color de cada jugador |
| `.input` | Línea impresa (borde inferior de 2 px); focus con fondo del acento; error con `aria-invalid`. `textarea` en caja |
| `.switch` | Piloto: naranja con mando tinta cuando está activo |
| `Modal`, `Curtain`, `Toaster` | Hoja con filete superior de 3 px. Cortina de terciopelo con fleco champán. Avisos con forma de ticket |
| `Envelope` | `k-normal`, `k-special`, `k-prize`, `k-surprise` × `is-locked`, `is-ready`, `is-opened` |
| `Box3D` | `idle`, `still`, `locked`, `charging`, `open` × 5 materiales |
| Ruleta | Aro por ruleta (`data-wheel`), clavijas, bombillas (`is-spinning`, `has-result`), `.win-ticket` |
| `.plate`, `.board`, `.arcade` | Marcadores: placa de plató, tablero de competición y arcade |
| `.mcard`, `.prompt-card` | Naipe de cartulina; carta grande de baraja con banda del color del mundo |
| `Empty`, `.skeleton` | Vacío con borde discontinuo; carga con brillo |

## Breakpoints

320 (mínimo comprobado), 360 (barra superior compacta), 600 (dos columnas y estado en la barra), 900 (rail lateral), 1100 y 1280.

## Rendimiento

- CSS 112 KB (24 KB gzip). JS 429 KB (137 KB gzip), igual que antes del rediseño.
- Una sola fuente nueva: Bodoni, 46 KB.
- Ninguna imagen remota. El grano es un SVG en línea y los iconos de app son PNG generados desde el SVG del monograma.
