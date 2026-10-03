export class SearchActivitiesTool {
  constructor(resourceService) {
    this.resourceService = resourceService;
    this.name = 'buscar_actividades';
  }

  get definition() {
    return {
      type: 'function',
      name: this.name,
      description: 'Busca actividades reales del catálogo según el objetivo, tiempo y energía.',
      parameters: {
        type: 'object',
        properties: {
          objective: {
            type: 'string',
            enum: ['organizacion', 'pausas', 'concentracion', 'descanso']
          },
          maxDuration: {
            type: 'integer',
            enum: [5, 10, 15, 20]
          },
          energy: {
            type: 'string',
            enum: ['baja', 'media', 'alta']
          }
        },
        required: ['objective', 'maxDuration', 'energy'],
        additionalProperties: false
      },
      strict: true
    };
  }

  async execute(argumentsObject, context) {
    const primary = await this.resourceService.list({
      category: argumentsObject.objective,
      maxDuration: argumentsObject.maxDuration,
      energy: argumentsObject.energy
    });

    const complementary = await this.resourceService.list({
      category: 'pausas',
      maxDuration: argumentsObject.maxDuration,
      energy: argumentsObject.energy
    });

    const unique = new Map([...primary, ...complementary].map((item) => [item.id, item]));
    const matches = [...unique.values()].slice(0, 8);
    context.availableActivityIds = new Set(matches.map((item) => item.id));

    return {
      count: matches.length,
      activities: matches.map(({ id, title, summary, category, duration, energy }) => ({
        id,
        title,
        summary,
        category,
        duration,
        energy
      }))
    };
  }
}
