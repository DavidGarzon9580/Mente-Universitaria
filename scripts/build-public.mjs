// Copia el sitio estático a /public para desplegarlo en Vercel.
import { cp, rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public');
const entries = ['index.html', 'favicon.svg', 'assets', 'css', 'js', 'pages'];

await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const entry of entries) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}
console.log('Sitio estático copiado a public/.');
