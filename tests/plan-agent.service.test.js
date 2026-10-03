import test from 'node:test';
import assert from 'node:assert/strict';
import { JsonResourceRepository } from '../server/repositories/json-resource.repository.js';
import { ResourceService } from '../server/services/resource.service.js';
import { SearchActivitiesTool } from '../server/tools/search-activities.tool.js';
import { ComposePlanTool } from '../server/tools/compose-plan.tool.js';
import { ToolRegistry } from '../server/tools/tool-registry.js';
import { PlanAgentService } from '../server/services/plan-agent.service.js';

class FakeAiGateway {
  constructor() {
    this.turn = 0;
  }

  async createResponse() {
    this.turn += 1;
    if (this.turn === 1) {
      return {
        output: [{
          type: 'function_call',
          call_id: 'call-search',
          name: 'buscar_actividades',
          arguments: JSON.stringify({ objective: 'organizacion', maxDuration: 10, energy: 'baja' })
        }]
      };
    }
    return {
      output: [{
        type: 'function_call',
        call_id: 'call-compose',
        name: 'componer_plan',
        arguments: JSON.stringify({
          activityIds: ['organiza-entregas', 'pausa-parcial'],
          reason: 'Combina organización y una pausa breve sin superar el tiempo disponible.'
        })
      }]
    };
  }
}

function createService() {
  const repository = new JsonResourceRepository(new URL('../server/data/resources.json', import.meta.url));
  const resourceService = new ResourceService(repository);
  const toolRegistry = new ToolRegistry([
    new SearchActivitiesTool(resourceService),
    new ComposePlanTool(resourceService)
  ]);
  return new PlanAgentService({ aiGateway: new FakeAiGateway(), toolRegistry });
}

test('el agente busca en el catálogo y compone un plan verificable', async () => {
  const result = await createService().generate({
    title: 'Mi plan de parciales',
    objective: 'organizacion',
    duration: 10,
    energy: 'baja',
    days: ['lunes', 'miercoles', 'viernes'],
    notes: '',
    useSurvey: false
  });

  assert.equal(result.trace.length, 2);
  assert.deepEqual(result.trace.map((item) => item.tool), ['buscar_actividades', 'componer_plan']);
  assert.equal(result.plan.items.length, 3);
  assert.ok(result.plan.items.every((item) => item.duration <= 10));
  assert.ok(result.plan.items.every((item) => ['lunes', 'miercoles', 'viernes'].includes(item.day)));
});
