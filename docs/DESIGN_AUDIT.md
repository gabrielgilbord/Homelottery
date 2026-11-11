# HOMELOTTERY · Auditoría de diseño

## v4 · THE PRIVATE SHOW × THE PLAY CLUB (identidad de marca)

### Skills instaladas y usadas

Entorno: Claude Code 2.1, que carga skills desde `~/.claude/skills` (usuario) y `.claude/skills` (proyecto). Se instalaron **a nivel de usuario**, copiando la carpeta que cada repositorio publica para Claude Code. Es su método documentado y no ejecuta nada. No se metieron en el repositorio del juego (son unos 50 MB de código ajeno), y no había skills previas con esos nombres. La herramienta Skill de Claude Code las lista, así que están accesibles. Como el contenedor es efímero, en una sesión nueva hay que repetir la copia (o instalar el plugin oficial con `/plugin`).

| Skill | Fuente oficial | Estado | Cómo se usó |
|---|---|---|---|
| Impeccable 4.8.2 | github.com/pbakaus/impeccable (Apache 2.0) | Instalada (`impeccable`) | Flujo `new-work` con dirección fijada por el brief; modos *Experience* (portada, caja, ruleta, sobres) y *Operate* (Home, selección); `craft-floor`: contraste medido, superficies del navegador tematizadas, sin eyebrows, sin texto con degradado y sin sombras duras. **No se ejecutó su binario** (`scripts/impeccable` descarga un ejecutable compilado que no se puede revisar); se siguió el fallback que la propia skill documenta |
| Frontend Design | github.com/anthropics/skills (`skills/frontend-design`) | Instalada (`frontend-design`) | Plan de tokens revisado contra los cinco tópicos de diseño generado; una sola audacia por pantalla; textos desde el lado de quien usa la app |
| UI UX Pro Max | github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT) | Instalada (`ui-ux-pro-max`). Su buscador en Python es local y se revisó antes de ejecutarlo | Se pasaron los tres conceptos por `--design-system`. Sus propuestas (violeta neón, Cormorant con Montserrat, Inter con Playfair, fieltro verde con oro) eran justo los tópicos a evitar y se usaron como contra-referencia. Sí se aplicó su checklist de UX (44 px, contraste, estados, movimiento reducido) |
| Emil Kowalski | github.com/emilkowalski/skill (MIT) | Instaladas `emil-design-eng`, `animate`, `choreograph`, `review-animations`, `mobile-native`, `animation-vocabulary` | Curvas, duraciones, `:active` 0,97, nada desde `scale(0)`, hover solo con ratón, CSS interrumpible y cartela coreografiada (ver `MOTION_GUIDELINES.md`) |
| Taste (tasteskill 2.5.1) | github.com/Leonxlnx/taste-skill (MIT) | Instalada (`design-taste-frontend`). Sus scripts no se ejecutaron | Es para webs de empresa. Se aplicó su puerta de calidad móvil: 44 px, nada fuera de pantalla a 320 px, un solo sistema de botones y tarjetas, dos niveles de anidado, nada de violeta y movimiento reducido sin contenido oculto |
| Design Engineer | No hay una oficial y verificable | No instalada | Solo aparecen versiones de la comunidad (una se declara para dashboards y SaaS). La más cercana con fuente verificable es `emil-design-eng` («Skills for Design Engineers»), ya instalada |

### Lo que la v3 tenía de plantilla

| # | Problema | Dónde |
|---|---|---|
| 1 | Todas las pantallas compartían una composición: barra, titular condensado, párrafo y paneles redondeados con borde | Gaming, Couples, Party, Movie, Host y Prefs |
| 2 | Un único granate en toda la app; el acento de cada mundo era un punto de 8 px | Todo |
| 3 | El logo era un ticket pequeño más el nombre escrito en una fuente | Barra, rail, intro |
| 4 | Controles de librería: pastilla segmentada, chips redondeados, input en caja, login genérico de Host | Todo |
| 5 | Navegación con idiomas mezclados (Inicio / The Show / Challenges / Boxes) | Barra inferior |
| 6 | Los sobres eran tarjetas idénticas con un círculo; las cajas, regalos genéricos sobre fondo plano | Show, Boxes |
| 7 | La ruleta tenía rótulos de 9 px y no tenía elementos físicos | Roulette |
| 8 | El marcador era una tabla gris | Leaderboard |
| 9 | Bug: modales y revelaciones encerrados dentro de la página (ver `QA_REPORT.md`) | Todas las capas |

### Dirección y decisiones

- **El brief fijó la dirección completa**, así que no hubo sorteo de direcciones: el flujo `new-work` de Impeccable lo contempla.
- **Concepto de marca único: «La pantalla»**, un televisor dibujado como letra Didone. Es la O de HOME y el marco del monograma.
- **Color por esquemas:** el suelo de cada pantalla cambia según su función (papel para leer, tinta para competir, burdeos para la intimidad, naranja para el directo). No hay un oscuro uniforme.
- **Tres voces tipográficas:** Bodoni Moda (show), Bricolage condensada (revista) y Geist (instrucciones).
- **Objetos en lugar de tarjetas:** tickets, placas, sobres, cajas, naipes y sellos. Las listas son filas editoriales con filetes.
- **El inglés es solo marca:** ON AIR, Tonight's show, Special guests y los nombres de cada sección (The Arcade Break, After Hours…). Todas las etiquetas funcionales están en español.

# Historial: auditoría y rediseño v3 ("Late Show en casa")

Capturas reales: `docs/design/before/` (versión anterior), `docs/design/after/` (iPhone 13) y `docs/design/after-desktop/` (1440 px). En las dos se usa la misma partida simulada, a media tarde del episodio 5.

## 1. Skills verificadas

| Skill pedida | ¿Instalada en este entorno? | Uso real |
|---|---|---|
| **Frontend Design** (Anthropic) | Sí, en `/mnt/skills/public/frontend-design` | Leída completa. Apliqué su proceso: plan de tokens, revisión contra los tics de diseño generado, una sola audacia por pantalla y textos escritos desde el lado de quien usa la app. |
| **Impeccable** (pbakaus) | No. Leí su SKILL.md y sus referencias desde el repositorio público. | Sigo `craft-floor`, `audit`, `polish` y `animate`. No ejecuté su binario descargable: es código externo sin verificar. Su propio fallback lo contempla ("context loading did not run"). |
| **Emil Kowalski Design Engineering** | No. Leí `emil-design-eng`, `animate` y `mobile-native` desde el repositorio público. | Curvas de animación, duraciones por debajo de 300 ms, `:active` a 0,97, hover solo con ratón y los ajustes para que la web se sienta nativa en el móvil. |
| **UI UX Pro Max** | No. Leí SKILL.md y `pro-rules.md` desde el repositorio público. | Su checklist previa a la entrega: objetivos táctiles, safe areas, contraste, iconos y estados. No ejecuté su buscador en Python. |
| **Taste** (leonxlnx) | No. Leí SKILL.md desde el repositorio público. | Casi todo es para webs de marketing. Apliqué su puerta de calidad para móvil (44 px, nada fuera de pantalla a 320 px, sin solapes, un único sistema) y su regla de no usar violeta. |
| Design Engineer Skill | No encontrada. | — |

## 2. Auditoría de la versión anterior (estilo Impeccable: P0 bloqueante → P3 pulido)

| # | Severidad | Problema | Dónde | Solución aplicada |
|---|---|---|---|---|
| 1 | P1 | Etiqueta "eyebrow" en mayúsculas sobre casi cada titular. Impeccable lo marca como prohibición y Frontend Design como tic de plantilla. | `PageHead`, `Section`, `Modal`, Intro y Movie | El titular habla solo. El contexto pasa a una línea bajo el título o desaparece. `.eyebrow` y `.label` se escriben en minúscula normal, sin tracking. |
| 2 | P1 | Fuente monoespaciada como disfraz "técnico" en metadatos y rótulos | Unos 40 usos | Solo se usa para los dígitos del temporizador y el PIN. Los datos van en sans con numerales tabulares. |
| 3 | P1 | Metadatos unidos con " · " y guiones largos en textos | Listas, toasts y resultados | Componente `.meta`: hechos separados por espacio. Los textos del motor usan comas. |
| 4 | P1 | El Home escondía el marcador bajo la primera pantalla. Dos botones apilados de anchos distintos. | Home | Escenario con el marcador en la primera pantalla del iPhone. Acción principal a ancho completo y secundaria a juego. |
| 5 | P1 | Hovers que se quedan pegados en el móvil y destello gris al tocar | Todo | Hovers solo en `@media (hover:hover) and (pointer:fine)`. Respuesta al pulsar con `:active` y `-webkit-tap-highlight-color: transparent`. |
| 6 | P2 | Negro casi puro teñido con un único acento: tic de diseño generado | Tokens | El fondo pasa a terciopelo burdeos (`#1a0b12`), el material del telón de un plató. |
| 7 | P2 | Una sola palabra en cursiva dentro del titular ("Couples *Mode*", "Home*lottery*") y texto con degradado | Titulares y logotipo | Retirado. Logotipo nuevo (resguardo de entrada en latón + rótulo condensado). Lo legendario es latón y lámina iridiscente sobre objetos, nunca sobre texto. |
| 8 | P2 | Sombra dura desplazada en las cartas de Party | Party | Sombra con desenfoque y desplazamiento real. Carta marfil en un escenario de baraja único. |
| 9 | P2 | Nueve barajas apiladas en Party (unas 2.500 px de scroll en el móvil) | Party, Couples, Movie, Gaming | `DeckStage`: un escenario de carta con selector de baraja. |
| 10 | P2 | Leaderboard con datos cortados en tres líneas y rankings "01/02" decorativos | Leaderboard | Marcador tipo televisión con barra de tira y afloja y tabla cara a cara (el ganador de cada fila, marcado). |
| 11 | P2 | Ruleta con texto boca abajo en la mitad izquierda. Selectores que empujaban la rueda fuera de la pantalla. | Roulette | El texto se rota según el lado. Selectores en una fila compacta. Colores por significado: valor en latón, ataque en rojo, suerte en terciopelo. |
| 12 | P2 | Ranuras de sorteo de Gaming de 400 px con un "—" que parecía un error | Gaming | Filas compactas con "Sin sortear" y el botón al lado. |
| 13 | P2 | Movimiento reducido que mataba todo el feedback a 1 ms | base.css | Menos desplazamiento, pero las transiciones de opacidad y color se mantienen. |
| 14 | P3 | Superficies del navegador sin tematizar: selección, cursor de texto, scrollbar | base.css | Tematizadas desde la paleta. |
| 15 | P3 | Pull-to-refresh accidental en mitad de la partida | html/body | `overscroll-behavior: none`. Las hojas usan `contain`. |
| 16 | P3 | Concordancias y repeticiones ("Premio rara", "Gabriel ya lo ha configurado, Tatiana ya lo ha configurado") | Boxes, Couples | Corregido. |

## 3. Dirección artística

Comparé tres direcciones y descarté dos:

| Propuesta | Veredicto |
|---|---|
| **Late Show en casa:** plató privado, telón de terciopelo, foco cálido, rótulos condensados de televisión y latón solo para el valor | **Elegida.** Es el mundo real del producto: un programa de televisión casero. Legible en móvil y con espacio para la personalidad de cada mundo. |
| Revista editorial con serif sobre negro (la v2) | Descartada. Elegante, pero leía como "plantilla editorial" y no como espectáculo. |
| Consola gaming de neón | Descartada. Genérica, y cansaría en un día de 14 horas. |

Referencias estudiadas por sus principios, sin copiar nada:

- **Gráficos de marcador de la televisión deportiva:** jerarquía número, nombre y diferencia.
- **Apple TV y Netflix:** el escenario como primer plano y el contenido como protagonista.
- **Linear y Raycast:** densidad tranquila en las listas y respuesta inmediata.
- **Interfaces de PlayStation:** iconografía y color propios para cada juego.
- **Cartelería de teatro y cine:** bombillas de marquesina, telón y sellos de lacre.

**La audacia está en un solo sitio:** el escenario del Home (telón, foco y marcador). Todo lo demás es silencioso: listas con filetes, tarjetas solo para objetos que se tocan.

## 4. Movimiento (Emil Kowalski + Impeccable `animate`)

- **El momento propio:** la apertura de caja. Anticipación de 1,5 s, la tapa sale en 3D con halo, la tarjeta del premio entra desenfocándose y hay confeti según la rareza. La legendaria dura más.
- **Cambio de episodio:** cartela con telón que se abre y título que sale del desenfoque.
- **Uso frecuente:** cambio de pantalla de 240 ms solo con opacidad y 6 px. Botones a 0,97 en 120 ms. Hojas con curva iOS (`0.32,0.72,0,1`). Toasts con transición desde abajo, pospuestos si hay un premio o un modal en pantalla.
- **Feedback:** puntuaciones que cuentan con `+N` flotante en latón, tira y afloja con `transform: scaleX`, clic de ruleta que se espacia y puntero que se balancea.

## 5. QA

- **Playwright** en 320 px, iPhone SE, iPhone 13, Pixel 7, iPad y 1440 px. Resultado: 0 errores de consola, 0 desbordes horizontales (barrido elemento a elemento), 0 premios secretos visibles en pantallas de jugador, y Host Mode vuelve a bloquearse al salir.
- **Simulación de un día completo** (`tests/day.test.ts`): 32 pruebas, todas las cajas, ruletas y cartas, 11 sobres, Movie Lottery, bingo, predicciones, series, llaves y cajas legendarias. Comprueba saldos no negativos, premios únicos sin repetir, premios personales a la persona correcta y la ida y vuelta de la persistencia.
- **Tests:** 19 de 19.
