import test from 'node:test';
import assert from 'node:assert/strict';
import { JsonResourceRepository } from '../server/repositories/json-resource.repository.js';
import { ResourceService } from '../server/services/resource.service.js';

const repository = new JsonResourceRepository(new URL('../server/data/resources.json', import.meta.url));
const service = new ResourceService(repository);

test('filtra recursos por categoría y duración', async () => {
  const resources = await service.list({ category: 'organizacion', maxDuration: '5' });
  assert.ok(resources.length >= 1);
  assert.ok(resources.every((resource) => resource.category === 'organizacion'));
  assert.ok(resources.every((resource) => resource.duration <= 5));
});

test('realiza búsqueda sin distinguir mayúsculas', async () => {
  const resources = await service.list({ search: 'ENTREGAS' });
  assert.ok(resources.some((resource) => resource.id === 'organiza-entregas'));
});

test('rechaza categorías desconocidas', async () => {
  await assert.rejects(() => service.list({ category: 'diagnostico' }), /categoría seleccionada no es válida/);
});
