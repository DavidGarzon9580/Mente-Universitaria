// Punto de entrada para Vercel: expone la API de Express como función serverless.
// Las páginas, CSS, JS e imágenes se sirven como archivos estáticos desde /public.
import { createApp } from '../server/app.js';
import { getEnvironment } from '../server/config/environment.js';

const app = createApp({ environment: getEnvironment() });

// Vercel está detrás de un proxy: así el límite de solicitudes usa la IP real de cada usuario.
app.set('trust proxy', 1);

export default app;
