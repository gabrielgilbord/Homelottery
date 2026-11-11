# HOMELOTTERY · Auditoría de diseño y rediseño

## Skills disponibles

He revisado las skills de la cuenta. No hay ninguna de UI/UX, diseño visual, motion, frontend ni game design: la búsqueda no devuelve nada y las que hay son de Office, PDF, docs y memoria. Consulté `artifact-design`, que está pensada para artefactos. De ella apliqué sus fundamentos generales:

- neutros con matiz en lugar de grises puros
- evitar los clichés de "diseño generado"
- numerales tabulares
- usar tarjetas solo cuando un elemento lo necesita
- numerar solo lo que es una secuencia real

El resto del trabajo se hizo sin skills especializadas.

## Dirección artística

Evalué tres direcciones:

| Propuesta | Idea | Veredicto |
|---|---|---|
| **Velvet Broadcast** | Late-night show privado: tinta y vino, marfil, serif editorial, etiquetas tipo rótulo de emisión | **Elegida.** Es la más original y legible, y cada mundo puede tener su acento sin perder la marca. |
| Private Club Deco | Geometría art déco, oro, terciopelo | Descartada: vuelve al cliché de casino. |
| Console Glass | Cristal oscuro, neón, gaming | Descartada: es genérica y cansa en un día de 14 horas. |

Principios de la dirección elegida:

- El champán solo marca **valor**: monedas, premios y recompensas.
- El degradado iridiscente solo aparece en momentos **legendarios**.
- Cada mundo tiene **un** acento funcional.

## Auditoría (versión anterior → solución)

| # | Área | Problema encontrado | Solución aplicada |
|---|---|---|---|
| 1 | Jerarquía | Todo eran tarjetas con el mismo borde, brillo y radio, así que nada destacaba. El Home apilaba 4 bloques del mismo peso. | Composición editorial: cabecera del episodio en serif grande, marcador como banda de ancho completo, listas con filetes y un libro de stats. Las tarjetas (`.surface`, `.ccard`) se reservan para objetos interactivos. |
| 2 | Composición | Rejillas `auto-fill` sin intención y bloques que no se relacionaban entre sí. | Home a dos columnas en escritorio (contenido + recompensas), catálogo de 1, 2 o 3 columnas según ancho, ficha de prueba con lateral sticky (temporizador y resultado). |
| 3 | Tipografía | 4 familias en competencia (Cinzel de casino, Playfair, Bebas y Manrope) y 17 tamaños distintos escritos a mano. | 3 roles: Instrument Serif para display y marcadores, Geist Sans para la interfaz y Geist Mono para rótulos y datos. Escala fluida de 10 pasos con `clamp()`. Números con `tabular-nums`. |
| 4 | Responsive | Un solo breakpoint. El logo se desbordaba. La marca salía duplicada en escritorio. La etiqueta "LÍDER" pisaba el nombre. Tablas con `min-width` fijo. | Breakpoints 600, 900 y 1280 px. Gutter con `max(16px, safe-area)`. Raíl lateral desde 900 px (la marca solo aparece ahí). La etiqueta de líder va en línea en el flujo. Las tablas viven dentro de `.table-wrap`. Probado a 320, 375, 390, 412, iPad y 1440 px sin desbordes. |
| 5 | Contraste | Texto terciario al 48 % de opacidad (~4:1) en tamaños de 11 px. | Escala marfil sólida: el texto terciario `#91857d` da ~5,3:1. El texto pequeño nunca baja de 11 px y solo se usa en mono mayúsculas. |
| 6 | Componentes | Unos 250 estilos inline. El slider usaba el color nativo del navegador. Botones de 4 alturas distintas. | Librería en `components.css`: Button (6 variantes, 3 alturas: 36, 44 y 52), Seg, Chip, Tag, Switch, Range (con el acento de la sección), Sheet, Curtain, Toast, Timer, Empty, Skeleton, MysteryCard, Avatar y Ledger. |
| 7 | Interacción | Sin estados de foco. Confirmar no transmitía tensión. Los números cambiaban de golpe. | `:focus-visible` global. `ConfirmButton` en estado "armado" que late y vibra. `AnimatedNumber` con conteo y `+N` flotante en champán. Celebración proporcional (niveles 1, 2 y 3). |
| 8 | Consistencia | Cada pantalla inventaba sus estilos y la numeración "03 ·" era decorativa. | Tokens únicos y `data-world` por sección. La numeración solo queda en secuencias reales (episodios, pasos, bloques del Cheat Sheet). |
| 9 | Accesibilidad | Sin roles en los tabs, el color era el único identificador del jugador y no había `aria` en los diálogos. | `role="tablist"`, `radiogroup` y `switch`. `aria-modal` con foco gestionado. Cada jugador se identifica por color, inicial y lado. El Bingo usa `aria-pressed`. Se respeta `prefers-reduced-motion`. |
| 10 | Rendimiento | Fondo con conic-gradient girando sin fin, ruido SVG y `backdrop-filter` en tres capas. 10 ficheros de fuentes. | Fondo estático: una luz por sección, sin animación en bucle. Blur solo en la barra superior y la navegación. Fuentes en subset latino (7 ficheros). Confeti en canvas efímero (2–3 s) que se elimina al terminar. |

## Motion

| Momento | Diseño |
|---|---|
| Cambio de pantalla | Fade + subida de 10 px (260 ms, ease-out); listas escalonadas a 45 ms. |
| Nuevo episodio | Cartela a pantalla completa ("EPISODIO 05 DE 08" + título que se desenfoca y aparece). La Gran Final usa el degradado legendario. |
| Sobre | Sello que crece al pasar el dedo, solapa que gira en 3D y carta que entra con rotación en X. |
| Caja | **Anticipación** (1,5 s de vibración y compresión, 3 tonos ascendentes), **apertura** (la tapa sale en 3D, halo y rayos), **revelación** (la tarjeta del premio entra con muelle) y celebración según rareza. La legendaria tarda más y usa el iridiscente. |
| Ruleta | Curva de frenado larga (5,4 s), clics que se espacian, puntero que se balancea con cada clic y resultado en tarjeta. |
| Puntuaciones | Conteo animado y `+N`/`−N` flotante. |
| Logros | Toast con muelle. Se pospone si hay una revelación en pantalla, para no tapar nunca un premio. |
| Doble o nada | Botón armado, resultado con *pop* y vibración en verde o rojo. |

## QA visual (evidencia en `docs/design/`)

En cada iteración se repitió el ciclo implementar → capturar → inspeccionar → corregir con Playwright, en iPhone SE, iPhone 13, Pixel 7, 320 px, iPad y escritorio a 1440 px. El script comprueba automáticamente:

- desbordamiento horizontal de cualquier elemento
- errores de consola
- que ningún premio secreto aparezca en pantallas de jugador
- que Host Mode se vuelva a bloquear al salir

Fallos encontrados por la inspección visual y corregidos:

1. La invitación salía en negro porque la animación terminaba en opacidad 0.
2. La tapa de la caja quedaba de canto y cruzaba el título.
3. Los toasts tapaban la tarjeta del premio.
4. La variable `--gap` se heredaba en layouts anidados y descuadraba los espacios.
5. Los filtros de la biblioteca quedaban cortados en móvil.

Resultado final: 0 errores, 0 desbordes y 0 fugas. Los 18 tests de lógica pasan sin cambios en las reglas de negocio.
