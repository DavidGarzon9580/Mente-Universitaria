import { readFile } from 'node:fs/promises';

export class JsonResourceRepository {
  constructor(fileUrl) {
    this.fileUrl = fileUrl;
    this.cache = null;
  }

  async getAll() {
    if (this.cache) return structuredClone(this.cache);

    const content = await readFile(this.fileUrl, 'utf8');
    const resources = JSON.parse(content);

    if (!Array.isArray(resources)) {
      throw new TypeError('El catálogo de recursos debe ser una lista.');
    }

    this.cache = resources;
    return structuredClone(this.cache);
  }

  async find({ category = '', maxDuration = null, search = '', energy = '' } = {}) {
    const resources = await this.getAll();
    const normalizedSearch = search.trim().toLocaleLowerCase('es');

    return resources.filter((resource) => {
      const matchesCategory = !category || resource.category === category;
      const matchesDuration = !maxDuration || resource.duration <= maxDuration;
      const matchesEnergy = !energy || resource.energy.includes(energy);
      const searchable = `${resource.title} ${resource.summary}`.toLocaleLowerCase('es');
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);

      return matchesCategory && matchesDuration && matchesEnergy && matchesSearch;
    });
  }

  async getByIds(ids) {
    const allowedIds = new Set(ids);
    const resources = await this.getAll();
    return resources.filter((resource) => allowedIds.has(resource.id));
  }
}
