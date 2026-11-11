# HOMELOTTERY · Gabriel × Tatiana
**The Ultimate Couples Game Show.** One day. Two players. Unlimited surprises.

Un concurso de un día entero en una web app pensada para el móvil: 8 episodios, 84 pruebas jugables, economía de monedas y puntos, cajas misteriosas, ruletas, cartas especiales, sobres secretos, Movie Night interactiva y un Host Mode privado con el Cheat Sheet de Gabriel.

## Guías para Gabriel
| Documento | Para qué | Versión móvil |
|---|---|---|
| [Guía rápida](docs/GUIA_RAPIDA_GABRIEL.md) | Cómo funciona todo, en dos minutos. **Sin spoilers.** | [guia-rapida-gabriel.html](docs/guia-rapida-gabriel.html) |
| [Cheat Sheet secreto](docs/GABRIEL_SECRET_CHEAT_SHEET.md) | Preparación, PIN, controles de anfitrión, premios, sobres, cronología y plan B. **Confidencial: no abrir delante de Tatiana.** | [gabriel-secret-cheat-sheet.html](docs/gabriel-secret-cheat-sheet.html) |

Los cuatro archivos se generan desde los datos del juego con `npm run cheatsheet`, así que siempre coinciden con la app. La versión interactiva del Cheat Sheet, con su checklist, está en la app: Más → Host Mode → Cheat Sheet.

## Ejecutar

Requisitos: Node 18+.

```bash
npm install
npm run dev        # desarrollo: abre la URL "Network" desde el móvil (misma WiFi)
npm run build      # genera dist/ (web estática)
npm run preview    # sirve dist/ en http://localhost:4173 y en la red local
npm test           # 19 tests: lógica del juego + simulación de un día completo (tests/day.test.ts)
npm run cheatsheet # regenera las dos guías (Markdown + HTML) desde los datos de la app
```

### Publicar en Vercel (recomendado)
El proyecto ya incluye `vercel.json`: Vite, `npm ci`, `npm run build`, salida `dist/`, `sw.js` sin caché, assets inmutables y `noindex`. Como la navegación usa `#/rutas`, no hacen falta reescrituras.

1. Entra en vercel.com → **Add New… → Project** → importa `gabrielgilbord/Homelottery`.
2. **Branch:** elige `claude/homelottery-couples-game-if533j` (o haz merge a `main` antes).
3. No toques nada más: Vercel detecta Vite y lee `vercel.json`. Pulsa **Deploy**.
4. Abre la URL `*.vercel.app` en el iPhone → Compartir → **Añadir a pantalla de inicio**. Ábrela una vez con WiFi para que quede disponible sin conexión.

Alternativa por terminal: `npx vercel` (preview) y `npx vercel --prod` (producción).

### Red local (sin publicar)
`npm run build && npm run preview` en el ordenador y abre `http://<IP-del-ordenador>:4173` en el móvil, con la misma WiFi.

**Sin conexión:** el Service Worker (generado en cada build) precachea todos los archivos en la primera visita. Después la app abre sin internet, con fuentes, iconos y estilos incluidos.

**iPhone:** la app añadida a la pantalla de inicio tiene su propio almacenamiento, separado de Safari. Configura el PIN y las preferencias **dentro de la app del icono** y juega siempre desde ahí. Ábrela una vez desde el icono con WiFi para que quede instalada sin conexión.

**Importante:** la partida se guarda en el navegador (localStorage) del dispositivo y de *esa* URL. Usad siempre el mismo móvil y la misma dirección. Copia de seguridad: Host Mode → Ajustes → Exportar partida.

## Qué incluye
| Sección | Qué hace |
|---|---|
| Intro | Invitación animada, reglas, Primer Sobre, límites de Tatiana y misión de bienvenida. |
| Home | Marcador Gabriel vs Tatiana, episodio actual, siguiente prueba, avisos (sobres, cajas gratis). |
| The Show | Escaleta de 8 episodios, avance de episodio, sobres secretos (11) con condiciones. |
| Challenges | Biblioteca de 84 pruebas con filtros, búsqueda, prueba al azar, temporizador, registro de resultado, pasar/sustituir sin penalización. |
| Gaming Arena | Ruletas de campeón/rol/modo de LoL, barajas secretas, pruebas de LoL, Split Fiction, ARK y F2P de PS. |
| Card Arena | Dados, moneda, carta al azar (española/póker), series al mejor de 3/5/7 y 13 juegos para dos. |
| Party Mode | Laboratorio de cócteles/mocktails, 9 barajas sin repetición, 12 juegos de fiesta (beber nunca obligatorio). |
| Couples Mode | Sweet · Spicy · Legendary, nivel común = el más suave de los dos, barajas de pareja. |
| Movie Night | Movie Lottery (subastas a sobre cerrado), Bingo (Twilight/Isla/English), predicciones selladas, marcador en vivo, modos y propuestas. |
| Mystery Boxes | Bronze/Silver/Gold/Diamond/Legendary con tablas de premios ponderadas, premios únicos sin duplicados y registro inmutable. |
| Roulette | 4 ruletas desbloqueables; las porciones son proporcionales a su probabilidad. Doble o nada. |
| Inventory | Cartas (10 tipos con efectos reales), misiones secretas, llaves, cajas gratis y premios canjeables. |
| Leaderboard / Achievements | Marcador, historial completo, 21 logros por jugador con recompensa automática. |
| Host Mode | PIN, Cheat Sheet imprimible con checklist, control de episodios, ajustes, catálogo de premios con probabilidades y edición, sobres editables, exportar/importar y reinicio seguro. |

## Arquitectura
- Vite + React 18 + TypeScript. Sin backend ni servicios externos.
- Estado en `src/state/store.ts` (store externo + `useSyncExternalStore`), autoguardado en `localStorage` con migración de versiones.
- Aleatoriedad con `crypto.getRandomValues` (`src/lib/random.ts`).
- Contenido en `src/data/*` (pruebas, barajas, premios, episodios, juegos, cheat sheet).
- Identidad **THE PRIVATE SHOW × THE PLAY CLUB**: un programa de televisión privado con diseño editorial. Logo «La pantalla» (la O de HOME es un televisor Didone), tres voces tipográficas empaquetadas (Bodoni Moda, Bricolage Grotesque y Geist), un esquema de color por pantalla (`data-scheme`: papel, noche, tinta, burdeos y naranja) y objetos propios (tickets, sobres, cajas, sellos). Ver `docs/BRAND_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, `docs/MOTION_GUIDELINES.md`, `docs/QA_REPORT.md` y `docs/DESIGN_AUDIT.md`.
- Sonidos del show opcionales y desactivados por defecto (*Mis límites → Sonidos del show*).

## Privacidad (un solo móvil)
- El **modo pantalla compartida** (activo por defecto) muestra una cortina de *mantener para revelar* antes de enseñar contenido privado: misiones secretas, cartas privadas, pujas, sobres personales, ajustes de límites y cajas abiertas en privado.
- Host Mode pide PIN y se bloquea al salir de la pantalla o tras 5 minutos sin uso.
- Limitación honesta: es una web estática; alguien con conocimientos técnicos podría leer el código fuente. Es una cortina para no hacer spoilers sin querer, no una caja fuerte.
