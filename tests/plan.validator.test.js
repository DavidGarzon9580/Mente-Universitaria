import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePlanRequest } from '../server/validators/plan.validator.js';

const validRequest = Object.freeze({
  title: 'Mi semana con calma',
  objective: 'organizacion',
  duration: 10,
  energy: 'baja',
  days: ['lunes', 'miercoles', 'viernes'],
  notes: 'Tengo varias entregas.',
  useSurvey: false,
  surveySummary: ''
});

test('acepta títulos con tildes y ñ', () => {
  const result = validatePlanRequest({ ...validRequest, title: 'Organización y sueño' });
  assert.equal(result.title, 'Organización y sueño');
});

test('rechaza un título que no cumple la expresión regular', () => {
  assert.throws(
    () => validatePlanRequest({ ...validRequest, title: '<script>' }),
    /título debe tener entre 3 y 60 caracteres/
  );
});

test('rechaza días repetidos', () => {
  assert.throws(
    () => validatePlanRequest({ ...validRequest, days: ['lunes', 'lunes'] }),
    /días seleccionados no son válidos/
  );
});

test('no conserva el resumen si no existe autorización', () => {
  const result = validatePlanRequest({
    ...validRequest,
    useSurvey: false,
    surveySummary: 'Texto que no debe compartirse'
  });
  assert.equal(result.surveySummary, '');
});
