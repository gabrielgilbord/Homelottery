# HOMELOTTERY · Motion guidelines

Principios de Emil Kowalski (`emil-design-eng`, `animate`, `choreograph`, instaladas desde `github.com/emilkowalski/skill`), aplicados al espectáculo.

## Reglas

1. **¿Debe animarse?** Lo que se ve decenas de veces al día (cambio de pantalla, botones, pestañas) es rápido y discreto. Lo que pasa una vez (apertura de caja, sobre, cartela de episodio) puede durar y contar algo.
2. **Curvas** (`tokens.css`):
   - `--ease-out` (0.23, 1, 0.32, 1) para casi todo.
   - `--ease-in-out` (0.77, 0, 0.175, 1) para cortinillas y solapas.
   - `--ease-drawer` (0.32, 0.72, 0, 1) para hojas inferiores.
   - `--ease-spring` solo en sellos y tickets.
   - Nunca `ease-in` en interfaz.
3. **Duraciones:** pulsar 120 ms · rápido 180 · base 240 · hoja 380 · revelación 640. Las interacciones pequeñas siempre por debajo de 300 ms.
4. **Nada aparece desde la nada:** las entradas parten de `scale(0.94–0.97)` u opacidad, nunca de `scale(0)`.
5. **Respuesta al pulsar:** `:active` a `scale(0.97)` en todo lo que se toca (0,94 en la barra inferior). Hover solo con puntero fino (`(hover:hover) and (pointer:fine)`).
6. **Interrumpible:** los cambios de estado son *transitions* de CSS (pestañas, interruptores, filas). Los *keyframes* se reservan para momentos narrativos que no se interrumpen.
7. **Rendimiento:** solo `transform`, `opacity`, `filter`, `clip-path` y `box-shadow`. La textura es estática. Las bombillas de la ruleta solo se animan mientras gira.
8. **Movimiento reducido:** se elimina el desplazamiento, pero se mantienen opacidad y color. No queda contenido oculto: todo arranca en su estado final.
9. **Lección aprendida:** las animaciones de entrada de página usan `fill-mode: backwards`, nunca `both`. Un `transform` que sigue activo al terminar convierte la página en bloque contenedor de los `position: fixed`, y los modales y la caja quedaban encerrados dentro de la página. Corregido en la v4: también afectaba a la v3.

## Catálogo

| Momento | Qué pasa | Duración y curva | Dónde |
|---|---|---|---|
| Encendido de ON AIR | El piloto parpadea dos veces y se queda fijo, como una lámpara que calienta. El punto late cada 1,8 s | 1,1 s `steps` + 1,8 s | `.onair-lamp` (`shell.css`) |
| Entrada de la cabecera | El filete del wordmark se descubre de izquierda a derecha y el número de episodio sale del desenfoque | 0,9 s in-out + 0,9 s out | `.mh-title` `wipe-in`, `.mh-num` `unblur` |
| Cambio de sección | Opacidad y 6 px de desplazamiento; el suelo cambia de color en 380 ms | 240 ms out | `.page`, `body` |
| Transición de episodio | Cartela burdeos: barrido crema que se retira, número gigante que sale del desenfoque, título y subtítulo escalonados | 2,8 s en total | `.ep-card` |
| Apertura de sobre | La solapa gira 178°, la carta sube desde dentro y el texto aparece desenfocado | 0,6 + 0,9 + 0,6 s | `.er-flap`, `.er-sheet`, `.er-letter` |
| Sobre listo | El lacre se mueve cada 2,6 s, porque es accionable | 2,6 s | `.envl.is-ready .envl-seal` |
| Apertura de caja | Anticipación de 1,5 s (vibra y crece), la tapa salta con *anticipate*, se enciende el foco y gira el halo. El certificado entra desenfocado y el sello se estampa con rebote | 1,5 s + 0,7 s + 0,5 s | `.box3d.charging`, `.lid`, `.spot`, `.prize-card`, `.pc-seal` |
| Giro de ruleta | 5,4 s con desaceleración larga (0.12, 0.72, 0.06, 1). El indicador da un golpe en cada clavija y los clics se espacian ×1,11. Las bombillas persiguen la luz mientras gira y parpadean cuatro veces al parar. Después sale el ticket ganador | 5,4 s | `.wheel`, `.wheel-pointer.tick`, `.wheel-bulbs`, `.win-ticket` |
| Incremento de puntos | El número cuenta hasta el valor y aparece un `+N` en champán que flota | 1,3 s | `AnimatedNumber`, `.delta` |
| Tira y afloja | La barra del marcador se desplaza con `scaleX` | 0,8 s out | `.plate-tug` |
| Desbloqueo de logro | Aviso con forma de ticket desde abajo; se pospone si hay una revelación en pantalla | 380 ms drawer | `.toast` |
| Victoria | Sello «Winner» que cae con rebote y confeti según la importancia | 0,55 s spring | `.result-seal` |
| Derrota | Sin confeti: solo número en rojo y vibración corta (doble o nada) | — | `Roulette` |
| Líder del marcador | Sello circular estampado sobre el tablero | 0,5 s spring | `.board-seal` |

## Sonido

Los sonidos del show (clics de la ruleta, cajas, revelaciones) son **opcionales y vienen desactivados**. Se activan en *Mis límites → Sonidos del show*. Es una preferencia del dispositivo, no de la partida.
