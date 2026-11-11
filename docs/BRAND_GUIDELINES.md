# HOMELOTTERY · Brand guidelines

**Dirección aprobada:** THE PRIVATE SHOW × THE PLAY CLUB.
Un programa de televisión nocturno que solo existe para Gabriel y Tatiana, diseñado como una revista cultural de edición limitada.

> Vintage en la atmósfera. Contemporáneo en la ejecución.
> THE PRIVATE SHOW aporta el espectáculo. THE PLAY CLUB aporta el diseño.

Capturas: `docs/design/v4/` (iPhone 13) y `docs/design/v4-desktop/` (1440 px). La versión anterior está en `docs/design/after/`.

## 1. Concepto

| El programa | En la app |
|---|---|
| Cada sesión es una emisión | El Home es una mancheta de televisión con piloto ON AIR, fecha y número de episodio |
| Cada episodio es un capítulo | Número Didone gigante, guía de emisión con sellos "Emitido", intermedios y progreso |
| Cada actividad es una sección del programa | Gaming = *The Arcade Break*, Fiesta = *The Live Act*, En pareja = *After Hours*, Cine = *The Screening Room*, Cartas = *The Card Table* |
| Cada ruleta es un espectáculo | Rueda con aro de bombillas, clavijas e indicador físico |
| Cada caja es un objeto misterioso | Cajas de cartón, hojalata, laca o cristal, con cinta y etiqueta numerada |
| Cada premio es una revelación | Certificado de premio con franja de rareza y sello de ganador, bajo un foco |

Regla del texto: **toda la interfaz va en español natural**. El inglés solo aparece como rótulo de marca (ON AIR, Tonight's show, Next act, Special guests, Winner, Private broadcast, Control room). Nunca sustituye a una etiqueta funcional.

## 2. Logotipo · concepto único: «La pantalla»

Un televisor dibujado como una letra Didone: lados gruesos, perfiles finos arriba y abajo. Un solo concepto que se declina así:

| Pieza | Qué es | Dónde | Código |
|---|---|---|---|
| **Wordmark** | `H [pantalla] MELOTTERY`: la pantalla sustituye a la O de HOME, con la estrella del show dentro | Barra superior, rail, mancheta del Home, intro | `Wordmark` (`sm` · `md` · `lg` · `xl`) |
| **Símbolo** | Pantalla + estrella de cuatro puntas | Centro de la ruleta, favicon de reserva | `LogoMark` |
| **Monograma** | Pantalla con una H Didone; la barra de la H es la estrella | Icono de app, puerta de Host Mode | `Monogram`, `public/icon.svg` |
| **Icono de app y favicon** | Monograma crema sobre granate | `icon-180/192/512.png`, `icon-maskable-512.png` (zona segura al 78 %), `icon.svg` | — |
| **Sello ON AIR** | Piloto luminoso naranja que se enciende con dos parpadeos | Home, barra superior, episodio actual, Fiesta (LIVE) y Host (REC) | `OnAir` |
| **Sello de emisión** | Sello circular con texto en el aro | Líder del marcador, victoria, certificado de premio | `Seal` |
| **Numeración de episodio** | «Ep.» + dos cifras Didone | Barra, guía y cartela | `EpNum` |

**Reglas de uso**
- El wordmark nunca se escribe "Homelottery" en una fuente: siempre se usa el componente, con la O-pantalla.
- Tamaño mínimo: 16 px de cuerpo (la H y la pantalla siguen legibles). En la mancheta se ajusta al ancho (`11.9cqi`).
- La estrella siempre va en naranja (`--orange-2`). La pantalla, en el color del texto del esquema.
- No se combinan foco, micrófono, cortina y medallón en el logo. Esos recursos viven en la gráfica, no en la marca.

## 3. Color

Paleta de marca (`tokens.css`):

| Nombre | Hex | Función |
|---|---|---|
| Tinta | `#171417` | Suelo de sala de control, arcade y cine. Texto sobre papel |
| Vino | `#2a101b` | La noche: suelo principal |
| Burdeos | `#501b2a` | El plató: placa del marcador, bloque "Ahora en emisión", cartela, icono |
| Crema | `#f2e9d8` | Papel: guía, catálogo, tickets, sobres, certificados |
| Champán | `#d6b77a` | **Solo valor**: monedas, premios, ganador. Nunca decoración |
| Naranja tostado | `#c65b35` / `#e27a50` | ON AIR y la única acción principal de cada pantalla (texto tinta, 6:1) |
| Rosa | `#e58aa5` | After Hours |
| Fósforo | `#5fd4c4` | The Arcade Break |
| Tapete | `#2f6b4f` | The Card Table |

**Esquemas (el suelo sobre el que se imprime cada pantalla)**

| Esquema | Suelo | Pantallas | Contraste texto 1 / 2 / 3 |
|---|---|---|---|
| Night | vino | Home, cajas, ruleta, intro | 14,7 / 10,3 / 6,1 |
| Paper | crema | Programa, pruebas, ficha, marcador, inventario, logros, límites | 15,2 / 9,0 / 5,3 |
| Ink | tinta | Gaming, cine, cartas, Host | 15,2 / 10,7 / 6,4 |
| Stage | burdeos | En pareja | 13,4 / 10,2 / 6,9 |
| Live | naranja | Fiesta | 6,2 / 5,4 / 4,8 |

Cada componente lee tokens semánticos (`--bg`, `--fg`, `--line`…). Un bloque se puede imprimir en otro esquema con `.s-paper`, `.s-ink`, etc.

**Rareza de premios:** común = kraft `#b87a4b`, poco común = hojalata `#9ea3ad`, rara = champán, épica = hielo `#8fd9f2`, legendaria = lámina iridiscente (`--foil`, solo sobre objetos).

**Prohibido:** dorado en degradado, glassmorphism, violeta o azul SaaS, sombras duras desplazadas, texto con degradado, el mismo suelo oscuro en todas las pantallas.

## 4. Tipografía · tres voces

| Voz | Familia | Uso | Por qué |
|---|---|---|---|
| **Display** | Bodoni Moda Variable (OFL), peso 400–900, tamaño óptico 6–96 | Titulares, wordmark, números de episodio, marcadores grandes, nombres de premio, cartas | Didone de alto contraste: es a la vez el título de un programa de los 70 y la portada de una revista. Su eje óptico mantiene los perfiles finos a cuerpo de titular y los engorda a tamaño pequeño |
| **Editorial** | Bricolage Grotesque Variable (OFL), ancho 75–85 % | Rótulos de emisión, numeración, botones, pestañas, cifras de tablas, marcador arcade | Grotesca condensada con carácter: la voz de la revista y del rótulo de plató |
| **Funcional** | Geist Sans (OFL) | Texto, instrucciones, formularios, metadatos | Neutra, legible y moderna para leer de verdad |
| Datos | Geist Mono | Solo dígitos de temporizador y PIN | — |

Descartadas: Inter (automática), Playfair, DM Serif y Cormorant (los tópicos que señalan Impeccable y Frontend Design), Space Grotesk, Syne y Bebas (intercambiables).

**Escala** (`tokens.css`): 12 · 13 · 15 · 17 · 22 · 28→38 (h2) · 38→68 (h1) · 48→100 (cabecera de página) · 64→136 (marcador) · 104→224 (números de episodio).

**Reglas**
- Números en Bodoni solo a partir de 44 px. Por debajo, el "1" Didone se lee como "I", así que tablas, contadores y la píldora de puntuación usan Bricolage.
- Los rótulos de emisión (`.bc`) van en mayúsculas con tracking, siempre enmarcados y como mucho uno por bloque. No son eyebrows encima de cada titular.
- Nada de una sola palabra en cursiva o en otro color dentro de un titular.

Las fuentes están empaquetadas. De Bodoni solo se incluye el subconjunto latino (46 KB), que cubre todo el español.

## 5. Sistema gráfico

| Elemento | Descripción | Clase o componente |
|---|---|---|
| Ticket | Papel crema con muescas laterales y perforación | `.ticket`, `.invite`, `.win-ticket`, avisos (`.toast`) |
| Placa de plató | Bloque burdeos con doble filete interior champán | `.plate`, `.now-block` |
| Tablero | Tinta con trama de puntos y nombres en placa | `.board` |
| Rótulo de emisión | Mayúsculas Bricolage enmarcadas | `.bc` |
| Sello de goma | Rectángulo girado −7°, verde | `.stamp` («Emitido») |
| Sello de emisión | Circular con texto en el aro | `Seal` |
| Sobres | Cuatro familias: normal (crema, lacre naranja), especial (granate, lacre champán), premio (champán, lacre burdeos), sorpresa (naranja, lacre tinta). Numerados «Nº 01–11» | `Envelope`, `EnvelopeReveal` |
| Cajas | Kraft, hojalata, laca champán, cristal y laca negra con filo iridiscente. Cinta, etiqueta «Nº 0X» y estantería con etiqueta de precio colgada | `Box3D`, `.price-tag` |
| Cartas | Naipe de cartulina con banda de color y doble filete | `.mcard`, `.prompt-card` |
| Filetes | 2 px en el color del texto bajo cada cabecera de página y de sección; 1 px entre filas | `.section-head`, `.page-head` |
| Textura | Grano SVG en línea (offline), en overlay sobre fondos oscuros y en multiply sobre papel | `--grain` |
| Iconos | Un solo juego propio de 24 px y trazo uniforme. Sin emojis ni familias mezcladas | `Icon.tsx` |

## 6. Los mundos

| Mundo | Suelo | Voz del titular | Objeto propio |
|---|---|---|---|
| Home | Noche | Mancheta: wordmark XL y número de episodio naranja | Placa del marcador, entrada con talón, mosaico de secciones |
| El programa | Papel | Didone | Guía de emisión con horas, sellos e intermedios; sobres |
| Gaming, *The Arcade Break* | Tinta | Bricolage en mayúsculas con brillo de fósforo | Marcador arcade P1/P2 por rondas, cartuchos por juego |
| En pareja, *After Hours* | Burdeos | Didone grande y ligera | Medidor Sweet / Spicy / Legendary con filete rosa |
| Noche de cine, *The Screening Room* | Tinta | Didone champán | Marquesina, haz de proyector, créditos del cartel, bingo en papel |
| Fiesta, *The Live Act* | Naranja | Didone gigante | Piloto LIVE, carta grande, barra de cócteles en tinta |
| Cartas y dados, *The Card Table* | Tinta | Didone | Tapete verde con filete champán, dados de marfil |
| Ruleta | Noche | Didone | Rueda con aro propio por ruleta (granate, oro, medianoche, legendaria) |
| Cajas | Noche | Didone | Estantería, materiales y foco de revelación |
| Marcador | Papel | Didone | Tablero de tinta y sello de líder |
| Host Mode | Tinta | Didone | Puerta de estudio con piloto REC y monograma |
