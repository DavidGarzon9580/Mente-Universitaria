import { createApp } from './app.js';
import { getEnvironment, loadEnvironment } from './config/environment.js';

loadEnvironment();
const environment = getEnvironment();
const app = createApp({ environment });

app.listen(environment.port, () => {
  console.log(`Mente Universitaria disponible en http://localhost:${environment.port}`);
  if (!environment.groqApiKey) {
    console.log('La aplicación está activa; configura GROQ_API_KEY para usar el generador con IA.');
  }
});
