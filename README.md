# HOMELOTTERY · Gabriel × Tatiana
**The Ultimate Couples Game Show.** One day. Two players. Unlimited surprises.

Un concurso de un día entero en una web app pensada para el móvil: 8 episodios, 84 pruebas jugables, economía de monedas y puntos, cajas misteriosas, ruletas, cartas especiales, sobres secretos, Movie Night interactiva y un Host Mode privado con el Cheat Sheet de Gabriel.

> ⚠️ Gabriel: el Cheat Sheet completo está en `docs/GABRIEL_SECRET_CHEAT_SHEET.md` y en la app (Host Mode). Este README no tiene spoilers.

## Ejecutar

Requisitos: Node 18+.

```bash
npm install
npm run dev        # desarrollo: abre la URL "Network" desde el móvil (misma WiFi)
npm run build      # genera dist/ (web estática)
npm run preview    # sirve dist/ en http://localhost:4173 y en la red local
npm test           # tests de la lógica del juego (economía, cajas, ruletas, cartas, sobres…)
npm run cheatsheet # regenera docs/GABRIEL_SECRET_CHEAT_SHEET.md desde los datos de la app
```

### Llevarlo al móvil (elige una)
1. **Hosting estático (recomendado):** sube `dist/` a Vercel, Netlify o GitHub Pages. `base: './'` ya funciona en subcarpetas. Abre la URL en el móvil → Compartir → *Añadir a pantalla de inicio*. Tras la primera visita funciona sin conexión (service worker).
2. **Red local:** `npm run build && npm run preview` en el ordenador y abre `http://<IP-del-ordenador>:4173` en el móvil (misma WiFi). El ordenador debe seguir encendido.

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
- Design System en `src/styles.css`: tokens + temas por sección (`data-theme`), fuentes empaquetadas (Cinzel, Playfair Display, Manrope, Bebas Neue), iconos SVG propios.

## Privacidad (un solo móvil)
- El **modo pantalla compartida** (activo por defecto) muestra una cortina de *mantener para revelar* antes de enseñar contenido privado: misiones secretas, cartas privadas, pujas, sobres personales, ajustes de límites y cajas abiertas en privado.
- Host Mode pide PIN y se bloquea al salir de la pantalla o tras 5 minutos sin uso.
- Limitación honesta: es una web estática; alguien con conocimientos técnicos podría leer el código fuente. Es una cortina para no hacer spoilers sin querer, no una caja fuerte.
