# PalabraDelDiaOffline

Juego web estático estilo **La Palabra del Día** (Wordle en español), listo para desplegar en cualquier servidor de archivos.

## Características
- Tablero 6x5, teclado virtual QWERTY con Ñ y soporte de teclado físico.
- Validación estricta de intentos usando `palabras.txt`.
- Reglas de coloreado tipo Wordle con manejo correcto de letras repetidas (prioridad verde y luego amarillo por conteo).
- Mensajes toast, animaciones flip y shake, vibración en errores (si el dispositivo lo soporta).
- Modal de instrucciones y modal de resultado (ganar/perder).
- Modo offline con Service Worker (cachea estáticos y diccionario).
- Botón para **Refrescar recursos** (forzar actualización de cache y diccionario cuando haya conexión).

## Ejecución local
```bash
python3 -m http.server 4173
```
Luego abre `http://localhost:4173`.
