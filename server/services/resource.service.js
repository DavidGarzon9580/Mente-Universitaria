import { ValidationError } from '../errors/application.error.js';

const CATEGORIES = new Set(['organizacion', 'pausas', 'concentracion', 'descanso', 'apoyo']);
const ENERGY_LEVELS = new Set(['baja', 'media', 'alta']);

function parseDuration(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 60) {
    throw new ValidationError('La duración máxima debe estar entre 1 y 60 minutos.');
  }
  return parsed;
}

export class ResourceService {
  constructor(resourceRepository) {
    this.resourceRepository = resourceRepository;
  }

  async list(filters = {}) {
    const category = String(filters.category || '').trim().toLocaleLowerCase('es');
    const energy = String(filters.energy || '').trim().toLocaleLowerCase('es');
    const search = String(filters.search || '').trim().slice(0, 80);
    const maxDuration = parseDuration(filters.maxDuration);

    if (category && !CATEGORIES.has(category)) {
      throw new ValidationError('La categoría seleccionada no es válida.');
    }

    if (energy && !ENERGY_LEVELS.has(energy)) {
      throw new ValidationError('El nivel de energía no es válido.');
    }

    return this.resourceRepository.find({ category, energy, search, maxDuration });
  }

  async getByIds(ids) {
    return this.resourceRepository.getByIds(ids);
  }
}
