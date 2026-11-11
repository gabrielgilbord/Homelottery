# HOMELOTTERY · QA report (rediseño v4)

Fecha: 11 de noviembre de 2026. Rama: `claude/homelottery-couples-game-if533j`. Herramientas: Playwright con el Chromium preinstalado y vitest. La partida simulada es `ep5-party` (episodio 5, a media tarde).

## Resultado

| Prueba | Resultado |
|---|---|
| Tests (`npm test`) | **19 de 19** (lógica y simulación de un día completo) |
| TypeScript (`tsc --noEmit`) | Sin errores |
| Build de producción (`npm run build`) | Correcto. Service Worker generado con todos los archivos |
| Desbordes: 16 rutas × 6 anchos (320, 375, 390, 430, 768 y 1280) | **0 elementos fuera de pantalla**. El barrido es elemento a elemento, porque `body` oculta el desborde y `scrollWidth` no lo vería. Excluye solo los carruseles horizontales intencionados |
| Errores de consola o de página en esas 96 vistas | **0** |
| Offline (build servido, servidor apagado) | Abren las 16 rutas, con fuentes e iconos; 0 peticiones fallidas; Host bloqueado |
| Red que acepta la conexión pero nunca responde | La app abre en unos 0,5 s desde la caché |
| Actualización desde la versión publicada | Se carga la CSS nueva, queda una sola caché y los puntos de la partida se conservan |
| PWA | Manifest correcto, `apple-touch-icon` de 180×180 PNG, título HOMELOTTERY, iconos nuevos con el monograma |
| Privacidad | Cortinas en preferencias y misiones; PIN incorrecto rechazado; Host sigue bloqueado al salir. El único texto "secreto" visible es «Noche de spa», un premio **ganado** que aparece en el historial |
| Ruleta | Gira, desacelera, el indicador da los golpes y aparece el ticket del resultado; doble o nada funciona |
| Cajas | Apertura delante de los dos y en privado, revelación a pantalla completa con certificado |
| Sobres | Apertura, relectura y cortina para los sobres personales |
| Persistencia | Sin cambios en el store. Comprobada en la prueba de actualización (puntos 77, 88 y 4 antes y después) |
| Contraste | Calculado (WCAG) para cada esquema: texto principal 6,2–15,2:1, secundario 5,4–10,7:1, terciario 4,8–6,9:1. Botón de acción: tinta sobre naranja, 6:1 |

## Fallos encontrados y corregidos durante el rediseño

1. **Modales y revelaciones encerrados en la página (también estaba en la v3).** La animación de entrada `.page` con `fill-mode: both` dejaba un `transform` activo. Eso convertía la página en bloque contenedor de los `position: fixed`, así que la cortina, los modales y la apertura de cajas no tapaban la barra superior ni la inferior. Se corrige con `backwards`.
2. **Contenido inalcanzable en la revelación de cajas.** Al centrar verticalmente un contenido más alto que la pantalla, la parte superior quedaba fuera sin scroll posible. Se sustituye por márgenes automáticos.
3. **Service Worker.** Guardaba como `index.html` cualquier página a la que se navegara. Ahora solo guarda la propia app.
4. **Sonidos siempre activos.** Ahora son opcionales y vienen apagados (*Mis límites → Sonidos del show*).
5. **Desbordes del rediseño** detectados en las capturas y corregidos:
   - wordmark XL cortado: ahora se ajusta con unidades de contenedor
   - números del marcador que se pisaban a 320 px: ahora escalan según sus dígitos
   - píldora de puntos a 320 px
   - título del episodio partido con guion
6. **Legibilidad:** el "1" de Bodoni a menos de 44 px se leía como "I". Las cifras pequeñas pasan a Bricolage.
7. **Falso positivo de privacidad:** el PIN de prueba aparecía dentro de coordenadas SVG de la ruleta. Se redondean a dos decimales.

## Capturas

- Después: `docs/design/v4/` (iPhone 13 a 2x: 16 pantallas, intro, resultado de ruleta, revelación de caja, sobres y apertura de sobre) y `docs/design/v4-desktop/` (1440 px).
- Antes: `docs/design/after/` (v3) y `docs/design/before/` (v2).

## No comprobable aquí

- **iPhone real:** añadir a la pantalla de inicio, el modo avión y la sensación al tacto. Hay que hacer la prueba descrita en el Cheat Sheet antes de jugar.
- **Rendimiento en un móvil de gama baja.** Solo se animan `transform`, `opacity` y `filter`, y las bombillas solo durante el giro, pero no se ha medido en un dispositivo real.
- **Lector de pantalla real (VoiceOver).** Se comprobaron los nombres accesibles por código (wordmark, sobres, ruleta y marcador con `aria-label`), pero no con VoiceOver.
