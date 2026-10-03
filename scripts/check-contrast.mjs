import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const tokenPath = resolve(import.meta.dirname, '../css/comun.css');
const css = await readFile(tokenPath, 'utf8');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readVariables(selector) {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]+)\\}`));
  if (!match) throw new Error(`No se encontró el bloque ${selector} en comun.css.`);
  return Object.fromEntries(
    [...match[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)]
      .map((entry) => [entry[1], entry[2].toLowerCase()])
  );
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(foreground, background) {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const base = readVariables(':root');
const themes = {
  claro: base,
  oscuro: { ...base, ...readVariables('.theme-dark') },
  'alto contraste': { ...base, ...readVariables('.theme-contrast') }
};

const checks = [
  ['texto sobre lienzo', '--color-text', '--color-canvas', 4.5],
  ['texto secundario sobre lienzo', '--color-muted', '--color-canvas', 4.5],
  ['texto sobre superficie', '--color-text', '--color-surface', 4.5],
  ['texto secundario sobre superficie', '--color-muted', '--color-surface', 4.5],
  ['texto de botón principal', '--color-on-brand', '--color-brand', 4.5],
  ['texto de botón acento', '--color-on-accent', '--color-accent', 4.5],
  ['enlace sobre superficie', '--color-brand-strong', '--color-surface', 4.5],
  ['etiqueta sobre lavanda', '--color-accent', '--color-lavender', 4.5],
  ['alerta sobre fondo de alerta', '--color-danger', '--color-danger-surface', 4.5]
];

const failures = [];

for (const [themeName, variables] of Object.entries(themes)) {
  for (const [label, foregroundName, backgroundName, minimum] of checks) {
    const foreground = variables[foregroundName];
    const background = variables[backgroundName];
    if (!foreground || !background) {
      failures.push(`${themeName}: faltan ${foregroundName} o ${backgroundName}`);
      continue;
    }
    const ratio = contrastRatio(foreground, background);
    if (ratio < minimum) failures.push(`${themeName}: ${label} = ${ratio.toFixed(2)}:1`);
  }
}

if (failures.length) {
  throw new Error(`Contrastes insuficientes:\n- ${failures.join('\n- ')}`);
}

console.log(`CONTRASTE OK: ${checks.length * Object.keys(themes).length} combinaciones cumplen al menos 4.5:1.`);
