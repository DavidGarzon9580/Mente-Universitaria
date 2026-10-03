export const PLAN_TITLE_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.,;:¡!¿?()'"-]{2,59}$/u;

const VALID_OBJECTIVES = new Set(['organizacion', 'pausas', 'concentracion', 'descanso']);
const VALID_ENERGY = new Set(['baja', 'media', 'alta']);
const VALID_DURATIONS = new Set([5, 10, 15, 20]);

export function validateAiPlanForm(values) {
  const errors = {};

  if (!PLAN_TITLE_PATTERN.test(values.title)) {
    errors.title = 'Escribe un título válido de 3 a 60 caracteres.';
  }
  if (!VALID_OBJECTIVES.has(values.objective)) {
    errors.objective = 'Selecciona qué quieres cuidar.';
  }
  if (!VALID_DURATIONS.has(values.duration)) {
    errors.duration = 'Selecciona un tiempo disponible válido.';
  }
  if (!VALID_ENERGY.has(values.energy)) {
    errors.energy = 'Selecciona un nivel de energía válido.';
  }
  if (!Array.isArray(values.days) || values.days.length < 1) {
    errors.days = 'Selecciona al menos un día.';
  }
  if (values.notes.length > 300) {
    errors.notes = 'El texto adicional no puede superar 300 caracteres.';
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
