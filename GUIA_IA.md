# Alma Mayor — conexión opcional con IA

La web publicada en GitHub Pages sigue funcionando con respuestas locales mientras no se active la IA.

## Backend seguro (preparación)
Archivo: `worker/alma-ai.js`. Diseñado para Cloudflare Workers y Gemini API. **No desplegado todavía.**

1. Crear una clave API en Google AI Studio, solo si la cuenta tiene acceso al nivel gratuito. Consultar los límites y condiciones vigentes antes de continuar.
2. Crear un Worker de Cloudflare en el plan gratuito y pegar el contenido de `worker/alma-ai.js`.
3. En Variables y secretos del Worker, guardar `GEMINI_API_KEY` como **Secret**. No pegar la clave en el HTML, el repositorio ni en chats.
4. Configurar `ALLOWED_ORIGIN` como `https://profesoraamp-boop.github.io`.
5. Probar el Worker y sus límites de uso. La restricción de origen CORS **no es una autenticación** ni evita abuso desde clientes externos; antes de publicar para uso general se necesita limitación de solicitudes y controles de presupuesto/cuota.
6. Solo después de validar el servicio, conectar el botón «Conversar» del HTML con la URL del Worker.

**Estado:** código de servidor preparado; no está conectado a la página pública. No se garantiza gratuidad ilimitada, disponibilidad del modelo ni acceso gratuito para todas las cuentas.

**Privacidad:** las conversaciones enviadas al servicio de IA se procesan fuera del dispositivo. Evitar información médica, financiera o personal sensible.
