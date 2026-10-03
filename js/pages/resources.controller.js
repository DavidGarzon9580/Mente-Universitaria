import { clearElement, createElement, formatCategory, query, setVisible } from '../utils/dom.js';

export class ResourcesController {
  constructor(api, database, toast) {
    this.api = api;
    this.database = database;
    this.toast = toast;
    this.resources = [];
    this.featuredResource = null;
    this.loadVersion = 0;
    this.currentResource = null;
    this.form = query('[data-resource-form]');
    this.list = query('[data-resource-list]');
    this.dialog = query('[data-resource-dialog]');
  }

  init() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.load();
    });
    query('[data-resource-category]').addEventListener('change', () => this.load());
    query('[data-resource-duration]').addEventListener('change', () => this.load());
    query('[data-retry-resources]').addEventListener('click', () => this.load());
    query('[data-clear-resource-filters]').addEventListener('click', () => this.clearFilters());
    query('[data-close-resource]').addEventListener('click', () => this.dialog.close());
    query('[data-save-resource]').addEventListener('click', () => this.saveCurrentResource());
    query('[data-open-featured-resource]').addEventListener('click', () => this.openFeatured());
    this.load();
  }

  get filters() {
    return {
      search: query('[data-resource-search]').value.trim(),
      category: query('[data-resource-category]').value,
      maxDuration: query('[data-resource-duration]').value
    };
  }

  async load() {
    const version = ++this.loadVersion;
    setVisible(query('[data-resource-loading]'), true);
    setVisible(query('[data-resource-error]'), false);
    setVisible(query('[data-resource-empty]'), false);
    clearElement(this.list);

    try {
      const response = await this.api.getResources(this.filters);
      if (version !== this.loadVersion) return;
      this.resources = response.data;
      this.featuredResource ||= this.resources.find((resource) => resource.id === 'organiza-entregas');
      this.render();
    } catch {
      if (version === this.loadVersion) setVisible(query('[data-resource-error]'), true);
    } finally {
      if (version === this.loadVersion) setVisible(query('[data-resource-loading]'), false);
    }
  }

  render() {
    clearElement(this.list);
    setVisible(query('[data-resource-empty]'), this.resources.length === 0);

    for (const resource of this.resources) {
      this.list.append(this.createCard(resource));
    }
  }

  createCard(resource) {
    const article = createElement('article', { className: 'card resource-card' });
    const image = createElement('img', {
      attributes: {
        src: resource.image,
        alt: `Ilustración del recurso ${resource.title}`,
        width: 384,
        height: 160,
        loading: 'lazy'
      }
    });
    const body = createElement('div', { className: 'resource-card__body' });
    const meta = createElement('div', { className: 'resource-card__meta' });
    meta.append(
      createElement('span', { className: 'tag', text: formatCategory(resource.category) }),
      createElement('small', { text: `${resource.duration} min` })
    );
    const actions = createElement('div', { className: 'resource-card__actions' });
    const readButton = createElement('button', { className: 'button button--secondary', text: 'Ver recurso', attributes: { type: 'button' } });
    const saveButton = createElement('button', { className: 'button button--primary', text: 'Añadir al plan', attributes: { type: 'button' } });
    readButton.addEventListener('click', () => this.open(resource));
    saveButton.addEventListener('click', () => this.addToPlan(resource));
    actions.append(readButton, saveButton);
    body.append(
      meta,
      createElement('h3', { text: resource.title }),
      createElement('p', { text: resource.summary }),
      actions
    );
    article.append(image, body);
    return article;
  }

  open(resource) {
    this.currentResource = resource;
    query('[data-resource-detail-title]').textContent = resource.title;
    query('[data-resource-detail-summary]').textContent = resource.summary;
    const steps = query('[data-resource-detail-steps]');
    clearElement(steps);
    resource.instructions.forEach((instruction) => steps.append(createElement('li', { text: instruction })));
    query('[data-resource-detail-source]').textContent = `Fuente: ${resource.source.name}.`;
    this.dialog.showModal();
  }

  async openFeatured() {
    try {
      if (!this.featuredResource) {
        const response = await this.api.getResources();
        this.featuredResource = response.data.find((resource) => resource.id === 'organiza-entregas');
      }
      if (!this.featuredResource) throw new Error('Recurso no disponible');
      this.open(this.featuredResource);
    } catch {
      this.toast.show('No se pudo abrir el recurso destacado. Inténtalo de nuevo.');
    }
  }

  saveCurrentResource() {
    if (!this.currentResource) return;
    this.addToPlan(this.currentResource);
  }

  async addToPlan(resource) {
    try {
      const added = await this.database.addResourceToPlan(resource);
      this.toast.show(added ? 'El recurso se añadió a Mi plan.' : 'Ese recurso ya está en tu plan.');
      if (this.dialog.open) this.dialog.close();
    } catch {
      this.toast.show('No se pudo guardar el recurso en este navegador.');
    }
  }

  clearFilters() {
    this.form.reset();
    query('[data-resource-category]').value = '';
    query('[data-resource-duration]').value = '';
    this.load();
  }
}
