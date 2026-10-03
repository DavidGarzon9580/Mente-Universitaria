import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { transform } from 'esbuild';

const cssDirectory = resolve(import.meta.dirname, '../css');
for (const name of ['comun.css', 'inicio.css', 'encuesta.css', 'recursos.css', 'mi-pausa.css', 'mi-plan.css', 'buscar-apoyo.css', 'guias.css']) {
  const source = await readFile(resolve(cssDirectory, name), 'utf8');
  const result = await transform(source, { loader: 'css', logLevel: 'silent' });
  if (result.warnings.length) {
    throw new Error(`${name}: ${result.warnings.map((warning) => warning.text).join('; ')}`);
  }
}
console.log('CSS OK: ocho archivos externos con sintaxis válida.');
