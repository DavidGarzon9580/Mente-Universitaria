import { ValidationError } from '../errors/application.error.js';

export const PLAN_TITLE_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.,;:¡!¿?()'"-]{2,59}$/u;

const OBJECTIVES = new Set(['organizacion', 'pausas', 'concentracion', 'descanso']);
const ENERGY_LEVELS = new Set(['baja', 'media', 'alta']);
const DURATIONS = new Set([5, 10, 15, 20]);
const WEEK_DAYS = new Set([
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
]);

function requiredText(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(`El campo ${fieldName} es obligatorio.`);
  }
  return value.trim();
}

export function validatePlanRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ValidationError('La solicitud del plan debe ser un objeto válido.');
  }

  const title = requiredText(input.title, 'título');
  if (!PLAN_TITLE_PATTERN.test(title)) {
    throw new ValidationError(
      'El título debe tener entre 3 y 60 caracteres y comenzar con una letra o un número.'
    );
  }

  const objective = requiredText(input.objective, 'objetivo').toLocaleLowerCase('es');
  if (!OBJECTIVES.has(objective)) {
    throw new ValidationError('El objetivo seleccionado no es válido.');
  }

  const duration = Number(input.duration);
  if (!DURATIONS.has(duration)) {
    throw new ValidationError('El tiempo debe ser 5, 10, 15 o 20 minutos.');
  }

  const energy = requiredText(input.energy, 'energía').toLocaleLowerCase('es');
  if (!ENERGY_LEVELS.has(energy)) {
    throw new ValidationError('El nivel de energía seleccionado no es válido.');
  }

  if (!Array.isArray(input.days) || input.days.length < 1 || input.days.length > 7) {
    throw new ValidationError('Selecciona entre uno y siete días.');
  }

  const days = [...new Set(input.days.map((day) => String(day).toLocaleLowerCase('es')))];
  if (days.length !== input.days.length || days.some((day) => !WEEK_DAYS.has(day))) {
    throw new ValidationError('Los días seleccionados no son válidos o están repetidos.');
  }

  const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
  if (notes.length > 300) {
    throw new ValidationError('La explicación adicional no puede superar 300 caracteres.');
  }

  const useSurvey = input.useSurvey === true;
  const surveySummary = useSurvey && typeof input.surveySummary === 'string'
    ? input.surveySummary.trim().slice(0, 600)
    : '';

  return Object.freeze({
    title,
    objective,
    duration,
    energy,
    days,
    notes,
    useSurvey,
    surveySummary
  });
}
