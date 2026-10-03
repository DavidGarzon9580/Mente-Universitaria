import { randomUUID } from 'node:crypto';
import { ValidationError } from '../errors/application.error.js';

const DAY_LABELS = Object.freeze({
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
});

export class ComposePlanTool {
  constructor(resourceService) {
    this.resourceService = resourceService;
    this.name = 'componer_plan';
  }

  get definition() {
    return {
      type: 'function',
      name: this.name,
      description: 'Organiza en los días elegidos actividades que ya fueron encontradas en el catálogo.',
      parameters: {
        type: 'object',
        properties: {
          activityIds: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 7
          },
          reason: {
            type: 'string',
            description: 'Explicación breve, educativa y no clínica de la selección.'
          }
        },
        required: ['activityIds', 'reason'],
        additionalProperties: false
      },
      strict: true
    };
  }

  async execute(argumentsObject, context) {
    if (!context.availableActivityIds?.size) {
      throw new ValidationError('Primero se deben buscar actividades del catálogo.');
    }

    const requestedIds = [...new Set(argumentsObject.activityIds)];
    const allowedIds = requestedIds.filter((id) => context.availableActivityIds.has(id));
    const resources = await this.resourceService.getByIds(allowedIds);
    const usable = resources.filter((resource) => resource.duration <= context.request.duration);

    if (!usable.length) {
      throw new ValidationError('No se seleccionaron actividades compatibles con el tiempo disponible.');
    }

    const items = context.request.days.map((day, index) => {
      const activity = usable[index % usable.length];
      return {
        id: randomUUID(),
        day,
        dayLabel: DAY_LABELS[day],
        activityId: activity.id,
        title: activity.title,
        summary: activity.summary,
        category: activity.category,
        duration: activity.duration,
        completed: false
      };
    });

    const reason = typeof argumentsObject.reason === 'string'
      ? argumentsObject.reason.trim().slice(0, 280)
      : '';

    const plan = {
      id: randomUUID(),
      source: 'ai',
      title: context.request.title,
      objective: context.request.objective,
      energy: context.request.energy,
      maxMinutesPerDay: context.request.duration,
      createdAt: new Date().toISOString(),
      explanation: reason || 'La propuesta combina acciones breves del catálogo con tus días disponibles.',
      items
    };

    context.plan = plan;
    return { plan };
  }
}
