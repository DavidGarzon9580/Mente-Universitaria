import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'js/app.bundle.js');
const resources = JSON.parse(await readFile(resolve(root, 'server/data/resources.json'), 'utf8'));
const channels = JSON.parse(await readFile(resolve(root, 'server/data/support-channels.json'), 'utf8'));
const result = await build({
  entryPoints: [resolve(root, 'js/app.js')],
  outfile: outputPath,
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  charset: 'utf8',
  legalComments: 'none',
  write: false,
  banner: {
    js: `/* Generado con npm run build:js. Edita los módulos fuente. */\n(() => {\nconst STATIC_RESOURCES = ${JSON.stringify(resources)};\nconst STATIC_SUPPORT_CHANNELS = ${JSON.stringify(channels)};`
  },
  footer: { js: '})();' }
});
const generated = result.outputFiles[0].text;
const existing = await readFile(outputPath, 'utf8').catch((error) => {
  if (error.code !== 'ENOENT') throw error;
  return '';
});

if (process.argv.includes('--check')) {
  if (existing !== generated) {
    console.error('JS DESACTUALIZADO: ejecuta npm run build:js.');
    process.exitCode = 1;
  } else {
    console.log('JS OK: paquete sincronizado con sus módulos y catálogos.');
  }
} else {
  if (existing !== generated) await writeFile(outputPath, generated);
  console.log('JavaScript compilado: app.bundle.js.');
}
