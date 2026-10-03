import { access, readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, extname, join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const publicDirectory = projectRoot;
const ignoredDirectories = new Set(['node_modules', '.git', 'coverage']);
const requiredPages = new Map([
  ['inicio', 'index.html'],
  ['encuesta', 'pages/encuesta.html'],
  ['recursos', 'pages/recursos.html'],
  ['mi-pausa', 'pages/mi-pausa.html'],
  ['mi-plan', 'pages/mi-plan.html'],
  ['buscar-apoyo', 'pages/buscar-apoyo.html']
]);

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectJavaScriptFiles(absolutePath));
    if (entry.isFile() && ['.js', '.mjs'].includes(extname(entry.name))) files.push(absolutePath);
  }

  return files;
}

const javascriptFiles = await collectJavaScriptFiles(projectRoot);

for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

const pageDirectory = join(publicDirectory, 'pages');
const pageFiles = (await readdir(pageDirectory)).filter((name) => name.endsWith('.html')).sort();
const expectedPageFiles = [...requiredPages.values()].filter((name) => name.startsWith('pages/')).map((name) => name.slice('pages/'.length)).sort();
if (pageFiles.length !== expectedPageFiles.length || pageFiles.some((name, index) => name !== expectedPageFiles[index])) {
  throw new Error('La carpeta pages debe contener únicamente las cinco páginas secundarias del sitio.');
}

const inlineCodePattern = /<style\b|\sstyle\s*=|\son[a-z]+\s*=/i;
const expectedSemantics = ['header', 'nav', 'main', 'section', 'footer'];
const formPages = new Set(['encuesta', 'recursos', 'mi-plan']);
const filesByRoute = new Map([...requiredPages].map(([route, relativePath]) => [route, join(publicDirectory, relativePath)]));

for (const [route, absolutePath] of filesByRoute) {
  const relativePath = requiredPages.get(route);
  const html = await readFile(absolutePath, 'utf8');
  const pageMarkers = [...html.matchAll(/<section\b[^>]*\bdata-page="([^"]+)"/g)];
  const bodyMarker = html.match(/<body\b[^>]*\bdata-page="([^"]+)"/i)?.[1];

  if (pageMarkers.length !== 1 || pageMarkers[0][1] !== route || bodyMarker !== route) {
    throw new Error(`${relativePath} debe representar únicamente la página ${route}.`);
  }
  if (!html.includes(`id="page-${route}"`)) throw new Error(`Falta el contenido principal de ${route}.`);
  if (/tailwind|bootstrap/i.test(html)) throw new Error(`${relativePath} no debe depender de frameworks CSS.`);
  if (inlineCodePattern.test(html)) throw new Error(`${relativePath} no debe contener estilos ni manejadores JavaScript en línea.`);

  for (const element of expectedSemantics) {
    if (!new RegExp(`<${element}\\b`, 'i').test(html)) throw new Error(`Falta <${element}> en ${relativePath}.`);
  }
  if (formPages.has(route) && !/<form\b/i.test(html)) throw new Error(`Falta el formulario esperado en ${relativePath}.`);
  if (route === 'mi-plan' && !/<aside\b/i.test(html)) throw new Error('La página Mi plan debe conservar el panel de IA.');

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) throw new Error(`Hay IDs repetidos en ${relativePath}: ${[...new Set(duplicateIds)].join(', ')}.`);

  for (const match of html.matchAll(/\s(?:aria-labelledby|aria-controls)="([^"]+)"/g)) {
    for (const reference of match[1].split(/\s+/)) {
      if (!ids.includes(reference)) throw new Error(`La referencia ARIA ${reference} no existe en ${relativePath}.`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (!reference || /^(?:[a-z]+:|\/\/)/i.test(reference) || reference.startsWith('#')) continue;
    const localPath = reference.split(/[?#]/, 1)[0];
    if (!localPath) continue;
    try {
      await access(resolve(dirname(absolutePath), decodeURIComponent(localPath)));
    } catch {
      throw new Error(`El enlace local ${reference} no existe desde ${relativePath}.`);
    }
  }
}

const guideDirectory = join(publicDirectory, 'assets/guides');
const guideFiles = (await readdir(guideDirectory)).filter((file) => extname(file) === '.html');
if (guideFiles.length !== 3) throw new Error(`Se esperaban tres guías web accesibles y se encontraron ${guideFiles.length}.`);

for (const filename of guideFiles) {
  const guidePath = join(guideDirectory, filename);
  const guideHtml = await readFile(guidePath, 'utf8');
  if (!/<html\b[^>]*\blang="es"/i.test(guideHtml) || !/<main\b/i.test(guideHtml) || !/<h1\b/i.test(guideHtml)) {
    throw new Error(`La guía ${filename} debe declarar español, un contenido principal y un título de nivel 1.`);
  }
  if (inlineCodePattern.test(guideHtml)) throw new Error(`La guía ${filename} no debe incluir CSS o JavaScript en línea.`);

  for (const match of guideHtml.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (!reference || /^(?:[a-z]+:|\/\/)/i.test(reference) || reference.startsWith('#')) continue;
    const localPath = reference.split(/[?#]/, 1)[0];
    if (!localPath) continue;
    try {
      await access(resolve(dirname(guidePath), decodeURIComponent(localPath)));
    } catch {
      throw new Error(`El enlace local ${reference} no existe desde assets/guides/${filename}.`);
    }
  }
}

console.log(`SINTAXIS OK: ${javascriptFiles.length} archivos JavaScript revisados.`);
console.log('ESTRUCTURA OK: seis páginas independientes, HTML semántico, IDs únicos y referencias ARIA válidas.');
console.log('GUÍAS OK: tres alternativas web en español, sin estilos en línea y con enlaces locales resueltos.');
